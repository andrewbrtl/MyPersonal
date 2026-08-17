import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !publishableKey || !secretKey) throw new Error("Credenciais do Supabase não configuradas.");

const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const anonymous = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
const createdUserIds = [];
const password = "TesteSeguro!2026";
const stamp = `${Date.now()}`;
const cref = `${stamp.slice(-6)}-G/PR`;
const professionalPhone = `429${stamp.slice(-8)}`;
const studentPhone = `428${stamp.slice(-8)}`;

try {
  const professional = await createTestUser("personal", professionalPhone, cref);
  const student = await createTestUser("aluno", studentPhone);
  const professionalClient = await authenticatedClient(professional.email);
  const studentClient = await authenticatedClient(student.email);

  const { data: modality, error: modalityError } = await admin.from("modalidades").select("id").eq("ativo", true).limit(1).single();
  if (modalityError) throw modalityError;

  const privateFavorite = await studentClient.from("favoritos").insert({ aluno_id: student.id, personal_id: professional.id });
  if (!privateFavorite.error) throw new Error("RLS aceitou favorito para perfil privado.");

  const privateReview = await studentClient.from("avaliacoes").insert({ aluno_id: student.id, personal_id: professional.id, nota: 5 });
  if (!privateReview.error) throw new Error("RLS aceitou avaliação para perfil privado.");

  const anonymousContact = await anonymous.from("contatos").insert({ personal_id: professional.id, canal: "whatsapp", origem: "perfil_publico" });
  if (!anonymousContact.error) throw new Error("RLS aceitou contato anônimo direto pela API.");

  await expectDatabaseRejection(
    admin.from("personais").update({ preco_mensal_base: -1 }).eq("id", professional.id),
    "preço negativo",
  );
  await expectDatabaseRejection(
    admin.from("personais").update({ bio: "<script>alert('x')</script> com conteúdo longo para passar do mínimo" }).eq("id", professional.id),
    "HTML na apresentação",
  );
  await expectDatabaseRejection(
    admin.from("profiles").update({ avatar_url: "https://evil.example/avatar.jpg" }).eq("id", professional.id),
    "avatar externo",
  );
  await expectDatabaseRejection(
    admin.from("profiles").update({ nome: "<img src=x>" }).eq("id", professional.id),
    "marcação HTML no nome",
  );

  const injectionText = "Atendimento individual seguro; teste literal ' OR 1=1 -- sem executar comandos no banco.";
  const validArgs = {
    perfil_id: professional.id,
    novo_nome: "Profissional Segurança",
    novo_telefone: professionalPhone,
    novo_cref: cref,
    novo_bairro: "Centro",
    nova_bio: injectionText,
    nova_formacao: "Educação Física e treinamento funcional",
    novos_anos_experiencia: 0,
    novo_preco: 0,
    novo_atendimento: "ambos",
    novos_horarios: ["Segunda · 08h às 10h"],
    novas_modalidades: [modality.id],
    novo_whatsapp: professionalPhone,
    novo_instagram_url: null,
    novo_facebook_url: null,
    novo_tiktok_url: null,
    novo_youtube_url: null,
    novo_website_url: null,
    alterar_avatar: false,
    nova_avatar_url: null,
  };

  const forbiddenRpc = await professionalClient.rpc("salvar_perfil_profissional", validArgs);
  if (!forbiddenRpc.error) throw new Error("Função privilegiada pôde ser chamada pelo cliente autenticado.");

  const { error: saveError } = await admin.rpc("salvar_perfil_profissional", validArgs);
  if (saveError) throw saveError;

  const { data: saved, error: savedError } = await admin
    .from("personais")
    .select("bio,preco_mensal_base,anos_experiencia,perfil_publico")
    .eq("id", professional.id)
    .single();
  if (savedError || saved.bio !== injectionText || Number(saved.preco_mensal_base) !== 0 || saved.anos_experiencia !== 0 || !saved.perfil_publico) {
    throw new Error("A operação atômica não preservou valores válidos como dados literais.");
  }

  await expectDatabaseRejection(
    professionalClient.from("personais").update({ preco_mensal_base: -0.01 }).eq("id", professional.id),
    "preço negativo via API autenticada",
  );
  await expectDatabaseRejection(
    professionalClient.from("personais").update({ website_url: "javascript:alert(1)" }).eq("id", professional.id),
    "URL perigosa via API autenticada",
  );
  await expectDatabaseRejection(
    admin.rpc("salvar_perfil_profissional", { ...validArgs, novas_modalidades: [modality.id, modality.id] }),
    "modalidade duplicada",
  );

  const unsafeReview = await studentClient.from("avaliacoes").insert({
    aluno_id: student.id,
    personal_id: professional.id,
    nota: 5,
    comentario: "<img src=x onerror=alert(1)>",
  });
  if (!unsafeReview.error) throw new Error("Comentário com HTML foi aceito.");

  console.log(JSON.stringify({
    constraints: "ok",
    rls: "ok",
    rpcPrivilegiada: "isolada e atômica",
    injecaoSql: "tratada como texto literal",
    numerosNegativos: "bloqueados no servidor e banco",
    dadosTemporarios: "serão removidos",
  }));
} finally {
  await Promise.all(createdUserIds.map((id) => admin.auth.admin.deleteUser(id)));
}

async function createTestUser(role, phone, personalCref) {
  const email = `codex.security.${role}.${stamp}@gmail.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nome: `Teste ${role}`,
      role,
      telefone: phone,
      ...(personalCref ? { cref: personalCref } : {}),
    },
  });
  if (error || !data.user) throw error ?? new Error(`Não foi possível criar ${role}.`);
  createdUserIds.push(data.user.id);
  return { id: data.user.id, email };
}

async function authenticatedClient(email) {
  const client = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

async function expectDatabaseRejection(query, label) {
  const { error } = await query;
  if (!error) throw new Error(`O banco aceitou ${label}.`);
}
