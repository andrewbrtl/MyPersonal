"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { isValidBrazilianPhone, normalizeBrazilianPhone } from "@/lib/contact";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type DeleteAccountState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export type PhoneState = {
  success?: boolean;
  message?: string;
  errors?: {
    telefone?: string[];
    password?: string[];
  };
};

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Digite sua senha atual."),
  confirmation: z.literal("EXCLUIR", { error: "Digite EXCLUIR exatamente como mostrado." }),
  understood: z.literal("on", { error: "Confirme que entende que a exclusão é permanente." }),
});

const phoneSchema = z.object({
  telefone: z.string().transform(normalizeBrazilianPhone).refine(isValidBrazilianPhone, "Digite um telefone com DDD válido."),
  password: z.string().min(1, "Digite sua senha atual."),
});

export async function updateLoginPhoneAction(
  _state: PhoneState,
  formData: FormData,
): Promise<PhoneState> {
  const profile = await requireUser("/conta");
  const parsed = phoneSchema.safeParse({
    telefone: formData.get("telefone"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: authentication, error: passwordError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: parsed.data.password,
  });
  if (passwordError || authentication.user.id !== profile.id) {
    return { errors: { password: ["Senha atual incorreta."] } };
  }

  const admin = createAdminClient();
  const { data: existingPhone } = await admin
    .from("profiles")
    .select("id")
    .eq("telefone", parsed.data.telefone)
    .neq("id", profile.id)
    .maybeSingle();
  if (existingPhone) return { errors: { telefone: ["Este telefone já está vinculado a outra conta."] } };

  const { error } = await admin.from("profiles").update({ telefone: parsed.data.telefone }).eq("id", profile.id);
  if (error?.code === "23505") return { errors: { telefone: ["Este telefone já está vinculado a outra conta."] } };
  if (error) return { message: "Não foi possível atualizar o telefone agora. Tente novamente." };

  revalidatePath("/conta");
  revalidatePath("/cadastro");
  return { success: true, message: "Telefone atualizado. Você já pode usá-lo no próximo login." };
}

export async function deleteAccountAction(
  _state: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const profile = await requireUser("/conta");
  const parsed = deleteAccountSchema.safeParse({
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
    understood: formData.get("understood"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: authentication, error: passwordError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: parsed.data.password,
  });
  if (passwordError || authentication.user.id !== profile.id) {
    return { errors: { password: ["Senha atual incorreta."] } };
  }

  const admin = createAdminClient();
  const { data: images, error: imageListError } = await admin.storage
    .from("profile-images")
    .list(profile.id, { limit: 100 });
  if (imageListError) return { message: "Não foi possível preparar a exclusão da conta. Tente novamente." };

  const imagePaths = (images ?? []).map((image) => `${profile.id}/${image.name}`);

  const { error: deleteError } = await admin.auth.admin.deleteUser(profile.id);
  if (deleteError) return { message: "Não foi possível excluir a conta agora. Tente novamente." };

  if (imagePaths.length) await admin.storage.from("profile-images").remove(imagePaths);

  await supabase.auth.signOut({ scope: "local" });
  redirect("/login?conta=excluida");
}
