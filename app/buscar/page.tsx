import type { Metadata } from "next";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";

import { ProfessionalCard } from "@/components/professional-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentProfile } from "@/lib/auth";
import { getPublicProfessionals } from "@/lib/professionals";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Encontrar profissionais" };

export default async function SearchPage({ searchParams }: PageProps<"/buscar">) {
  const params = await searchParams;
  const supabase = await createClient();
  const [professionals, { data: modalityRows }] = await Promise.all([
    getPublicProfessionals(),
    supabase.from("modalidades").select("nome").eq("ativo", true).order("nome"),
  ]);
  const rawTerm = typeof params.q === "string" ? params.q.trim() : "";
  const modality = typeof params.modalidade === "string" ? params.modalidade.trim() : "";
  const neighborhood = typeof params.bairro === "string" ? params.bairro.trim() : "";
  const attendance = ["presencial", "online", "ambos"].includes(String(params.atendimento)) ? String(params.atendimento) : "";
  const order = ["relevancia", "preco", "avaliacao"].includes(String(params.ordem)) ? String(params.ordem) : "relevancia";
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const term = normalize(rawTerm);
  const filtered = professionals.filter((item) => {
    const text = normalize(`${item.nome} ${item.especialidade} ${item.modalidades.join(" ")} ${item.bairro}`);
    const normalizedModality = normalize(modality);
    const modalityAliases: Record<string, string[]> = {
      lutas: ["boxe", "muay thai", "jiu-jitsu"],
      "yoga e pilates": ["yoga", "pilates"],
      "outros esportes": ["crossfit", "hyrox", "ciclismo", "tenis"],
    };
    const requestedModalities = modalityAliases[normalizedModality] ?? [normalizedModality];
    const matchesModality = !modality
      || item.modalidades.some((itemModality) => requestedModalities.some((requested) => normalize(itemModality).startsWith(requested)));
    const matchesNeighborhood = !neighborhood || normalize(item.bairro) === normalize(neighborhood);
    const matchesAttendance = !attendance
      || item.atendimentoValor === attendance
      || (item.atendimentoValor === "ambos" && attendance !== "ambos");
    return (!term || text.includes(term)) && matchesModality && matchesNeighborhood && matchesAttendance;
  });
  filtered.sort((a, b) => order === "preco"
    ? a.preco - b.preco
    : order === "avaliacao"
      ? b.nota - a.nota || b.avaliacoes - a.avaliacoes
      : b.nota - a.nota);

  const availableModalities = modalityRows?.map((item) => item.nome) ?? [];
  const neighborhoods = [...new Set(professionals.map((item) => item.bairro).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const profile = await getCurrentProfile();
  const favoriteIds = new Set<string>();
  if (profile?.role === "aluno") {
    const { data: favorites } = await supabase.from("favoritos").select("personal_id").eq("aluno_id", profile.id);
    favorites?.forEach((item) => favoriteIds.add(item.personal_id));
  }

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
            <input id="search" name="q" defaultValue={rawTerm} className="field flex-1 bg-cream" placeholder="Musculação, corrida ou nome" />
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
            {rawTerm && <input type="hidden" name="q" value={rawTerm} />}
            <fieldset>
              <legend className="field-label">Modalidade</legend>
              <div className="grid gap-2.5">
                {availableModalities.map((name) => (
                  <label key={name} className="flex items-center gap-3 text-sm text-forest/70">
                    <input type="radio" name="modalidade" value={name} defaultChecked={normalize(modality) === normalize(name)} />
                    {name}
                  </label>
                ))}
              </div>
            </fieldset>
            <label>
              <span className="field-label">Bairro</span>
              <select className="field" name="bairro" defaultValue={neighborhood}>
                <option value="">Todos os bairros</option>
                {neighborhoods.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Atendimento</span>
              <select className="field" name="atendimento" defaultValue={attendance}>
                <option value="">Presencial ou online</option><option value="presencial">Presencial</option><option value="online">Online</option><option value="ambos">Presencial e online</option>
              </select>
            </label>
            <button className="button-secondary min-h-12 px-4" type="submit"><SlidersHorizontal size={17} /> Aplicar filtros</button>
          </form>
        </aside>

        <div>
          <div className="flex flex-col gap-3 border-b border-forest/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="eyebrow">Resultados</p><p className="mt-2 text-sm text-forest/55">{filtered.length} {filtered.length === 1 ? "profissional encontrado" : "profissionais encontrados"}</p></div>
            <form action="/buscar" className="flex items-center gap-2">
              {rawTerm && <input type="hidden" name="q" value={rawTerm} />}
              {modality && <input type="hidden" name="modalidade" value={modality} />}
              {neighborhood && <input type="hidden" name="bairro" value={neighborhood} />}
              {attendance && <input type="hidden" name="atendimento" value={attendance} />}
              <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-forest/50">
                Ordenar por
                <select name="ordem" defaultValue={order} className="min-h-10 border border-forest/20 bg-cream px-3 text-sm normal-case tracking-normal text-forest"><option value="relevancia">Relevância</option><option value="preco">Menor preço</option><option value="avaliacao">Melhor avaliação</option></select>
              </label>
              <button type="submit" className="button-quiet min-h-10 px-3">Ordenar</button>
            </form>
          </div>
          {filtered.length ? (
            <div data-motion-list className="mt-6 grid gap-5">{filtered.map((item) => <ProfessionalCard key={item.id} professional={item} saved={favoriteIds.has(item.id)} returnTo="/buscar" canFavorite={profile?.role !== "personal"} />)}</div>
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
