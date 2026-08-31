import "server-only";

import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

export type RateLimitOperation = "login" | "cadastro" | "recuperacao" | "contato";

type RateLimitOptions = {
  operation: RateLimitOperation;
  limit: number;
  windowSeconds: number;
  requestHeaders?: Headers;
};

export async function consumeRequestLimit(options: RateLimitOptions) {
  const requestHeaders = options.requestHeaders ?? await headers();
  const clientAddress = trustedClientAddress(requestHeaders);

  if (!clientAddress && process.env.NODE_ENV === "production") return false;

  const secret = process.env.RATE_LIMIT_SECRET || process.env.SUPABASE_SECRET_KEY;
  if (!secret || secret.length < 32) return false;

  const fingerprint = createHmac("sha256", secret)
    .update(`my-personal:rate-limit:v1:${clientAddress ?? "local-development"}`)
    .digest("hex");

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("consumir_limite_operacao", {
    p_chave_hash: fingerprint,
    p_janela_segundos: options.windowSeconds,
    p_limite: options.limit,
    p_operacao: options.operation,
  });

  return !error && data === true;
}

function trustedClientAddress(requestHeaders: Headers) {
  const vercelForwarded = requestHeaders.get("x-vercel-forwarded-for");
  const vercelAddress = firstValidAddress(vercelForwarded);
  if (vercelAddress) return vercelAddress;

  const directAddress = requestHeaders.get("x-real-ip")?.trim();
  if (directAddress && isIP(directAddress)) return directAddress;

  const standardForwarded = requestHeaders.get("x-forwarded-for");
  if (process.env.NODE_ENV === "production") return lastValidAddress(standardForwarded);

  return firstValidAddress(standardForwarded);
}

function firstValidAddress(value: string | null) {
  if (!value || value.length > 512) return null;
  return value.split(",").map((part) => part.trim()).find((part) => isIP(part)) ?? null;
}

function lastValidAddress(value: string | null) {
  if (!value || value.length > 512) return null;
  return value.split(",").map((part) => part.trim()).findLast((part) => isIP(part)) ?? null;
}
