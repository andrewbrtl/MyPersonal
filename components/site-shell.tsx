import Link from "next/link";

export function BrandPlaceholder() {
  return (
    <Link
      href="/"
      aria-label="Página inicial"
      className="inline-flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-4"
    >
      <span className="relative block size-9" aria-hidden="true">
        <span className="absolute left-0 top-0 size-6 bg-forest" />
        <span className="absolute bottom-0 right-0 size-4 bg-orange" />
      </span>
      <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-forest/60 sm:block">
        Guarapuava, PR
      </span>
    </Link>
  );
}

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="border-b border-forest/15 bg-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <BrandPlaceholder />
        <nav aria-label="Navegação principal" className="flex items-center gap-2 sm:gap-6">
          <Link href="/buscar" className="nav-link hidden md:inline-flex">Encontrar profissionais</Link>
          {!compact && <Link href="/#como-funciona" className="nav-link hidden lg:inline-flex">Como funciona</Link>}
          <Link href="/painel" className="nav-link hidden sm:inline-flex">Entrar</Link>
          <Link href="/cadastro" className="button-secondary min-h-11 px-4 text-sm sm:px-5">Criar perfil</Link>
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
          <BrandPlaceholder />
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
            <Link href="#" className="hover:text-white">Termos de uso</Link>
            <Link href="#" className="hover:text-white">Privacidade</Link>
            <Link href="#" className="hover:text-white">Contato</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 px-5 py-5 text-center text-xs text-cream/45">
        © 2026 · Guarapuava, Paraná
      </div>
    </footer>
  );
}
