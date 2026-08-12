import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Check, Circle, Eye, LayoutDashboard, LogOut, MessageCircle, PencilLine, Settings, UserRound } from "lucide-react";

import { signOutAction } from "@/app/login/actions";
import { BrandPlaceholder } from "@/components/site-shell";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Painel profissional" };

const tasks = [
  ["Foto do perfil", "Concluído", true],
  ["Apresentação profissional", "Concluído", true],
  ["Adicionar fotos do atendimento", "Pendente", false],
  ["Confirmar horários disponíveis", "Pendente", false],
] as const;

export default async function DashboardPage() {
  const profile = await requireRole("personal", "/painel");
  const firstName = profile.nome.trim().split(/\s+/)[0] || "profissional";
  const initials = profile.nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase() || "P";

  return (
    <main className="min-h-screen bg-sand">
      <header className="border-b border-forest/15 bg-cream"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10"><BrandPlaceholder /><div className="flex items-center gap-3"><Link href="/profissionais/marina-silva" className="text-link hidden sm:inline-flex"><Eye size={16} /> Visualizar perfil</Link><form action={signOutAction}><button type="submit" className="text-link"><LogOut size={16} /> <span className="hidden sm:inline">Sair</span></button></form><span className="grid size-10 place-items-center rounded-xl bg-orange font-semibold text-white" aria-label={`Conta de ${profile.nome}`}>{initials}</span></div></div></header>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[220px_1fr] lg:px-10 lg:py-14">
        <aside className="h-fit bg-forest p-4 text-cream lg:sticky lg:top-5"><p className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-orange-light">Área profissional</p><nav className="mt-3 grid text-sm"><Link href="/painel" className="flex items-center gap-3 border-l-2 border-orange bg-white/10 px-4 py-3 font-semibold"><LayoutDashboard size={17} /> Painel</Link><Link href="#contatos" className="flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-cream/65 hover:bg-white/5 hover:text-white"><MessageCircle size={17} /> Contatos</Link><Link href="/cadastro" className="flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-cream/65 hover:bg-white/5 hover:text-white"><UserRound size={17} /> Editar perfil</Link><Link href="#configuracoes" className="flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-cream/65 hover:bg-white/5 hover:text-white"><Settings size={17} /> Configurações</Link></nav></aside>
        <div>
          <p className="eyebrow">Painel profissional</p><h1 className="font-display mt-3 text-5xl font-medium tracking-[-0.04em]">Olá, {firstName}.</h1><p className="mt-3 text-forest/55">Veja o que precisa de atenção no seu perfil.</p>
          <section className="mt-8 border border-forest/15 bg-cream p-5 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-forest/15 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">Prioridade</p><h2 className="font-display mt-3 text-3xl font-medium">Seu perfil está quase pronto</h2><p className="mt-2 text-sm text-forest/55">Complete os dois itens abaixo para publicar um perfil mais confiável.</p></div><span className="text-3xl font-semibold text-orange-dark">75%</span></div>
            <div data-motion-list className="mt-5 grid gap-2">{tasks.map(([label, status, done]) => <div key={label} className="flex items-center gap-4 border border-forest/10 p-4"><span className={`grid size-8 place-items-center rounded-full ${done ? "bg-forest text-white" : "border border-forest/25 text-forest/35"}`}>{done ? <Check size={16} /> : <Circle size={14} />}</span><span className={`flex-1 text-sm font-semibold ${done ? "text-forest/45 line-through" : ""}`}>{label}</span><span className="text-xs text-forest/40">{status}</span></div>)}</div>
            <Link href="/cadastro" className="button-accent mt-6 min-h-12 w-full sm:w-auto">Completar perfil <ArrowRight size={17} /></Link>
          </section>
          <div data-motion-list className="mt-6 grid gap-6 xl:grid-cols-2">
            <section id="contatos" className="border border-forest/15 bg-cream p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><MessageCircle size={19} className="text-orange-dark" /> Últimos contatos</h2><a href="#" className="text-link">Ver todos</a></div><div className="mt-5 grid gap-3"><Contact initials="MC" name="Mariana Costa" detail="Interesse em musculação · hoje, 14h30" /><Contact initials="RM" name="Rafael Mendes" detail="Consultoria online · ontem" /></div></section>
            <section className="border border-forest/15 bg-cream p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarClock size={19} className="text-orange-dark" /> Disponibilidade</h2><Link href="/cadastro" className="text-link"><PencilLine size={15} /> Editar</Link></div><dl className="mt-5 grid gap-3 text-sm"><Availability label="Manhã" value="06h às 11h" /><Availability label="Tarde" value="Indisponível" /><Availability label="Noite" value="18h às 21h" /><Availability label="Fim de semana" value="Sob consulta" /></dl></section>
          </div>
        </div>
      </div>
    </main>
  );
}

function Contact({ initials, name, detail }: { initials: string; name: string; detail: string }) { return <div className="flex items-center gap-3 border-t border-forest/10 pt-3"><span className="grid size-10 place-items-center bg-sand text-xs font-semibold">{initials}</span><div><p className="text-sm font-semibold">{name}</p><p className="mt-0.5 text-xs text-forest/45">{detail}</p></div></div>; }
function Availability({ label, value }: { label: string; value: string }) { return <div className="flex justify-between border-t border-forest/10 pt-3"><dt className="text-forest/45">{label}</dt><dd className="font-semibold">{value}</dd></div>; }
