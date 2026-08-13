"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { isValidBrazilianPhone, normalizeBrazilianPhone } from "@/lib/contact";
import { resolveLoginEmail, validateLoginIdentifier } from "@/lib/login-identifier";
import { strongPasswordSchema } from "@/lib/password-validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  errors?: {
    nome?: string[];
    identificador?: string[];
    email?: string[];
    telefone?: string[];
    password?: string[];
    passwordConfirm?: string[];
    role?: string[];
    cref?: string[];
  };
  message?: string;
  success?: boolean;
};

const loginSchema = z.object({
  identificador: z.string().trim().refine(validateLoginIdentifier, "Digite um e-mail ou telefone com DDD válido."),
  password: z.string().min(1, "Digite sua senha."),
  next: z.string().optional(),
});

const recoverySchema = z.object({
  identificador: z.string().trim().refine(validateLoginIdentifier, "Digite um e-mail ou telefone com DDD válido."),
});

const signUpSchema = z.object({
  nome: z.string().trim().min(2, "Digite seu nome completo.").max(80, "O nome está muito longo."),
  email: z.string().trim().email("Digite um e-mail válido."),
  telefone: z.string().transform(normalizeBrazilianPhone).refine(isValidBrazilianPhone, "Digite um telefone com DDD válido."),
  password: strongPasswordSchema,
  passwordConfirm: z.string().min(1, "Confirme sua senha."),
  role: z.enum(["aluno", "personal"], { error: "Escolha o tipo de conta." }),
  cref: z.string().trim().toUpperCase().optional(),
  next: z.string().optional(),
}).superRefine((data, context) => {
  if (data.password !== data.passwordConfirm) {
    context.addIssue({ code: "custom", path: ["passwordConfirm"], message: "As senhas não coincidem." });
  }

  if (data.role === "personal" && !/^\d{4,8}-[A-Z]\/([A-Z]{2})$/.test(data.cref ?? "")) {
    context.addIssue({ code: "custom", path: ["cref"], message: "Informe um CREF válido, como 012345-G/PR." });
  }
});

function safeNext(value: string | undefined, fallback: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    identificador: formData.get("identificador"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const email = await resolveLoginEmail(parsed.data.identificador);
  if (!email) return { message: "E-mail, telefone ou senha inválidos. Confira os dados e tente novamente." };

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) return { message: "E-mail, telefone ou senha inválidos. Confira os dados e tente novamente." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  redirect(safeNext(parsed.data.next, profile?.role === "personal" ? "/painel" : "/buscar"));
}

export async function signUpAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    role: formData.get("role"),
    cref: formData.get("cref") || undefined,
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const admin = createAdminClient();
  const { data: existingPhone } = await admin
    .from("profiles")
    .select("id")
    .eq("telefone", parsed.data.telefone)
    .maybeSingle();
  if (existingPhone) return { errors: { telefone: ["Este telefone já está vinculado a outra conta."] } };

  if (parsed.data.role === "personal") {
    const { data: existingCref } = await admin
      .from("personais")
      .select("id")
      .eq("cref", parsed.data.cref ?? "")
      .maybeSingle();
    if (existingCref) return { errors: { cref: ["Este CREF já está vinculado a outra conta."] } };
  }

  const supabase = await createClient();
  const fallback = parsed.data.role === "personal" ? "/cadastro" : "/buscar";
  const next = safeNext(parsed.data.next, fallback);
  const siteUrl = getSiteUrl();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        nome: parsed.data.nome,
        role: parsed.data.role,
        telefone: parsed.data.telefone,
        cref: parsed.data.role === "personal" ? parsed.data.cref : undefined,
      },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("rate limit")) {
      return { message: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente." };
    }
    if (error.message.toLowerCase().includes("already registered")) {
      return { message: "Já existe uma conta com este e-mail. Tente entrar." };
    }
    if (error.message.toLowerCase().includes("password")) {
      return { message: "A senha não atende aos requisitos de segurança." };
    }
    return { message: "Não foi possível criar a conta. Confira os dados e tente novamente." };
  }
  if (!data.session) return { success: true, message: "Conta criada. Abra o e-mail de confirmação para continuar." };

  redirect(next);
}

export async function requestPasswordResetAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = recoverySchema.safeParse({ identificador: formData.get("identificador") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const email = await resolveLoginEmail(parsed.data.identificador);
  if (email) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/redefinir-senha")}`,
    });
  }

  return {
    success: true,
    message: "Se encontramos essa conta, enviamos um link de recuperação para o e-mail cadastrado.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signOutAndCreateAccountAction(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const role = formData.get("tipo") === "personal" ? "personal" : "aluno";
  const next = typeof formData.get("next") === "string" ? String(formData.get("next")) : "";
  const safeDestination = next.startsWith("/") && !next.startsWith("//") ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/login?modo=criar&tipo=${role}${safeDestination}`);
}
