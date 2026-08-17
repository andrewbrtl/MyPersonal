"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Phone, Save } from "lucide-react";

import { updateLoginPhoneAction, type PhoneState } from "@/app/conta/actions";
import { INPUT_LIMITS } from "@/lib/input-validation";

const initialState: PhoneState = {};

export function PhoneForm({ currentPhone }: { currentPhone: string }) {
  const [state, action, pending] = useActionState(updateLoginPhoneAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-6 grid gap-5 sm:grid-cols-2">
      <label>
        <span className="field-label">Telefone com DDD</span>
        <span className="relative block">
          <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
          <input className="field pl-12" type="tel" name="telefone" autoComplete="tel" inputMode="tel" maxLength={INPUT_LIMITS.phoneFormatted} pattern="[0-9()+ -]{10,20}" defaultValue={currentPhone} placeholder="(42) 99999-9999" aria-invalid={Boolean(state.errors?.telefone)} required />
        </span>
        <FieldError messages={state.errors?.telefone} />
      </label>

      <label>
        <span className="field-label">Senha atual</span>
        <span className="relative block">
          <input className="field pr-12" type={showPassword ? "text" : "password"} name="password" maxLength={INPUT_LIMITS.password} autoComplete="current-password" aria-invalid={Boolean(state.errors?.password)} required />
          <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-forest/45 transition hover:bg-forest/5 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
        <FieldError messages={state.errors?.password} />
      </label>

      {(state.message || state.success) && <div role="status" aria-live="polite" className={`flex items-center gap-3 border p-4 text-sm sm:col-span-2 ${state.success ? "border-forest/20 bg-forest/5 text-forest" : "border-orange/30 bg-orange/8 text-orange-dark"}`}>{state.success && <CheckCircle2 size={18} />}{state.message}</div>}

      <button type="submit" disabled={pending} className="button-accent min-h-12 sm:col-span-2 sm:w-fit disabled:cursor-not-allowed disabled:opacity-55"><Save size={17} /> {pending ? "Salvando..." : "Salvar telefone"}</button>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="mt-2 block text-xs font-medium text-orange-dark">{messages[0]}</span>;
}
