import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";

import { ProfessionalCard } from "@/components/professional-card";
import { SearchFilters } from "@/components/search-filters";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentProfile } from "@/lib/auth";
import { INPUT_LIMITS, normalizeSearchInput, parseIntegerInput, parseMoneyInput } from "@/lib/input-validation";
import { getPublicProfessionals, type Professional } from "@/lib/professionals";
import { createClient } from "@/lib/supabase/server";
import styles from "./search.module.css";

export const metadata: Metadata = { title: "Buscar profissionais" };

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default async function SearchPage({ searchParams }: PageProps<"/buscar">) {
  const params = await searchParams;
  const supabase = await createClient();
  const [professionals, { data: modalityRows }, profile] = await Promise.all([
    getPublicProfessionals(),
    supabase.from("modalidades").select("nome,categoria").eq("ativo", true).order("categoria").order("nome"),
    getCurrentProfile(),
  ]);

  const availableModalities = modalityRows ?? [];
  const modalityNames = availableModalities.map((item) => item.nome);
  const categoryNames = [...new Set(availableModalities.map((item) => item.categoria))];
  const neighborhoods = [...new Set(professionals.flatMap((item) => [item.bairro, ...item.academias.map((gym) => gym.bairro)]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const term = normalizeSearchInput(params.q);
  const modality = findAllowedValue(normalizeSearchInput(params.modalidade), modalityNames);
  const category = findAllowedValue(normalizeSearchInput(params.categoria), categoryNames);
  const neighborhood = findAllowedValue(normalizeSearchInput(params.bairro), neighborhoods);
  const attendance = typeof params.atendimento === "string" && ["presencial", "online", "ambos"].includes(params.atendimento) ? params.atendimento : "";
  const maxPrice = parseMoneyInput(params.preco_max, 1, INPUT_LIMITS.price);
  const minExperience = parseIntegerInput(params.experiencia, 0, 80);
  const order = typeof params.ordem === "string" && ["relevancia", "preco", "avaliacao", "experiencia"].includes(params.ordem) ? params.ordem : "relevancia";
  const normalizedTerm = normalize(term);
  const tokens = normalizedTerm.split(/\s+/).filter(Boolean);

  const filtered = professionals.filter((item) => {
    const searchableText = normalize([
      item.nome,
      item.especialidade,
      item.modalidades.join(" "),
      item.categorias.join(" "),
      item.bairro,
      item.academias.map((gym) => `${gym.nome} ${gym.endereco} ${gym.bairro}`).join(" "),
      item.bio,
      item.formacao.join(" "),
    ].join(" "));
    const matchesTerm = tokens.every((token) => searchableText.includes(token));
    const matchesModality = !modality || item.modalidades.some((value) => normalize(value) === normalize(modality));
    const matchesCategory = !category || item.categorias.some((value) => normalize(value) === normalize(category));
    const matchesNeighborhood = !neighborhood
      || normalize(item.bairro) === normalize(neighborhood)
      || item.academias.some((gym) => normalize(gym.bairro) === normalize(neighborhood));
    const matchesAttendance = !attendance
      || item.atendimentoValor === attendance
      || (item.atendimentoValor === "ambos" && attendance !== "ambos");
    const matchesPrice = maxPrice === undefined || (item.preco > 0 && item.preco <= maxPrice);
    const matchesExperience = minExperience === undefined
      || (item.anosExperiencia !== null && item.anosExperiencia >= minExperience);
    return matchesTerm && matchesModality && matchesCategory && matchesNeighborhood && matchesAttendance && matchesPrice && matchesExperience;
  });

  filtered.sort((a, b) => {
    if (order === "preco") return comparablePrice(a) - comparablePrice(b);
    if (order === "avaliacao") return b.nota - a.nota || b.avaliacoes - a.avaliacoes;
    if (order === "experiencia") return (b.anosExperiencia ?? -1) - (a.anosExperiencia ?? -1);
    return relevanceScore(b, tokens, normalizedTerm) - relevanceScore(a, tokens, normalizedTerm)
      || b.nota - a.nota
      || b.avaliacoes - a.avaliacoes;
  });

  const favoriteIds = new Set<string>();
  if (profile?.role === "aluno") {
    const { data: favorites } = await supabase.from("favoritos").select("personal_id").eq("aluno_id", profile.id);
    favorites?.forEach((item) => favoriteIds.add(item.personal_id));
  }

  const activeFilterCount = [term, modality, category, neighborhood, attendance, maxPrice, minExperience].filter((value) => value !== "" && value !== undefined).length;
  const returnParams = new URLSearchParams();
  setParam(returnParams, "q", term);
  setParam(returnParams, "modalidade", modality);
  setParam(returnParams, "categoria", category);
  setParam(returnParams, "bairro", neighborhood);
  setParam(returnParams, "atendimento", attendance);
  setParam(returnParams, "preco_max", maxPrice);
  setParam(returnParams, "experiencia", minExperience);
  setParam(returnParams, "ordem", order === "relevancia" ? "" : order);
  const returnTo = returnParams.size ? `/buscar?${returnParams}` : "/buscar";

  return (
    <main className="bg-cream">
      <SiteHeader compact />
      <section className={styles.intro}>
          <div className={styles.introTop}><Link href="/"><ArrowLeft size={14} /> Início</Link><span>Guarapuava, PR · Presencial e online</span></div>
          <h1>Encontre seu personal.</h1>
          <p>Busque por nome, treino, academia ou bairro.</p>
          <form className={styles.searchForm} action="/buscar">
            {Array.from(returnParams.entries()).filter(([key]) => key !== "q").map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
            <label className="sr-only" htmlFor="search">Nome, modalidade ou bairro</label>
            <input id="search" name="q" maxLength={INPUT_LIMITS.search} defaultValue={term} placeholder="Nome, modalidade, academia ou bairro" />
            <button type="submit" aria-label="Buscar profissionais"><Search size={18} /> <span>Buscar</span></button>
          </form>
      </section>

      <section className={styles.layout}>
        <SearchFilters activeCount={activeFilterCount}>
          <div className="flex items-center justify-between border-b border-forest/20 px-5 py-4">
            <h2 className="font-semibold">Filtros {activeFilterCount ? `(${activeFilterCount})` : ""}</h2>
            {activeFilterCount > 0 && <a href="/buscar" className="inline-flex items-center gap-1 text-xs underline underline-offset-4"><X size={13} /> Limpar</a>}
          </div>
          <form action="/buscar" className="grid gap-5 p-5">
            {term && <input type="hidden" name="q" value={term} />}
            {order !== "relevancia" && <input type="hidden" name="ordem" value={order} />}
            <label>
              <span className="field-label">Tipo de treino</span>
              <select className="field" name="categoria" defaultValue={category}>
                <option value="">Todos os tipos</option>
                {categoryNames.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Modalidade ou objetivo</span>
              <select className="field" name="modalidade" defaultValue={modality}>
                <option value="">Todas as opções</option>
                {availableModalities.map((item) => <option key={item.nome} value={item.nome}>{item.nome}</option>)}
              </select>
            </label>
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
                <option value="">Presencial ou online</option>
                <option value="presencial">Presencial</option>
                <option value="online">Online</option>
                <option value="ambos">Presencial e online</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="field-label">Até R$</span>
                <input className="field" name="preco_max" type="number" inputMode="decimal" min="1" max={INPUT_LIMITS.price} step="1" defaultValue={maxPrice ?? ""} placeholder="Sem limite" />
              </label>
              <label>
                <span className="field-label">Experiência</span>
                <select className="field" name="experiencia" defaultValue={minExperience ?? ""}>
                  <option value="">Qualquer</option>
                  <option value="1">1+ ano</option>
                  <option value="3">3+ anos</option>
                  <option value="5">5+ anos</option>
                  <option value="10">10+ anos</option>
                </select>
              </label>
            </div>
            <button className="button-secondary min-h-12 px-4" type="submit"><SlidersHorizontal size={17} /> Aplicar</button>
          </form>
        </SearchFilters>

        <div>
          <div className="flex flex-col gap-3 border-b border-forest/20 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm font-semibold">{filtered.length} {filtered.length === 1 ? "profissional" : "profissionais"}</p>
            <form action="/buscar" className="flex items-center gap-2">
              {term && <input type="hidden" name="q" value={term} />}
              {modality && <input type="hidden" name="modalidade" value={modality} />}
              {category && <input type="hidden" name="categoria" value={category} />}
              {neighborhood && <input type="hidden" name="bairro" value={neighborhood} />}
              {attendance && <input type="hidden" name="atendimento" value={attendance} />}
              {maxPrice !== undefined && <input type="hidden" name="preco_max" value={maxPrice} />}
              {minExperience !== undefined && <input type="hidden" name="experiencia" value={minExperience} />}
              <label className="flex items-center gap-3 text-xs font-semibold text-forest/50">
                Ordenar
                <select name="ordem" defaultValue={order} className="min-h-10 border border-forest/20 bg-cream px-3 text-sm text-forest">
                  <option value="relevancia">Relevância</option>
                  <option value="preco">Menor preço</option>
                  <option value="experiencia">Mais experiência</option>
                  <option value="avaliacao">Melhor avaliação</option>
                </select>
              </label>
              <button type="submit" className="button-quiet min-h-10 border border-forest/20 px-3">OK</button>
            </form>
          </div>
          {filtered.length ? (
            <div data-motion-list className="mt-6 grid gap-4">
              {filtered.map((item) => <ProfessionalCard key={item.id} professional={item} saved={favoriteIds.has(item.id)} returnTo={returnTo} canFavorite={profile?.role !== "personal"} />)}
            </div>
          ) : (
            <div className={styles.empty}>
              <Search size={28} strokeWidth={1.4} />
              <h2>{activeFilterCount ? "Nenhum perfil com esses filtros." : "Ainda não há perfis publicados."}</h2>
              <p>{activeFilterCount ? "Tente outra modalidade ou retire um filtro para ampliar a busca." : "Os profissionais aparecerão aqui assim que publicarem seus perfis."}</p>
              {activeFilterCount > 0 && <Link href="/buscar">Limpar busca</Link>}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function findAllowedValue(value: string, allowed: string[]) {
  if (!value) return "";
  return allowed.find((item) => normalize(item) === normalize(value)) ?? "";
}

function comparablePrice(professional: Professional) {
  return professional.preco > 0 ? professional.preco : Number.MAX_SAFE_INTEGER;
}

function relevanceScore(professional: Professional, tokens: string[], normalizedTerm: string) {
  if (!tokens.length) return professional.nota * 2 + Math.min(professional.avaliacoes, 20) / 10;
  const name = normalize(professional.nome);
  const modalities = normalize(professional.modalidades.join(" "));
  const categories = normalize(professional.categorias.join(" "));
  const neighborhood = normalize(professional.bairro);
  const gyms = normalize(professional.academias.map((gym) => `${gym.nome} ${gym.endereco} ${gym.bairro}`).join(" "));
  const bio = normalize(professional.bio);
  let score = name === normalizedTerm ? 120 : name.includes(normalizedTerm) ? 70 : 0;
  for (const token of tokens) {
    if (name.includes(token)) score += 24;
    if (modalities.includes(token)) score += 18;
    if (categories.includes(token)) score += 10;
    if (neighborhood.includes(token)) score += 8;
    if (gyms.includes(token)) score += 12;
    if (bio.includes(token)) score += 2;
  }
  return score;
}

function setParam(params: URLSearchParams, key: string, value: string | number | undefined) {
  if (value !== "" && value !== undefined) params.set(key, String(value));
}
