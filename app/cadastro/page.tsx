import type { Metadata } from "next";
import { ArrowRight, LogOut, Save } from "lucide-react";

import { BrandPlaceholder } from "@/components/site-shell";
import { signOutAction } from "@/app/login/actions";
import { requireRole } from "@/lib/auth";
import { modalities } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Criar perfil profissional" };

export default async function RegistrationPage() {
  await requireRole("personal", "/cadastro");

  return (
    <main className="min-h-screen bg-sand">
      <header className="border-b border-forest/15 bg-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"><BrandPlaceholder /><form action={signOutAction}><button type="submit" className="text-link"><LogOut size={16} /> Sair</button></form></div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[280px_1fr] lg:py-14">
        <aside>
          <p className="eyebrow">Cadastro profissional</p>
          <h1 className="font-display mt-4 text-4xl font-medium leading-tight">Conte como você trabalha.</h1>
          <p className="mt-4 text-sm leading-6 text-forest/55">Essas informações ajudam as pessoas a entender se o seu atendimento combina com o que procuram.</p>
          <ol className="mt-8 grid gap-1 text-sm">
            {[["01", "Informações básicas", true], ["02", "Especialidades", false], ["03", "Onde atende", false], ["04", "Valores e horários", false], ["05", "Revisar perfil", false]].map(([number, label, active]) => (
              <li key={String(number)} className={`flex gap-4 border-l-2 px-4 py-3 ${active ? "border-orange bg-cream font-semibold" : "border-forest/15 text-forest/45"}`}><span className="text-xs">{number}</span>{label}</li>
            ))}
          </ol>
        </aside>
        <section className="border border-forest/15 bg-cream p-5 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between border-b border-forest/15 pb-5"><div><p className="eyebrow">Etapa 1 de 5</p><h2 className="font-display mt-2 text-3xl font-medium">Informações básicas</h2></div><span className="text-sm font-semibold text-orange-dark">20%</span></div>
          <form data-motion-list className="mt-8 grid gap-6 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="field-label">Nome completo</span><input className="field" placeholder="Como seu nome aparece profissionalmente" /></label>
            <label><span className="field-label">Telefone</span><input className="field" type="tel" placeholder="(42) 99999-9999" /></label>
            <label><span className="field-label">CREF ou registro</span><input className="field" placeholder="Opcional nesta etapa" /></label>
            <label><span className="field-label">Bairro principal</span><input className="field" placeholder="Ex.: Centro" /></label>
            <label><span className="field-label">Formato de atendimento</span><select className="field" defaultValue="ambos"><option value="presencial">Presencial</option><option value="online">Online</option><option value="ambos">Presencial e online</option></select></label>
            <fieldset className="sm:col-span-2"><legend className="field-label">Principais modalidades</legend><div className="grid gap-2 sm:grid-cols-2">{modalities.slice(0, 6).map(([name]) => <label key={name} className="flex min-h-11 items-center gap-3 border border-forest/15 px-3 text-sm"><input type="checkbox" />{name}</label>)}</div></fieldset>
            <label className="sm:col-span-2"><span className="field-label">Apresentação</span><textarea className="field min-h-32 py-3" placeholder="Conte de forma simples com quem você trabalha e como são seus atendimentos." /><span className="mt-2 block text-xs text-forest/45">Evite promessas. Explique seu método, experiência e público.</span></label>
            <div className="flex flex-col-reverse gap-3 border-t border-forest/15 pt-6 sm:col-span-2 sm:flex-row sm:justify-between"><button type="button" className="button-quiet"><Save size={17} /> Salvar e continuar depois</button><button type="button" className="button-accent min-h-12">Salvar e continuar <ArrowRight size={17} /></button></div>
          </form>
        </section>
      </div>
    </main>
  );
}
