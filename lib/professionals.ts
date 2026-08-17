import "server-only";

import { cache } from "react";

import { isSocialUrl, isWebsiteUrl } from "@/lib/contact";
import { isUuid } from "@/lib/input-validation";
import { createAdminClient } from "@/lib/supabase/admin";

export type Professional = {
  id: string;
  nome: string;
  iniciais: string;
  avatarUrl: string | null;
  especialidade: string;
  modalidades: string[];
  bairro: string;
  atendimento: string;
  atendimentoValor: "presencial" | "online" | "ambos";
  preco: number;
  unidade: string;
  nota: number;
  avaliacoes: number;
  verificado: boolean;
  destaque: string;
  bio: string;
  experiencia: string;
  formacao: string[];
  horarios: string[];
  cref: string;
  telefone: string;
  whatsapp: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  websiteUrl: string;
};

export const getPublicProfessionals = cache(async (): Promise<Professional[]> => {
  const admin = createAdminClient();
  const { data: personals, error } = await admin
    .from("personais")
    .select("id,bio,formacao,anos_experiencia,preco_mensal_base,atendimento,nota_media,total_avaliacoes,bairro,horarios,cref,whatsapp,instagram_url,facebook_url,tiktok_url,youtube_url,website_url")
    .eq("perfil_publico", true)
    .order("nota_media", { ascending: false });

  if (error || !personals?.length) return [];
  const ids = personals.map((item) => item.id);
  const [{ data: profiles }, { data: links }] = await Promise.all([
    admin.from("profiles").select("id,nome,avatar_url,telefone").in("id", ids),
    admin.from("personal_modalidades").select("personal_id,modalidades(nome)").in("personal_id", ids),
  ]);

  return personals.map((personal) => {
    const base = profiles?.find((item) => item.id === personal.id);
    const modalityNames = (links ?? [])
      .filter((item) => item.personal_id === personal.id)
      .map((item) => {
        const relation = item.modalidades as unknown as { nome?: string } | null;
        return relation?.nome;
      })
      .filter((name): name is string => Boolean(name));
    const nome = base?.nome ?? "Profissional";
    const iniciais = nome.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

    return {
      id: personal.id,
      nome,
      iniciais,
      avatarUrl: trustedAvatarUrl(base?.avatar_url, personal.id),
      especialidade: modalityNames.slice(0, 2).join(" e ") || "Treinamento personalizado",
      modalidades: modalityNames,
      bairro: personal.bairro ?? "Guarapuava",
      atendimento: personal.atendimento === "ambos" ? "Presencial e online" : personal.atendimento === "online" ? "Online" : "Presencial",
      atendimentoValor: personal.atendimento,
      preco: Number(personal.preco_mensal_base ?? 0),
      unidade: "por mês",
      nota: Number(personal.nota_media ?? 0),
      avaliacoes: personal.total_avaliacoes ?? 0,
      verificado: Boolean(personal.cref),
      destaque: personal.bio?.slice(0, 150) ?? "Conheça o trabalho e converse diretamente com o profissional.",
      bio: personal.bio ?? "",
      experiencia: personal.anos_experiencia === null ? "Experiência não informada" : `${personal.anos_experiencia} ${personal.anos_experiencia === 1 ? "ano" : "anos"} de experiência`,
      formacao: personal.formacao?.split("\n").map((item) => item.trim()).filter(Boolean) ?? [],
      horarios: personal.horarios ?? [],
      cref: personal.cref ?? "",
      telefone: base?.telefone ?? "",
      whatsapp: personal.whatsapp ?? "",
      instagramUrl: personal.instagram_url && isSocialUrl(personal.instagram_url, "instagram") ? personal.instagram_url : "",
      facebookUrl: personal.facebook_url && isSocialUrl(personal.facebook_url, "facebook") ? personal.facebook_url : "",
      tiktokUrl: personal.tiktok_url && isSocialUrl(personal.tiktok_url, "tiktok") ? personal.tiktok_url : "",
      youtubeUrl: personal.youtube_url && isSocialUrl(personal.youtube_url, "youtube") ? personal.youtube_url : "",
      websiteUrl: personal.website_url && isWebsiteUrl(personal.website_url) ? personal.website_url : "",
    };
  });
});

export const getPublicProfessional = cache(async (id: string) => {
  if (!isUuid(id)) return null;
  const professionals = await getPublicProfessionals();
  return professionals.find((item) => item.id === id) ?? null;
});

function trustedAvatarUrl(value: string | null | undefined, profileId: string) {
  if (!value || value.length > 500) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  try {
    const imageUrl = new URL(value);
    const expectedOrigin = new URL(supabaseUrl).origin;
    const expectedPrefix = `/storage/v1/object/public/profile-images/${profileId}/`;
    return imageUrl.origin === expectedOrigin
      && imageUrl.pathname.startsWith(expectedPrefix)
      && !imageUrl.username
      && !imageUrl.password
      && !imageUrl.search
      && !imageUrl.hash
      ? imageUrl.toString()
      : null;
  } catch {
    return null;
  }
}
