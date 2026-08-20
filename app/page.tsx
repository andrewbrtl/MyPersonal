import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, MapPin, ShieldCheck } from "lucide-react";

import heroImage from "@/public/images/gym-interior-hero-v2.webp";
import storyImage from "@/public/images/gym-coaching-plan-v4.webp";
import { ProfessionalCard } from "@/components/professional-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentProfile } from "@/lib/auth";
import { modalities } from "@/lib/demo-data";
import { getPublicProfessionals } from "@/lib/professionals";

import styles from "./home.module.css";

const steps = [
  ["01", "Defina o movimento", "Escolha modalidade, bairro, atendimento e a faixa que cabe no seu momento."],
  ["02", "Leia o profissional", "Compare experiência, apresentação, disponibilidade e valores sem correr."],
  ["03", "Comece a conversa", "Abra o canal disponibilizado pelo profissional e alinhe o primeiro encontro."],
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
              <p className={styles.heroKicker} data-motion-intro><span data-motion-rule /> Curadoria local · Guarapuava</p>
              <h1 aria-label="Menos tentativa. Mais direção.">
                <span className={styles.motionLine}><span data-motion-title-line>Menos tentativa.</span></span>
                <span className={styles.motionLine}><em data-motion-title-line>Mais direção.</em></span>
              </h1>
              <p className={styles.heroText} data-motion-intro>
                Encontre profissionais de esporte perto de você, compare o que realmente importa e escolha com calma quem vai acompanhar seu ritmo.
              </p>
              <div className={styles.heroActions} data-motion-intro>
                <Link href="/buscar" className={styles.heroPrimary}>
                  Explorar profissionais <ArrowRight size={18} />
                </Link>
                <Link href="/#criterios" className={styles.heroSecondary}>
                  Entender a escolha
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
              <p className="eyebrow">Comece pelo que move você</p>
              <h2>Precisão antes<br />da repetição.</h2>
            </div>
            <p>Do primeiro treino à preparação avançada: encontre alguém que entenda seu objetivo, seu bairro e sua rotina.</p>
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
            alt="Treinador e aluna conversando sobre o plano de treino em uma academia"
            fill
            sizes="(max-width: 900px) 100vw, 55vw"
            className={styles.storyImage}
            data-motion-parallax
          />
          <span className={styles.imageMeta} aria-hidden="true">Field note / 02</span>
          <span className={styles.imageCaption}>Força · Controle · Consistência</span>
        </div>
        <div className={styles.methodCopy} data-motion-heading>
          <p className="eyebrow text-orange-dark">02 · O que muda</p>
          <h2>Você não precisa de mais um treino salvo.</h2>
          <p className={styles.methodLead}>Precisa de alguém que saiba ler o seu momento.</p>
          <p className={styles.methodText}>
            Aqui, o perfil não para na foto. Você vê especialidades, formato de atendimento, região, valor inicial e os canais que cada profissional decidiu abrir.
          </p>
          <div className={styles.methodDetails}>
            <div><span>01</span><strong>Contexto local</strong><p>Perfis organizados para quem vive e treina em Guarapuava.</p></div>
            <div><span>02</span><strong>Informação objetiva</strong><p>Menos promessa. Mais dados para uma primeira escolha consciente.</p></div>
            <div><span>03</span><strong>Contato direto</strong><p>A conversa começa no canal publicado pelo próprio profissional.</p></div>
          </div>
          <Link href="/buscar" className="text-link mt-8">Ver todos os profissionais <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className={styles.professionalsSection}>
        <div className={styles.sectionRail}><span>03</span><p>Seleção local</p></div>
        <div className={styles.professionalsBody}>
          <div className={styles.professionalsHeading} data-motion-heading>
            <div>
              <p className="eyebrow">Perto de você</p>
              <h2>Quem entende<br />do movimento.</h2>
            </div>
            <div>
              <p>Perfis publicados por profissionais da região para você comparar sem pressa.</p>
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
          <p className="eyebrow text-orange-light">04 · Como funciona</p>
          <h2>Três movimentos.<br /><em>Zero ruído.</em></h2>
          <p>Uma busca direta, feita para sair da tela e chegar ao treino.</p>
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
          <p className="eyebrow">05 · Para profissionais</p>
          <h2>Seu trabalho merece mais do que uma bio curta.</h2>
        </div>
        <div className={styles.ctaCopy}>
          <p>Apresente sua formação, modalidades, valores, agenda e canais de contato em um perfil feito para a sua região.</p>
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
      <p className="eyebrow">Abertura local</p>
      <h3>Os primeiros perfis estão sendo preparados.</h3>
      <p>Profissionais reais aparecem aqui assim que concluem e publicam seus cadastros.</p>
      <Link href="/login?modo=criar&tipo=personal&next=%2Fcadastro" className="text-link">Publicar o primeiro perfil <ArrowRight size={16} /></Link>
    </div>
  );
}
