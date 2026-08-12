import Link from "next/link";
import { ArrowRight, BadgeCheck, Heart, MapPin, Star } from "lucide-react";

import type { Professional } from "@/lib/professionals";

export function ProfessionalCard({ professional }: { professional: Professional }) {
  return (
    <article className="group grid overflow-hidden border border-forest/15 bg-cream transition hover:border-forest/35 md:grid-cols-[180px_1fr]">
      <div
        className="relative grid min-h-48 place-items-center bg-forest text-cream md:min-h-full"
        style={professional.avatarUrl ? { backgroundImage: `linear-gradient(to top, rgb(24 52 44 / .72), transparent 65%), url(${professional.avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        role={professional.avatarUrl ? "img" : undefined}
        aria-label={professional.avatarUrl ? `Foto de ${professional.nome}` : undefined}
      >
        {!professional.avatarUrl && <span className="font-display text-5xl font-medium">{professional.iniciais}</span>}
        <span className="absolute bottom-3 left-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/70">
          {professional.bairro}
        </span>
      </div>
      <div className="flex flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-[-0.025em]">{professional.nome}</h2>
              {professional.verificado && <span className="status-badge"><BadgeCheck size={13} /> Verificado</span>}
            </div>
            <p className="mt-1 text-sm font-medium text-orange-dark">{professional.especialidade}</p>
          </div>
          <button aria-label={`Salvar perfil de ${professional.nome}`} className="save-button"><Heart size={19} /></button>
        </div>
        <p className="mt-4 max-w-xl text-sm leading-6 text-forest/65">{professional.destaque}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-forest/55">
          <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{professional.bairro}</span>
          <span>{professional.atendimento}</span>
          <span className="inline-flex items-center gap-1.5"><Star size={14} className="fill-orange text-orange" />{professional.nota.toFixed(1)} ({professional.avaliacoes})</span>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-forest/10 pt-4">
          <p>
            <span className="block text-[0.65rem] uppercase tracking-[0.12em] text-forest/45">A partir de</span>
            <strong className="text-lg">R$ {professional.preco}</strong>{" "}
            <span className="text-xs text-forest/55">{professional.unidade}</span>
          </p>
          <Link href={`/profissionais/${professional.id}`} className="text-link">Ver perfil <ArrowRight size={16} /></Link>
        </div>
      </div>
    </article>
  );
}
