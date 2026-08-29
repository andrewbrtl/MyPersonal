import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Building2, MapPin, Star } from "lucide-react";

import { FavoriteButton } from "@/components/favorite-button";
import type { Professional } from "@/lib/professionals";

export function ProfessionalCard({ professional, saved = false, returnTo = "/buscar", canFavorite = true }: { professional: Professional; saved?: boolean; returnTo?: string; canFavorite?: boolean }) {
  return (
    <article className="group grid min-w-0 overflow-hidden border border-forest/20 bg-white text-forest transition duration-200 hover:border-forest/50 md:grid-cols-[220px_minmax(0,1fr)]">
      <div
        className="relative grid min-h-56 place-items-center overflow-hidden bg-[#2b2829] text-cream md:min-h-full"
        style={professional.avatarUrl ? { backgroundImage: `linear-gradient(to top, rgb(33 31 32 / .78), transparent 68%), url(${professional.avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        role={professional.avatarUrl ? "img" : undefined}
        aria-label={professional.avatarUrl ? `Foto de ${professional.nome}` : undefined}
      >
        {!professional.avatarUrl && <span className="text-5xl font-bold text-orange">{professional.iniciais}</span>}
        <span className="absolute bottom-4 left-4 border-l-2 border-orange bg-forest/80 px-3 py-1.5 text-[0.65rem] font-semibold text-white/80 backdrop-blur-sm">
          {professional.bairro}
        </span>
      </div>
      <div className="flex min-w-0 flex-col p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="break-words text-2xl font-bold tracking-[-0.025em]">{professional.nome}</h2>
              {professional.verificado && <span className="inline-flex min-h-6 items-center gap-1 border border-forest/20 bg-cream px-2.5 text-[0.6rem] font-bold text-forest/65"><BadgeCheck size={13} className="text-orange-dark" /> CREF informado</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {professional.modalidades.slice(0, 4).map((modality) => (
                <span key={modality} className="border border-forest/18 px-2 py-1 text-[0.65rem] font-semibold text-forest/65">{modality}</span>
              ))}
            </div>
          </div>
          {canFavorite && <FavoriteButton professionalId={professional.id} professionalName={professional.nome} initialSaved={saved} returnTo={returnTo} />}
        </div>
        <p className="mt-5 max-w-2xl break-words text-sm leading-6 text-forest/60 [overflow-wrap:anywhere]">{professional.destaque}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.7rem] font-semibold text-forest/50">
          <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{professional.bairro}</span>
          <span>{professional.atendimento}</span>
          <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={14} />{professional.experiencia}</span>
          {professional.academias.length > 0 && <span className="inline-flex items-center gap-1.5"><Building2 size={14} />{professional.academias[0].nome}{professional.academias.length > 1 ? ` +${professional.academias.length - 1}` : ""}</span>}
          <span className="inline-flex items-center gap-1.5"><Star size={14} className={professional.avaliacoes ? "fill-orange text-orange-dark" : "text-forest/25"} />{professional.avaliacoes ? `${professional.nota.toFixed(1)} (${professional.avaliacoes})` : "Novo"}</span>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-forest/12 pt-5">
          <p>
            <span className="block text-[0.62rem] font-semibold text-forest/45">A partir de</span>
            <strong className="text-xl font-bold">{professional.preco > 0 ? `R$ ${professional.preco.toLocaleString("pt-BR")}` : "Sob consulta"}</strong>{" "}
            {professional.preco > 0 && <span className="text-xs text-forest/45">{professional.unidade}</span>}
          </p>
          <Link href={`/profissionais/${professional.id}`} className="inline-flex min-h-11 items-center gap-2 border-b border-forest/25 text-xs font-bold transition hover:border-forest">Ver perfil <ArrowRight size={16} /></Link>
        </div>
      </div>
    </article>
  );
}
