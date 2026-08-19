import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Star } from "lucide-react";

import { FavoriteButton } from "@/components/favorite-button";
import type { Professional } from "@/lib/professionals";

export function ProfessionalCard({ professional, saved = false, returnTo = "/buscar", canFavorite = true }: { professional: Professional; saved?: boolean; returnTo?: string; canFavorite?: boolean }) {
  return (
    <article className="group grid min-w-0 overflow-hidden border border-cream/12 bg-[#111415] text-cream transition duration-300 hover:border-orange/60 md:grid-cols-[230px_minmax(0,1fr)]">
      <div
        className="relative grid min-h-56 place-items-center overflow-hidden bg-[#202426] text-cream md:min-h-full"
        style={professional.avatarUrl ? { backgroundImage: `linear-gradient(to top, rgb(11 13 14 / .82), transparent 68%), url(${professional.avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        role={professional.avatarUrl ? "img" : undefined}
        aria-label={professional.avatarUrl ? `Foto de ${professional.nome}` : undefined}
      >
        {!professional.avatarUrl && <span className="font-display text-6xl font-light text-cream/75">{professional.iniciais}</span>}
        <span className="absolute bottom-4 left-4 border-l border-orange pl-3 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white/64">
          {professional.bairro}
        </span>
      </div>
      <div className="flex min-w-0 flex-col p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display break-words text-3xl font-medium tracking-[-0.035em]">{professional.nome}</h2>
              {professional.verificado && <span className="inline-flex min-h-6 items-center gap-1 border border-cream/18 px-2 text-[0.56rem] font-bold uppercase tracking-[0.1em] text-cream/62"><BadgeCheck size={13} className="text-orange-light" /> CREF informado</span>}
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-orange-light">{professional.especialidade}</p>
          </div>
          {canFavorite && <FavoriteButton professionalId={professional.id} professionalName={professional.nome} initialSaved={saved} returnTo={returnTo} />}
        </div>
        <p className="mt-5 max-w-2xl break-words text-sm leading-6 text-cream/55 [overflow-wrap:anywhere]">{professional.destaque}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-cream/42">
          <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{professional.bairro}</span>
          <span>{professional.atendimento}</span>
          <span className="inline-flex items-center gap-1.5"><Star size={14} className={professional.avaliacoes ? "fill-orange text-orange" : "text-cream/30"} />{professional.avaliacoes ? `${professional.nota.toFixed(1)} (${professional.avaliacoes})` : "Novo"}</span>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-cream/12 pt-5">
          <p>
            <span className="block text-[0.58rem] uppercase tracking-[0.14em] text-cream/35">A partir de</span>
            <strong className="font-display text-2xl font-medium">{professional.preco > 0 ? `R$ ${professional.preco.toLocaleString("pt-BR")}` : "Sob consulta"}</strong>{" "}
            {professional.preco > 0 && <span className="text-xs text-cream/42">{professional.unidade}</span>}
          </p>
          <Link href={`/profissionais/${professional.id}`} className="inline-flex min-h-11 items-center gap-2 border-b border-cream/25 text-[0.64rem] font-bold uppercase tracking-[0.09em] text-cream transition hover:border-orange hover:text-orange-light">Ver perfil <ArrowRight size={16} /></Link>
        </div>
      </div>
    </article>
  );
}
