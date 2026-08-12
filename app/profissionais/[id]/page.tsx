import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AtSign, BadgeCheck, Camera, Globe2, MapPin, MessageCircle, Phone, Star, UsersRound, Video } from "lucide-react";
import { notFound } from "next/navigation";

import { FavoriteButton } from "@/components/favorite-button";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentProfile } from "@/lib/auth";
import { formatPhone } from "@/lib/contact";
import { getPublicProfessional } from "@/lib/professionals";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/profissionais/[id]">): Promise<Metadata> {
  const { id } = await params;
  const professional = await getPublicProfessional(id);
  return professional ? { title: professional.nome, description: professional.destaque } : { title: "Perfil não encontrado" };
}

export default async function ProfessionalPage({ params }: PageProps<"/profissionais/[id]">) {
  const { id } = await params;
  const professional = await getPublicProfessional(id);
  if (!professional) notFound();
  const viewer = await getCurrentProfile();
  let saved = false;
  if (viewer?.role === "aluno") {
    const supabase = await createClient();
    const { data: favorite } = await supabase.from("favoritos").select("personal_id").eq("aluno_id", viewer.id).eq("personal_id", id).maybeSingle();
    saved = Boolean(favorite);
  }
  const socials = [
    { label: "Instagram", href: professional.instagramUrl, icon: <Camera size={17} /> },
    { label: "Facebook", href: professional.facebookUrl, icon: <UsersRound size={17} /> },
    { label: "TikTok", href: professional.tiktokUrl, icon: <AtSign size={17} /> },
    { label: "YouTube", href: professional.youtubeUrl, icon: <Video size={17} /> },
    { label: "Site", href: professional.websiteUrl, icon: <Globe2 size={17} /> },
  ].filter((item) => item.href);

  return (
    <main>
      <SiteHeader compact />
      <section className="bg-sand"><div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10"><Link href="/buscar" className="text-link"><ArrowLeft size={16} /> Voltar para a busca</Link></div></section>
      <section className="border-b border-forest/15 bg-cream">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[280px_1fr] lg:px-10 lg:py-14">
          <div
            className="grid min-h-72 place-items-center bg-forest text-cream"
            style={professional.avatarUrl ? { backgroundImage: `linear-gradient(to top, rgb(24 52 44 / .35), transparent), url(${professional.avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            role={professional.avatarUrl ? "img" : undefined}
            aria-label={professional.avatarUrl ? `Foto de ${professional.nome}` : undefined}
          >
            {!professional.avatarUrl && <span className="font-display text-7xl">{professional.iniciais}</span>}
          </div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow">{professional.verificado ? <><BadgeCheck size={15} /> CREF informado</> : "Perfil profissional"}</p>
            <h1 className="font-display mt-4 text-5xl font-medium tracking-[-0.04em] sm:text-6xl">{professional.nome}</h1>
            <p className="mt-3 text-lg font-semibold text-orange-dark">{professional.especialidade}</p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-forest/62">{professional.destaque}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-forest/55"><span className="inline-flex items-center gap-1.5"><MapPin size={15} />{professional.bairro}</span><span>{professional.atendimento}</span><span className="inline-flex items-center gap-1.5"><Star size={15} className={professional.avaliacoes ? "fill-orange text-orange" : "text-forest/35"} />{professional.avaliacoes ? `${professional.nota.toFixed(1)} · ${professional.avaliacoes} avaliações` : "Novo na plataforma"}</span></div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_340px] lg:px-10 lg:py-16">
        <div data-motion-list className="grid gap-12">
          <ProfileSection number="01" title="Sobre"><p>{professional.bio}</p><p className="mt-4 font-semibold text-forest">{professional.experiencia}</p></ProfileSection>
          <ProfileSection number="02" title="Modalidades"><div className="flex flex-wrap gap-2">{professional.modalidades.map((item) => <span className="status-badge min-h-8 px-3" key={item}>{item}</span>)}</div></ProfileSection>
          <ProfileSection number="03" title="Formação"><ul className="grid gap-3">{professional.formacao.map((item) => <li className="border-b border-forest/10 pb-3" key={item}>{item}</li>)}</ul><p className="mt-4 text-sm font-semibold text-forest">CREF {professional.cref}</p></ProfileSection>
          <ProfileSection number="04" title="Horários">{professional.horarios.length ? <ul className="grid gap-3">{professional.horarios.map((item) => <li className="flex gap-3 border-b border-forest/10 pb-3" key={item}><span className="text-orange">—</span>{item}</li>)}</ul> : <p>Disponibilidade sob consulta.</p>}</ProfileSection>
        </div>
        <aside id="contato" className="h-fit border border-forest/15 bg-sand p-6 lg:sticky lg:top-5">
          <p className="eyebrow">Valores</p>
          <p className="mt-4 text-sm text-forest/50">A partir de</p>
          <p className="mt-1 text-3xl font-semibold">{professional.preco > 0 ? <>R$ {professional.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-forest/50">{professional.unidade}</span></> : "Sob consulta"}</p>
          <div className="mt-7 grid gap-3">
            {professional.whatsapp && <a href={`/contato/${professional.id}?canal=whatsapp`} rel="nofollow" className="button-accent min-h-13 w-full"><MessageCircle size={18} /> Chamar no WhatsApp</a>}
            {professional.telefone && <a href={`/contato/${professional.id}?canal=telefone`} rel="nofollow" className="button-secondary min-h-12 w-full"><Phone size={18} /> {formatPhone(professional.telefone)}</a>}
            {!professional.whatsapp && !professional.telefone && <p className="rounded-xl border border-forest/15 bg-cream p-4 text-sm leading-6 text-forest/60">Este profissional ainda não informou um contato público.</p>}
          </div>
          {viewer?.role !== "personal" && <FavoriteButton professionalId={professional.id} professionalName={professional.nome} initialSaved={saved} returnTo={`/profissionais/${professional.id}`} wide />}
          {socials.length > 0 && <div className="mt-6 border-t border-forest/15 pt-5"><p className="field-label">Redes e links</p><div className="grid grid-cols-2 gap-2">{socials.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer nofollow" className="button-quiet justify-start border border-forest/12 bg-cream px-3">{item.icon}{item.label}</a>)}</div></div>}
          <p className="mt-5 text-xs leading-5 text-forest/50">Confirme valores, horários e disponibilidade diretamente antes de marcar.</p>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}

function ProfileSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section><p className="eyebrow">{number}</p><h2 className="font-display mt-3 text-4xl font-medium">{title}</h2><div className="mt-5 max-w-3xl text-base leading-7 text-forest/65">{children}</div></section>;
}
