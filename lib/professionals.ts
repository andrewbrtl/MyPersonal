import "server-only";

import { cache } from "react";

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
};

export const getPublicProfessionals = cache(async (): Promise<Professional[]> => {
  const admin = createAdminClient();
  const { data: personals, error } = await admin
    .from("personais")
    .select("id,bio,formacao,anos_experiencia,preco_mensal_base,atendimento,nota_media,total_avaliacoes,bairro,horarios,cref")
    .eq("perfil_publico", true)
    .order("nota_media", { ascending: false });

  if (error || !personals?.length) return [];
  const ids = personals.map((item) => item.id);
  const [{ data: profiles }, { data: links }] = await Promise.all([
    admin.from("profiles").select("id,nome,avatar_url").in("id", ids),
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
      avatarUrl: base?.avatar_url ?? null,
      especialidade: modalityNames.slice(0, 2).join(" e ") || "Treinamento personalizado",
      modalidades: modalityNames,
      bairro: personal.bairro ?? "Guarapuava",
      atendimento: personal.atendimento === "ambos" ? "Presencial e online" : personal.atendimento === "online" ? "Online" : "Presencial",
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
    };
  });
});

export const getPublicProfessional = cache(async (id: string) => {
  const professionals = await getPublicProfessionals();
  return professionals.find((item) => item.id === id) ?? null;
});
