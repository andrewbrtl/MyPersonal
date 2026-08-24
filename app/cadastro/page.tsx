import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";

import { signOutAction } from "@/app/login/actions";
import { ProfileForm } from "@/app/cadastro/profile-form";
import { BrandPlaceholder } from "@/components/site-shell";
import { requireRole } from "@/lib/auth";
import { formatPhone } from "@/lib/contact";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Perfil profissional" };

export default async function RegistrationPage() {
  const profile = await requireRole("personal", "/cadastro");
  const supabase = await createClient();
  const [{ data: professional }, { data: modalities }, { data: selectedModalities }] = await Promise.all([
    supabase.from("personais").select("cref,bairro,bio,formacao,anos_experiencia,preco_mensal_base,atendimento,horarios,whatsapp,instagram_url,facebook_url,tiktok_url,youtube_url,website_url").eq("id", profile.id).single(),
    supabase.from("modalidades").select("id,nome").eq("ativo", true).order("nome"),
    supabase.from("personal_modalidades").select("modalidade_id").eq("personal_id", profile.id),
  ]);

  return (
    <main className="min-h-screen bg-sand">
      <header className="border-b border-cream/15 bg-forest text-cream"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"><BrandPlaceholder inverted /><div className="flex items-center gap-3"><Link href="/conta" className="text-link hidden text-cream sm:inline-flex">Configurações</Link><form action={signOutAction}><button type="submit" className="text-link text-cream"><LogOut size={16} /> Sair</button></form></div></div></header>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-9 grid gap-6 border-b border-forest/15 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="eyebrow">Perfil profissional</p><h1 className="font-display mt-4 max-w-3xl text-5xl font-medium tracking-[-0.04em] sm:text-6xl">Cadastro do perfil profissional</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-forest/55">Preencha as informações que serão exibidas no catálogo público.</p></div>
          <div className="flex max-w-sm gap-3 rounded-[2px] border border-forest/15 bg-cream p-4 text-xs leading-5 text-forest/55"><ShieldCheck className="shrink-0 text-orange-dark" size={20} /><span>Antes de publicar, confirmamos número, situação ativa e nome na consulta pública do CREF9/PR.</span></div>
        </div>
        <ProfileForm
          modalities={modalities ?? []}
          initialProfile={{
            nome: profile.nome,
            telefone: formatPhone(profile.telefone),
            avatarUrl: profile.avatarUrl,
            cref: professional?.cref ?? "",
            bairro: professional?.bairro ?? "",
            bio: professional?.bio ?? "",
            formacao: professional?.formacao ?? "",
            anosExperiencia: professional?.anos_experiencia ?? null,
            preco: professional?.preco_mensal_base ?? null,
            atendimento: professional?.atendimento ?? "presencial",
            horarios: professional?.horarios ?? [],
            modalidades: selectedModalities?.map((item) => item.modalidade_id) ?? [],
            whatsapp: formatPhone(professional?.whatsapp),
            instagram: professional?.instagram_url ?? "",
            facebook: professional?.facebook_url ?? "",
            tiktok: professional?.tiktok_url ?? "",
            youtube: professional?.youtube_url ?? "",
            website: professional?.website_url ?? "",
          }}
        />
      </div>
    </main>
  );
}
