import type { Metadata } from "next";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";

import { ProfessionalCard } from "@/components/professional-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { modalities } from "@/lib/demo-data";
import { getPublicProfessionals } from "@/lib/professionals";

export const metadata: Metadata = { title: "Encontrar profissionais" };

export default async function SearchPage({ searchParams }: PageProps<"/buscar">) {
  const params = await searchParams;
  const professionals = await getPublicProfessionals();
  const term = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const modality = typeof params.modalidade === "string" ? params.modalidade.toLowerCase() : "";
  const filtered = professionals.filter((item) => {
    const text = `${item.nome} ${item.especialidade} ${item.modalidades.join(" ")}`.toLowerCase();
    return (!term || text.includes(term)) && (!modality || text.includes(modality));
  });

  return (
    <main>
      <SiteHeader compact />
      <section className="border-b border-forest/15 bg-sand">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <p className="eyebrow">Explorar · Guarapuava</p>
          <h1 className="font-display mt-4 text-5xl font-medium tracking-[-0.04em] sm:text-6xl">Profissionais em Guarapuava</h1>
          <p className="mt-4 text-forest/60">Compare especialidades, valores e locais de atendimento.</p>
          <form className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row" action="/buscar">
            <label className="sr-only" htmlFor="search">Especialidade ou nome</label>
            <input id="search" name="q" defaultValue={term} className="field flex-1 bg-cream" placeholder="Musculação, corrida, yoga ou nome" />
            <button className="button-accent min-h-12 sm:min-w-36" type="submit"><Search size={18} /> Buscar <ArrowRight size={17} /></button>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[250px_1fr] lg:px-10 lg:py-14">
        <aside className="h-fit border border-forest/15 bg-cream p-5 lg:sticky lg:top-5">
          <div className="flex items-center justify-between border-b border-forest/15 pb-4">
            <h2 className="font-semibold">Filtros</h2>
            <a href="/buscar" className="inline-flex items-center gap-1 text-xs underline underline-offset-4"><X size={13} /> Limpar</a>
          </div>
          <form action="/buscar" className="mt-5 grid gap-6">
            <fieldset>
              <legend className="field-label">Modalidade</legend>
              <div className="grid gap-2.5">
                {modalities.slice(0, 6).map(([name]) => (
                  <label key={name} className="flex items-center gap-3 text-sm text-forest/70">
                    <input type="radio" name="modalidade" value={name} defaultChecked={modality === name.toLowerCase()} />
                    {name}
                  </label>
                ))}
              </div>
            </fieldset>
            <label>
              <span className="field-label">Bairro</span>
              <select className="field" name="bairro" defaultValue="">
                <option value="">Todos os bairros</option>
                <option>Centro</option><option>Santa Cruz</option><option>Vila Bela</option><option>Bairro dos Estados</option>
              </select>
            </label>
            <label>
              <span className="field-label">Atendimento</span>
              <select className="field" name="atendimento" defaultValue="">
                <option value="">Presencial ou online</option><option>Presencial</option><option>Online</option>
              </select>
            </label>
            <button className="button-secondary min-h-12 px-4" type="submit"><SlidersHorizontal size={17} /> Aplicar filtros</button>
          </form>
        </aside>

        <div>
          <div className="flex flex-col gap-3 border-b border-forest/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="eyebrow">Resultados</p><p className="mt-2 text-sm text-forest/55">{filtered.length} profissionais encontrados</p></div>
            <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-forest/50">
              Ordenar por
              <select className="min-h-10 border border-forest/20 bg-cream px-3 text-sm normal-case tracking-normal text-forest"><option>Relevância</option><option>Menor preço</option><option>Melhor avaliação</option></select>
            </label>
          </div>
          {filtered.length ? (
            <div data-motion-list className="mt-6 grid gap-5">{filtered.map((item) => <ProfessionalCard key={item.id} professional={item} />)}</div>
          ) : (
            <div className="mt-6 border border-forest/15 bg-cream p-10 text-center">
              <h2 className="font-display text-3xl">Nenhum perfil encontrado</h2>
              <p className="mt-3 text-sm text-forest/55">Tente buscar por outra modalidade ou remova os filtros.</p>
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
