"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import { safeInternalPath } from "@/lib/input-validation";
import { createClient } from "@/lib/supabase/server";

export type FavoriteState = {
  saved: boolean;
  success?: boolean;
  message?: string;
};

const professionalIdSchema = z.string().uuid();

export async function toggleFavoriteAction(
  professionalId: string,
  returnTo: string,
  state: FavoriteState,
  _formData: FormData,
): Promise<FavoriteState> {
  void _formData;
  const parsedId = professionalIdSchema.safeParse(professionalId);
  if (!parsedId.success) return { ...state, success: false, message: "Perfil inválido." };

  const profile = await getCurrentProfile();
  const safeReturnTo = safeInternalPath(returnTo, "/buscar");
  if (!profile) redirect(`/login?next=${encodeURIComponent(safeReturnTo)}`);
  if (profile.role !== "aluno") return { ...state, success: false, message: "Favoritos estão disponíveis para contas de aluno." };

  const supabase = await createClient();
  const { data: professional } = await supabase
    .from("personais")
    .select("id")
    .eq("id", parsedId.data)
    .eq("perfil_publico", true)
    .maybeSingle();
  if (!professional) return { ...state, success: false, message: "Este perfil não está disponível." };

  const { data: existing } = await supabase
    .from("favoritos")
    .select("personal_id")
    .eq("aluno_id", profile.id)
    .eq("personal_id", parsedId.data)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("aluno_id", profile.id)
      .eq("personal_id", parsedId.data);
    if (error) return { saved: true, success: false, message: "Não foi possível remover o perfil agora." };
  } else {
    const { error } = await supabase.from("favoritos").insert({ aluno_id: profile.id, personal_id: parsedId.data });
    if (error) return { saved: false, success: false, message: "Não foi possível salvar o perfil agora." };
  }

  revalidatePath("/buscar");
  revalidatePath("/favoritos");
  revalidatePath(`/profissionais/${parsedId.data}`);
  return {
    saved: !existing,
    success: true,
    message: !existing
      ? "Você encontra este profissional na sua lista de salvos."
      : "Este profissional saiu da sua lista de salvos.",
  };
}
