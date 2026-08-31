import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/input-validation";
import type { Database } from "@/types/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];

export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, nome, role, avatar_url, telefone")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    nome: profile.nome,
    role: profile.role,
    avatarUrl: profile.avatar_url,
    telefone: profile.telefone ?? "",
  };
});

export async function requireUser(returnTo: string) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(safeInternalPath(returnTo, "/"))}`);
  return profile;
}

export async function requireRole(role: UserRole, returnTo: string) {
  const profile = await requireUser(returnTo);
  if (profile.role !== role) redirect(role === "personal" ? "/buscar" : "/favoritos");
  return profile;
}
