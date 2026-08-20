import type { Metadata } from "next";

import "@fontsource-variable/figtree";
import "@fontsource-variable/newsreader";
import "./globals.css";

import { PageMotion } from "@/components/page-motion";
import { SiteNoticeProvider } from "@/components/site-notices";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Profissionais de esporte em Guarapuava",
    template: "%s · Guarapuava",
  },
  description: "Encontre profissionais de esporte em Guarapuava por modalidade, bairro e faixa de preço.",
  openGraph: {
    title: "Profissionais de esporte em Guarapuava",
    description: "Compare profissionais de esporte, especialidades, valores e locais de atendimento em Guarapuava.",
    images: [{
      url: "/images/gym-interior-hero-v2.webp",
      width: 2400,
      height: 1350,
      alt: "Academia profissional em iluminação baixa",
    }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Profissionais de esporte em Guarapuava",
    description: "Profissionais de esporte perto de você, em Guarapuava.",
    images: ["/images/gym-interior-hero-v2.webp"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full"><SiteNoticeProvider>{children}<PageMotion /></SiteNoticeProvider></body>
    </html>
  );
}
