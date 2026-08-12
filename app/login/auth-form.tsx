"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import {
  loginAction,
  signUpAction,
  type AuthState,
} from "@/app/login/actions";

const initialState: AuthState = {};

type AuthFormProps = {
  mode: "login" | "signup";
  next: string;
  role: "aluno" | "personal";
  switchHref: string;
  callbackError?: boolean;
};

export function AuthForm({ mode, next, role, switchHref, callbackError }: AuthFormProps) {
  const action = mode === "signup" ? signUpAction : loginAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const isSignup = mode === "signup";

  return (
    <div>
      <div className="flex border-b border-forest/15" aria-label="Escolha entre entrar ou criar conta">
        <Link
          href={isSignup ? switchHref : "#formulario"}
          aria-current={!isSignup ? "page" : undefined}
          className={`flex-1 border-b-2 px-3 py-4 text-center text-sm font-semibold transition ${!isSignup ? "border-orange text-forest" : "border-transparent text-forest/45 hover:text-forest"}`}
        >
          Entrar
        </Link>
        <Link
          href={!isSignup ? switchHref : "#formulario"}
          aria-current={isSignup ? "page" : undefined}
          className={`flex-1 border-b-2 px-3 py-4 text-center text-sm font-semibold transition ${isSignup ? "border-orange text-forest" : "border-transparent text-forest/45 hover:text-forest"}`}
        >
          Criar conta
        </Link>
      </div>

      <form id="formulario" action={formAction} className="mt-7 grid gap-5">
        <input type="hidden" name="next" value={next} />

        {isSignup && (
          <label>
            <span className="field-label">Nome completo</span>
            <span className="relative block">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
              <input
                className="field pl-12"
                name="nome"
                autoComplete="name"
                placeholder="Como você gosta de ser chamado"
                aria-invalid={Boolean(state.errors?.nome)}
                required
              />
            </span>
            <FieldError messages={state.errors?.nome} />
          </label>
        )}

        <label>
          <span className="field-label">E-mail</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
            <input
              className="field pl-12"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="voce@exemplo.com"
              aria-invalid={Boolean(state.errors?.email)}
              required
            />
          </span>
          <FieldError messages={state.errors?.email} />
        </label>

        <label>
          <span className="field-label">Senha</span>
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
            <input
              className="field px-12"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "Mínimo de 8 caracteres" : "Digite sua senha"}
              aria-invalid={Boolean(state.errors?.password)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-forest/45 transition hover:bg-forest/5 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
          {isSignup && !state.errors?.password && (
            <span className="mt-2 block text-xs text-forest/45">Use 8 ou mais caracteres, com pelo menos uma letra e um número.</span>
          )}
          <FieldError messages={state.errors?.password} />
        </label>

        {isSignup && (
          <fieldset>
            <legend className="field-label">Quero usar a plataforma como</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <RoleOption
                value="aluno"
                title="Quero treinar"
                description="Buscar e salvar profissionais"
                defaultChecked={role === "aluno"}
              />
              <RoleOption
                value="personal"
                title="Sou profissional"
                description="Criar e divulgar meu perfil"
                defaultChecked={role === "personal"}
              />
            </div>
            <FieldError messages={state.errors?.role} />
          </fieldset>
        )}

        {(state.message || callbackError) && (
          <div
            className={`flex gap-3 border p-4 text-sm leading-6 ${state.success ? "border-forest/20 bg-forest/5 text-forest" : "border-orange/30 bg-orange/8 text-[#7b321f]"}`}
            role="status"
            aria-live="polite"
          >
            {state.success && <CheckCircle2 className="mt-0.5 shrink-0" size={18} />}
            <span>{state.message ?? "O link de confirmação expirou ou já foi utilizado. Entre com sua conta ou solicite um novo acesso."}</span>
          </div>
        )}

        <button type="submit" disabled={pending || state.success} className="button-accent min-h-13 w-full disabled:cursor-not-allowed disabled:opacity-55">
          {pending ? "Aguarde..." : isSignup ? "Criar minha conta" : "Entrar na minha conta"}
          {!pending && <ArrowRight size={18} />}
        </button>

      </form>
    </div>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="mt-2 block text-xs font-medium text-orange-dark">{messages[0]}</span>;
}

function RoleOption({
  value,
  title,
  description,
  defaultChecked,
}: {
  value: "aluno" | "personal";
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="relative cursor-pointer">
      <input className="peer sr-only" type="radio" name="role" value={value} defaultChecked={defaultChecked} />
      <span className="block min-h-24 rounded-xl border border-forest/20 bg-cream p-4 transition peer-checked:border-forest peer-checked:bg-forest peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-orange peer-focus-visible:ring-offset-2">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-xs leading-5 opacity-60">{description}</span>
      </span>
    </label>
  );
}
