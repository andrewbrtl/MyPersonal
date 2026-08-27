import Link from "next/link";
import { Dumbbell, LogIn, UserPlus } from "lucide-react";

import { AccountMenu } from "@/components/account-menu";
import { getCurrentProfile } from "@/lib/auth";

export function BrandPlaceholder({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Página inicial"
      className={`brand-lockup outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-4 ${inverted ? "brand-lockup-inverted focus-visible:ring-offset-forest" : "focus-visible:ring-offset-cream"}`}
    >
      <span className="brand-mark" aria-hidden="true"><Dumbbell size={19} strokeWidth={2.2} /></span>
      <span className="brand-place">
        <strong>Guarapuava</strong>
        <small>Profissionais de esporte</small>
      </span>
    </Link>
  );
}

export async function SiteHeader({ compact = false, overlay = false }: { compact?: boolean; overlay?: boolean }) {
  const profile = await getCurrentProfile();

  return (
    <header className={`site-header ${overlay ? "site-header-overlay" : ""}`}>
      <div className="mx-auto flex max-w-[96rem] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <BrandPlaceholder inverted />
        <nav aria-label="Navegação principal" className="flex items-center gap-2 sm:gap-6">
          <Link href="/buscar" className="nav-link nav-link-inverted hidden md:inline-flex">Buscar</Link>
          {!compact && <Link href="/#modalidades" className="nav-link nav-link-inverted hidden lg:inline-flex">Modalidades</Link>}
          {profile ? (
            <>
              <Link href={profile.role === "personal" ? "/painel" : "/favoritos"} className="nav-link nav-link-inverted hidden sm:inline-flex">
                {profile.role === "personal" ? "Meu painel" : "Meus salvos"}
              </Link>
              <AccountMenu profile={profile} inverted />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link nav-link-inverted hidden gap-2 sm:inline-flex"><LogIn size={15} /> Entrar</Link>
              <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className="button-accent min-h-11 px-4 sm:px-5"><UserPlus size={16} /> Cadastrar perfil</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr] lg:px-12 lg:py-20">
        <div>
          <BrandPlaceholder inverted />
          <p className="mt-6 max-w-sm text-sm leading-7 text-cream/48">
            Encontre profissionais de esporte que atendem em Guarapuava.
          </p>
        </div>
        <div>
          <p className="eyebrow text-orange-light">Explorar</p>
          <div className="mt-5 grid gap-4 text-xs font-semibold uppercase tracking-[0.08em] text-cream/55">
            <Link href="/buscar" className="hover:text-white">Profissionais</Link>
            <Link href="/#modalidades" className="hover:text-white">Modalidades</Link>
            <Link href="/#como-funciona" className="hover:text-white">Informações dos perfis</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow text-orange-light">Informações</p>
          <div className="mt-5 grid gap-4 text-xs font-semibold uppercase tracking-[0.08em] text-cream/55">
            <Link href="/termos" className="hover:text-white">Termos de uso</Link>
            <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
            <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className="hover:text-white">Criar perfil profissional</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 px-5 py-5 text-center text-[0.6rem] uppercase tracking-[0.16em] text-cream/35">
        © 2026 · Guia local de Guarapuava
      </div>
    </footer>
  );
}
