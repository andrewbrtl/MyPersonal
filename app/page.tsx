import Link from "next/link";

const modalidades = [
  { nome: "Musculação", detalhe: "Força e hipertrofia" },
  { nome: "Corrida", detalhe: "Rua e performance" },
  { nome: "Lutas", detalhe: "Boxe, muay thai e jiu-jitsu" },
  { nome: "Funcional", detalhe: "Mobilidade e condicionamento" },
  { nome: "Pilates", detalhe: "Controle e postura" },
  { nome: "Natação", detalhe: "Técnica e resistência" },
];

const criterios = [
  {
    numero: "01",
    titulo: "Perto de você",
    texto: "Filtre por distância e encontre profissionais que atendem na sua região.",
  },
  {
    numero: "02",
    titulo: "Dentro do orçamento",
    texto: "Compare valores antes de conversar e escolha com mais segurança.",
  },
  {
    numero: "03",
    titulo: "Do seu jeito",
    texto: "Presencial ou online, individual ou em grupo, para o objetivo que você tem.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f2efe6] text-[#18342c]">
      <header className="border-b border-[#18342c]/15">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 text-lg font-semibold tracking-[-0.035em] outline-none focus-visible:ring-2 focus-visible:ring-[#d9653b] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f2efe6]"
          >
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-[0.45rem] bg-[#18342c] text-xs font-bold text-[#f2efe6] transition-transform group-hover:-rotate-3"
            >
              tp
            </span>
            <span>
              treino<span className="text-[#bb4d2d]">.perto</span>
            </span>
          </Link>

          <nav aria-label="Navegação principal" className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/planos"
              className="hidden text-sm font-medium text-[#18342c]/70 underline-offset-4 transition hover:text-[#18342c] hover:underline sm:block"
            >
              Ver planos
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#18342c]/30 bg-transparent px-4 text-sm font-semibold transition hover:border-[#18342c] hover:bg-[#18342c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9653b] focus-visible:ring-offset-2"
            >
              Sou profissional
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.82fr)] lg:items-center lg:gap-20 lg:px-10 lg:pb-24 lg:pt-24">
        <div>
          <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#18342c]/65">
            <span className="h-px w-8 bg-[#bb4d2d]" aria-hidden="true" />
            Feito para Guarapuava
          </div>

          <h1 className="font-display max-w-3xl text-[3.35rem] font-medium leading-[0.96] tracking-[-0.045em] text-[#18342c] sm:text-[4.8rem] lg:text-[5.65rem]">
            Seu treino começa com a pessoa certa.
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-[#18342c]/70 sm:text-xl">
            Encontre profissionais de esporte por modalidade, localização e preço. Sem enrolação: você escolhe e conversa direto.
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <Link
              href="/buscar"
              className="group inline-flex min-h-13 items-center justify-between gap-8 rounded-xl bg-[#18342c] px-6 font-semibold text-white transition hover:bg-[#245043] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9653b] focus-visible:ring-offset-2 sm:min-w-64"
            >
              Buscar profissionais
              <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <span className="text-center text-sm text-[#18342c]/55 sm:max-w-36 sm:text-left">
              Gratuito para quem busca
            </span>
          </div>
        </div>

        <aside className="overflow-hidden rounded-2xl bg-[#18342c] text-[#f7f4ec] shadow-[0_24px_70px_rgba(24,52,44,0.18)]">
          <div className="flex items-start justify-between border-b border-white/15 px-6 py-6 sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#efac79]">
                Comece por aqui
              </p>
              <h2 className="font-display mt-2 text-3xl font-medium tracking-[-0.03em]">
                O que você quer treinar?
              </h2>
            </div>
            <span className="hidden rounded-md border border-white/20 px-2.5 py-1 text-xs text-white/65 sm:block">
              13 modalidades
            </span>
          </div>

          <div className="grid sm:grid-cols-2">
            {modalidades.map((modalidade, index) => (
              <Link
                key={modalidade.nome}
                href={`/buscar?modalidade=${encodeURIComponent(modalidade.nome)}`}
                className="group flex min-h-24 gap-4 border-b border-white/10 px-6 py-5 transition hover:bg-white/[0.07] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#efac79] sm:px-8 sm:odd:border-r"
              >
                <span className="pt-0.5 text-xs tabular-nums text-[#efac79]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-semibold text-white transition group-hover:text-[#efac79]">
                    {modalidade.nome}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-white/50">
                    {modalidade.detalhe}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <Link
            href="/buscar"
            className="group flex min-h-14 items-center justify-between bg-[#d8663f] px-6 font-semibold text-white transition hover:bg-[#c45632] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white sm:px-8"
          >
            Ver todas as modalidades
            <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </aside>
      </section>

      <section className="border-y border-[#18342c]/15 bg-[#e8e3d7]">
        <div className="mx-auto grid max-w-7xl divide-y divide-[#18342c]/15 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-10">
          {criterios.map((criterio) => (
            <article key={criterio.numero} className="py-8 md:px-8 md:first:pl-0 md:last:pr-0 lg:py-10">
              <p className="text-xs font-semibold tabular-nums text-[#bb4d2d]">{criterio.numero}</p>
              <h2 className="mt-4 text-lg font-semibold tracking-[-0.02em]">{criterio.titulo}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#18342c]/65">{criterio.texto}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
