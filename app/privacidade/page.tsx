import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = { title: "Privacidade" };

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader compact />
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
        <p className="eyebrow">Informações</p>
        <h1 className="font-display mt-4 text-5xl font-medium tracking-[-0.04em]">Privacidade</h1>
        <p className="mt-4 text-sm text-forest/50">Versão inicial · agosto de 2026</p>
        <div className="legal-copy mt-10">
          <h2>Dados usados pela plataforma</h2>
          <p>Usamos dados da conta, como nome, email e telefone, para autenticação. O telefone também pode identificar sua conta no login, enquanto links de recuperação de senha são enviados apenas ao email cadastrado. Em perfis profissionais, as informações marcadas para publicação — foto, descrição, CREF, telefone, redes sociais, modalidades e valores — ficam visíveis para visitantes.</p>
          <h2>Consulta do registro profissional</h2>
          <p>Ao criar uma conta profissional, consultamos a base pública do CREF9/PR para conferir o número do registro, o nome, a categoria e a situação cadastral. A conta só é criada quando o registro é localizado, está ativo e o nome informado coincide com o cadastro público.</p>
          <h2>CPF de profissionais</h2>
          <p>O CPF é solicitado somente para impedir que a mesma pessoa crie mais de uma conta profissional. Validamos o formato no servidor e armazenamos apenas uma assinatura criptográfica protegida por chave; o número original não é mantido no banco, não integra os dados de autenticação e nunca aparece no perfil público.</p>
          <h2>Favoritos e contatos</h2>
          <p>Perfis salvos ficam ligados à conta do aluno. Quando alguém usa um botão de telefone ou WhatsApp, registramos o canal, a origem e o horário do contato para o painel do profissional; visitantes anônimos não são identificados.</p>
          <h2>Proteção e fornecedores</h2>
          <p>A autenticação e o banco de dados usam Supabase, e a aplicação é hospedada na Vercel. O acesso aos dados é limitado por permissões de conta e regras do banco.</p>
          <h2>Suas escolhas</h2>
          <p>Profissionais podem editar os dados públicos no painel. Não publique informações sensíveis nos campos de apresentação ou redes sociais.</p>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
