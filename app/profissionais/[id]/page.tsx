import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { professionals } from "@/lib/demo-data";

export function generateStaticParams() { return professionals.map(({ id }) => ({ id })); }

export default async function ProfessionalPage({ params }: PageProps<"/profissionais/[id]">) {
  const { id } = await params;
  const professional = professionals.find((item) => item.id === id);
  if (!professional) notFound();

  return (
    <main>
      <SiteHeader compact />
      <section className="bg-sand">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <Link href="/buscar" className="text-link">← Voltar para a busca</Link>
        </div>
      </section>
      <section className="border-b border-forest/15 bg-cream">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[280px_1fr] lg:px-10 lg:py-14">
          <div className={`grid min-h-72 place-items-center ${professional.cor} text-cream`}><span className="font-display text-7xl">{professional.iniciais}</span></div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow">{professional.verificado ? "Perfil verificado" : "Perfil profissional"}</p>
            <h1 className="font-display mt-4 text-5xl font-medium tracking-[-0.04em] sm:text-6xl">{professional.nome}</h1>
            <p className="mt-3 text-lg font-semibold text-orange-dark">{professional.especialidade}</p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-forest/62">{professional.destaque}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-forest/55">
              <span>{professional.bairro}</span><span>{professional.atendimento}</span><span>★ {professional.nota.toFixed(1)} · {professional.avaliacoes} avaliações</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_340px] lg:px-10 lg:py-16">
        <div className="grid gap-12">
          <ProfileSection number="01" title="Sobre"><p>{professional.bio}</p><p className="mt-4 font-semibold text-forest">{professional.experiencia}</p></ProfileSection>
          <ProfileSection number="02" title="Modalidades"><div className="flex flex-wrap gap-2">{professional.modalidades.map((item) => <span className="status-badge min-h-8 px-3" key={item}>{item}</span>)}</div></ProfileSection>
          <ProfileSection number="03" title="Formação"><ul className="grid gap-3">{professional.formacao.map((item) => <li className="border-b border-forest/10 pb-3" key={item}>{item}</li>)}</ul></ProfileSection>
          <ProfileSection number="04" title="Horários"><ul className="grid gap-3">{professional.horarios.map((item) => <li className="flex gap-3 border-b border-forest/10 pb-3" key={item}><span className="text-orange">—</span>{item}</li>)}</ul></ProfileSection>
          <ProfileSection number="05" title="Avaliações"><blockquote className="border-l-2 border-orange pl-5"><p>“Atendimento cuidadoso e treino bem explicado. Consegui manter a rotina sem exageros.”</p><footer className="mt-3 text-sm text-forest/50">Cliente verificado · Guarapuava</footer></blockquote></ProfileSection>
        </div>
        <aside className="h-fit border border-forest/15 bg-sand p-6 lg:sticky lg:top-5">
          <p className="eyebrow">Valores</p>
          <p className="mt-4 text-sm text-forest/50">A partir de</p>
          <p className="mt-1 text-3xl font-semibold">R$ {professional.preco} <span className="text-sm font-normal text-forest/50">{professional.unidade}</span></p>
          <a href="#contato" className="button-primary mt-7 w-full">Conversar com o profissional <span>→</span></a>
          <button className="button-secondary mt-3 min-h-12 w-full">Salvar perfil</button>
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
