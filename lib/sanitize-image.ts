import "server-only";

import sharp from "sharp";

import { AVATAR_MAX_BYTES, AVATAR_MAX_PIXELS } from "@/lib/image-validation";

const AVATAR_OUTPUT_MAX_DIMENSION = 2048;

export async function sanitizeAvatarImage(bytes: Uint8Array) {
  const { data, info } = await sharp(bytes, {
    animated: false,
    failOn: "warning",
    limitInputPixels: AVATAR_MAX_PIXELS,
  })
    .rotate()
    .resize({
      width: AVATAR_OUTPUT_MAX_DIMENSION,
      height: AVATAR_OUTPUT_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ effort: 4, quality: 88 })
    .toBuffer({ resolveWithObject: true });

  if (!info.width || !info.height || data.byteLength === 0 || data.byteLength > AVATAR_MAX_BYTES) {
    throw new Error("Imagem sanitizada inválida.");
  }

  return {
    bytes: data,
    extension: "webp" as const,
    mime: "image/webp" as const,
  };
}
