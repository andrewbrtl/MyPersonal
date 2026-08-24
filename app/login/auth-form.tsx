"use client";

import Link from "next/link";
import { useActionState, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  AtSign,
  Eye,
  EyeOff,
  IdCard,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import {
  loginAction,
  signUpAction,
  type AuthState,
} from "@/app/login/actions";
import { passwordRules } from "@/lib/password-rules";
import { INPUT_LIMITS } from "@/lib/input-validation";
import { useActionNotice } from "@/components/site-notices";

const initialState: AuthState = {};

type AuthFormProps = {
  mode: "login" | "signup";
  next: string;
  role: "aluno" | "personal";
  switchHref: string;
};

export function AuthForm({ mode, next, role, switchHref }: AuthFormProps) {
  const action = mode === "signup" ? signUpAction : loginAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(role);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const professionalFieldsRef = useRef<HTMLDivElement>(null);
  const isSignup = mode === "signup";
  useActionNotice(state, {
    successTitle: "Conta criada com sucesso",
    errorTitle: isSignup ? "A conta ainda não foi criada" : "Não foi possível entrar",
    validationTitle: "Falta acertar alguns dados",
  });

  useLayoutEffect(() => {
    if (!professionalFieldsRef.current || selectedRole !== "personal") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      professionalFieldsRef.current,
      { autoAlpha: 0, height: 0, y: -8 },
      { autoAlpha: 1, height: "auto", y: 0, duration: 0.42, ease: "power2.out", clearProps: "height,opacity,visibility,transform" },
    );
  }, [selectedRole]);

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

      <form id="formulario" data-motion-list action={formAction} className="mt-7 grid gap-5">
        <input type="hidden" name="next" value={next} />

        {isSignup && (
          <label>
            <span className="field-label">Nome completo</span>
            <span className="relative block">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
              <input
                className="field pl-12"
                name="nome"
                maxLength={INPUT_LIMITS.signupName}
                autoComplete="name"
                placeholder="Seu nome completo"
                aria-invalid={Boolean(state.errors?.nome)}
                required
              />
            </span>
            <FieldError messages={state.errors?.nome} />
          </label>
        )}

        <label>
          <span className="field-label">{isSignup ? "Email" : "Email ou Telefone"}</span>
          <span className="relative block">
            {isSignup
              ? <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
              : <AtSign className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />}
            <input
              className="field pl-12"
              type={isSignup ? "email" : "text"}
              name={isSignup ? "email" : "identificador"}
              maxLength={isSignup ? INPUT_LIMITS.email : INPUT_LIMITS.loginIdentifier}
              autoComplete={isSignup ? "email" : "username"}
              inputMode={isSignup ? "email" : undefined}
              placeholder={isSignup ? "voce@exemplo.com" : "voce@exemplo.com ou (42) 99999-9999"}
              aria-invalid={Boolean(isSignup ? state.errors?.email : state.errors?.identificador)}
              required
            />
          </span>
          <FieldError messages={isSignup ? state.errors?.email : state.errors?.identificador} />
        </label>

        {isSignup && (
          <label>
            <span className="field-label">Telefone com DDD</span>
            <span className="relative block">
              <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
              <input
                className="field pl-12"
                type="tel"
                name="telefone"
                autoComplete="tel"
                inputMode="tel"
                maxLength={INPUT_LIMITS.phoneFormatted}
                pattern="[0-9()+ -]{10,20}"
                placeholder="(42) 99999-9999"
                aria-invalid={Boolean(state.errors?.telefone)}
                required
              />
            </span>
            <span className="mt-2 block text-xs leading-5 text-forest/45">Você também poderá usar este número para entrar.</span>
            <FieldError messages={state.errors?.telefone} />
          </label>
        )}

        <label>
          <span className="field-label">Senha</span>
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
            <input
              className="field px-12"
              type={showPassword ? "text" : "password"}
              name="password"
              maxLength={isSignup ? INPUT_LIMITS.newPassword : INPUT_LIMITS.password}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "Crie uma senha forte" : "Digite sua senha"}
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
          {isSignup && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Requisitos da senha">
              {passwordRules.map(({ label, test }) => {
                const valid = test(password);
                return (
                <span key={label} className={`flex items-center gap-1.5 text-[0.68rem] font-medium transition ${valid ? "text-forest" : "text-forest/38"}`}>
                  <span className={`grid size-4 place-items-center rounded-full transition ${valid ? "bg-forest text-white" : "border border-forest/20"}`}>
                    {valid && <Check size={10} strokeWidth={3} />}
                  </span>
                  {label}
                </span>
                );
              })}
            </div>
          )}
          <FieldError messages={state.errors?.password} />
        </label>

        {!isSignup && (
          <Link href={`/login?modo=recuperar${next ? `&next=${encodeURIComponent(next)}` : ""}`} className="-mt-2 w-fit text-xs font-semibold text-orange-dark underline decoration-orange/35 underline-offset-4 transition hover:decoration-orange">
            Esqueci minha senha
          </Link>
        )}

        {isSignup && (
          <label>
            <span className="field-label">Confirme a senha</span>
            <span className="relative block">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
              <input
                className="field px-12"
                type={showPasswordConfirm ? "text" : "password"}
                name="passwordConfirm"
                maxLength={INPUT_LIMITS.newPassword}
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                autoComplete="new-password"
                placeholder="Digite a mesma senha novamente"
                aria-invalid={Boolean(state.errors?.passwordConfirm)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((current) => !current)}
                className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-forest/45 transition hover:bg-forest/5 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                aria-label={showPasswordConfirm ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
              >
                {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            {passwordConfirm && !state.errors?.passwordConfirm && (
              <span className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${password === passwordConfirm ? "text-forest" : "text-orange-dark"}`}>
                {password === passwordConfirm && <CheckCircle2 size={14} />}
                {password === passwordConfirm ? "As senhas coincidem." : "As senhas ainda não coincidem."}
              </span>
            )}
            <FieldError messages={state.errors?.passwordConfirm} />
          </label>
        )}

        {isSignup && (
          <fieldset>
            <legend className="field-label">Quero usar a plataforma como</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <RoleOption
                value="aluno"
                title="Quero treinar"
                description="Buscar e salvar profissionais"
                defaultChecked={role === "aluno"}
                onSelect={setSelectedRole}
              />
              <RoleOption
                value="personal"
                title="Sou profissional"
                description="Criar e divulgar meu perfil"
                defaultChecked={role === "personal"}
                onSelect={setSelectedRole}
              />
            </div>
            <FieldError messages={state.errors?.role} />
          </fieldset>
        )}

        {isSignup && selectedRole === "personal" && (
          <div ref={professionalFieldsRef} className="rounded-[2px] border border-orange/25 bg-orange/6 p-4 sm:p-5">
            <label>
              <span className="field-label text-orange-dark">CREF obrigatório</span>
              <span className="relative block">
                <IdCard className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-dark/55" size={18} />
                <input
                  className="field bg-white pl-12 uppercase"
                  name="cref"
                  maxLength={INPUT_LIMITS.cref}
                  autoComplete="off"
                  placeholder="012345-G/PR"
                  pattern="[0-9]{4,8}-[A-Za-z]/PR"
                  title="Use um CREF do Paraná no formato 012345-G/PR"
                  aria-invalid={Boolean(state.errors?.cref)}
                  required
                />
              </span>
              <span className="mt-2 block text-xs leading-5 text-forest/50">Antes de criar a conta, conferimos número, situação e nome completo na consulta pública do CREF9/PR.</span>
              <FieldError messages={state.errors?.cref} />
            </label>
          </div>
        )}

        <button type="submit" disabled={pending || state.success} className="button-accent min-h-13 w-full disabled:cursor-not-allowed disabled:opacity-55">
          {pending ? (isSignup && selectedRole === "personal" ? "Consultando CREF9..." : "Aguarde...") : isSignup ? "Criar minha conta" : "Entrar na minha conta"}
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
  onSelect,
}: {
  value: "aluno" | "personal";
  title: string;
  description: string;
  defaultChecked: boolean;
  onSelect: (role: "aluno" | "personal") => void;
}) {
  return (
    <label className="relative cursor-pointer">
      <input className="peer sr-only" type="radio" name="role" value={value} defaultChecked={defaultChecked} onChange={() => onSelect(value)} />
      <span className="block min-h-24 rounded-[2px] border border-forest/20 bg-cream p-4 transition peer-checked:border-forest peer-checked:bg-forest peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-orange peer-focus-visible:ring-offset-2">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-xs leading-5 opacity-60">{description}</span>
      </span>
    </label>
  );
}
