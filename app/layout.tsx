import type { Metadata } from "next";

import "@fontsource-variable/figtree";
import "@fontsource-variable/newsreader";
import "./globals.css";

import { PageMotion } from "@/components/page-motion";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Profissionais de esporte em Guarapuava",
    template: "%s · Guarapuava",
  },
  description: "Encontre profissionais de esporte em Guarapuava por modalidade, bairro e faixa de preço.",
  openGraph: {
    title: "Seu treino começa com a pessoa certa.",
    description: "Compare profissionais de esporte, especialidades, valores e locais de atendimento em Guarapuava.",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Seu treino começa com a pessoa certa.",
    description: "Profissionais de esporte perto de você, em Guarapuava.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full">{children}<PageMotion /></body>
    </html>
  );
}
