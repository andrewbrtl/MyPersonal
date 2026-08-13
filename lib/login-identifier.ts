import "server-only";

import { z } from "zod";

import { isValidBrazilianPhone, normalizeBrazilianPhone } from "@/lib/contact";
import { createAdminClient } from "@/lib/supabase/admin";

const emailSchema = z.string().trim().toLowerCase().email();

export function validateLoginIdentifier(value: string) {
  const identifier = value.trim();
  if (emailSchema.safeParse(identifier).success || isValidBrazilianPhone(identifier)) return true;
  return false;
}

export async function resolveLoginEmail(identifier: string) {
  const email = emailSchema.safeParse(identifier);
  if (email.success) return email.data;

  const telefone = normalizeBrazilianPhone(identifier);
  if (!isValidBrazilianPhone(telefone)) return null;

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id")
    .eq("telefone", telefone)
    .maybeSingle();

  if (profileError || !profile) return null;

  const { data, error } = await admin.auth.admin.getUserById(profile.id);
  if (error || !data.user?.email) return null;
  return data.user.email;
}
