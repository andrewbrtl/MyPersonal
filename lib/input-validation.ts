export const NEW_PASSWORD_LIMITS = { min: 8, max: 30 } as const;

export const INPUT_LIMITS = {
  name: 120,
  signupName: 80,
  email: 254,
  loginIdentifier: 254,
  password: 128,
  newPassword: NEW_PASSWORD_LIMITS.max,
  internalPath: 500,
  cref: 13,
  neighborhood: 80,
  bio: 1200,
  education: 500,
  schedule: 1000,
  scheduleLines: 14,
  scheduleLine: 100,
  url: 300,
  phoneFormatted: 20,
  search: 80,
  modalities: 20,
  price: 100000,
  experienceYears: 80,
  gymName: 120,
  address: 180,
  mapsUrl: 500,
} as const;

const unsafeControls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const anyControls = /[\u0000-\u001f\u007f]/u;
const htmlDelimiters = /[<>]/u;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeSingleLineText(value: string) {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}

export function normalizeMultilineText(value: string) {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .join("\n")
    .trim();
}

export function isSafeSingleLineText(value: string) {
  return !anyControls.test(value) && !htmlDelimiters.test(value);
}

export function isSafeMultilineText(value: string) {
  return !unsafeControls.test(value) && !htmlDelimiters.test(value);
}

export function isValidPersonName(value: string) {
  const normalized = normalizeSingleLineText(value);
  return isSafeSingleLineText(normalized)
    && /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,'’()-]*$/u.test(normalized);
}

export function isValidNeighborhood(value: string) {
  const normalized = normalizeSingleLineText(value);
  return isSafeSingleLineText(normalized)
    && /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,'’()/-]*$/u.test(normalized);
}

export function isValidBusinessName(value: string) {
  const normalized = normalizeSingleLineText(value);
  return isSafeSingleLineText(normalized)
    && /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} &+.,'’()/-]*$/u.test(normalized);
}

export function isValidStreetAddress(value: string) {
  const normalized = normalizeSingleLineText(value);
  return isSafeSingleLineText(normalized)
    && /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,'’()/#ºª-]*$/u.test(normalized);
}

export function isUuid(value: string) {
  return uuidPattern.test(value);
}

export function safeInternalPath(value: string | null | undefined, fallback = "") {
  if (!value || value.length > INPUT_LIMITS.internalPath || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  if (anyControls.test(value) || value.includes("\\")) return fallback;

  try {
    const parsed = new URL(value, "https://internal.invalid");
    return parsed.origin === "https://internal.invalid" ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback;
  } catch {
    return fallback;
  }
}

export type SiteNoticeCode =
  | "conta-criada-aluno"
  | "conta-criada-personal"
  | "entrada-confirmada"
  | "sessao-encerrada";

export function withSiteNotice(path: string, notice: SiteNoticeCode) {
  const safePath = safeInternalPath(path, "/");
  const parsed = new URL(safePath, "https://internal.invalid");
  parsed.searchParams.set("aviso", notice);
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function normalizeSearchInput(value: unknown) {
  if (typeof value !== "string" || value.length > INPUT_LIMITS.search) return "";
  const normalized = normalizeSingleLineText(value);
  return normalized && isSafeSingleLineText(normalized) ? normalized : "";
}

export function parseIntegerInput(value: unknown, min: number, max: number) {
  if (typeof value !== "string" || !/^(0|[1-9]\d*)$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
}

export function parseMoneyInput(value: unknown, min = 0, max = INPUT_LIMITS.price) {
  if (typeof value !== "string" || !/^(0|[1-9]\d*)(?:[.,]\d{1,2})?$/.test(value)) return undefined;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
}

export function parseSchedule(value: string) {
  const normalized = normalizeMultilineText(value);
  if (!normalized) return [];
  return normalized.split("\n").filter(Boolean);
}

export function isValidSchedule(value: string) {
  if (!isSafeMultilineText(value)) return false;
  const lines = parseSchedule(value);
  return lines.length <= INPUT_LIMITS.scheduleLines
    && lines.every((line) => line.length <= INPUT_LIMITS.scheduleLine && isSafeSingleLineText(line));
}
