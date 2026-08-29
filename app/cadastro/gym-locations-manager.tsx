"use client";

import { useActionState, useEffect, useRef } from "react";
import { Building2, ExternalLink, MapPin, Plus, Trash2 } from "lucide-react";

import { addGymLocation, removeGymLocation, type GymState } from "@/app/cadastro/gym-actions";
import { useActionNotice } from "@/components/site-notices";
import { googleMapsSearchUrl } from "@/lib/gym-location";
import { INPUT_LIMITS } from "@/lib/input-validation";

export type GymLocation = {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  maps_url: string | null;
};

const initialState: GymState = {};

export function GymLocationsManager({ gyms }: { gyms: GymLocation[] }) {
  const [state, action, pending] = useActionState(addGymLocation, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  useActionNotice(state, {
    successTitle: "Academia adicionada",
    errorTitle: "Não foi possível adicionar",
    validationTitle: "Revise a localização",
  });

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <section id="academias" className="mt-8 scroll-mt-6 border border-forest/15 bg-cream p-5 sm:p-8 lg:p-10">
      <div className="border-b border-forest/15 pb-6">
        <p className="eyebrow">04 · Locais de atendimento</p>
        <h2 className="font-display mt-2 text-3xl font-medium">Academias onde atende</h2>
      </div>

      <form ref={formRef} action={action} className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Nome da academia" name="nomeAcademia" maxLength={INPUT_LIMITS.gymName} placeholder="Ex.: Academia Centro" error={state.errors?.nome} required />
        <Field label="Bairro" name="bairroAcademia" maxLength={INPUT_LIMITS.neighborhood} placeholder="Ex.: Centro" error={state.errors?.bairro} required />
        <Field label="Endereço" name="enderecoAcademia" maxLength={INPUT_LIMITS.address} placeholder="Rua, número" error={state.errors?.endereco} className="sm:col-span-2" required />
        <Field label="Link do Google Maps (opcional)" name="mapsUrl" type="url" maxLength={INPUT_LIMITS.mapsUrl} placeholder="https://maps.app.goo.gl/..." error={state.errors?.mapsUrl} className="sm:col-span-2" />
        <button type="submit" disabled={pending} className="button-accent min-h-12 sm:w-fit disabled:cursor-not-allowed disabled:opacity-55">
          <Plus size={17} /> {pending ? "Adicionando..." : "Adicionar academia"}
        </button>
      </form>

      <div className="mt-8 border-t border-forest/15">
        {gyms.length ? gyms.map((gym) => {
          const mapUrl = gym.maps_url || googleMapsSearchUrl(gym.nome, gym.endereco, gym.bairro);
          return (
            <article key={gym.id} className="grid gap-4 border-b border-forest/15 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h3 className="flex items-center gap-2 font-semibold"><Building2 size={17} className="text-orange-dark" /> {gym.nome}</h3>
                <p className="mt-2 text-sm text-forest/60">{gym.endereco} · {gym.bairro}, Guarapuava</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={mapUrl} target="_blank" rel="noopener noreferrer nofollow" className="button-quiet border border-forest/20 px-3">
                  <MapPin size={16} /> Mapa <ExternalLink size={13} />
                </a>
                <form action={removeGymLocation}>
                  <input type="hidden" name="academiaId" value={gym.id} />
                  <button type="submit" className="button-quiet border border-forest/20 px-3 text-red-800" aria-label={`Remover ${gym.nome}`}>
                    <Trash2 size={16} /> Remover
                  </button>
                </form>
              </div>
            </article>
          );
        }) : <p className="py-6 text-sm text-forest/50">Nenhuma academia cadastrada.</p>}
      </div>
    </section>
  );
}

function Field({ label, error, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string[] }) {
  return <label className={className}><span className="field-label">{label}</span><input className="field" {...props} />{error?.[0] && <span className="mt-2 block text-xs font-medium text-orange-dark">{error[0]}</span>}</label>;
}
