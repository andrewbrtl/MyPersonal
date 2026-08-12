import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];

export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nome, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    nome: profile?.nome ?? user.user_metadata.nome ?? user.email?.split("@")[0] ?? "Usuário",
    role: profile?.role ?? (user.user_metadata.role === "personal" ? "personal" : "aluno"),
    avatarUrl: profile?.avatar_url ?? null,
  };
});

export async function requireUser(returnTo: string) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return profile;
}

export async function requireRole(role: UserRole, returnTo: string) {
  const profile = await requireUser(returnTo);
  if (profile.role !== role) redirect(role === "personal" ? "/buscar" : "/favoritos");
  return profile;
}
