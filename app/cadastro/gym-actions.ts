"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { isGoogleMapsUrl, normalizeGoogleMapsUrl } from "@/lib/gym-location";
import { INPUT_LIMITS, isValidBusinessName, isValidNeighborhood, isValidStreetAddress, normalizeSingleLineText } from "@/lib/input-validation";
import { createAdminClient } from "@/lib/supabase/admin";

export type GymState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const gymSchema = z.object({
  nome: z.string()
    .max(INPUT_LIMITS.gymName, "O nome está muito longo.")
    .transform(normalizeSingleLineText)
    .refine((value) => value.length >= 2 && isValidBusinessName(value), "Informe um nome válido."),
  endereco: z.string()
    .max(INPUT_LIMITS.address, "O endereço está muito longo.")
    .transform(normalizeSingleLineText)
    .refine((value) => value.length >= 5 && isValidStreetAddress(value), "Informe um endereço válido."),
  bairro: z.string()
    .max(INPUT_LIMITS.neighborhood, "O bairro está muito longo.")
    .transform(normalizeSingleLineText)
    .refine((value) => value.length >= 2 && isValidNeighborhood(value), "Informe um bairro válido."),
  mapsUrl: z.string()
    .max(INPUT_LIMITS.mapsUrl, "O link está muito longo.")
    .transform(normalizeGoogleMapsUrl)
    .refine(isGoogleMapsUrl, "Use um link válido do Google Maps."),
});

export async function addGymLocation(_state: GymState, formData: FormData): Promise<GymState> {
  const profile = await requireRole("personal", "/cadastro#academias");
  const parsed = gymSchema.safeParse({
    nome: formData.get("nomeAcademia"),
    endereco: formData.get("enderecoAcademia"),
    bairro: formData.get("bairroAcademia"),
    mapsUrl: formData.get("mapsUrl"),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const admin = createAdminClient();
  const { error } = await admin.from("academias_personais").insert({
    personal_id: profile.id,
    nome: parsed.data.nome,
    endereco: parsed.data.endereco,
    bairro: parsed.data.bairro,
    maps_url: parsed.data.mapsUrl || null,
  });

  if (error?.code === "23505") {
    return { errors: { nome: ["Esta academia já está cadastrada no seu perfil."] } };
  }
  if (error) return { message: "Não foi possível adicionar esta academia." };

  revalidateProfilePaths(profile.id);
  return { success: true, message: "Academia adicionada ao perfil." };
}

export async function removeGymLocation(formData: FormData): Promise<void> {
  const profile = await requireRole("personal", "/cadastro#academias");
  const id = z.string().uuid().safeParse(formData.get("academiaId"));
  if (!id.success) return;

  const admin = createAdminClient();
  await admin.from("academias_personais").delete().eq("id", id.data).eq("personal_id", profile.id);
  revalidateProfilePaths(profile.id);
}

function revalidateProfilePaths(profileId: string) {
  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/cadastro");
  revalidatePath(`/profissionais/${profileId}`);
}
