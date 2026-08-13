"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole } from "lucide-react";

import { resetPasswordAction, type ResetPasswordState } from "@/app/redefinir-senha/actions";
import { passwordRules } from "@/lib/password-rules";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  return (
    <form data-motion-list action={action} className="mt-8 grid gap-5">
      <PasswordField
        label="Nova senha"
        name="password"
        value={password}
        onChange={setPassword}
        show={showPassword}
        onToggle={() => setShowPassword((current) => !current)}
        error={state.errors?.password}
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Requisitos da senha">
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

      <PasswordField
        label="Confirme a nova senha"
        name="passwordConfirm"
        value={passwordConfirm}
        onChange={setPasswordConfirm}
        show={showPasswordConfirm}
        onToggle={() => setShowPasswordConfirm((current) => !current)}
        error={state.errors?.passwordConfirm}
      />

      {state.message && <div role="status" aria-live="polite" className="border border-orange/30 bg-orange/8 p-4 text-sm leading-6 text-[#7b321f]">{state.message}</div>}

      <button type="submit" disabled={pending} className="button-accent min-h-13 w-full disabled:cursor-not-allowed disabled:opacity-55">
        {pending ? "Atualizando..." : "Salvar nova senha"}
        {!pending && <ArrowRight size={18} />}
      </button>
    </form>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string[];
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <span className="relative block">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
        <input
          className="field px-12"
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
          aria-invalid={Boolean(error)}
          required
        />
        <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-forest/45 transition hover:bg-forest/5 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange" aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      <FieldError messages={error} />
    </label>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="mt-2 block text-xs font-medium text-orange-dark">{messages[0]}</span>;
}
