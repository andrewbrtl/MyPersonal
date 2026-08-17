import { INPUT_LIMITS } from "@/lib/input-validation";

export type SocialNetwork = "instagram" | "facebook" | "tiktok" | "youtube";

const socialConfig: Record<SocialNetwork, { baseUrl: string; hosts: string[] }> = {
  instagram: { baseUrl: "https://www.instagram.com", hosts: ["instagram.com"] },
  facebook: { baseUrl: "https://www.facebook.com", hosts: ["facebook.com", "fb.com"] },
  tiktok: { baseUrl: "https://www.tiktok.com", hosts: ["tiktok.com"] },
  youtube: { baseUrl: "https://www.youtube.com", hosts: ["youtube.com", "youtu.be"] },
};

export function onlyPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeBrazilianPhone(value: string | null | undefined) {
  let digits = onlyPhoneDigits(value ?? "");
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  return digits;
}

export function isValidBrazilianPhone(value: string | null | undefined) {
  return /^\d{10,11}$/.test(normalizeBrazilianPhone(value));
}

export function formatPhone(value: string | null | undefined) {
  const digits = normalizeBrazilianPhone(value);
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value ?? "";
}

export function toWhatsAppNumber(value: string) {
  return `55${normalizeBrazilianPhone(value)}`;
}

export function normalizeSocialInput(value: string, network: SocialNetwork) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const config = socialConfig[network];
  const isHandle = trimmed.startsWith("@");
  const withoutAt = trimmed.replace(/^@/, "");
  const candidate = isHandle
    ? `${config.baseUrl}/${withoutAt}`
    : /^https?:\/\//i.test(withoutAt)
    ? withoutAt
    : withoutAt.includes(".")
      ? `https://${withoutAt}`
      : `${config.baseUrl}/${withoutAt}`;

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const allowed = config.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
    if (!allowed || !["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port) return trimmed;
    url.protocol = "https:";
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

export function normalizeWebsiteInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol) || !isPublicHostname(url.hostname) || url.username || url.password || url.port) return trimmed;
    url.protocol = "https:";
    url.username = "";
    url.password = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

export function isSocialUrl(value: string, network: SocialNetwork) {
  if (!value) return true;
  if (value.length > INPUT_LIMITS.url) return false;
  const config = socialConfig[network];
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && !url.port
      && !url.search
      && !url.hash
      && config.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export function isWebsiteUrl(value: string) {
  if (!value) return true;
  if (value.length > INPUT_LIMITS.url) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && !url.port
      && !url.hash
      && isPublicHostname(url.hostname);
  } catch {
    return false;
  }
}

function isPublicHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  if (!normalized.includes(".") || normalized === "localhost" || normalized.includes(":")) return false;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) return false;
  return normalized.split(".").every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
}
