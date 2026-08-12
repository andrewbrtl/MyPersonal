import { z } from "zod";

import { onlyPhoneDigits, toWhatsAppNumber } from "@/lib/contact";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const idSchema = z.string().uuid();

export async function GET(request: Request, context: RouteContext<"/contato/[id]">) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const channel = url.searchParams.get("canal");
  if (!idSchema.safeParse(id).success || (channel !== "whatsapp" && channel !== "telefone")) {
    return new Response("Contato inválido.", { status: 400 });
  }

  const admin = createAdminClient();
  const { data: professional } = await admin
    .from("personais")
    .select("id,whatsapp,perfil_publico")
    .eq("id", id)
    .eq("perfil_publico", true)
    .maybeSingle();
  if (!professional) return new Response("Perfil não encontrado.", { status: 404 });

  const { data: publicProfile } = await admin.from("profiles").select("telefone").eq("id", id).maybeSingle();
  const phone = channel === "whatsapp" ? professional.whatsapp : publicProfile?.telefone;
  const digits = onlyPhoneDigits(phone ?? "");
  if (digits.length < 10) {
    return Response.redirect(new URL(`/profissionais/${id}?contato=indisponivel`, url.origin), 303);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let studentId: string | null = null;
  if (user) {
    const { data: viewerProfile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (viewerProfile?.role === "aluno") studentId = user.id;
  }

  await admin.from("contatos").insert({
    personal_id: id,
    aluno_id: studentId,
    canal: channel,
    origem: "perfil_publico",
  });

  if (channel === "whatsapp") {
    const message = encodeURIComponent("Olá! Encontrei seu perfil profissional e gostaria de saber mais sobre o acompanhamento.");
    return Response.redirect(`https://wa.me/${toWhatsAppNumber(digits)}?text=${message}`, 303);
  }

  return new Response(null, { status: 302, headers: { Location: `tel:+${toWhatsAppNumber(digits)}` } });
}
