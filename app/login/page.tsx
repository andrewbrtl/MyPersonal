import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check, LogOut, MapPin, ShieldCheck, UserRound } from "lucide-react";

import { signOutAndCreateAccountAction } from "@/app/login/actions";
import { AuthForm } from "@/app/login/auth-form";
import { BrandPlaceholder } from "@/components/site-shell";
import { getCurrentProfile } from "@/lib/auth";

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

function safeNext(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const mode = first(query.modo) === "criar" ? "signup" : "login";
  const role = first(query.tipo) === "personal" ? "personal" : "aluno";
  const next = safeNext(first(query.next));
  const profile = await getCurrentProfile();

  if (profile && mode === "signup") {
    return (
      <main className="grid min-h-screen place-items-center bg-sand px-5 py-12">
        <div className="w-full max-w-lg border border-forest/15 bg-cream p-6 shadow-[0_24px_80px_rgba(24,52,44,0.12)] sm:p-10">
          <BrandPlaceholder />
          <div className="mt-10 grid size-12 place-items-center rounded-xl bg-forest text-white"><UserRound size={21} /></div>
          <p className="eyebrow mt-7">Sessão ativa</p>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">Você já está conectado.</h1>
          <p className="mt-4 text-sm leading-6 text-forest/55">
            A conta de <strong className="text-forest">{profile.nome}</strong> está ativa neste navegador. Para criar outra conta sem misturar as sessões, saia desta primeiro.
          </p>
          <div className="mt-7 rounded-xl border border-forest/15 bg-sand p-4">
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
    <main className="grid min-h-screen bg-cream lg:grid-cols-[minmax(0,1.05fr)_minmax(460px,0.95fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-forest px-10 py-9 text-cream lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-12">
        <div className="absolute right-[-4rem] top-[16%] size-44 rotate-12 border border-orange/35" aria-hidden="true" />
        <div className="absolute bottom-[-5rem] left-[18%] size-56 rounded-full border border-cream/10" aria-hidden="true" />
        <BrandPlaceholder inverted />

        <div className="relative max-w-xl py-16">
          <p className="eyebrow text-orange-light"><span className="eyebrow-line" /> Seu espaço, do seu jeito</p>
          <h1 className="font-display mt-6 text-[4.2rem] font-medium leading-[0.96] tracking-[-0.045em] xl:text-[5rem]">
            Movimento começa com confiança.
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-cream/62">
            Uma conta simples para encontrar o profissional certo — ou apresentar seu trabalho a quem está por perto.
          </p>
          <div className="mt-10 grid max-w-md gap-4 border-t border-cream/15 pt-7 text-sm text-cream/72">
            <Benefit>Perfis e preferências em um só lugar</Benefit>
            <Benefit>Área separada para alunos e profissionais</Benefit>
            <Benefit>Seus dados protegidos pelo Supabase</Benefit>
          </div>
        </div>

        <div className="relative flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-cream/45">
          <MapPin size={15} className="text-orange-light" /> Feito para Guarapuava, PR
        </div>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden"><BrandPlaceholder /></div>
          <Link href="/" className="text-link"><ArrowLeft size={16} /> Voltar ao início</Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <div className="flex size-11 items-center justify-center rounded-xl border border-forest/15 bg-sand text-forest">
              <ShieldCheck size={21} />
            </div>
            <p className="eyebrow mt-6">Acesso seguro</p>
            <h2 className="font-display mt-3 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">
              {mode === "signup" ? "Crie seu espaço." : "Bom ter você de volta."}
            </h2>
            <p className="mt-3 text-sm leading-6 text-forest/55">
              {mode === "signup" ? "Leva menos de um minuto. Depois você completa o que realmente importa." : "Entre para continuar de onde parou."}
            </p>
          </div>

          <AuthForm
            mode={mode}
            next={next}
            role={role}
            switchHref={switchHref}
            callbackError={first(query.erro) === "confirmacao"}
          />
        </div>

        <p className="pb-2 text-center text-xs leading-5 text-forest/40">
          Ao continuar, você concorda com os <Link href="/termos" className="underline underline-offset-3 hover:text-forest">termos de uso</Link> e a <Link href="/privacidade" className="underline underline-offset-3 hover:text-forest">política de privacidade</Link>.
        </p>
      </section>
    </main>
  );
}

function Benefit({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-orange/15 text-orange-light"><Check size={13} strokeWidth={3} /></span>{children}</span>;
}
