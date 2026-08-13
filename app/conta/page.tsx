import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";

import { DeleteAccountForm } from "@/app/conta/delete-account-form";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Configurações da conta" };

export default async function AccountPage() {
  const profile = await requireUser("/conta");

  return (
    <main>
      <SiteHeader compact />
      <section className="border-b border-forest/15 bg-sand">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
          <Link href={profile.role === "personal" ? "/painel" : "/buscar"} className="text-link"><ArrowLeft size={16} /> Voltar</Link>
          <p className="eyebrow mt-8">Sua conta</p>
          <h1 className="font-display mt-3 text-5xl font-medium tracking-[-0.04em] sm:text-6xl">Configurações</h1>
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl gap-8 px-5 py-12 sm:px-8 lg:py-16">
        <section className="border border-forest/15 bg-cream p-5 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-forest text-white"><UserRound size={20} /></span>
            <div className="min-w-0"><p className="text-lg font-semibold">{profile.nome}</p><p className="mt-1 break-all text-sm text-forest/50">{profile.email}</p><span className="status-badge mt-3">Conta {profile.role === "personal" ? "profissional" : "de aluno"}</span></div>
          </div>
          <div className="mt-7 flex gap-3 border-t border-forest/10 pt-6 text-sm leading-6 text-forest/55"><ShieldCheck className="mt-0.5 shrink-0 text-orange-dark" size={19} /><p>A exclusão exige sua senha atual e duas confirmações para impedir cliques acidentais.</p></div>
        </section>

        <section className="border border-red-900/20 bg-cream p-5 sm:p-8">
          <p className="eyebrow text-red-800">Zona de risco</p>
          <h2 className="font-display mt-3 text-3xl font-medium">Excluir conta</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-forest/55">Seu acesso, perfil, imagens e dados vinculados serão removidos definitivamente. Depois disso, o mesmo e-mail poderá criar uma nova conta do zero.</p>
          <div className="mt-6"><DeleteAccountForm /></div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
