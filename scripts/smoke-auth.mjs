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
    const client = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.signUp({
      email,
      password: "TesteSeguro!2026",
      options: {
        data: { nome: `Teste ${role}`, role, ...(role === "personal" ? { cref } : {}) },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
      },
    });
    if (error || !data.user) throw new Error(`${role}: ${error?.code ?? "sem_usuario"} - ${error?.message ?? "usuário não retornado"}`);
    createdUserIds.push(data.user.id);

    const { data: profile, error: profileError } = await admin.from("profiles").select("id,role,nome").eq("id", data.user.id).single();
    if (profileError || profile?.role !== role) throw new Error(`${role}: perfil não foi criado corretamente.`);

    if (role === "personal") {
      const { data: professional, error: professionalError } = await admin.from("personais").select("cref").eq("id", data.user.id).single();
      if (professionalError || professional?.cref !== cref) throw new Error("personal: registro profissional não foi criado corretamente.");
    }

    result.push({ role, userCreated: true, sessionCreated: Boolean(data.session), triggerValidated: true });
  }
} finally {
  await Promise.all(createdUserIds.map((id) => admin.auth.admin.deleteUser(id)));
}

console.log(JSON.stringify({ conectado: true, fluxos: result, dadosTemporariosRemovidos: createdUserIds.length }));
