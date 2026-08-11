import type { Metadata } from "next";

import "@fontsource-variable/figtree";
import "@fontsource-variable/newsreader";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Encontre seu próximo treino",
    template: "%s | Marketplace de Personais",
  },
  description:
    "Encontre personais e profissionais de esporte em Guarapuava por modalidade, localização e preço.",
  openGraph: {
    title: "Seu treino começa com a pessoa certa.",
    description:
      "Encontre profissionais de esporte em Guarapuava por modalidade, localização e preço.",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og.png", alt: "treino.perto — Seu treino começa com a pessoa certa." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seu treino começa com a pessoa certa.",
    description: "Profissionais de esporte perto de você, em Guarapuava.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
