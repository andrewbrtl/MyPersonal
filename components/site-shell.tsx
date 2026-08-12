import Link from "next/link";
import { LogIn, MapPin, UserPlus } from "lucide-react";

import { AccountMenu } from "@/components/account-menu";
import { getCurrentProfile } from "@/lib/auth";

export function BrandPlaceholder({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Página inicial"
      className={`inline-flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-4 ${inverted ? "focus-visible:ring-offset-forest" : "focus-visible:ring-offset-cream"}`}
    >
      <span className={`relative grid size-10 place-items-center rounded-xl border ${inverted ? "border-cream/30 bg-cream text-forest" : "border-forest bg-forest text-cream"}`} aria-hidden="true">
        <MapPin size={19} strokeWidth={2.3} />
        <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-current bg-orange" />
      </span>
      <span className={`hidden text-xs font-semibold uppercase tracking-[0.16em] sm:block ${inverted ? "text-cream/70" : "text-forest/60"}`}>
        Guarapuava, PR
      </span>
    </Link>
  );
}

export async function SiteHeader({ compact = false }: { compact?: boolean }) {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-forest/15 bg-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <BrandPlaceholder />
        <nav aria-label="Navegação principal" className="flex items-center gap-2 sm:gap-6">
          <Link href="/buscar" className="nav-link hidden md:inline-flex">Encontrar profissionais</Link>
          {!compact && <Link href="/#como-funciona" className="nav-link hidden lg:inline-flex">Como funciona</Link>}
          {profile ? (
            <>
              <Link href={profile.role === "personal" ? "/painel" : "/favoritos"} className="nav-link hidden sm:inline-flex">
                {profile.role === "personal" ? "Meu painel" : "Meus salvos"}
              </Link>
              <AccountMenu profile={profile} />
            </>
          ) : (
            <>
            <Link href="/login" className="nav-link hidden gap-2 sm:inline-flex"><LogIn size={16} /> Entrar</Link>
              <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className="button-accent min-h-11 px-4 text-sm sm:px-5"><UserPlus size={17} /> Criar perfil</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-cream/20 bg-forest text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr] lg:px-10">
        <div>
          <BrandPlaceholder inverted />
          <p className="mt-5 max-w-sm text-sm leading-6 text-cream/60">
            Profissionais do esporte e pessoas que querem se movimentar, mais perto umas das outras.
          </p>
        </div>
        <div>
          <p className="eyebrow text-orange-light">Explorar</p>
          <div className="mt-4 grid gap-3 text-sm text-cream/70">
            <Link href="/buscar" className="hover:text-white">Profissionais</Link>
            <Link href="/#modalidades" className="hover:text-white">Modalidades</Link>
            <Link href="/#como-funciona" className="hover:text-white">Como funciona</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow text-orange-light">Informações</p>
          <div className="mt-4 grid gap-3 text-sm text-cream/70">
            <Link href="/termos" className="hover:text-white">Termos de uso</Link>
            <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
            <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className="hover:text-white">Criar perfil profissional</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 px-5 py-5 text-center text-xs text-cream/45">
        © 2026 · Guarapuava, Paraná
      </div>
    </footer>
  );
}
