"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Bookmark, ChevronDown, Dumbbell, LogOut, Plus, Search, Settings, UserRound } from "lucide-react";

import { signOutAction, signOutAndCreateAccountAction } from "@/app/login/actions";

type AccountMenuProps = {
  profile: {
    nome: string;
    email: string;
    role: "aluno" | "personal" | "admin";
    avatarUrl: string | null;
  };
};

export function AccountMenu({ profile }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstName = profile.nome.trim().split(/\s+/)[0] || "Conta";
  const initials = profile.nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
  const isProfessional = profile.role === "personal";

  useLayoutEffect(() => {
    if (!open || !panelRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(panelRef.current, { autoAlpha: 0, y: -8, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.22, ease: "power2.out" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 items-center gap-2 rounded-xl border border-forest/18 bg-white/45 p-1.5 pr-2 text-left transition hover:border-forest/35 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
      >
        <Avatar avatarUrl={profile.avatarUrl} initials={initials} name={profile.nome} />
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-24 truncate text-xs font-semibold text-forest">{firstName}</span>
          <span className="block text-[0.62rem] uppercase tracking-[0.1em] text-forest/42">{isProfessional ? "Profissional" : "Aluno"}</span>
        </span>
        <ChevronDown size={14} className={`hidden text-forest/45 transition sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div ref={panelRef} role="menu" className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-forest/15 bg-cream shadow-[0_22px_60px_rgba(24,52,44,0.18)]">
          <div className="flex items-center gap-3 border-b border-forest/10 bg-sand/70 p-4">
            <Avatar avatarUrl={profile.avatarUrl} initials={initials} name={profile.nome} large />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile.nome}</p>
              <p className="mt-0.5 truncate text-xs text-forest/45">{profile.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-forest px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white">
                <span className="size-1.5 rounded-full bg-orange-light" /> Conta {isProfessional ? "profissional" : "de aluno"}
              </span>
            </div>
          </div>

          <div className="grid p-2 text-sm">
            {isProfessional ? (
              <>
                <MenuLink href="/painel" icon={<Dumbbell size={16} />}>Meu painel</MenuLink>
                <MenuLink href="/cadastro" icon={<Settings size={16} />}>Editar perfil profissional</MenuLink>
              </>
            ) : (
              <>
                <MenuLink href="/buscar" icon={<Search size={16} />}>Encontrar profissionais</MenuLink>
                <MenuLink href="/favoritos" icon={<Bookmark size={16} />}>Meus perfis salvos</MenuLink>
              </>
            )}
          </div>

          <div className="border-t border-forest/10 p-2">
            <form action={signOutAndCreateAccountAction}>
              <input type="hidden" name="tipo" value="aluno" />
              <button type="submit" role="menuitem" className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-semibold text-forest/62 transition hover:bg-sand hover:text-forest">
                <Plus size={15} /> Sair e criar outra conta
              </button>
            </form>
            <form action={signOutAction}>
              <button type="submit" role="menuitem" className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-semibold text-orange-dark transition hover:bg-orange/8">
                <LogOut size={15} /> Sair desta conta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <Link href={href} role="menuitem" className="flex min-h-11 items-center gap-3 rounded-lg px-3 font-medium text-forest/68 transition hover:bg-sand hover:text-forest">{icon}{children}</Link>;
}

function Avatar({ avatarUrl, initials, name, large = false }: { avatarUrl: string | null; initials: string; name: string; large?: boolean }) {
  const size = large ? "size-12" : "size-9";
  if (avatarUrl) return <span className={`${size} shrink-0 rounded-xl bg-cover bg-center`} style={{ backgroundImage: `url(${avatarUrl})` }} role="img" aria-label={`Foto de ${name}`} />;
  return <span className={`${size} grid shrink-0 place-items-center rounded-xl bg-forest text-xs font-semibold text-white`} aria-hidden="true">{initials || <UserRound size={16} />}</span>;
}
