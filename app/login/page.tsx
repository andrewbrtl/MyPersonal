import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check, LogOut, MapPin, ShieldCheck, UserRound } from "lucide-react";

import { signOutAndCreateAccountAction } from "@/app/login/actions";
import { AuthForm } from "@/app/login/auth-form";
import { RecoveryForm } from "@/app/login/recovery-form";
import { BrandPlaceholder } from "@/components/site-shell";
import { getCurrentProfile } from "@/lib/auth";
import { safeInternalPath } from "@/lib/input-validation";
import loginImage from "@/public/images/gym-login-interior-v3.webp";

import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Entrar ou criar conta",
  description: "Acesse sua conta ou crie um perfil para encontrar profissionais de esporte em Guarapuava.",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const requestedMode = first(query.modo);
  const mode = requestedMode === "criar" ? "signup" : requestedMode === "recuperar" ? "recovery" : "login";
  const role = first(query.tipo) === "personal" ? "personal" : "aluno";
  const next = safeInternalPath(first(query.next));
  const profile = await getCurrentProfile();

  if (profile && mode === "signup") {
    return (
      <main className="grid min-h-screen place-items-center bg-sand px-5 py-12">
        <div className="w-full max-w-lg border border-forest/15 bg-cream p-6 shadow-[0_24px_80px_rgba(24,52,44,0.12)] sm:p-10">
          <BrandPlaceholder />
          <div className="mt-10 grid size-12 place-items-center rounded-[2px] bg-forest text-white"><UserRound size={21} /></div>
          <p className="eyebrow mt-7">Sessão ativa</p>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">Você já está conectado.</h1>
          <p className="mt-4 text-sm leading-6 text-forest/55">
            A conta de <strong className="text-forest">{profile.nome}</strong> está ativa neste navegador. Para criar outra conta sem misturar as sessões, saia desta primeiro.
          </p>
          <div className="mt-7 rounded-[2px] border border-forest/15 bg-sand p-4">
            <p className="text-sm font-semibold">{profile.nome}</p>
            <p className="mt-1 text-xs text-forest/45">{profile.email} · {profile.role === "personal" ? "Profissional" : "Aluno"}</p>
          </div>
          <form action={signOutAndCreateAccountAction}>
            <input type="hidden" name="tipo" value={role} />
            <input type="hidden" name="next" value={next} />
            <button type="submit" className="button-accent mt-7 min-h-13 w-full"><LogOut size={17} /> Sair e criar outra conta</button>
          </form>
          <Link href={profile.role === "personal" ? "/painel" : "/buscar"} className="button-quiet mt-2 w-full">Continuar com esta conta <ArrowLeft className="rotate-180" size={16} /></Link>
        </div>
      </main>
    );
  }

  if (profile) redirect(next || (profile.role === "personal" ? "/painel" : "/buscar"));

  const nextQuery = next ? `&next=${encodeURIComponent(next)}` : "";
  const switchHref = mode === "signup"
    ? `/login?modo=entrar${nextQuery}`
    : `/login?modo=criar&tipo=${role}${nextQuery}`;

  return (
    <main className="grid min-h-screen bg-cream lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)]">
      <section className={`${styles.visual} relative hidden min-h-screen overflow-hidden bg-forest px-10 py-9 text-cream lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-12`}>
        <Image src={loginImage} alt="" fill priority sizes="55vw" className={styles.visualImage} data-motion-hero-image />
        <div className={styles.visualShade} aria-hidden="true" />
        <div className={styles.visualGrid} aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-8">
          <BrandPlaceholder inverted />
          <span className={styles.coordinates}>25°23&apos; S / 51°27&apos; W</span>
        </div>

        <div className={`${styles.copy} py-16`} data-motion-hero-copy>
          <p className="eyebrow text-orange-light" data-motion-intro><span className="eyebrow-line" data-motion-rule /> Acesso reservado</p>
          <h1 className={styles.title} aria-label="Direção muda o movimento.">
            <span className={styles.titleLine}><span data-motion-title-line>Direção muda</span></span>
            <span className={styles.titleLine}><span data-motion-title-line>o movimento.</span></span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-cream/62" data-motion-intro>
            Entre para guardar suas escolhas ou publicar um trabalho que merece ser encontrado na sua região.
          </p>
          <div className={`${styles.benefits} mt-10 grid max-w-md gap-4 border-t border-cream/15 pt-7 text-sm text-cream/72`} data-motion-list>
            <Benefit>Perfis e preferências em um só lugar</Benefit>
            <Benefit>Área separada para alunos e profissionais</Benefit>
            <Benefit>Seus dados protegidos pelo Supabase</Benefit>
          </div>
        </div>

        <div className="relative flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.16em] text-cream/45">
          <MapPin size={15} className="text-orange-light" /> Feito para Guarapuava, PR
        </div>
      </section>

      <section className={`${styles.panel} flex min-h-screen flex-col bg-cream px-5 py-6 sm:px-10 lg:px-14 xl:px-20`}>
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden"><BrandPlaceholder /></div>
          <Link href="/" className="text-link"><ArrowLeft size={16} /> Voltar ao início</Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className={`${styles.formIntro} mb-8`} data-motion-form-intro>
            <div className="flex size-11 items-center justify-center rounded-[2px] border border-forest/20 bg-sand text-forest">
              <ShieldCheck size={21} />
            </div>
            <p className="eyebrow mt-6">Acesso seguro</p>
            <h2 className="font-display mt-3 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">
              {mode === "signup" ? "Crie seu espaço." : mode === "recovery" ? "Recupere seu acesso." : "Bom ter você de volta."}
            </h2>
            <p className="mt-3 text-sm leading-6 text-forest/55">
              {mode === "signup"
                ? "Leva menos de um minuto. Depois você completa o que realmente importa."
                : mode === "recovery"
                  ? "Informe seu email ou telefone. O link seguro será enviado para o email cadastrado."
                  : "Entre com seu email ou telefone para continuar de onde parou."}
            </p>
          </div>

          {mode === "recovery"
            ? <RecoveryForm next={next} expiredLink={first(query.erro) === "link-expirado"} />
            : (
              <AuthForm
                mode={mode}
                next={next}
                role={role}
                switchHref={switchHref}
              />
            )}
        </div>

        <p className="pb-2 text-center text-xs leading-5 text-forest/40">
          Ao continuar, você concorda com os <Link href="/termos" className="underline underline-offset-3 hover:text-forest">termos de uso</Link> e a <Link href="/privacidade" className="underline underline-offset-3 hover:text-forest">política de privacidade</Link>.
        </p>
      </section>
    </main>
  );
}

function Benefit({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-3"><span className={styles.benefitMark}><Check size={12} strokeWidth={2.5} /></span>{children}</span>;
}
