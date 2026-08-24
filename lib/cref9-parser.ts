export type Cref9Registration = {
  number: string;
  categoryLetter: string;
  formatted: string;
};

export type Cref9PublicRecord = {
  registration: string;
  name: string;
  category: string;
  status: string;
};

const CREF9_FORMAT = /^(\d{4,8})-([A-Z])\/PR$/;

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
  Aacute: "Á",
  Acirc: "Â",
  Atilde: "Ã",
  Ccedil: "Ç",
  Eacute: "É",
  Ecirc: "Ê",
  Iacute: "Í",
  Oacute: "Ó",
  Ocirc: "Ô",
  Otilde: "Õ",
  Uacute: "Ú",
  aacute: "á",
  acirc: "â",
  atilde: "ã",
  ccedil: "ç",
  eacute: "é",
  ecirc: "ê",
  iacute: "í",
  oacute: "ó",
  ocirc: "ô",
  otilde: "õ",
  uacute: "ú",
};

export function parseCref9Registration(value: string): Cref9Registration | null {
  const formatted = value.trim().toUpperCase();
  const match = CREF9_FORMAT.exec(formatted);
  if (!match) return null;

  return {
    number: match[1],
    categoryLetter: match[2],
    formatted,
  };
}

export function registryNamesMatch(candidate: string, officialName: string) {
  const normalizedCandidate = normalizeRegistryText(candidate);
  const normalizedOfficialName = normalizeRegistryText(officialName);
  return normalizedCandidate.length >= 2 && normalizedCandidate === normalizedOfficialName;
}

export function registryCategoryMatches(categoryLetter: string, officialCategory: string) {
  const normalizedCategory = normalizeRegistryText(officialCategory);
  if (normalizedCategory.includes("PROVISIONADO")) return categoryLetter === "P";
  if (["BACHAREL", "LICENCIADO", "GRADUADO"].some((category) => normalizedCategory.includes(category))) {
    return categoryLetter === "G";
  }
  return false;
}

export function extractWebFormHiddenFields(html: string) {
  const fields = new URLSearchParams();

  for (const match of html.matchAll(/<input\b[^>]*>/gi)) {
    const tag = match[0];
    const type = getHtmlAttribute(tag, "type");
    if (type?.toLowerCase() !== "hidden") continue;

    const name = getHtmlAttribute(tag, "name");
    if (!name) continue;
    fields.set(decodeHtml(name), decodeHtml(getHtmlAttribute(tag, "value") ?? ""));
  }

  return fields;
}

export function parseCref9SearchHtml(html: string, expectedNumber: string): Cref9PublicRecord | null {
  const normalizedExpectedNumber = normalizeRegistrationNumber(expectedNumber);
  const rows = html.matchAll(/<tr\b[^>]*\bid=["'][^"']*gridConsulta_DXDataRow\d+["'][^>]*>([\s\S]*?)<\/tr>/gi);

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cleanHtmlCell(cell[1]));
    if (cells.length < 4) continue;

    const registrationNumber = cells[0].match(/\d{4,8}/)?.[0];
    if (!registrationNumber || normalizeRegistrationNumber(registrationNumber) !== normalizedExpectedNumber) continue;

    return {
      registration: cells[0],
      name: cells[1],
      category: cells[2],
      status: cells[3],
    };
  }

  return null;
}

export function hasCref9NoResultsMarker(html: string) {
  return /<tr\b[^>]*\bid=["'][^"']*gridConsulta_DXEmptyRow["'][^>]*>/i.test(html)
    && /n[aã]o\s+constam?\s+em\s+nossa\s+base\s+de\s+dados/i.test(cleanHtmlCell(html));
}

export function normalizeRegistryText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeRegistrationNumber(value: string) {
  return value.replace(/^0+(?=\d)/, "");
}

function cleanHtmlCell(value: string) {
  return decodeHtml(
    value
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ").trim();
}

function getHtmlAttribute(tag: string, attribute: string) {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const quoted = new RegExp(`\\b${escapedAttribute}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i").exec(tag);
  if (quoted) return quoted[2];
  return new RegExp(`\\b${escapedAttribute}\\s*=\\s*([^\\s>]+)`, "i").exec(tag)?.[1];
}

function decodeHtml(value: string) {
  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z][a-z0-9]+);/gi, (entity, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) {
      return safeCodePoint(Number.parseInt(code.slice(2), 16), entity);
    }
    if (code.startsWith("#")) return safeCodePoint(Number.parseInt(code.slice(1), 10), entity);
    return HTML_ENTITIES[code] ?? entity;
  });
}

function safeCodePoint(codePoint: number, fallback: string) {
  if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return fallback;
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return fallback;
  }
}
