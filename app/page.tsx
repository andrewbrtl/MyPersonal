import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, MapPin, Search } from "lucide-react";

import { ProfessionalCard } from "@/components/professional-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentProfile } from "@/lib/auth";
import { modalities } from "@/lib/demo-data";
import { INPUT_LIMITS } from "@/lib/input-validation";
import { getPublicProfessionals } from "@/lib/professionals";
import heroImage from "@/public/images/gym-interior-hero-v2.webp";

import styles from "./home.module.css";

const profileDetails = [
  ["CREF", "Número e situação profissional informados no cadastro."],
  ["Atendimento", "Bairro, formato presencial ou online e valor inicial."],
  ["Contato direto", "Telefone, WhatsApp e redes sociais escolhidos pelo profissional."],
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

            <div className={styles.heroMeta} data-motion-specs>
              <span><Check size={15} /> Gratuito para alunos</span>
              <span><Check size={15} /> Contato direto</span>
              <span><Check size={15} /> Perfis locais</span>
            </div>
          </div>
        </section>
      </div>

      <section id="modalidades" className={styles.modalitiesSection}>
        <div className={styles.sectionHeading} data-motion-heading>
          <div>
            <p className={styles.sectionLabel}>Modalidades</p>
            <h2>O que você procura?</h2>
          </div>
          <Link href="/buscar" className={styles.inlineLink}>Ver todos os profissionais <ArrowRight size={17} /></Link>
        </div>

        <div className={styles.modalityGrid} data-motion-list>
          {modalities.map(([name, detail]) => (
            <Link key={name} href={`/buscar?modalidade=${encodeURIComponent(name)}`}>
              <div><h3>{name}</h3><p>{detail}</p></div>
              <ArrowRight size={19} />
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

      <section id="como-funciona" className={styles.profileInfoSection}>
        <div className={styles.infoIntro} data-motion-heading>
          <p className={styles.sectionLabel}>Perfis completos</p>
          <h2>O que aparece nos perfis</h2>
          <p>As informações são preenchidas pelo próprio profissional e ficam visíveis antes do contato.</p>
        </div>
        <div className={styles.infoList} data-motion-list>
          {profileDetails.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {index === 0 && <BadgeCheck size={24} aria-hidden="true" />}
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.professionalCta}>
        <div>
          <p className={styles.sectionLabel}>Para profissionais</p>
          <h2>Atende em Guarapuava?</h2>
          <p>Crie seu perfil com modalidades, CREF, valores, disponibilidade e contatos. A foto é opcional.</p>
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
