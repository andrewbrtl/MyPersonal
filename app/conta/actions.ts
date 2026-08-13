"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type DeleteAccountState = {
  message?: string;
  errors?: Record<string, string[]>;
};

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Digite sua senha atual."),
  confirmation: z.literal("EXCLUIR", { error: "Digite EXCLUIR exatamente como mostrado." }),
  understood: z.literal("on", { error: "Confirme que entende que a exclusão é permanente." }),
});

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
  if (imagePaths.length) {
    const { error: imageDeleteError } = await admin.storage.from("profile-images").remove(imagePaths);
    if (imageDeleteError) return { message: "Não foi possível remover os arquivos da conta. Tente novamente." };
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(profile.id);
  if (deleteError) return { message: "Não foi possível excluir a conta agora. Tente novamente." };

  await supabase.auth.signOut({ scope: "local" });
  redirect("/login?conta=excluida");
}
