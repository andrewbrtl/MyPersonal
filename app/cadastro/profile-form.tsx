"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowRight, AtSign, Camera, CheckCircle2, Globe2, MessageCircle, Phone, Save, UploadCloud, UsersRound, Video, X } from "lucide-react";

import { saveProfessionalProfile, type ProfileState } from "@/app/cadastro/actions";
import { INPUT_LIMITS } from "@/lib/input-validation";

type Modality = { id: string; nome: string };
type InitialProfile = {
  nome: string;
  telefone: string;
  avatarUrl: string | null;
  cref: string;
  bairro: string;
  bio: string;
  formacao: string;
  anosExperiencia: number | null;
  preco: number | null;
  atendimento: "presencial" | "online" | "ambos";
  horarios: string[];
  modalidades: string[];
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  website: string;
};

const initialState: ProfileState = {};

export function ProfileForm({ modalities, initialProfile }: { modalities: Modality[]; initialProfile: InitialProfile }) {
  const [state, action, pending] = useActionState(saveProfessionalProfile, initialState);
  const [preview, setPreview] = useState<string | null>(initialProfile.avatarUrl);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <form action={action} className="grid gap-8">
      <section className="border border-forest/15 bg-cream p-5 sm:p-8 lg:p-10">
        <div className="border-b border-forest/15 pb-6">
          <p className="eyebrow">01 · Identidade</p>
          <h2 className="font-display mt-2 text-3xl font-medium">Como as pessoas verão você</h2>
        </div>

        <div className="mt-7 grid gap-7 md:grid-cols-[180px_1fr]">
          <div>
            <span className="field-label">Foto profissional <span className="normal-case tracking-normal text-forest/38">(opcional)</span></span>
            <label className="group block cursor-pointer">
              <span
                className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl border border-dashed border-forest/30 bg-sand text-center transition group-hover:border-orange"
                style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                {!preview && <span className="grid justify-items-center gap-2 px-4 text-xs text-forest/50"><Camera size={28} /><strong className="text-forest">Adicionar foto</strong>Suas iniciais aparecem se deixar vazio</span>}
                {preview && <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-lg bg-forest/85 px-3 py-2 text-xs font-semibold text-white"><UploadCloud size={14} /> Trocar foto</span>}
              </span>
              <input
                className="sr-only"
                type="file"
                name="avatar"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setPreview(URL.createObjectURL(file));
                    setRemoveAvatar(false);
                  }
                }}
              />
            </label>
            {initialProfile.avatarUrl && <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-semibold text-forest/55"><input type="checkbox" name="removerAvatar" checked={removeAvatar} onChange={(event) => { setRemoveAvatar(event.target.checked); setPreview(event.target.checked ? null : initialProfile.avatarUrl); }} /><X size={14} /> Remover foto atual</label>}
            <FieldError messages={state.errors?.avatar} />
          </div>

          <div data-motion-list className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome profissional" name="nome" defaultValue={initialProfile.nome} maxLength={INPUT_LIMITS.name} error={state.errors?.nome} className="sm:col-span-2" required />
            <Field label="CREF" name="cref" defaultValue={initialProfile.cref} maxLength={INPUT_LIMITS.cref} pattern="[0-9]{4,8}-[A-Za-z]/[A-Za-z]{2}" placeholder="012345-G/PR" error={state.errors?.cref} className="uppercase" required />
            <Field label="Bairro principal" name="bairro" defaultValue={initialProfile.bairro} maxLength={INPUT_LIMITS.neighborhood} placeholder="Ex.: Centro" error={state.errors?.bairro} required />
            <label><span className="field-label">Atendimento</span><select className="field" name="atendimento" defaultValue={initialProfile.atendimento}><option value="presencial">Presencial</option><option value="online">Online</option><option value="ambos">Presencial e online</option></select></label>
          </div>
        </div>
      </section>

      <section id="contatos" className="scroll-mt-6 border border-forest/15 bg-cream p-5 sm:p-8 lg:p-10">
        <div className="border-b border-forest/15 pb-6">
          <p className="eyebrow">02 · Contato e redes</p>
          <h2 className="font-display mt-2 text-3xl font-medium">Facilite a primeira conversa</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-forest/55">Só os canais preenchidos serão exibidos no seu perfil público. Seu e-mail de acesso continua privado.</p>
        </div>
        <div data-motion-list className="mt-7 grid gap-5 sm:grid-cols-2">
          <IconField icon={<Phone size={17} />} label="Telefone público" name="telefone" type="tel" inputMode="tel" maxLength={INPUT_LIMITS.phoneFormatted} pattern="[0-9()+ -]{10,20}" defaultValue={initialProfile.telefone} placeholder="(42) 99999-9999" error={state.errors?.telefone} required />
          <IconField icon={<MessageCircle size={17} />} label="WhatsApp" name="whatsapp" type="tel" inputMode="tel" maxLength={INPUT_LIMITS.phoneFormatted} pattern="[0-9()+ -]{10,20}" defaultValue={initialProfile.whatsapp} placeholder="(42) 99999-9999" error={state.errors?.whatsapp} />
          <IconField icon={<Camera size={17} />} label="Instagram" name="instagram" type="text" maxLength={INPUT_LIMITS.url} defaultValue={initialProfile.instagram} placeholder="@seuperfil" error={state.errors?.instagram} />
          <IconField icon={<UsersRound size={17} />} label="Facebook" name="facebook" type="text" maxLength={INPUT_LIMITS.url} defaultValue={initialProfile.facebook} placeholder="facebook.com/seuperfil" error={state.errors?.facebook} />
          <IconField icon={<AtSign size={17} />} label="TikTok" name="tiktok" type="text" maxLength={INPUT_LIMITS.url} defaultValue={initialProfile.tiktok} placeholder="@seuperfil" error={state.errors?.tiktok} />
          <IconField icon={<Video size={17} />} label="YouTube" name="youtube" type="text" maxLength={INPUT_LIMITS.url} defaultValue={initialProfile.youtube} placeholder="youtube.com/@seucanal" error={state.errors?.youtube} />
          <IconField icon={<Globe2 size={17} />} label="Site" name="website" type="text" maxLength={INPUT_LIMITS.url} defaultValue={initialProfile.website} placeholder="seusite.com.br" error={state.errors?.website} className="sm:col-span-2" />
        </div>
      </section>

      <section className="border border-forest/15 bg-cream p-5 sm:p-8 lg:p-10">
        <div className="border-b border-forest/15 pb-6"><p className="eyebrow">03 · Seu trabalho</p><h2 className="font-display mt-2 text-3xl font-medium">Dê contexto antes do primeiro contato</h2></div>
        <div data-motion-list className="mt-7 grid gap-6 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="field-label">Apresentação</span><textarea className="field min-h-36 py-3" name="bio" minLength={40} maxLength={INPUT_LIMITS.bio} defaultValue={initialProfile.bio} placeholder="Conte com quem você trabalha, como funciona seu acompanhamento e o que torna seu método especial." required /><FieldError messages={state.errors?.bio} /></label>
          <label className="sm:col-span-2"><span className="field-label">Formação e certificações</span><textarea className="field min-h-24 py-3" name="formacao" minLength={5} maxLength={INPUT_LIMITS.education} defaultValue={initialProfile.formacao} placeholder="Educação Física, especializações e certificações relevantes." required /><FieldError messages={state.errors?.formacao} /></label>
          <Field label="Anos de experiência" name="anosExperiencia" type="number" min="0" max={INPUT_LIMITS.experienceYears} step="1" defaultValue={initialProfile.anosExperiencia ?? 0} error={state.errors?.anosExperiencia} required />
          <Field label="Valor mensal a partir de" name="preco" type="number" inputMode="decimal" min="0" max={INPUT_LIMITS.price} step="0.01" defaultValue={initialProfile.preco ?? 0} error={state.errors?.preco} required />
          <fieldset className="sm:col-span-2"><legend className="field-label">Modalidades</legend><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{modalities.map((item) => <label key={item.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-forest/15 px-4 text-sm transition has-checked:border-forest has-checked:bg-forest has-checked:text-white"><input type="checkbox" name="modalidades" value={item.id} defaultChecked={initialProfile.modalidades.includes(item.id)} />{item.nome}</label>)}</div><FieldError messages={state.errors?.modalidades} /></fieldset>
          <label className="sm:col-span-2"><span className="field-label">Horários disponíveis</span><textarea className="field min-h-28 py-3" name="horarios" maxLength={INPUT_LIMITS.schedule} defaultValue={initialProfile.horarios.join("\n")} placeholder={"Segunda e quarta · 06h às 11h\nTerça e quinta · 18h às 21h"} /><span className="mt-2 block text-xs text-forest/45">Use uma linha para cada período disponível (máximo de {INPUT_LIMITS.scheduleLines}).</span><FieldError messages={state.errors?.horarios} /></label>
        </div>
      </section>

      {(state.message || state.success) && <div role="status" aria-live="polite" className={`flex items-center gap-3 border p-4 text-sm ${state.success ? "border-forest/20 bg-forest/5" : "border-orange/30 bg-orange/8 text-orange-dark"}`}>{state.success && <CheckCircle2 size={19} />}{state.message}</div>}

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-forest/15 bg-cream/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs leading-5 text-forest/50">Você poderá editar essas informações quando quiser.</span>
        <button type="submit" disabled={pending} className="button-accent min-h-12 disabled:cursor-not-allowed disabled:opacity-55"><Save size={17} /> {pending ? "Salvando..." : "Salvar e publicar"} {!pending && <ArrowRight size={17} />}</button>
      </div>
    </form>
  );
}

function Field({ label, error, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string[] }) {
  return <label className={className}><span className="field-label">{label}</span><input className="field" {...props} /><FieldError messages={error} /></label>;
}

function IconField({ icon, label, error, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode; label: string; error?: string[] }) {
  return <label className={className}><span className="field-label inline-flex items-center gap-2">{icon}{label}</span><input className="field" {...props} /><FieldError messages={error} /></label>;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <span className="mt-2 block text-xs font-medium text-orange-dark">{messages[0]}</span>;
}
