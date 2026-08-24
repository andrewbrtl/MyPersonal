import "server-only";

import { createHmac } from "node:crypto";

import { isValidCpf, normalizeCpf } from "@/lib/cpf";

export function createCpfFingerprint(value: string) {
  const cpf = normalizeCpf(value);
  if (!isValidCpf(cpf)) throw new Error("CPF inválido.");

  const secret = process.env.CPF_HASH_SECRET || process.env.SUPABASE_SECRET_KEY;
  if (!secret || secret.length < 32) throw new Error("Chave de proteção do CPF não configurada.");

  return createHmac("sha256", secret)
    .update(`my-personal:cpf:v1:${cpf}`)
    .digest("hex");
}
