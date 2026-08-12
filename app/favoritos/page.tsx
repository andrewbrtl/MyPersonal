import type { Metadata } from "next";

import { ProfessionalCard } from "@/components/professional-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { professionals } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Perfis salvos" };

export default function FavoritesPage() {
  return (
    <main>
      <SiteHeader compact />
      <section className="border-b border-forest/15 bg-sand"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16"><p className="eyebrow">Sua seleção</p><h1 className="font-display mt-4 text-5xl font-medium tracking-[-0.04em] sm:text-6xl">Perfis salvos</h1><p className="mt-4 max-w-xl text-forest/60">Compare as opções que você guardou antes de conversar com um profissional.</p></div></section>
      <section className="section-shell">
        <div className="flex flex-col gap-4 border-b border-forest/15 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">3 perfis</p><h2 className="mt-2 text-lg font-semibold">Sua lista</h2></div><a href="/buscar" className="text-link">Explorar mais profissionais <span>→</span></a></div>
        <div className="mt-7 grid gap-5">{professionals.slice(0, 3).map((professional) => <ProfessionalCard key={professional.id} professional={professional} />)}</div>
      </section>
      <SiteFooter />
    </main>
  );
}
