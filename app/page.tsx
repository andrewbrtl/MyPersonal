import Link from "next/link";

const modalidades = ["Musculação", "Corrida", "Lutas", "Funcional", "Pilates", "Natação"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#d9f99d_0,_transparent_34%),linear-gradient(#fafaf9,#f5f5f4)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="text-lg font-black tracking-[-0.04em]">
          treino<span className="text-lime-700">.perto</span>
        </Link>
        <Link
          href="/cadastro"
          className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-stone-400"
        >
          Sou profissional
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
        <div>
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-lime-800">
            Guarapuava, PR
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-7xl">
            O profissional certo para o seu próximo objetivo.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-stone-600">
            Compare modalidades, atendimento, distância e preço. Encontre quem combina com o seu treino e converse direto pelo WhatsApp.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/buscar"
              className="rounded-full bg-stone-950 px-7 py-3.5 text-center font-bold text-white shadow-lg shadow-stone-950/15 transition hover:bg-lime-700"
            >
              Encontrar um profissional
            </Link>
            <Link
              href="/planos"
              className="rounded-full px-7 py-3.5 text-center font-bold text-stone-700 transition hover:bg-white/70"
            >
              Conhecer os planos
            </Link>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-2xl shadow-stone-900/10 backdrop-blur sm:p-7">
          <p className="text-sm font-bold text-stone-500">O que você quer treinar?</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {modalidades.map((modalidade) => (
              <Link
                key={modalidade}
                href={`/buscar?modalidade=${encodeURIComponent(modalidade)}`}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-5 font-bold transition hover:-translate-y-0.5 hover:border-lime-500 hover:shadow-md"
              >
                {modalidade}
              </Link>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-stone-500">
            Busca pública e gratuita. Entre em contato sem intermediários.
          </p>
        </aside>
      </section>
    </main>
  );
}

