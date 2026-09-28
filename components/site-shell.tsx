import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";

import { AccountMenu } from "@/components/account-menu";
import { getCurrentProfile } from "@/lib/auth";

export function BrandPlaceholder({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Página inicial"
      className={`brand-lockup outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-4 ${inverted ? "brand-lockup-inverted focus-visible:ring-offset-forest" : "focus-visible:ring-offset-cream"}`}
    >
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="brand-place">
        <strong>Guarapuava</strong>
        <small>Guia de personal trainers</small>
      </span>
    </Link>
  );
}

export async function SiteHeader({ compact = false, overlay = false }: { compact?: boolean; overlay?: boolean }) {
  const profile = await getCurrentProfile();

  return (
    <header className={`site-header ${overlay ? "site-header-overlay" : ""}`}>
      <div className="header-inner">
        <BrandPlaceholder inverted={overlay} />
        <nav aria-label="Navegação principal" className="header-navigation">
          <Link href="/buscar" className="nav-link desktop-nav-link">Encontrar um personal</Link>
          {!compact && <Link href="/#modalidades" className="nav-link desktop-nav-link">Modalidades</Link>}
          {profile ? (
            <>
              <Link href={profile.role === "personal" ? "/painel" : "/favoritos"} className="nav-link desktop-nav-link">
                {profile.role === "personal" ? "Meu painel" : "Meus salvos"}
              </Link>
              <AccountMenu profile={profile} inverted={overlay} />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link header-login">Entrar</Link>
              <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className="header-cta">Sou personal <ArrowUpRight size={16} /></Link>
            </>
          )}
          <details className="mobile-navigation">
            <summary aria-label="Abrir navegação"><Menu size={21} /></summary>
            <div className="mobile-navigation-panel">
              <Link href="/buscar">Encontrar um personal <ArrowUpRight size={16} /></Link>
              <Link href="/#modalidades">Modalidades <ArrowUpRight size={16} /></Link>
              {profile ? (
                <>
                  <Link href={profile.role === "personal" ? "/painel" : "/favoritos"}>{profile.role === "personal" ? "Meu painel" : "Meus salvos"} <ArrowUpRight size={16} /></Link>
                  <Link href="/conta">Minha conta <ArrowUpRight size={16} /></Link>
                </>
              ) : <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro">Sou personal <ArrowUpRight size={16} /></Link>}
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <BrandPlaceholder />
        <nav aria-label="Navegação do rodapé">
          <Link href="/buscar">Profissionais</Link>
          <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro">Criar perfil</Link>
          <Link href="/termos">Termos</Link>
          <Link href="/privacidade">Privacidade</Link>
        </nav>
        <p>© {new Date().getFullYear()} · Guarapuava, PR</p>
      </div>
    </footer>
  );
}
