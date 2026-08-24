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
const validationTickets = [];
const result = [];
let professionalCpfFingerprint = "";

try {
  for (const role of ["aluno", "personal"]) {
    const stamp = `${Date.now()}${role === "personal" ? "1" : "0"}`;
    const email = `codex.qa.${stamp}@gmail.com`;
    const cref = `${stamp.slice(-6)}-G/PR`;
    const phone = `429${stamp.slice(-8)}`;
    const password = "TesteSeguro!2026";
    const name = `Teste ${role}`;
    const validation = role === "personal" ? await createValidationTicket(email, name, cref) : undefined;
    if (validation) professionalCpfFingerprint = validation.cpfFingerprint;
    const client = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: name,
          role,
          telefone: phone,
          ...(role === "personal" ? { cref, cref_validation_token: validation?.token } : {}),
        },
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
      const { data: identity, error: identityError } = await admin.from("identidades_personais").select("cpf_fingerprint").eq("personal_id", data.user.id).single();
      if (identityError || identity?.cpf_fingerprint !== professionalCpfFingerprint) throw new Error("personal: proteção privada do CPF não foi criada corretamente.");
    }

    result.push({ role, userCreated: true, sessionCreated: Boolean(data.session), triggerValidated: true, phoneLoginValidated: true, duplicatePhoneBlocked: true, recoveryLinkValidated: true });
  }

  const duplicateCpfStamp = `${Date.now()}8`;
  const duplicateCpfEmail = `codex.qa.cpf.${duplicateCpfStamp}@gmail.com`;
  const duplicateCpfName = "Tentativa CPF Repetido";
  const duplicateCpfCref = `${duplicateCpfStamp.slice(-6)}-G/PR`;
  const duplicateCpfValidation = await createValidationTicket(
    duplicateCpfEmail,
    duplicateCpfName,
    duplicateCpfCref,
    professionalCpfFingerprint,
  );
  const duplicateCpfClient = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: duplicateCpfData, error: duplicateCpfError } = await duplicateCpfClient.auth.signUp({
    email: duplicateCpfEmail,
    password: "TesteSeguro!2026",
    options: {
      data: {
        nome: duplicateCpfName,
        role: "personal",
        telefone: `426${duplicateCpfStamp.slice(-8)}`,
        cref: duplicateCpfCref,
        cref_validation_token: duplicateCpfValidation.token,
      },
    },
  });
  if (duplicateCpfData.user?.id) {
    createdUserIds.push(duplicateCpfData.user.id);
    throw new Error("personal: um segundo cadastro com o mesmo CPF foi aceito.");
  }
  if (!duplicateCpfError) throw new Error("personal: CPF repetido não foi recusado pelo banco.");
  result.push({ role: "personal_cpf_repetido", blocked: true });

  const bypassStamp = `${Date.now()}9`;
  const bypassClient = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: bypassData, error: bypassError } = await bypassClient.auth.signUp({
    email: `codex.qa.bypass.${bypassStamp}@gmail.com`,
    password: "TesteSeguro!2026",
    options: {
      data: {
        nome: "Tentativa Sem Validação",
        role: "personal",
        telefone: `427${bypassStamp.slice(-8)}`,
        cref: `${bypassStamp.slice(-6)}-G/PR`,
      },
    },
  });
  if (bypassData.user?.id) {
    createdUserIds.push(bypassData.user.id);
    throw new Error("personal: cadastro direto sem passe CREF9 foi aceito.");
  }
  if (!bypassError) throw new Error("personal: tentativa sem passe CREF9 não foi recusada.");
  result.push({ role: "personal_sem_validacao", blocked: true });
} finally {
  await Promise.all(createdUserIds.map((id) => admin.auth.admin.deleteUser(id)));
  if (validationTickets.length) await admin.from("validacoes_cref9").delete().in("token", validationTickets);
}

console.log(JSON.stringify({ conectado: true, fluxos: result, dadosTemporariosRemovidos: createdUserIds.length }));

async function createValidationTicket(email, name, cref, cpfFingerprint = createTestFingerprint()) {
  const token = crypto.randomUUID();
  validationTickets.push(token);
  const { error } = await admin.from("validacoes_cref9").insert({
    token,
    email,
    nome_informado: name,
    cref,
    nome_oficial: name.toUpperCase(),
    categoria: "LICENCIADO/BACHAREL",
    situacao: "ATIVO",
    cpf_fingerprint: cpfFingerprint,
    expira_em: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
  if (error) throw error;
  return { token, cpfFingerprint };
}

function createTestFingerprint() {
  return `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
}
