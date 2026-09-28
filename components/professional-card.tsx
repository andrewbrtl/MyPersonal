import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Building2, MapPin, Star } from "lucide-react";

import { FavoriteButton } from "@/components/favorite-button";
import type { Professional } from "@/lib/professionals";
import styles from "./professional-card.module.css";

export function ProfessionalCard({ professional, saved = false, returnTo = "/buscar", canFavorite = true }: { professional: Professional; saved?: boolean; returnTo?: string; canFavorite?: boolean }) {
  return (
    <article className={styles.card}>
      <div className={styles.layout}>
        <Link href={`/profissionais/${professional.id}`} className={styles.photo}
          style={professional.avatarUrl ? { backgroundImage: `url(${professional.avatarUrl})` } : undefined}
          aria-label={`Ver perfil de ${professional.nome}`}>
          {!professional.avatarUrl && <span aria-hidden="true">{professional.iniciais}</span>}
        </Link>
        <div className={styles.body}>
          <div className={styles.heading}>
            <div>
              <h3><Link href={`/profissionais/${professional.id}`}>{professional.nome}</Link></h3>
              {professional.verificado && <span className={styles.credential}><BadgeCheck size={13} /> CREF informado</span>}
            </div>
            {canFavorite && <FavoriteButton professionalId={professional.id} professionalName={professional.nome} initialSaved={saved} returnTo={returnTo} />}
          </div>
          <p className={styles.modalities}>{professional.modalidades.slice(0, 4).join(" · ") || professional.especialidade}</p>
          <p className={styles.bio}>{professional.destaque}</p>
          <div className={styles.details}>
            <span><MapPin size={13} />{professional.bairro}</span>
            <span>{professional.atendimento}</span>
            {professional.avaliacoes > 0 && <span><Star size={13} />{professional.nota.toFixed(1)} ({professional.avaliacoes})</span>}
          </div>
          {professional.academias.length > 0 && <p className={styles.gym}><Building2 size={13} />{professional.academias[0].nome}{professional.academias.length > 1 ? ` +${professional.academias.length - 1}` : ""}</p>}
          <div className={styles.footer}>
            <p><small>{professional.preco > 0 ? "A partir de" : "Valor"}</small><strong>{professional.preco > 0 ? `R$ ${professional.preco.toLocaleString("pt-BR")}` : "Sob consulta"}</strong>{professional.preco > 0 && <span> / mês</span>}</p>
            <Link href={`/profissionais/${professional.id}`}>Ver perfil <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </div>
    </article>
  );
}
