export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_MAX_DIMENSION = 10000;
export const AVATAR_MAX_PIXELS = 40_000_000;

export type SupportedImage = {
  mime: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

function matches(bytes: Uint8Array, offset: number, signature: number[]) {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

export function detectSupportedImage(bytes: Uint8Array): SupportedImage | null {
  if (bytes.length >= 24 && matches(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png", extension: "png" };
  }
  if (bytes.length >= 4 && matches(bytes, 0, [0xff, 0xd8, 0xff])) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (bytes.length >= 30 && matches(bytes, 0, [0x52, 0x49, 0x46, 0x46]) && matches(bytes, 8, [0x57, 0x45, 0x42, 0x50])) {
    return { mime: "image/webp", extension: "webp" };
  }
  return null;
}

function uint16BigEndian(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function uint16LittleEndian(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function uint24LittleEndian(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function uint32BigEndian(bytes: Uint8Array, offset: number) {
  return ((bytes[offset] * 0x1000000) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]) >>> 0;
}

export function readImageDimensions(bytes: Uint8Array, image: SupportedImage) {
  if (image.mime === "image/png") {
    return { width: uint32BigEndian(bytes, 16), height: uint32BigEndian(bytes, 20) };
  }

  if (image.mime === "image/webp") {
    const chunk = String.fromCharCode(...bytes.slice(12, 16));
    if (chunk === "VP8X" && bytes.length >= 30) {
      return { width: uint24LittleEndian(bytes, 24) + 1, height: uint24LittleEndian(bytes, 27) + 1 };
    }
    if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
      return {
        width: 1 + bytes[21] + ((bytes[22] & 0x3f) << 8),
        height: 1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10),
      };
    }
    if (chunk === "VP8 " && bytes.length >= 30 && matches(bytes, 23, [0x9d, 0x01, 0x2a])) {
      return { width: uint16LittleEndian(bytes, 26) & 0x3fff, height: uint16LittleEndian(bytes, 28) & 0x3fff };
    }
    return null;
  }

  let offset = 2;
  const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= bytes.length) return null;
    const segmentLength = uint16BigEndian(bytes, offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
    if (startOfFrameMarkers.has(marker) && segmentLength >= 7) {
      return {
        height: uint16BigEndian(bytes, offset + 3),
        width: uint16BigEndian(bytes, offset + 5),
      };
    }
    offset += segmentLength;
  }
  return null;
}

export function isSafeImageDimensions(dimensions: { width: number; height: number } | null) {
  return Boolean(
    dimensions
    && dimensions.width > 0
    && dimensions.height > 0
    && dimensions.width <= AVATAR_MAX_DIMENSION
    && dimensions.height <= AVATAR_MAX_DIMENSION
    && dimensions.width * dimensions.height <= AVATAR_MAX_PIXELS,
  );
}
