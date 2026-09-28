import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin, Search, UserRound } from "lucide-react";

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

const specialties = [
  { name: "Musculação", detail: "Na academia", image: strengthImage, position: "30% center", href: "/buscar?modalidade=Muscula%C3%A7%C3%A3o" },
  { name: "Corrida", detail: "Na rua ou na pista", image: runningImage, position: "center 62%", href: "/buscar?modalidade=Corrida" },
  { name: "Funcional", detail: "Força e condicionamento", image: functionalImage, position: "center 70%", href: "/buscar?modalidade=Funcional" },
  { name: "Lutas", detail: "Boxe, muay thai e mais", image: boxingImage, position: "center", href: "/buscar?categoria=Luta" },
] as const;

export default async function Home() {
  const [professionals, profile] = await Promise.all([getPublicProfessionals(), getCurrentProfile()]);
  const professionalHref = profile?.role === "personal" ? "/cadastro" : "/login?modo=criar&tipo=personal&next=%2Fcadastro";

  return (
    <main className={styles.home} id="conteudo">
      <SiteHeader />
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroCopy} data-motion-hero-copy>
          <p className={styles.location} data-motion-intro><MapPin size={15} /> Guarapuava, Paraná</p>
          <h1 id="home-title">
            <span className={styles.titleLine}><span data-motion-title-line>Personal trainer</span></span>
            <span className={styles.titleLine}><span data-motion-title-line>em <em>Guarapuava.</em></span></span>
          </h1>
          <p className={styles.heroText} data-motion-intro>Veja quem atende perto de você.<br />Compare os perfis e converse direto com o profissional.</p>
          <div className={styles.heroActions} data-motion-intro>
            <Link href="/buscar" className={styles.primaryAction}>Procurar profissionais <ArrowUpRight size={20} /></Link>
            <a href="#modalidades" className={styles.secondaryAction}>Ver modalidades <ArrowDown size={15} /></a>
          </div>
          <div className={styles.heroNote} data-motion-intro><span aria-hidden="true" /> Presencial e online. Sem custo para buscar.</div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.photoBacking} aria-hidden="true" />
          <div className={styles.mainPhoto}>
            <Image src={heroImage} alt="Equipamentos de musculação em uma academia" fill preload sizes="(max-width: 760px) 100vw, 48vw" className={styles.heroImage} data-motion-hero-image />
            <div className={styles.photoCaption}><span>Dentro e fora da academia.</span><ArrowUpRight size={20} aria-hidden="true" /></div>
          </div>
          <Link href="/buscar?modalidade=Corrida" className={styles.insetPhoto} aria-label="Encontrar profissionais de corrida">
            <Image src={runningImage} alt="Atleta se preparando para correr na pista" fill loading="eager" sizes="(max-width: 760px) 32vw, 190px" />
            <span>Corrida <ArrowUpRight size={16} /></span>
          </Link>
        </div>
      </section>

      <section className={styles.specialtiesSection} id="modalidades" aria-labelledby="modalities-title">
        <div className={styles.sectionHeading} data-motion-heading>
          <div><p className={styles.kicker}>Por onde começar</p><h2 id="modalities-title">Qual é o seu treino?</h2></div>
          <Link href="/buscar" className={styles.inlineLink}>Todas as modalidades <ArrowUpRight size={17} /></Link>
        </div>
        <div className={styles.specialtiesGrid} data-motion-list>
          {specialties.map((specialty, index) => (
            <Link key={specialty.name} href={specialty.href} className={styles.specialtyCard}>
              <div className={styles.specialtyImage}>
                <Image src={specialty.image} alt="" fill sizes="(max-width: 760px) 45vw, 24vw" style={{ objectPosition: specialty.position }} />
                <span className={styles.specialtyIndex} aria-hidden="true">0{index + 1}</span>
                <span className={styles.specialtyArrow}><ArrowUpRight size={22} /></span>
              </div>
              <div className={styles.specialtyCopy}><h3>{specialty.name}</h3><p>{specialty.detail}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.directorySection} aria-labelledby="directory-title">
        <div className={styles.directoryIntro} data-motion-heading>
          <p className={styles.kicker}>O guia da cidade</p>
          <h2 id="directory-title">Quem vai<br />treinar com você?</h2>
          <p>Modalidades, locais de atendimento e valores. Tudo no perfil.</p>
          <Link href="/buscar" className={styles.inlineLink}>Ver todos os profissionais <ArrowRight size={18} /></Link>
          <div className={styles.directoryStamp}><MapPin size={17} /><span>Feito para<br /><strong>Guarapuava, PR</strong></span></div>
        </div>
        <div className={styles.directoryList} data-motion-list>
          {professionals.length ? professionals.slice(0, 2).map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} canFavorite={profile?.role !== "personal"} />
          )) : (
            <div className={styles.emptyDirectory}>
              <div className={styles.emptyPortrait} aria-hidden="true"><UserRound size={34} strokeWidth={1.3} /></div>
              <p>O catálogo está começando.</p>
              <h3>Seu perfil pode estar aqui.</h3>
              <span>É personal em Guarapuava? Cadastre seu atendimento para aparecer nas buscas.</span>
              <Link href={professionalHref} className={styles.inlineLink}>Cadastrar meu perfil <ArrowUpRight size={17} /></Link>
            </div>
          )}
        </div>
      </section>

      <section className={styles.professionalCta} aria-labelledby="professional-title">
        <div className={styles.ctaMarker} aria-hidden="true"><Search size={27} strokeWidth={1.5} /></div>
        <div><p className={styles.kicker}>Para quem é personal</p><h2 id="professional-title">Seu trabalho, no guia local.</h2><p>Adicione seus treinos, academias e formas de contato.</p></div>
        <Link href={professionalHref} className={styles.primaryAction}>{profile?.role === "personal" ? "Editar meu perfil" : "Criar perfil profissional"} <ArrowUpRight size={20} /></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
