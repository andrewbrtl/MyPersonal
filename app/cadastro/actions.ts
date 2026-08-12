"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProfileState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const profileSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome profissional.").max(120),
  telefone: z.string().trim().min(10, "Informe um telefone com DDD.").max(20),
  cref: z.string().trim().toUpperCase().regex(/^\d{4,8}-[A-Z]\/([A-Z]{2})$/, "Use o formato 012345-G/PR."),
  bairro: z.string().trim().min(2, "Informe o bairro principal.").max(80),
  bio: z.string().trim().min(40, "Conte um pouco mais sobre seu trabalho (mínimo de 40 caracteres).").max(1200),
  formacao: z.string().trim().min(5, "Informe sua formação ou certificação principal.").max(500),
  anosExperiencia: z.coerce.number().int().min(0).max(80),
  preco: z.coerce.number().min(0, "O valor não pode ser negativo.").max(100000),
  atendimento: z.enum(["presencial", "online", "ambos"]),
  horarios: z.string().trim().max(1000),
  modalidades: z.array(z.string().uuid()).min(1, "Escolha pelo menos uma modalidade."),
});

export async function saveProfessionalProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const profile = await requireRole("personal", "/cadastro");
  const parsed = profileSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    cref: formData.get("cref"),
    bairro: formData.get("bairro"),
    bio: formData.get("bio"),
    formacao: formData.get("formacao"),
    anosExperiencia: formData.get("anosExperiencia"),
    preco: formData.get("preco"),
    atendimento: formData.get("atendimento"),
    horarios: formData.get("horarios"),
    modalidades: formData.getAll("modalidades"),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const admin = createAdminClient();
  const avatar = formData.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    if (!avatar.type.match(/^image\/(jpeg|png|webp)$/)) {
      return { errors: { avatar: ["Envie uma imagem JPG, PNG ou WebP."] } };
    }
    if (avatar.size > 5 * 1024 * 1024) {
      return { errors: { avatar: ["A imagem deve ter no máximo 5 MB."] } };
    }
  }

  const { data: currentProfile } = await admin.from("profiles").select("avatar_url").eq("id", profile.id).single();
  if (!(avatar instanceof File && avatar.size > 0) && !currentProfile?.avatar_url) {
    return { errors: { avatar: ["Escolha uma foto profissional para publicar o perfil."] } };
  }

  let avatarUrl: string | undefined;

  if (avatar instanceof File && avatar.size > 0) {
    const extension = avatar.type.split("/")[1].replace("jpeg", "jpg");
    const storagePath = `${profile.id}/avatar-${Date.now()}.${extension}`;
    const { error: uploadError } = await admin.storage
      .from("profile-images")
      .upload(storagePath, Buffer.from(await avatar.arrayBuffer()), { contentType: avatar.type, upsert: false });

    if (uploadError) return { message: "Não foi possível enviar a imagem. Tente novamente." };
    avatarUrl = admin.storage.from("profile-images").getPublicUrl(storagePath).data.publicUrl;
  }

  const profileUpdate = {
    nome: parsed.data.nome,
    telefone: parsed.data.telefone,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  };
  const { error: profileError } = await admin.from("profiles").update(profileUpdate).eq("id", profile.id);
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
  }).eq("id", profile.id);

  if (personalError) {
    if (personalError.code === "23505") return { errors: { cref: ["Este CREF já está vinculado a outro perfil."] } };
    return { message: "Não foi possível salvar os dados profissionais." };
  }

  await admin.from("personal_modalidades").delete().eq("personal_id", profile.id);
  const { error: modalitiesError } = await admin.from("personal_modalidades").insert(
    parsed.data.modalidades.map((modalidadeId) => ({ personal_id: profile.id, modalidade_id: modalidadeId })),
  );
  if (modalitiesError) return { message: "O perfil foi salvo, mas houve um problema com as modalidades." };

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

  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/cadastro");
  revalidatePath(`/profissionais/${profile.id}`);
  return { success: true, message: "Perfil salvo e publicado. Agora ele já pode aparecer na busca." };
}
