"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { PASSWORD_RECOVERY_COOKIE } from "@/lib/password-recovery";
import { strongPasswordSchema } from "@/lib/password-validation";
import { createClient } from "@/lib/supabase/server";

export type ResetPasswordState = {
  message?: string;
  errors?: {
    password?: string[];
    passwordConfirm?: string[];
  };
};

const resetPasswordSchema = z.object({
  password: strongPasswordSchema,
  passwordConfirm: z.string().min(1, "Confirme sua nova senha."),
}).superRefine((data, context) => {
  if (data.password !== data.passwordConfirm) {
    context.addIssue({ code: "custom", path: ["passwordConfirm"], message: "As senhas não coincidem." });
  }
});

export async function resetPasswordAction(
  _state: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const cookieStore = await cookies();
  if (cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value !== "1") {
    return { message: "Este link não é mais válido. Solicite uma nova recuperação de senha." };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Sua sessão de recuperação expirou. Solicite um novo link." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.message.toLowerCase().includes("same password")) {
      return { errors: { password: ["Escolha uma senha diferente da senha atual."] } };
    }
    return { message: "Não foi possível atualizar sua senha. Solicite um novo link e tente novamente." };
  }

  cookieStore.delete(PASSWORD_RECOVERY_COOKIE);
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login?senha=alterada");
}
