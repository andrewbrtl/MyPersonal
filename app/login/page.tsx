import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, LogOut, UserRound } from "lucide-react";

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
        <div className="w-full max-w-lg border border-forest/20 bg-cream p-6 sm:p-10">
          <BrandPlaceholder />
          <div className="mt-10 grid size-12 place-items-center rounded-[2px] bg-forest text-white"><UserRound size={21} /></div>
          <p className="eyebrow mt-7">Sessão ativa</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">Você já está conectado.</h1>
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
    <main className={styles.layout}>
      <section className={styles.visual} aria-label="Guia de profissionais de Guarapuava">
        <BrandPlaceholder />
        <div className={styles.photo}>
          <Image src={loginImage} alt="Interior de uma academia" fill preload sizes="45vw" className={styles.visualImage} data-motion-hero-image />
          <div className={styles.photoCaption}><span>Guarapuava.<small>Paraná, Brasil</small></span><ArrowUpRight size={26} aria-hidden="true" /></div>
        </div>
        <p className={styles.visualNote}>Profissionais da cidade. Contato direto.</p>
      </section>

      <section className={`${styles.panel} flex min-h-screen flex-col bg-cream px-5 py-6 sm:px-10 lg:px-14 xl:px-20`}>
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden"><BrandPlaceholder /></div>
          <Link href="/" className="text-link"><ArrowLeft size={16} /> Voltar ao início</Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className={`${styles.formIntro} mb-8`} data-motion-form-intro>
            <p className="text-xs font-medium text-orange-dark">Sua conta</p>
            <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
              {mode === "signup" ? "Criar conta" : mode === "recovery" ? "Recuperar acesso" : "Entrar"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-forest/55">
              {mode === "signup"
                ? "Informe os dados de acesso. O perfil profissional é preenchido na etapa seguinte."
                : mode === "recovery"
                  ? "Informe seu email ou telefone. O link seguro será enviado para o email cadastrado."
                  : "Use o email ou telefone cadastrado para acessar sua conta."}
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
