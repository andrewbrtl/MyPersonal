import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProfessionalCard } from "@/components/professional-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { modalities, professionals } from "@/lib/demo-data";

const steps = [
  ["01", "Busque", "Filtre por modalidade, bairro, formato de atendimento e valor."],
  ["02", "Compare", "Conheça o trabalho, a experiência e os valores de cada profissional."],
  ["03", "Converse", "Tire suas dúvidas diretamente antes de combinar o primeiro treino."],
] as const;

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="px-5 pb-16 pt-14 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
            <p className="eyebrow"><span className="eyebrow-line" /> Guia local de esporte</p>
            <h1 className="font-display mt-8 max-w-3xl text-hero font-medium text-forest">
              Seu treino começa com a pessoa certa.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-forest/68">
              Encontre profissionais de esporte em Guarapuava por modalidade, bairro e faixa de preço.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/buscar" className="button-primary sm:min-w-64">
                Encontrar profissionais <ArrowRight size={18} />
              </Link>
              <span className="text-sm text-forest/50">Gratuito para quem busca</span>
            </div>
          </div>

          <div className="relative bg-forest px-5 py-10 text-cream sm:px-8 lg:px-10 lg:py-16">
            <div className="absolute right-0 top-0 h-28 w-28 bg-orange sm:h-40 sm:w-40" aria-hidden="true" />
            <div className="relative max-w-xl">
              <p className="eyebrow text-orange-light">Comece pela modalidade</p>
              <h2 className="font-display mt-4 max-w-md text-4xl font-medium leading-tight sm:text-5xl">
                Encontre alguém que combine com seu ritmo.
              </h2>
              <div className="mt-10 border-t border-cream/20">
                {modalities.slice(0, 4).map(([name], index) => (
                  <Link
                    key={name}
                    href={`/buscar?modalidade=${encodeURIComponent(name)}`}
                    className="group flex items-center gap-5 border-b border-cream/15 py-4 outline-none hover:text-orange-light focus-visible:text-orange-light"
                  >
                    <span className="text-xs tabular-nums text-orange-light">0{index + 1}</span>
                    <span className="flex-1 text-lg font-semibold">{name}</span>
                    <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modalidades" className="section-shell bg-sand">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 · Modalidades</p>
            <h2 className="font-display section-title">O que você quer praticar?</h2>
          </div>
          <Link href="/buscar" className="text-link">Ver todas <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-10 grid border-l border-t border-forest/15 sm:grid-cols-2 lg:grid-cols-4">
          {modalities.map(([name, detail], index) => (
            <Link key={name} href={`/buscar?modalidade=${encodeURIComponent(name)}`} className="modality-cell">
              <span className="text-xs text-orange-dark">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-8 text-lg font-semibold">{name}</h3>
              <p className="mt-1 text-sm text-forest/55">{detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell bg-cream">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 · Perto de você</p>
            <h2 className="font-display section-title">Profissionais em destaque</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-forest/55">Perfis locais para você comparar especialidades, valores e formas de atendimento.</p>
        </div>
        <div className="mt-10 grid gap-5 xl:grid-cols-3">
          {professionals.slice(0, 3).map((professional) => (
            <div key={professional.id} className="xl:[&>article]:block xl:[&>article>div:first-child]:min-h-56">
              <ProfessionalCard professional={professional} />
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="bg-forest text-cream">
        <div className="section-shell">
          <p className="eyebrow text-orange-light">03 · Como funciona</p>
          <div className="mt-7 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="font-display text-5xl font-medium leading-[1.02] sm:text-6xl">Simples para quem busca. Direto para quem trabalha.</h2>
            <div className="border-t border-cream/20">
              {steps.map(([number, title, text]) => (
                <article key={number} className="grid gap-4 border-b border-cream/15 py-6 sm:grid-cols-[48px_150px_1fr] sm:items-start">
                  <span className="text-xs text-orange-light">{number}</span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm leading-6 text-cream/60">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-orange text-white">
        <div className="section-shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow text-white/70">Para profissionais</p>
            <h2 className="font-display mt-5 max-w-3xl text-5xl font-medium leading-tight sm:text-6xl">Mostre seu trabalho para pessoas da sua região.</h2>
          </div>
          <Link href="/cadastro" className="button-light">Criar perfil profissional <ArrowRight size={18} /></Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
