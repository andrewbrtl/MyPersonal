"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { isValidBrazilianPhone, normalizeBrazilianPhone } from "@/lib/contact";
import { createCpfFingerprint } from "@/lib/cpf-fingerprint";
import { CPF_FORMATTED_MAX_LENGTH, isValidCpfInput, normalizeCpf } from "@/lib/cpf";
import { validateCref9Registration } from "@/lib/cref9-validation";
import {
  INPUT_LIMITS,
  isValidPersonName,
  normalizeSingleLineText,
  safeInternalPath,
  withSiteNotice,
} from "@/lib/input-validation";
import { emailSchema, resolveLoginEmail, validateLoginIdentifier } from "@/lib/login-identifier";
import { strongPasswordSchema } from "@/lib/password-validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  errors?: {
    nome?: string[];
    identificador?: string[];
    email?: string[];
    telefone?: string[];
    cpf?: string[];
    password?: string[];
    passwordConfirm?: string[];
    role?: string[];
    cref?: string[];
  };
  message?: string;
  success?: boolean;
};

const loginSchema = z.object({
  identificador: z.string().max(INPUT_LIMITS.loginIdentifier).trim().refine(validateLoginIdentifier, "Digite um email ou telefone com DDD válido."),
  password: z.string().min(1, "Digite sua senha.").max(INPUT_LIMITS.password, "A senha informada é muito longa."),
  next: z.string().max(INPUT_LIMITS.internalPath).optional(),
});

const recoverySchema = z.object({
  identificador: z.string().max(INPUT_LIMITS.loginIdentifier).trim().refine(validateLoginIdentifier, "Digite um email ou telefone com DDD válido."),
});

const signUpSchema = z.object({
  nome: z.string()
    .max(INPUT_LIMITS.signupName, "O nome está muito longo.")
    .transform(normalizeSingleLineText)
    .refine((value) => value.length >= 2 && isValidPersonName(value), "Digite um nome válido, sem símbolos ou marcação HTML."),
  email: emailSchema,
  telefone: z.string()
    .max(INPUT_LIMITS.phoneFormatted, "O telefone está muito longo.")
    .transform(normalizeBrazilianPhone)
    .refine(isValidBrazilianPhone, "Digite um telefone com DDD válido."),
  password: strongPasswordSchema,
  passwordConfirm: z.string().min(1, "Confirme sua senha.").max(INPUT_LIMITS.newPassword, "A confirmação está muito longa."),
  role: z.enum(["aluno", "personal"], { error: "Escolha o tipo de conta." }),
  cpf: z.string().max(CPF_FORMATTED_MAX_LENGTH, "O CPF está muito longo.").trim().optional(),
  cref: z.string().max(INPUT_LIMITS.cref).trim().toUpperCase().optional(),
  next: z.string().max(INPUT_LIMITS.internalPath).optional(),
}).superRefine((data, context) => {
  if (data.password !== data.passwordConfirm) {
    context.addIssue({ code: "custom", path: ["passwordConfirm"], message: "As senhas não coincidem." });
  }

  if (data.role === "personal" && !/^\d{4,8}-[A-Z]\/PR$/.test(data.cref ?? "")) {
    context.addIssue({ code: "custom", path: ["cref"], message: "Informe um CREF do Paraná, como 012345-G/PR." });
  }

  if (data.role === "personal" && !isValidCpfInput(data.cpf ?? "")) {
    context.addIssue({ code: "custom", path: ["cpf"], message: "Informe um CPF válido." });
  }
});

function getSiteUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  try {
    const url = new URL(candidate);
    if (url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
      return url.origin;
    }
  } catch {
    // A configuração inválida é tratada abaixo sem refletir seu conteúdo.
  }
  throw new Error("NEXT_PUBLIC_SITE_URL inválida.");
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    identificador: formData.get("identificador"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const email = await resolveLoginEmail(parsed.data.identificador);
  if (!email) return { message: "Email, telefone ou senha inválidos. Confira os dados e tente novamente." };

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) return { message: "Email, telefone ou senha inválidos. Confira os dados e tente novamente." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  const destination = safeInternalPath(parsed.data.next, profile?.role === "personal" ? "/painel" : "/buscar");
  redirect(withSiteNotice(destination, "entrada-confirmada"));
}

export async function signUpAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    role: formData.get("role"),
    cpf: formData.get("cpf") || undefined,
    cref: formData.get("cref") || undefined,
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const admin = createAdminClient();
  const { data: existingPhone, error: phoneLookupError } = await admin
    .from("profiles")
    .select("id")
    .eq("telefone", parsed.data.telefone)
    .maybeSingle();
  if (phoneLookupError) return { message: "Não foi possível validar os dados agora. Tente novamente." };
  if (existingPhone) return { errors: { telefone: ["Este telefone já está vinculado a outra conta."] } };

  let crefValidationToken: string | undefined;
  if (parsed.data.role === "personal") {
    const cref = parsed.data.cref ?? "";
    let cpfFingerprint: string;
    try {
      cpfFingerprint = createCpfFingerprint(normalizeCpf(parsed.data.cpf ?? ""));
    } catch {
      return { message: "Não foi possível proteger o CPF agora. Nenhuma conta foi criada." };
    }

    const [
      { data: existingCref, error: crefLookupError },
      { data: existingCpf, error: cpfLookupError },
    ] = await Promise.all([
      admin.from("personais").select("id").eq("cref", cref).maybeSingle(),
      admin.from("identidades_personais").select("personal_id").eq("cpf_fingerprint", cpfFingerprint).maybeSingle(),
    ]);
    if (crefLookupError || cpfLookupError) return { message: "Não foi possível validar os dados agora. Tente novamente." };
    if (existingCref) return { errors: { cref: ["Este CREF já está vinculado a outra conta."] } };
    if (existingCpf) return { errors: { cpf: ["Este CPF já está vinculado a uma conta profissional."] } };

    const crefValidation = await validateCref9Registration(cref, parsed.data.nome);
    if (!crefValidation.ok) {
      if (crefValidation.reason === "service_unavailable") {
        return { message: "A consulta do CREF9/PR está indisponível no momento. Nenhuma conta foi criada; tente novamente em alguns minutos." };
      }
      if (crefValidation.reason === "name_mismatch") {
        return { errors: { nome: ["Use seu nome completo exatamente como consta no cadastro do CREF9/PR."] } };
      }
      if (crefValidation.reason === "inactive") {
        return { errors: { cref: ["Este registro consta como inativo no CREF9/PR."] } };
      }
      if (crefValidation.reason === "category_mismatch") {
        return { errors: { cref: ["A letra G/P informada não corresponde à categoria deste registro no CREF9/PR."] } };
      }
      return { errors: { cref: ["Este registro não foi localizado na consulta pública do CREF9/PR."] } };
    }

    crefValidationToken = crypto.randomUUID();
    const now = Date.now();
    await admin.from("validacoes_cref9").delete().lte("expira_em", new Date(now).toISOString());
    const { error: ticketError } = await admin.from("validacoes_cref9").insert({
      token: crefValidationToken,
      email: parsed.data.email.toLowerCase(),
      nome_informado: parsed.data.nome,
      cref,
      nome_oficial: crefValidation.record.name,
      categoria: crefValidation.record.category,
      situacao: "ATIVO",
      cpf_fingerprint: cpfFingerprint,
      expira_em: new Date(now + 10 * 60 * 1000).toISOString(),
    });
    if (ticketError) return { message: "Não foi possível concluir a validação profissional agora. Nenhuma conta foi criada." };
  }

  const supabase = await createClient();
  const fallback = parsed.data.role === "personal" ? "/cadastro" : "/buscar";
  const next = safeInternalPath(parsed.data.next, fallback);
  const accountDestination = withSiteNotice(
    next,
    parsed.data.role === "personal" ? "conta-criada-personal" : "conta-criada-aluno",
  );
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
        cref_validation_token: crefValidationToken,
      },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(accountDestination)}`,
    },
  });

  if (crefValidationToken) {
    await admin.from("validacoes_cref9").delete().eq("token", crefValidationToken);
  }

  if (error) {
    if (error.message.toLowerCase().includes("rate limit")) {
      return { message: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente." };
    }
    if (error.message.toLowerCase().includes("already registered")) {
      return { message: "Já existe uma conta com este email. Tente entrar." };
    }
    if (error.message.toLowerCase().includes("password")) {
      return { message: "A senha não atende aos requisitos de segurança." };
    }
    return { message: "Não foi possível criar a conta. Confira os dados e tente novamente." };
  }
  if (!data.session) return { success: true, message: "Conta criada. Abra o email de confirmação para continuar." };

  redirect(accountDestination);
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
    message: "Se encontramos essa conta, enviamos um link de recuperação para o email cadastrado.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(withSiteNotice("/", "sessao-encerrada"));
}

export async function signOutAndCreateAccountAction(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const role = formData.get("tipo") === "personal" ? "personal" : "aluno";
  const next = typeof formData.get("next") === "string" ? String(formData.get("next")) : "";
  const validatedNext = safeInternalPath(next);
  const safeDestination = validatedNext ? `&next=${encodeURIComponent(validatedNext)}` : "";
  redirect(`/login?modo=criar&tipo=${role}${safeDestination}`);
}
