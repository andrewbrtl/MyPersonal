import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";

import { ProfessionalCard } from "@/components/professional-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentProfile } from "@/lib/auth";
import { modalities } from "@/lib/demo-data";
import { INPUT_LIMITS } from "@/lib/input-validation";
import { getPublicProfessionals } from "@/lib/professionals";
import heroImage from "@/public/images/gym-interior-hero-v2.webp";

import styles from "./home.module.css";

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

            <form action="/buscar" className={styles.heroSearch} data-motion-intro>
              <label>
                <span>Modalidade</span>
                <select name="modalidade" defaultValue="">
                  <option value="">Todas</option>
                  {modalities.map(([name]) => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
              <label>
                <span>Nome ou especialidade</span>
                <input name="q" maxLength={INPUT_LIMITS.search} placeholder="Ex.: musculação" />
              </label>
              <button type="submit" aria-label="Buscar profissionais"><Search size={20} /></button>
            </form>

          </div>
        </section>
      </div>

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
