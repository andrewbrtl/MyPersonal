"use client";

import { useActionState } from "react";
import { Bookmark, Heart } from "lucide-react";

import { toggleFavoriteAction, type FavoriteState } from "@/app/favoritos/actions";
import { useActionNotice } from "@/components/site-notices";

export function FavoriteButton({
  professionalId,
  professionalName,
  initialSaved = false,
  returnTo,
  wide = false,
}: {
  professionalId: string;
  professionalName: string;
  initialSaved?: boolean;
  returnTo: string;
  wide?: boolean;
}) {
  const actionWithContext = toggleFavoriteAction.bind(null, professionalId, returnTo);
  const [state, action, pending] = useActionState<FavoriteState, FormData>(actionWithContext, { saved: initialSaved });
  const Icon = wide ? Bookmark : Heart;
  const label = state.saved ? `Remover ${professionalName} dos salvos` : `Salvar perfil de ${professionalName}`;
  useActionNotice(state, {
    successTitle: state.saved ? "Guardado para depois" : "Saiu dos salvos",
    errorTitle: "Não foi possível atualizar os salvos",
  });

  return (
    <form action={action} className={wide ? "w-full" : undefined}>
      <button
        type="submit"
        disabled={pending}
        aria-label={label}
        aria-pressed={state.saved}
        title={label}
        className={wide ? "button-secondary mt-3 min-h-12 w-full disabled:opacity-55" : `save-button disabled:opacity-55 ${state.saved ? "border-orange-dark bg-orange-dark text-white" : ""}`}
      >
        <Icon size={wide ? 18 : 19} className={state.saved ? "fill-current" : undefined} />
        {wide && (pending ? "Salvando..." : state.saved ? "Perfil salvo" : "Salvar perfil")}
      </button>
    </form>
  );
}
