import type { Metadata } from "next";
import Link from "next/link";

import { BrandPlaceholder } from "@/components/site-shell";

export const metadata: Metadata = { title: "Painel profissional" };

const tasks = [
  ["Foto do perfil", "Concluído", true],
  ["Apresentação profissional", "Concluído", true],
  ["Adicionar fotos do atendimento", "Pendente", false],
  ["Confirmar horários disponíveis", "Pendente", false],
] as const;

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-sand">
      <header className="border-b border-forest/15 bg-cream"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10"><BrandPlaceholder /><div className="flex items-center gap-3"><Link href="/profissionais/marina-silva" className="text-link hidden sm:inline-flex">Visualizar perfil</Link><span className="grid size-10 place-items-center bg-orange font-semibold text-white">MS</span></div></div></header>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[220px_1fr] lg:px-10 lg:py-14">
        <aside className="h-fit bg-forest p-4 text-cream lg:sticky lg:top-5"><p className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-orange-light">Área profissional</p><nav className="mt-3 grid text-sm"><Link href="/painel" className="border-l-2 border-orange bg-white/10 px-4 py-3 font-semibold">Painel</Link><Link href="#contatos" className="border-l-2 border-transparent px-4 py-3 text-cream/60 hover:text-white">Contatos</Link><Link href="/cadastro" className="border-l-2 border-transparent px-4 py-3 text-cream/60 hover:text-white">Editar perfil</Link><Link href="#configuracoes" className="border-l-2 border-transparent px-4 py-3 text-cream/60 hover:text-white">Configurações</Link></nav></aside>
        <div>
          <p className="eyebrow">Painel profissional</p><h1 className="font-display mt-3 text-5xl font-medium tracking-[-0.04em]">Olá, Marina.</h1><p className="mt-3 text-forest/55">Veja o que precisa de atenção no seu perfil.</p>
          <section className="mt-8 border border-forest/15 bg-cream p-5 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-forest/15 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">Prioridade</p><h2 className="font-display mt-3 text-3xl font-medium">Seu perfil está quase pronto</h2><p className="mt-2 text-sm text-forest/55">Complete os dois itens abaixo para publicar um perfil mais confiável.</p></div><span className="text-3xl font-semibold text-orange-dark">75%</span></div>
            <div className="mt-5 grid gap-2">{tasks.map(([label, status, done]) => <div key={label} className="flex items-center gap-4 border border-forest/10 p-4"><span className={`grid size-7 place-items-center rounded-full text-xs ${done ? "bg-forest text-white" : "border border-forest/25"}`}>{done ? "✓" : ""}</span><span className={`flex-1 text-sm font-semibold ${done ? "text-forest/45 line-through" : ""}`}>{label}</span><span className="text-xs text-forest/40">{status}</span></div>)}</div>
            <Link href="/cadastro" className="button-primary mt-6 w-full sm:w-auto">Completar perfil <span>→</span></Link>
          </section>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section id="contatos" className="border border-forest/15 bg-cream p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Últimos contatos</h2><a href="#" className="text-link">Ver todos</a></div><div className="mt-5 grid gap-3"><Contact initials="MC" name="Mariana Costa" detail="Interesse em musculação · hoje, 14h30" /><Contact initials="RM" name="Rafael Mendes" detail="Consultoria online · ontem" /></div></section>
            <section className="border border-forest/15 bg-cream p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Disponibilidade</h2><Link href="/cadastro" className="text-link">Editar</Link></div><dl className="mt-5 grid gap-3 text-sm"><Availability label="Manhã" value="06h às 11h" /><Availability label="Tarde" value="Indisponível" /><Availability label="Noite" value="18h às 21h" /><Availability label="Fim de semana" value="Sob consulta" /></dl></section>
          </div>
        </div>
      </div>
    </main>
  );
}

function Contact({ initials, name, detail }: { initials: string; name: string; detail: string }) { return <div className="flex items-center gap-3 border-t border-forest/10 pt-3"><span className="grid size-10 place-items-center bg-sand text-xs font-semibold">{initials}</span><div><p className="text-sm font-semibold">{name}</p><p className="mt-0.5 text-xs text-forest/45">{detail}</p></div></div>; }
function Availability({ label, value }: { label: string; value: string }) { return <div className="flex justify-between border-t border-forest/10 pt-3"><dt className="text-forest/45">{label}</dt><dd className="font-semibold">{value}</dd></div>; }
