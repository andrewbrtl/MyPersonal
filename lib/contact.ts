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

export function formatPhone(value: string | null | undefined) {
  let digits = onlyPhoneDigits(value ?? "");
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) digits = digits.slice(2);
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value ?? "";
}

export function toWhatsAppNumber(value: string) {
  const digits = onlyPhoneDigits(value);
  return digits.startsWith("55") && (digits.length === 12 || digits.length === 13) ? digits : `55${digits}`;
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
    if (!allowed || !["http:", "https:"].includes(url.protocol)) return trimmed;
    url.protocol = "https:";
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
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) return trimmed;
    return url.toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

export function isSocialUrl(value: string, network: SocialNetwork) {
  if (!value) return true;
  const config = socialConfig[network];
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    return url.protocol === "https:" && config.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export function isWebsiteUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".");
  } catch {
    return false;
  }
}
