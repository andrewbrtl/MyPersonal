import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { ResetPasswordForm } from "@/app/redefinir-senha/reset-password-form";
import { BrandPlaceholder } from "@/components/site-shell";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/password-recovery";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Redefinir senha" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value !== "1") {
    redirect("/login?modo=recuperar&erro=link-expirado");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-sand px-5 py-12">
      <section className="w-full max-w-lg border border-forest/15 bg-cream p-6 shadow-[0_24px_80px_rgba(24,52,44,0.12)] sm:p-10">
        <div className="flex items-center justify-between gap-5">
          <BrandPlaceholder />
          <Link href="/" className="text-link"><ArrowLeft size={16} /> Início</Link>
        </div>
        <div className="mt-10 grid size-12 place-items-center rounded-[2px] bg-forest text-white"><ShieldCheck size={21} /></div>
        <p className="eyebrow mt-7">Acesso protegido</p>
        <h1 className="font-display mt-3 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">Crie uma nova senha.</h1>
        <p className="mt-4 text-sm leading-6 text-forest/55">Use uma senha forte e diferente das anteriores. Ao salvar, você entrará novamente com o novo acesso.</p>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
