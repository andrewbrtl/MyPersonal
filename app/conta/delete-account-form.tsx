"use client";

import { useActionState, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { AlertTriangle, LockKeyhole, Trash2, X } from "lucide-react";

import { deleteAccountAction, type DeleteAccountState } from "@/app/conta/actions";
import { INPUT_LIMITS } from "@/lib/input-validation";

const initialState: DeleteAccountState = {};

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [state, action, pending] = useActionState(deleteAccountAction, initialState);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !panelRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(panelRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, [open]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-700/35 px-5 font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700">
        <Trash2 size={17} /> Excluir minha conta
      </button>
    );
  }

  const ready = understood && confirmation === "EXCLUIR" && password.length > 0;

  return (
    <div ref={panelRef} className="rounded-2xl border border-red-800/25 bg-[#fff9f5] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-800 text-white"><AlertTriangle size={19} /></span>
          <div><h3 className="text-lg font-semibold text-red-950">Confirmar exclusão permanente</h3><p className="mt-1 text-sm leading-6 text-red-950/60">Esta ação não pode ser desfeita.</p></div>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="grid size-10 shrink-0 place-items-center rounded-xl text-red-950/50 transition hover:bg-red-950/5 hover:text-red-950" aria-label="Cancelar exclusão"><X size={18} /></button>
      </div>

      <form action={action} className="mt-6 grid gap-5">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-red-900/15 bg-white p-4 text-sm leading-6 text-red-950/70">
          <input name="understood" type="checkbox" checked={understood} onChange={(event) => setUnderstood(event.target.checked)} className="mt-1 size-4 accent-red-800" />
          <span>Entendo que meu perfil, favoritos, contatos, imagens e acesso serão excluídos permanentemente.</span>
        </label>
        <FieldError messages={state.errors?.understood} />

        <label><span className="field-label text-red-900">Digite EXCLUIR para confirmar</span><input className="field bg-white uppercase" name="confirmation" maxLength={7} value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase())} autoComplete="off" required /><FieldError messages={state.errors?.confirmation} /></label>
        <label><span className="field-label text-red-900">Senha atual</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-red-900/45" size={17} /><input className="field bg-white pl-11" name="password" type="password" maxLength={INPUT_LIMITS.password} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></span><FieldError messages={state.errors?.password} /></label>

        {state.message && <p role="status" className="rounded-xl border border-red-800/20 bg-red-50 p-4 text-sm text-red-900">{state.message}</p>}
        <button type="submit" disabled={!ready || pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-800 px-5 font-semibold text-white transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-40">
          <Trash2 size={17} /> {pending ? "Excluindo conta..." : "Excluir conta definitivamente"}
        </button>
      </form>
    </div>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="-mt-3 block text-xs font-medium text-red-800">{messages[0]}</span>;
}
