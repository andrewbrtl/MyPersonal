import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, MapPin, ShieldCheck } from "lucide-react";

import heroImage from "@/public/images/gym-interior-hero-v2.webp";
import storyImage from "@/public/images/gym-dumbbell-rack-v7.webp";
import { ProfessionalCard } from "@/components/professional-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentProfile } from "@/lib/auth";
import { modalities } from "@/lib/demo-data";
import { getPublicProfessionals } from "@/lib/professionals";

import styles from "./home.module.css";

const steps = [
  ["01", "Aplicar filtros", "Escolha modalidade, bairro, formato de atendimento e faixa de preço."],
  ["02", "Comparar perfis", "Consulte apresentação, experiência, disponibilidade, CREF informado e valores."],
  ["03", "Entrar em contato", "Use um dos canais disponibilizados no perfil para falar com o profissional."],
] as const;

export default async function Home() {
  const [professionals, profile] = await Promise.all([getPublicProfessionals(), getCurrentProfile()]);

  return (
    <main className={styles.home}>
      <div className={styles.heroFrame}>
        <SiteHeader overlay />
        <section className={styles.hero} data-motion-static>
          <Image
            src={heroImage}
            alt="Academia de musculação com equipamentos profissionais em iluminação baixa"
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
            data-motion-hero-image
          />
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroGrid} aria-hidden="true" />

          <div className={styles.heroContent}>
            <div className={styles.heroCopy} data-motion-hero-copy>
              <p className={styles.heroKicker} data-motion-intro><span data-motion-rule /> Profissionais de esporte · Guarapuava</p>
              <h1 aria-label="Profissionais de esporte em Guarapuava.">
                <span className={styles.motionLine}><span data-motion-title-line>Profissionais de esporte</span></span>
                <span className={styles.motionLine}><em data-motion-title-line>em Guarapuava.</em></span>
              </h1>
              <p className={styles.heroText} data-motion-intro>
                Consulte modalidades, bairros, valores iniciais e formas de atendimento antes de entrar em contato.
              </p>
              <div className={styles.heroActions} data-motion-intro>
                <Link href="/buscar" className={styles.heroPrimary}>
                  Ver catálogo <ArrowRight size={18} />
                </Link>
                <Link href="/#criterios" className={styles.heroSecondary}>
                  Como usar
                </Link>
              </div>
            </div>

            <dl className={styles.heroSpecs} data-motion-specs>
              <div><dt>Base</dt><dd><MapPin size={14} /> Guarapuava, PR</dd></div>
              <div><dt>Catálogo</dt><dd>{modalities.length.toString().padStart(2, "0")} modalidades</dd></div>
              <div><dt>Acesso</dt><dd>Gratuito para alunos</dd></div>
            </dl>
          </div>

          <a href="#modalidades" className={styles.scrollCue} aria-label="Ir para modalidades">
            <span>Explorar</span><ChevronDown size={17} />
          </a>
          <span className={styles.heroIndex} aria-hidden="true">01 / 05</span>
        </section>
      </div>

      <section id="modalidades" className={styles.modalitiesSection}>
        <div className={styles.sectionRail}><span>01</span><p>Escolha por modalidade</p></div>
        <div className={styles.modalitiesBody}>
          <div className={styles.editorialHeading} data-motion-heading>
            <div>
              <p className="eyebrow">Catálogo por especialidade</p>
              <h2>Precisão antes<br />da repetição.</h2>
            </div>
            <p>Selecione uma modalidade para consultar os profissionais publicados, locais de atendimento e valores iniciais.</p>
          </div>

          <div className={styles.modalityList} data-motion-list>
            {modalities.map(([name, detail], index) => (
              <Link key={name} href={`/buscar?modalidade=${encodeURIComponent(name)}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{name}</h3><p>{detail}</p></div>
                <ArrowRight size={19} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="criterios" className={styles.methodSection}>
        <div className={styles.storyImageFrame} data-motion-image-frame>
          <Image
            src={storyImage}
            alt="Halter de ferro apoiado em um rack de academia sob iluminação fria"
            fill
            sizes="(max-width: 900px) 100vw, 55vw"
            className={styles.storyImage}
            data-motion-parallax
          />
        </div>
        <div className={styles.methodCopy} data-motion-heading>
          <p className="eyebrow text-orange-dark">02 · Informações do perfil</p>
          <h2>O que você encontra em cada perfil.</h2>
          <p className={styles.methodLead}>Dados publicados pelo próprio profissional.</p>
          <p className={styles.methodText}>
            Consulte especialidades, formato de atendimento, região, valor inicial, CREF informado e canais de contato disponíveis.
          </p>
          <div className={styles.methodDetails}>
            <div><span>01</span><strong>Local</strong><p>Bairro e formato de atendimento informado no cadastro.</p></div>
            <div><span>02</span><strong>Serviço</strong><p>Modalidades, apresentação, disponibilidade e valor inicial.</p></div>
            <div><span>03</span><strong>Contato</strong><p>Telefone, WhatsApp e redes sociais escolhidas pelo profissional.</p></div>
          </div>
          <Link href="/buscar" className="text-link mt-8">Ver todos os profissionais <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className={styles.professionalsSection}>
        <div className={styles.sectionRail}><span>03</span><p>Seleção local</p></div>
        <div className={styles.professionalsBody}>
          <div className={styles.professionalsHeading} data-motion-heading>
            <div>
              <p className="eyebrow">Perfis publicados</p>
              <h2>Profissionais em<br />Guarapuava.</h2>
            </div>
            <div>
              <p>Compare modalidade, localização, formato de atendimento e valor informado.</p>
              <Link href="/buscar" className="text-link">Abrir catálogo completo <ArrowRight size={16} /></Link>
            </div>
          </div>

          {professionals.length ? (
            <div className={styles.professionalGrid} data-motion-list>
              {professionals.slice(0, 3).map((professional) => (
                <ProfessionalCard key={professional.id} professional={professional} canFavorite={profile?.role !== "personal"} />
              ))}
            </div>
          ) : <EmptyProfessionals />}
        </div>
      </section>

      <section id="como-funciona" className={styles.processSection}>
        <div className={styles.processIntro} data-motion-heading>
          <p className="eyebrow text-orange-light">04 · Uso da plataforma</p>
          <h2>Como usar<br /><em>o catálogo.</em></h2>
          <p>Filtre os resultados, consulte os perfis e use um dos canais de contato publicados.</p>
        </div>
        <div className={styles.processList} data-motion-list>
          {steps.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <ArrowRight size={18} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className={styles.professionalCta}>
        <div className={styles.ctaSeal} aria-hidden="true"><ShieldCheck size={24} /><span>Perfil<br />profissional</span></div>
        <div data-motion-heading>
          <p className="eyebrow">05 · Cadastro profissional</p>
          <h2>Publique seu perfil profissional.</h2>
        </div>
        <div className={styles.ctaCopy}>
          <p>Cadastre formação, CREF, modalidades, valores, disponibilidade e canais de contato.</p>
          <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className="button-accent min-h-13">
            Criar perfil profissional <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack} data-motion-marquee>
          <TickerSet />
          <TickerSet />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

function TickerSet() {
  return (
    <span className={styles.tickerSet}>
      <span>Musculação</span><i /> <span>Corrida</span><i /> <span>Funcional</span><i /> <span>Lutas</span><i /> <span>Mobilidade</span><i /> <span>Performance</span><i />
    </span>
  );
}

function EmptyProfessionals() {
  return (
    <div className={styles.emptyProfessionals}>
      <p className="eyebrow">Catálogo</p>
      <h3>Nenhum perfil publicado no momento.</h3>
      <p>Os perfis aparecem nesta área após a conclusão e publicação do cadastro profissional.</p>
      <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className="text-link">Publicar o primeiro perfil <ArrowRight size={16} /></Link>
    </div>
  );
}
