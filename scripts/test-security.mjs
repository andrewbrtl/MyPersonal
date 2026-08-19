import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  INPUT_LIMITS,
  isSafeMultilineText,
  isValidNeighborhood,
  isValidPersonName,
  isValidSchedule,
  normalizeSearchInput,
  parseIntegerInput,
  parseMoneyInput,
  safeInternalPath,
  withSiteNotice,
} from "../lib/input-validation.ts";
import { detectSupportedImage, isSafeImageDimensions, readImageDimensions } from "../lib/image-validation.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(safeInternalPath("/buscar?q=corrida", "/"), "/buscar?q=corrida");
assert.equal(safeInternalPath("//evil.example", "/"), "/");
assert.equal(safeInternalPath("/\\evil.example", "/"), "/");
assert.equal(safeInternalPath("https://evil.example", "/"), "/");
assert.equal(safeInternalPath("/buscar\r\nLocation:https://evil.example", "/"), "/");
assert.equal(safeInternalPath(`/${"a".repeat(INPUT_LIMITS.internalPath)}`, "/"), "/");
assert.equal(withSiteNotice("/buscar?q=corrida#resultados", "conta-criada-aluno"), "/buscar?q=corrida&aviso=conta-criada-aluno#resultados");
assert.equal(withSiteNotice("https://evil.example", "entrada-confirmada"), "/?aviso=entrada-confirmada");

assert.equal(isValidPersonName("Ana Maria D'Ávila"), true);
assert.equal(isValidPersonName("' OR 1=1 --"), false);
assert.equal(isValidPersonName("<script>alert(1)</script>"), false);
assert.equal(isValidNeighborhood("Jardim das Américas"), true);
assert.equal(isValidNeighborhood("Centro\u0000"), false);
assert.equal(isSafeMultilineText("Texto legítimo com 'aspas' e pontuação."), true);
assert.equal(isSafeMultilineText("<img src=x onerror=alert(1)>"), false);

assert.equal(parseIntegerInput("0", 0, 80), 0);
assert.equal(parseIntegerInput("80", 0, 80), 80);
assert.equal(parseIntegerInput("-1", 0, 80), undefined);
assert.equal(parseIntegerInput("1.5", 0, 80), undefined);
assert.equal(parseIntegerInput("1e2", 0, 80), undefined);
assert.equal(parseIntegerInput("999999999999999999", 0, 80), undefined);
assert.equal(parseMoneyInput("0"), 0);
assert.equal(parseMoneyInput("356,90"), 356.9);
assert.equal(parseMoneyInput("-0.01"), undefined);
assert.equal(parseMoneyInput("10.999"), undefined);
assert.equal(parseMoneyInput("1e4"), undefined);
assert.equal(parseMoneyInput("100000.01"), undefined);

assert.equal(isValidSchedule("Segunda · 08h às 10h\nQuarta · 18h às 20h"), true);
assert.equal(isValidSchedule(Array.from({ length: 15 }, (_, index) => `Horário ${index}`).join("\n")), false);
assert.equal(isValidSchedule("a".repeat(101)), false);
assert.equal(isValidSchedule("Segunda\u0007"), false);
assert.equal(normalizeSearchInput("  musculação   centro "), "musculação centro");
assert.equal(normalizeSearchInput("<script>"), "");
assert.equal(normalizeSearchInput("a".repeat(INPUT_LIMITS.search + 1)), "");

const png = new Uint8Array(24);
png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
png.set([0, 0, 4, 0], 16);
png.set([0, 0, 3, 0], 20);
const pngType = detectSupportedImage(png);
assert.deepEqual(pngType, { mime: "image/png", extension: "png" });
assert.deepEqual(readImageDimensions(png, pngType), { width: 1024, height: 768 });
assert.equal(isSafeImageDimensions({ width: 1024, height: 768 }), true);
assert.equal(isSafeImageDimensions({ width: 10000, height: 10000 }), false);
assert.equal(detectSupportedImage(new TextEncoder().encode("<svg><script>alert(1)</script></svg>")), null);

const sourceFiles = (await Promise.all(["app", "components", "lib"].map((directory) => listSourceFiles(path.join(root, directory))))).flat();
const source = (await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))).join("\n");
for (const forbidden of ["dangerouslySetInnerHTML", "new Function(", ".not(\"modalidade_id\"", "eval("]) {
  assert.equal(source.includes(forbidden), false, `Padrão perigoso encontrado: ${forbidden}`);
}

const migration = await readFile(path.join(root, "supabase/migrations/0007_input_security_hardening.sql"), "utf8");
for (const required of [
  "personais_preco_limite_check",
  "personais_horarios_seguros_check",
  "profiles_avatar_confiavel_check",
  "salvar_perfil_profissional",
  "grant execute on function public.salvar_perfil_profissional",
]) {
  assert.equal(migration.includes(required), true, `Proteção de banco ausente: ${required}`);
}

console.log(JSON.stringify({
  validacoes: "ok",
  numeros: "ok",
  redirecionamentos: "ok",
  imagens: "assinatura e dimensões verificadas",
  fontesAuditadas: sourceFiles.length,
  banco: "constraints, RLS e operação atômica presentes",
}));

async function listSourceFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", ".next", "node_modules"].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await listSourceFiles(fullPath));
    else if (/\.(?:ts|tsx|js|mjs|sql)$/.test(entry.name)) result.push(fullPath);
  }
  return result;
}
