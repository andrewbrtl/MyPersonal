"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  errors?: { nome?: string[]; email?: string[]; password?: string[]; role?: string[] };
  message?: string;
  success?: boolean;
};

const loginSchema = z.object({
  email: z.string().trim().email("Digite um e-mail válido."),
  password: z.string().min(1, "Digite sua senha."),
  next: z.string().optional(),
});

const signUpSchema = z.object({
  nome: z.string().trim().min(2, "Digite seu nome completo.").max(80, "O nome está muito longo."),
  email: z.string().trim().email("Digite um e-mail válido."),
  password: z.string().min(8, "Use pelo menos 8 caracteres.").regex(/[A-Za-zÀ-ÿ]/, "Inclua pelo menos uma letra.").regex(/[0-9]/, "Inclua pelo menos um número."),
  role: z.enum(["aluno", "personal"], { error: "Escolha o tipo de conta." }),
  next: z.string().optional(),
});

function safeNext(value: string | undefined, fallback: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { message: "E-mail ou senha inválidos. Confira os dados e tente novamente." };

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
    password: formData.get("password"),
    role: formData.get("role"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const fallback = parsed.data.role === "personal" ? "/cadastro" : "/buscar";
  const next = safeNext(parsed.data.next, fallback);
  const requestHeaders = await headers();
  const siteUrl = requestHeaders.get("origin")
    ?? process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { nome: parsed.data.nome, role: parsed.data.role },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return { message: "Não foi possível criar a conta. Verifique os dados ou tente novamente em instantes." };
  if (!data.session) return { success: true, message: "Conta criada. Abra o e-mail de confirmação para continuar." };

  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
