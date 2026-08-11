import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error("Credenciais públicas do Supabase não configuradas.");
}

const supabase = createClient(url, publishableKey, {
  auth: { persistSession: false },
});

const [modalidadesResult, planosResult, buscaResult] = await Promise.all([
  supabase.from("modalidades").select("id", { count: "exact", head: true }),
  supabase.from("planos").select("id", { count: "exact", head: true }),
  supabase.rpc("buscar_personais", {
    lat: -25.3907,
    lng: -51.4628,
    raio_km: 15,
  }),
]);

for (const result of [modalidadesResult, planosResult, buscaResult]) {
  if (result.error) throw result.error;
}

console.log(
  JSON.stringify({
    conectado: true,
    modalidades: modalidadesResult.count,
    planos: planosResult.count,
    personais_publicos: buscaResult.data.length,
  }),
);
