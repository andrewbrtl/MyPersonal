import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const selfPath = "scripts/audit-public-repo.mjs";
const maximumTextBytes = 2 * 1024 * 1024;

const sensitivePathPatterns = [
  /(^|\/)\.env(?:\..+)?$/i,
  /(^|\/)\.vercel\//i,
  /(^|\/)\.supabase\//i,
  /(^|\/)(?:credentials|service-account)(?:\.[^/]*)?$/i,
  /\.(?:pem|key|p12|pfx|jks|keystore|sqlite|sqlite3|db|dump|bak)$/i,
];

const secretPatterns = [
  { name: "chave privada", regex: /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/ },
  { name: "token Supabase privilegiado", regex: /\b(?:sb_secret_|sbp_)[A-Za-z0-9_-]{20,}\b/ },
  { name: "token GitHub", regex: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
  { name: "chave de provedor", regex: /\b(?:sk_live_|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16})[A-Za-z0-9_-]*\b/ },
  { name: "JWT incorporado", regex: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/ },
  { name: "URL de banco com senha", regex: /\bpostgres(?:ql)?:\/\/[^\s:@/]+:[^\s@/]+@/i },
  {
    name: "variável secreta com valor literal",
    regex: /\b(?:SUPABASE_SECRET_KEY|CPF_HASH_SECRET|RATE_LIMIT_SECRET|ASAAS_API_KEY|ASAAS_WEBHOOK_TOKEN|DATABASE_URL|POSTGRES_PASSWORD|JWT_SECRET)[ \t]*=[ \t]*["']?[A-Za-z0-9][^\s#"']{7,}/,
  },
];

const trackedFiles = gitText(["ls-files", "--cached", "--others", "--exclude-standard", "-z"]).split("\0").filter(Boolean);
const currentFindings = [];

for (const file of trackedFiles) {
  const normalized = file.replaceAll("\\", "/");
  if (normalized !== ".env.example" && sensitivePathPatterns.some((pattern) => pattern.test(normalized))) {
    currentFindings.push(`arquivo sensível rastreado: ${normalized}`);
  }

  if (normalized === selfPath) continue;
  const absolute = path.join(root, file);
  if (statSync(absolute).size > maximumTextBytes) continue;
  const content = readFileSync(absolute);
  if (content.includes(0)) continue;
  const text = content.toString("utf8");
  for (const pattern of secretPatterns) {
    if (pattern.regex.test(text)) currentFindings.push(`${pattern.name}: ${normalized}`);
  }
}

const historicalPaths = gitText(["log", "--all", "--name-only", "--pretty=format:"])
  .split(/\r?\n/)
  .map((file) => file.trim().replaceAll("\\", "/"))
  .filter(Boolean);
const historicalSensitivePaths = [...new Set(historicalPaths.filter((file) =>
  file !== ".env.example" && sensitivePathPatterns.some((pattern) => pattern.test(file)),
))];

const gitExtendedPattern = [
  "-----BEGIN ([A-Z ]+ )?PRIVATE KEY-----",
  "(sb_secret_|sbp_)[A-Za-z0-9_-]{20,}",
  "gh[pousr]_[A-Za-z0-9]{20,}",
  "github_pat_[A-Za-z0-9_]{20,}",
  "(sk_live_|sk-)[A-Za-z0-9_-]{20,}",
  "AKIA[0-9A-Z]{16}",
  "eyJ[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}",
  "postgres(ql)?://[^[:space:]@/]+:[^[:space:]@/]+@",
].join("|");

const historicalContentFindings = [];
for (const revision of gitText(["rev-list", "--all"]).split(/\r?\n/).filter(Boolean)) {
  const result = spawnSync("git", [
    "grep", "-Il", "-E", "-e", gitExtendedPattern, revision, "--", ".", `:(exclude)${selfPath}`,
  ], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error("Falha ao examinar o histórico Git.");
  for (const file of result.stdout.split(/\r?\n/).filter(Boolean)) {
    historicalContentFindings.push(`${revision.slice(0, 10)} ${file}`);
  }
}

const findings = [
  ...currentFindings,
  ...historicalSensitivePaths.map((file) => `arquivo sensível no histórico: ${file}`),
  ...[...new Set(historicalContentFindings)].map((item) => `possível segredo no histórico: ${item}`),
];

if (findings.length) {
  console.error("Auditoria recusada. Nenhum valor foi impresso:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(JSON.stringify({
  arquivosAtuais: trackedFiles.length,
  commitsAuditados: gitText(["rev-list", "--count", "--all"]).trim(),
  historico: "sem padrões conhecidos de segredo",
  arquivosSensiveis: "nenhum rastreado",
}));

function gitText(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}
