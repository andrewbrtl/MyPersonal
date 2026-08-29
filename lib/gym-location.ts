export function normalizeGoogleMapsUrl(value: string) {
  return value.trim();
}

export function isGoogleMapsUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    const host = url.hostname.toLowerCase();
    if (host === "maps.app.goo.gl") return url.pathname.length > 1;
    if (host.startsWith("maps.google.")) return url.pathname.length > 1;
    return (host === "google.com" || host === "www.google.com" || /^www\.google\.[a-z.]+$/.test(host))
      && url.pathname.startsWith("/maps");
  } catch {
    return false;
  }
}

export function googleMapsSearchUrl(name: string, address: string, neighborhood: string) {
  const query = `${name}, ${address}, ${neighborhood}, Guarapuava - PR`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
