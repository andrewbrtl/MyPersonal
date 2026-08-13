import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !publishableKey || !secretKey) throw new Error("Credenciais do Supabase não configuradas.");

const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const createdUserIds = [];
const result = [];

try {
  for (const role of ["aluno", "personal"]) {
    const stamp = `${Date.now()}${role === "personal" ? "1" : "0"}`;
    const email = `codex.qa.${stamp}@gmail.com`;
    const cref = `${stamp.slice(-6)}-G/PR`;
    const phone = `429${stamp.slice(-8)}`;
    const password = "TesteSeguro!2026";
    const client = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { nome: `Teste ${role}`, role, telefone: phone, ...(role === "personal" ? { cref } : {}) },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
      },
    });
    if (error || !data.user) throw new Error(`${role}: ${error?.code ?? "sem_usuario"} - ${error?.message ?? "usuário não retornado"}`);
    createdUserIds.push(data.user.id);

    const { data: profile, error: profileError } = await admin.from("profiles").select("id,role,nome,telefone").eq("id", data.user.id).single();
    if (profileError || profile?.role !== role || profile.telefone !== phone) throw new Error(`${role}: perfil não foi criado corretamente.`);

    const { data: phoneProfile, error: phoneProfileError } = await admin.from("profiles").select("id").eq("telefone", phone).single();
    if (phoneProfileError || phoneProfile.id !== data.user.id) throw new Error(`${role}: telefone não localizou a conta correta.`);
    const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(phoneProfile.id);
    if (authUserError || authUser.user?.email !== email) throw new Error(`${role}: telefone não resolveu o e-mail correto.`);

    const { data: recoveryLink, error: recoveryError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=%2Fredefinir-senha` },
    });
    if (recoveryError || !recoveryLink.properties?.action_link) throw new Error(`${role}: link de recuperação não foi gerado.`);

    const duplicateClient = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: duplicateData, error: duplicateError } = await duplicateClient.auth.signUp({
      email: `duplicado.${stamp}@gmail.com`,
      password,
      options: { data: { nome: "Telefone duplicado", role: "aluno", telefone: phone } },
    });
    if (duplicateData.user?.id) createdUserIds.push(duplicateData.user.id);
    if (!duplicateError) throw new Error(`${role}: telefone duplicado foi aceito indevidamente.`);

    await client.auth.signOut();
    const { error: loginError } = await client.auth.signInWithPassword({ email: authUser.user.email, password });
    if (loginError) throw new Error(`${role}: login resolvido pelo telefone falhou.`);

    if (role === "personal") {
      const { data: professional, error: professionalError } = await admin.from("personais").select("cref").eq("id", data.user.id).single();
      if (professionalError || professional?.cref !== cref) throw new Error("personal: registro profissional não foi criado corretamente.");
    }

    result.push({ role, userCreated: true, sessionCreated: Boolean(data.session), triggerValidated: true, phoneLoginValidated: true, duplicatePhoneBlocked: true, recoveryLinkValidated: true });
  }
} finally {
  await Promise.all(createdUserIds.map((id) => admin.auth.admin.deleteUser(id)));
}

console.log(JSON.stringify({ conectado: true, fluxos: result, dadosTemporariosRemovidos: createdUserIds.length }));
