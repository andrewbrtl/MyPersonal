import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Encontre seu próximo treino",
    template: "%s | Marketplace de Personais",
  },
  description:
    "Encontre personais e profissionais de esporte em Guarapuava por modalidade, localização e preço.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-stone-50 text-stone-950">{children}</body>
    </html>
  );
}
