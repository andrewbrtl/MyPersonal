import "server-only";

import {
  extractWebFormHiddenFields,
  hasCref9NoResultsMarker,
  normalizeRegistryText,
  parseCref9Registration,
  parseCref9SearchHtml,
  registryCategoryMatches,
  registryNamesMatch,
  type Cref9PublicRecord,
} from "@/lib/cref9-parser";

const CREF9_PUBLIC_QUERY_URL = "https://listasconfef.org.br/spw/CREF9/ConsultaCadastral/TelaConsultaPublicaCompleta.aspx";
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_RESPONSE_CHARACTERS = 1_000_000;
const CACHE_LIMIT = 200;
const FOUND_CACHE_TTL_MS = 30 * 60 * 1000;
const NOT_FOUND_CACHE_TTL_MS = 2 * 60 * 1000;

type RegistryQueryResult =
  | { kind: "found"; record: Cref9PublicRecord }
  | { kind: "not_found" }
  | { kind: "unavailable" };

export type Cref9ValidationResult =
  | { ok: true; record: Cref9PublicRecord }
  | { ok: false; reason: "invalid_format" | "not_found" | "inactive" | "name_mismatch" | "category_mismatch" | "service_unavailable" };

const queryCache = new Map<string, { expiresAt: number; result: RegistryQueryResult }>();
const pendingQueries = new Map<string, Promise<RegistryQueryResult>>();

export async function validateCref9Registration(cref: string, expectedName?: string): Promise<Cref9ValidationResult> {
  const parsed = parseCref9Registration(cref);
  if (!parsed) return { ok: false, reason: "invalid_format" };

  const result = await queryCref9Registry(parsed.number);
  if (result.kind === "unavailable") return { ok: false, reason: "service_unavailable" };
  if (result.kind === "not_found") return { ok: false, reason: "not_found" };
  if (normalizeRegistryText(result.record.status) !== "ATIVO") return { ok: false, reason: "inactive" };
  if (!registryCategoryMatches(parsed.categoryLetter, result.record.category)) {
    return { ok: false, reason: "category_mismatch" };
  }
  if (expectedName && !registryNamesMatch(expectedName, result.record.name)) {
    return { ok: false, reason: "name_mismatch" };
  }

  return { ok: true, record: result.record };
}

async function queryCref9Registry(number: string): Promise<RegistryQueryResult> {
  const cached = queryCache.get(number);
  if (cached && cached.expiresAt > Date.now()) return cached.result;
  if (cached) queryCache.delete(number);

  const pending = pendingQueries.get(number);
  if (pending) return pending;

  const request = performRegistryQuery(number).finally(() => pendingQueries.delete(number));
  pendingQueries.set(number, request);
  const result = await request;

  if (result.kind !== "unavailable") {
    if (queryCache.size >= CACHE_LIMIT) queryCache.delete(queryCache.keys().next().value ?? "");
    queryCache.set(number, {
      expiresAt: Date.now() + (result.kind === "found" ? FOUND_CACHE_TTL_MS : NOT_FOUND_CACHE_TTL_MS),
      result,
    });
  }

  return result;
}

async function performRegistryQuery(number: string): Promise<RegistryQueryResult> {
  try {
    const pageResponse = await fetch(CREF9_PUBLIC_QUERY_URL, {
      cache: "no-store",
      headers: requestHeaders(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!pageResponse.ok) return { kind: "unavailable" };

    const pageHtml = await readBoundedHtml(pageResponse);
    if (!pageHtml) return { kind: "unavailable" };

    const form = extractWebFormHiddenFields(pageHtml);
    if (!form.has("__VIEWSTATE") || !form.has("__EVENTVALIDATION")) return { kind: "unavailable" };

    form.set("cbousuario_VI", "1");
    form.set("ctl00$ContentPlaceHolder1$Callbackconsulta$cbousuario", "Profissional");
    form.set("ContentPlaceHolder1_Callbackconsulta_cboTipoBusca_VI", "NumRegistro");
    form.set("ctl00$ContentPlaceHolder1$Callbackconsulta$cboTipoBusca", "Num. Registro");
    form.set("ctl00$ContentPlaceHolder1$Callbackconsulta$txtConsultaTotal", number);
    form.set("ctl00$ContentPlaceHolder1$Callbackconsulta$btnConsultaTotal", "Pesquisar");

    const resultResponse = await fetch(CREF9_PUBLIC_QUERY_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        ...requestHeaders(),
        "content-type": "application/x-www-form-urlencoded",
        cookie: getCookieHeader(pageResponse.headers),
        referer: CREF9_PUBLIC_QUERY_URL,
      },
      body: form.toString(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!resultResponse.ok) return { kind: "unavailable" };

    const resultHtml = await readBoundedHtml(resultResponse);
    if (!resultHtml) return { kind: "unavailable" };

    const record = parseCref9SearchHtml(resultHtml, number);
    if (record) return { kind: "found", record };
    return hasCref9NoResultsMarker(resultHtml) ? { kind: "not_found" } : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}

function requestHeaders() {
  return {
    accept: "text/html,application/xhtml+xml",
    "accept-language": "pt-BR,pt;q=0.9",
    "user-agent": "MyPersonal-CREF9-Registration-Validation/1.0",
  };
}

async function readBoundedHtml(response: Response) {
  const html = await response.text();
  return html.length <= MAX_RESPONSE_CHARACTERS ? html : null;
}

function getCookieHeader(headers: Headers) {
  const cookieHeaders = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.()
    ?? (headers.get("set-cookie") ? [headers.get("set-cookie") as string] : []);
  return cookieHeaders.map((cookie) => cookie.split(";", 1)[0]).filter(Boolean).join("; ");
}
