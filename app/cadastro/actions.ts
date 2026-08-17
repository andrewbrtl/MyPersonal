"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import {
  isValidBrazilianPhone,
  isSocialUrl,
  isWebsiteUrl,
  normalizeSocialInput,
  normalizeWebsiteInput,
  normalizeBrazilianPhone,
} from "@/lib/contact";
import { AVATAR_MAX_BYTES, detectSupportedImage, isSafeImageDimensions, readImageDimensions } from "@/lib/image-validation";
import {
  INPUT_LIMITS,
  isSafeMultilineText,
  isValidNeighborhood,
  isValidPersonName,
  isValidSchedule,
  normalizeMultilineText,
  normalizeSingleLineText,
  parseIntegerInput,
  parseMoneyInput,
  parseSchedule,
} from "@/lib/input-validation";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProfileState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const optionalSocialUrl = (network: "instagram" | "facebook" | "tiktok" | "youtube", label: string) => z
  .string()
  .max(INPUT_LIMITS.url, `${label}: o endereço está muito longo.`)
  .transform((value) => normalizeSocialInput(value, network))
  .refine((value) => isSocialUrl(value, network), `${label}: informe um perfil válido.`);

const profileSchema = z.object({
  nome: z.string()
    .max(INPUT_LIMITS.name, "O nome está muito longo.")
    .transform(normalizeSingleLineText)
    .refine((value) => value.length >= 2 && isValidPersonName(value), "Informe um nome válido, sem símbolos ou marcação HTML."),
  telefone: z.string()
    .max(INPUT_LIMITS.phoneFormatted, "O telefone está muito longo.")
    .transform(normalizeBrazilianPhone)
    .refine(isValidBrazilianPhone, "Informe um telefone com DDD válido."),
  whatsapp: z.string()
    .max(INPUT_LIMITS.phoneFormatted, "O WhatsApp está muito longo.")
    .transform(normalizeBrazilianPhone)
    .refine((value) => !value || isValidBrazilianPhone(value), "Informe um WhatsApp com DDD válido."),
  cref: z.string().max(INPUT_LIMITS.cref).trim().toUpperCase().regex(/^\d{4,8}-[A-Z]\/([A-Z]{2})$/, "Use o formato 012345-G/PR."),
  bairro: z.string()
    .max(INPUT_LIMITS.neighborhood, "O bairro está muito longo.")
    .transform(normalizeSingleLineText)
    .refine((value) => value.length >= 2 && isValidNeighborhood(value), "Informe um bairro válido, sem símbolos ou marcação HTML."),
  bio: z.string()
    .max(INPUT_LIMITS.bio, "A apresentação está muito longa.")
    .transform(normalizeMultilineText)
    .refine((value) => value.length >= 40, "Conte um pouco mais sobre seu trabalho (mínimo de 40 caracteres).")
    .refine(isSafeMultilineText, "A apresentação contém caracteres não permitidos."),
  formacao: z.string()
    .max(INPUT_LIMITS.education, "A formação está muito longa.")
    .transform(normalizeMultilineText)
    .refine((value) => value.length >= 5, "Informe sua formação ou certificação principal.")
    .refine(isSafeMultilineText, "A formação contém caracteres não permitidos."),
  anosExperiencia: z.preprocess(
    (value) => parseIntegerInput(value, 0, INPUT_LIMITS.experienceYears),
    z.number({ error: `Informe um número inteiro entre 0 e ${INPUT_LIMITS.experienceYears}.` }),
  ),
  preco: z.preprocess(
    (value) => parseMoneyInput(value),
    z.number({ error: `Informe um valor entre R$ 0 e R$ ${INPUT_LIMITS.price.toLocaleString("pt-BR")}, com até 2 casas decimais.` }),
  ),
  atendimento: z.enum(["presencial", "online", "ambos"]),
  horarios: z.string()
    .max(INPUT_LIMITS.schedule, "Os horários estão muito longos.")
    .transform(normalizeMultilineText)
    .refine(isValidSchedule, `Informe até ${INPUT_LIMITS.scheduleLines} horários, um por linha.`)
    .transform(parseSchedule),
  modalidades: z.array(z.string().uuid("Modalidade inválida."))
    .min(1, "Escolha pelo menos uma modalidade.")
    .max(INPUT_LIMITS.modalities, "Há modalidades demais selecionadas.")
    .refine((values) => new Set(values).size === values.length, "Há modalidades repetidas."),
  instagram: optionalSocialUrl("instagram", "Instagram"),
  facebook: optionalSocialUrl("facebook", "Facebook"),
  tiktok: optionalSocialUrl("tiktok", "TikTok"),
  youtube: optionalSocialUrl("youtube", "YouTube"),
  website: z.string()
    .max(INPUT_LIMITS.url, "O endereço do site está muito longo.")
    .transform(normalizeWebsiteInput)
    .refine(isWebsiteUrl, "Informe um site HTTPS válido, sem credenciais ou endereço local."),
});

export async function saveProfessionalProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const profile = await requireRole("personal", "/cadastro");
  const parsed = profileSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    whatsapp: formData.get("whatsapp"),
    cref: formData.get("cref"),
    bairro: formData.get("bairro"),
    bio: formData.get("bio"),
    formacao: formData.get("formacao"),
    anosExperiencia: formData.get("anosExperiencia"),
    preco: formData.get("preco"),
    atendimento: formData.get("atendimento"),
    horarios: formData.get("horarios"),
    modalidades: formData.getAll("modalidades"),
    instagram: formData.get("instagram"),
    facebook: formData.get("facebook"),
    tiktok: formData.get("tiktok"),
    youtube: formData.get("youtube"),
    website: formData.get("website"),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const admin = createAdminClient();
  const avatar = formData.get("avatar");
  const removeAvatar = formData.get("removerAvatar") === "on";
  const avatarFile = avatar instanceof File && avatar.size > 0 && !removeAvatar ? avatar : null;
  let avatarBytes: Uint8Array | null = null;
  let avatarImage: ReturnType<typeof detectSupportedImage> = null;
  if (avatarFile) {
    if (avatarFile.size > AVATAR_MAX_BYTES) {
      return { errors: { avatar: ["A imagem deve ter no máximo 5 MB."] } };
    }
    avatarBytes = new Uint8Array(await avatarFile.arrayBuffer());
    avatarImage = detectSupportedImage(avatarBytes);
    if (!avatarImage) return { errors: { avatar: ["O arquivo não é uma imagem JPG, PNG ou WebP válida."] } };
    if (!isSafeImageDimensions(readImageDimensions(avatarBytes, avatarImage))) {
      return { errors: { avatar: ["A imagem está corrompida ou possui dimensões muito grandes."] } };
    }
  }

  const { data: validModalities, error: modalityLookupError } = await admin
    .from("modalidades")
    .select("id")
    .in("id", parsed.data.modalidades)
    .eq("ativo", true);
  if (modalityLookupError) return { message: "Não foi possível validar as modalidades agora." };
  if (validModalities?.length !== parsed.data.modalidades.length) {
    return { errors: { modalidades: ["Uma das modalidades escolhidas não está mais disponível."] } };
  }

  const { data: currentProfile, error: currentProfileError } = await admin
    .from("profiles")
    .select("avatar_url")
    .eq("id", profile.id)
    .single();
  if (currentProfileError) return { message: "Não foi possível carregar seus dados atuais." };

  let avatarUrl: string | null | undefined = removeAvatar ? null : undefined;
  let uploadedStoragePath: string | null = null;

  if (avatarFile && avatarBytes && avatarImage) {
    uploadedStoragePath = `${profile.id}/avatar-${crypto.randomUUID()}.${avatarImage.extension}`;
    const { error: uploadError } = await admin.storage
      .from("profile-images")
      .upload(uploadedStoragePath, Buffer.from(avatarBytes), { contentType: avatarImage.mime, upsert: false });

    if (uploadError) return { message: "Não foi possível enviar a imagem. Tente novamente." };
    avatarUrl = admin.storage.from("profile-images").getPublicUrl(uploadedStoragePath).data.publicUrl;
  }

  const { error: saveError } = await admin.rpc("salvar_perfil_profissional", {
    perfil_id: profile.id,
    novo_nome: parsed.data.nome,
    novo_telefone: parsed.data.telefone,
    novo_cref: parsed.data.cref,
    novo_bairro: parsed.data.bairro,
    nova_bio: parsed.data.bio,
    nova_formacao: parsed.data.formacao,
    novos_anos_experiencia: parsed.data.anosExperiencia,
    novo_preco: parsed.data.preco,
    novo_atendimento: parsed.data.atendimento,
    novos_horarios: parsed.data.horarios,
    novas_modalidades: parsed.data.modalidades,
    novo_whatsapp: parsed.data.whatsapp || null,
    novo_instagram_url: parsed.data.instagram || null,
    novo_facebook_url: parsed.data.facebook || null,
    novo_tiktok_url: parsed.data.tiktok || null,
    novo_youtube_url: parsed.data.youtube || null,
    novo_website_url: parsed.data.website || null,
    alterar_avatar: avatarUrl !== undefined,
    nova_avatar_url: avatarUrl ?? null,
  });

  if (saveError) {
    if (uploadedStoragePath) await admin.storage.from("profile-images").remove([uploadedStoragePath]);
    if (saveError.code === "23505" && saveError.message.toLowerCase().includes("cref")) {
      return { errors: { cref: ["Este CREF já está vinculado a outro perfil."] } };
    }
    if (saveError.code === "23505") {
      return { errors: { telefone: ["Este telefone já está vinculado a outra conta."] } };
    }
    return { message: "Não foi possível salvar o perfil. Nenhuma alteração foi aplicada." };
  }

  if (avatarUrl !== undefined && currentProfile?.avatar_url && currentProfile.avatar_url !== avatarUrl) {
    const marker = "/profile-images/";
    const markerIndex = currentProfile.avatar_url.indexOf(marker);
    if (markerIndex >= 0) {
      const oldStoragePath = decodeURIComponent(currentProfile.avatar_url.slice(markerIndex + marker.length));
      if (oldStoragePath.startsWith(`${profile.id}/`)) await admin.storage.from("profile-images").remove([oldStoragePath]);
    }
  }

  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/cadastro");
  revalidatePath(`/profissionais/${profile.id}`);
  return { success: true, message: "Perfil salvo e publicado. Agora ele já pode aparecer na busca." };
}
