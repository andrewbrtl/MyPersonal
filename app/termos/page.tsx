import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermsPage() {
  return (
    <main>
      <SiteHeader compact />
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
        <p className="eyebrow">Informações</p>
        <h1 className="font-display mt-4 text-5xl font-medium tracking-[-0.04em]">Termos de uso</h1>
        <p className="mt-4 text-sm text-forest/50">Versão inicial · agosto de 2026</p>
        <div className="legal-copy mt-10">
          <h2>Sobre a plataforma</h2>
          <p>A plataforma aproxima alunos e profissionais do esporte em Guarapuava. Ela não presta o serviço de treinamento e não participa da negociação, do pagamento ou da execução do acompanhamento.</p>
          <h2>Contas e informações</h2>
          <p>Cada pessoa é responsável por manter seus dados corretos e proteger sua senha. Profissionais devem informar um CPF único e um CREF9/PR próprio, ativo e compatível com seu nome no cadastro público, além de somente divulgar qualificações, preços, contatos e serviços verdadeiros. A consulta do registro não substitui a confirmação da identidade da pessoa.</p>
          <h2>Contratação e segurança</h2>
          <p>Antes de contratar, confirme identidade, registro profissional, valores, horários e condições diretamente com o profissional. A plataforma pode suspender perfis com informações falsas, uso abusivo ou risco aos demais usuários.</p>
          <h2>Uso aceitável</h2>
          <p>Não é permitido usar a plataforma para fraude, assédio, spam, violação de direitos ou acesso indevido a contas e dados.</p>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
