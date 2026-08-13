"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import {
  isSocialUrl,
  isWebsiteUrl,
  normalizeSocialInput,
  normalizeWebsiteInput,
  normalizeBrazilianPhone,
} from "@/lib/contact";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProfileState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const optionalSocialUrl = (network: "instagram" | "facebook" | "tiktok" | "youtube", label: string) => z
  .string()
  .max(300, `${label}: o endereço está muito longo.`)
  .refine((value) => isSocialUrl(value, network), `${label}: informe um perfil válido.`);

const profileSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome profissional.").max(120),
  telefone: z.string().regex(/^\d{10,11}$/, "Informe um telefone com DDD."),
  whatsapp: z.string().refine((value) => !value || /^\d{10,11}$/.test(value), "Informe um WhatsApp com DDD."),
  cref: z.string().trim().toUpperCase().regex(/^\d{4,8}-[A-Z]\/([A-Z]{2})$/, "Use o formato 012345-G/PR."),
  bairro: z.string().trim().min(2, "Informe o bairro principal.").max(80),
  bio: z.string().trim().min(40, "Conte um pouco mais sobre seu trabalho (mínimo de 40 caracteres).").max(1200),
  formacao: z.string().trim().min(5, "Informe sua formação ou certificação principal.").max(500),
  anosExperiencia: z.coerce.number().int().min(0).max(80),
  preco: z.coerce.number().min(0, "O valor não pode ser negativo.").max(100000),
  atendimento: z.enum(["presencial", "online", "ambos"]),
  horarios: z.string().trim().max(1000),
  modalidades: z.array(z.string().uuid()).min(1, "Escolha pelo menos uma modalidade."),
  instagram: optionalSocialUrl("instagram", "Instagram"),
  facebook: optionalSocialUrl("facebook", "Facebook"),
  tiktok: optionalSocialUrl("tiktok", "TikTok"),
  youtube: optionalSocialUrl("youtube", "YouTube"),
  website: z.string().max(300, "O endereço do site está muito longo.").refine(isWebsiteUrl, "Informe um site válido."),
});

export async function saveProfessionalProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const profile = await requireRole("personal", "/cadastro");
  const parsed = profileSchema.safeParse({
    nome: formData.get("nome"),
    telefone: normalizeBrazilianPhone(String(formData.get("telefone") ?? "")),
    whatsapp: normalizeBrazilianPhone(String(formData.get("whatsapp") ?? "")),
    cref: formData.get("cref"),
    bairro: formData.get("bairro"),
    bio: formData.get("bio"),
    formacao: formData.get("formacao"),
    anosExperiencia: formData.get("anosExperiencia"),
    preco: formData.get("preco"),
    atendimento: formData.get("atendimento"),
    horarios: formData.get("horarios"),
    modalidades: formData.getAll("modalidades"),
    instagram: normalizeSocialInput(String(formData.get("instagram") ?? ""), "instagram"),
    facebook: normalizeSocialInput(String(formData.get("facebook") ?? ""), "facebook"),
    tiktok: normalizeSocialInput(String(formData.get("tiktok") ?? ""), "tiktok"),
    youtube: normalizeSocialInput(String(formData.get("youtube") ?? ""), "youtube"),
    website: normalizeWebsiteInput(String(formData.get("website") ?? "")),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const admin = createAdminClient();
  const avatar = formData.get("avatar");
  const removeAvatar = formData.get("removerAvatar") === "on";
  const avatarFile = avatar instanceof File && avatar.size > 0 && !removeAvatar ? avatar : null;
  if (avatarFile) {
    if (!avatarFile.type.match(/^image\/(jpeg|png|webp)$/)) {
      return { errors: { avatar: ["Envie uma imagem JPG, PNG ou WebP."] } };
    }
    if (avatarFile.size > 5 * 1024 * 1024) {
      return { errors: { avatar: ["A imagem deve ter no máximo 5 MB."] } };
    }
  }

  const { data: currentProfile } = await admin.from("profiles").select("avatar_url").eq("id", profile.id).single();
  let avatarUrl: string | null | undefined = removeAvatar ? null : undefined;

  if (avatarFile) {
    const extension = avatarFile.type.split("/")[1].replace("jpeg", "jpg");
    const storagePath = `${profile.id}/avatar-${Date.now()}.${extension}`;
    const { error: uploadError } = await admin.storage
      .from("profile-images")
      .upload(storagePath, Buffer.from(await avatarFile.arrayBuffer()), { contentType: avatarFile.type, upsert: false });

    if (uploadError) return { message: "Não foi possível enviar a imagem. Tente novamente." };
    avatarUrl = admin.storage.from("profile-images").getPublicUrl(storagePath).data.publicUrl;
  }

  const profileUpdate = {
    nome: parsed.data.nome,
    telefone: parsed.data.telefone,
    ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
  };
  const { error: profileError } = await admin.from("profiles").update(profileUpdate).eq("id", profile.id);
  if (profileError?.code === "23505") return { errors: { telefone: ["Este telefone já está vinculado a outra conta."] } };
  if (profileError) return { message: "Não foi possível salvar seus dados básicos." };

  const horarios = parsed.data.horarios
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const { error: personalError } = await admin.from("personais").update({
    cref: parsed.data.cref,
    bairro: parsed.data.bairro,
    bio: parsed.data.bio,
    formacao: parsed.data.formacao,
    anos_experiencia: parsed.data.anosExperiencia,
    preco_mensal_base: parsed.data.preco,
    atendimento: parsed.data.atendimento,
    horarios,
    whatsapp: parsed.data.whatsapp || null,
    instagram_url: parsed.data.instagram || null,
    facebook_url: parsed.data.facebook || null,
    tiktok_url: parsed.data.tiktok || null,
    youtube_url: parsed.data.youtube || null,
    website_url: parsed.data.website || null,
  }).eq("id", profile.id);

  if (personalError) {
    if (personalError.code === "23505") return { errors: { cref: ["Este CREF já está vinculado a outro perfil."] } };
    return { message: "Não foi possível salvar os dados profissionais." };
  }

  const { data: validModalities } = await admin
    .from("modalidades")
    .select("id")
    .in("id", parsed.data.modalidades)
    .eq("ativo", true);
  if (validModalities?.length !== parsed.data.modalidades.length) {
    return { errors: { modalidades: ["Uma das modalidades escolhidas não está mais disponível."] } };
  }

  const { error: modalitiesError } = await admin.from("personal_modalidades").upsert(
    parsed.data.modalidades.map((modalidadeId) => ({ personal_id: profile.id, modalidade_id: modalidadeId })),
  );
  if (modalitiesError) return { message: "O perfil foi salvo, mas houve um problema com as modalidades." };
  await admin
    .from("personal_modalidades")
    .delete()
    .eq("personal_id", profile.id)
    .not("modalidade_id", "in", `(${parsed.data.modalidades.join(",")})`);

  const { data: existingSubscription } = await admin
    .from("assinaturas")
    .select("id")
    .eq("personal_id", profile.id)
    .eq("status", "ativa")
    .limit(1)
    .maybeSingle();

  if (!existingSubscription) {
    const { data: freePlan } = await admin.from("planos").select("id").eq("tipo", "gratuito").single();
    if (freePlan) {
      await admin.from("assinaturas").insert({ personal_id: profile.id, plano_id: freePlan.id, status: "ativa" });
    }
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
