import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { ProfessionalCard } from "@/components/professional-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentProfile } from "@/lib/auth";
import { getPublicProfessionals } from "@/lib/professionals";
import boxingImage from "@/public/images/modality-boxing-pexels.jpg";
import runningImage from "@/public/images/modality-running-pexels.jpg";
import strengthImage from "@/public/images/gym-dumbbell-rack-v9.webp";
import functionalImage from "@/public/images/gym-login-interior-v3.webp";
import heroImage from "@/public/images/gym-interior-hero-v2.webp";

import styles from "./home.module.css";

const primarySpecialties = [
  { name: "Musculação", detail: "Academia", image: strengthImage, position: "center" },
  { name: "Corrida", detail: "Rua e pista", image: runningImage, position: "center 62%" },
  { name: "Lutas", detail: "Boxe, muay thai e jiu-jitsu", image: boxingImage, position: "center" },
  { name: "Funcional", detail: "Condicionamento", image: functionalImage, position: "center" },
] as const;

export default async function Home() {
  const [professionals, profile] = await Promise.all([getPublicProfessionals(), getCurrentProfile()]);

  return (
    <main className={styles.home}>
      <div className={styles.heroFrame}>
        <SiteHeader overlay />
        <section className={styles.hero}>
          <div className={styles.heroVisual}>
            <Image
              src={heroImage}
              alt="Academia com equipamentos de musculação"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
              className={styles.heroImage}
              data-motion-hero-image
            />
            <div className={styles.heroImageShade} aria-hidden="true" />
            <p className={styles.locationTag}><MapPin size={16} /> Guarapuava, PR</p>
          </div>

          <div className={styles.heroCopy} data-motion-hero-copy>
            <p className={styles.heroLabel} data-motion-intro>Guia local de profissionais</p>
            <h1 aria-label="Encontre um personal em Guarapuava">
              <span className={styles.titleLine}><span data-motion-title-line>Encontre um personal</span></span>
              <span className={styles.titleLine}><span data-motion-title-line>em <strong>Guarapuava.</strong></span></span>
            </h1>
            <p className={styles.heroText} data-motion-intro>
              Pesquise por modalidade, bairro ou nome. Veja o perfil e fale diretamente com o profissional.
            </p>

            <Link href="/buscar" className={styles.heroAction} data-motion-intro>
              Procurar profissionais <ArrowRight size={18} />
            </Link>

          </div>
        </section>
      </div>

      <section className={styles.specialtiesSection}>
        <div className={styles.specialtiesHeading} data-motion-heading>
          <div>
            <p className={styles.sectionLabel}>Busca rápida</p>
            <h2>Modalidades</h2>
          </div>
          <Link href="/buscar" className={styles.inlineLink}>Ver todas <ArrowRight size={17} /></Link>
        </div>
        <div className={styles.specialtiesGrid} data-motion-list>
          {primarySpecialties.map((specialty, index) => (
            <Link key={specialty.name} href={`/buscar?modalidade=${encodeURIComponent(specialty.name)}`} className={styles.specialtyCard}>
              <Image src={specialty.image} alt={`Treino de ${specialty.name.toLowerCase()}`} fill sizes="(max-width: 760px) 100vw, 50vw" style={{ objectPosition: specialty.position }} />
              <span className={styles.specialtyShade} aria-hidden="true" />
              <span className={styles.specialtyNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.specialtyCopy}><small>{specialty.detail}</small><strong>{specialty.name}</strong></span>
              <ArrowRight className={styles.specialtyArrow} size={20} />
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.professionalsSection}>
        <div className={styles.sectionHeading} data-motion-heading>
          <div>
            <p className={styles.sectionLabel}>Perto de você</p>
            <h2>Profissionais em Guarapuava</h2>
          </div>
          <p>Compare modalidade, localização, atendimento e valor informado.</p>
        </div>

        {professionals.length ? (
          <div className={styles.professionalGrid} data-motion-list>
            {professionals.slice(0, 3).map((professional) => (
              <ProfessionalCard key={professional.id} professional={professional} canFavorite={profile?.role !== "personal"} />
            ))}
          </div>
        ) : <EmptyProfessionals />}

        <Link href="/buscar" className={styles.catalogButton}>Abrir catálogo <ArrowRight size={18} /></Link>
      </section>

      <section className={styles.professionalCta}>
        <div>
          <p className={styles.sectionLabel}>Para profissionais</p>
          <h2>Atende em Guarapuava?</h2>
          <p>Publique modalidades, valores e formas de contato. A foto é opcional.</p>
        </div>
        <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className={styles.ctaButton}>
          Criar perfil profissional <ArrowRight size={18} />
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}

function EmptyProfessionals() {
  return (
    <div className={styles.emptyProfessionals}>
      <h3>Ainda não há perfis publicados.</h3>
      <p>Profissionais cadastrados aparecerão aqui e no catálogo.</p>
      <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className={styles.inlineLink}>
        Criar perfil profissional <ArrowRight size={17} />
      </Link>
    </div>
  );
}
