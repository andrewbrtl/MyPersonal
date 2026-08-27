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
          {!compact && <Link href="/buscar" className="nav-link nav-link-inverted hidden lg:inline-flex">Modalidades</Link>}
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
      <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <BrandPlaceholder inverted />
        <nav aria-label="Navegação do rodapé" className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-cream/55">
          <Link href="/buscar" className="hover:text-white">Profissionais</Link>
          <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className="hover:text-white">Criar perfil</Link>
          <Link href="/termos" className="hover:text-white">Termos</Link>
          <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
        </nav>
        <p className="text-[0.65rem] text-cream/35">© 2026 · Guarapuava, PR</p>
      </div>
    </footer>
  );
}
