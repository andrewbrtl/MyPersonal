"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, ArrowRight, AtSign, CheckCircle2 } from "lucide-react";

import { requestPasswordResetAction, type AuthState } from "@/app/login/actions";

const initialState: AuthState = {};

export function RecoveryForm({ next, expiredLink }: { next: string; expiredLink?: boolean }) {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialState);
  const loginHref = `/login${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div>
      <form data-motion-list action={action} className="grid gap-5">
        {expiredLink && !state.message && (
          <div role="status" className="border border-orange/30 bg-orange/8 p-4 text-sm leading-6 text-[#7b321f]">
            O link expirou ou já foi utilizado. Solicite uma nova recuperação abaixo.
          </div>
        )}

        <label>
          <span className="field-label">E-mail ou telefone</span>
          <span className="relative block">
            <AtSign className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" size={18} />
            <input
              className="field pl-12"
              type="text"
              name="identificador"
              autoComplete="username"
              placeholder="voce@exemplo.com ou (42) 99999-9999"
              aria-invalid={Boolean(state.errors?.identificador)}
              required
            />
          </span>
          <FieldError messages={state.errors?.identificador} />
        </label>

        {state.message && (
          <div
            className={`flex gap-3 border p-4 text-sm leading-6 ${state.success ? "border-forest/20 bg-forest/5 text-forest" : "border-orange/30 bg-orange/8 text-[#7b321f]"}`}
            role="status"
            aria-live="polite"
          >
            {state.success && <CheckCircle2 className="mt-0.5 shrink-0" size={18} />}
            <span>{state.message}</span>
          </div>
        )}

        <button type="submit" disabled={pending || state.success} className="button-accent min-h-13 w-full disabled:cursor-not-allowed disabled:opacity-55">
          {pending ? "Enviando..." : "Enviar link de recuperação"}
          {!pending && <ArrowRight size={18} />}
        </button>
      </form>

      <Link href={loginHref} className="button-quiet mt-3 w-full"><ArrowLeft size={16} /> Voltar para o login</Link>
    </div>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="mt-2 block text-xs font-medium text-orange-dark">{messages[0]}</span>;
}
