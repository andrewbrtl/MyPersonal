import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { ProfessionalCard } from "@/components/professional-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { requireRole } from "@/lib/auth";
import { getPublicProfessionals } from "@/lib/professionals";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Perfis salvos" };

export default async function FavoritesPage() {
  const profile = await requireRole("aluno", "/favoritos");
  const supabase = await createClient();
  const [{ data: favorites }, professionals] = await Promise.all([
    supabase.from("favoritos").select("personal_id").eq("aluno_id", profile.id),
    getPublicProfessionals(),
  ]);
  const favoriteIds = new Set(favorites?.map((item) => item.personal_id) ?? []);
  const savedProfessionals = professionals.filter((item) => favoriteIds.has(item.id));

  return (
    <main>
      <SiteHeader compact />
      <section className="border-b border-forest/15 bg-sand"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16"><p className="eyebrow">Sua seleção</p><h1 className="font-display mt-4 text-5xl font-medium tracking-[-0.04em] sm:text-6xl">Perfis salvos</h1><p className="mt-4 max-w-xl text-forest/60">Compare as opções que você guardou antes de conversar com um profissional.</p></div></section>
      <section className="section-shell">
        <div className="flex flex-col gap-4 border-b border-forest/15 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">{savedProfessionals.length} {savedProfessionals.length === 1 ? "perfil" : "perfis"}</p><h2 className="mt-2 text-lg font-semibold">Sua lista</h2></div><a href="/buscar" className="text-link">Explorar mais profissionais <ArrowRight size={16} /></a></div>
        {savedProfessionals.length ? <div data-motion-list className="mt-7 grid gap-5">{savedProfessionals.map((professional) => <ProfessionalCard key={professional.id} professional={professional} saved returnTo="/favoritos" />)}</div> : <div className="mt-7 border border-forest/15 bg-cream p-10 text-center"><h2 className="font-display text-3xl">Nenhum perfil salvo ainda</h2><p className="mt-3 text-sm text-forest/55">Quando você salvar um profissional real, ele aparecerá aqui.</p></div>}
      </section>
      <SiteFooter />
    </main>
  );
}
