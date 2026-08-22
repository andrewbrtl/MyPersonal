import { z } from "zod";

import { NEW_PASSWORD_LIMITS } from "@/lib/input-validation";

export const strongPasswordSchema = z.string()
  .min(NEW_PASSWORD_LIMITS.min, `Use pelo menos ${NEW_PASSWORD_LIMITS.min} caracteres.`)
  .max(NEW_PASSWORD_LIMITS.max, `Use no máximo ${NEW_PASSWORD_LIMITS.max} caracteres.`)
  .regex(/[a-z]/, "Inclua pelo menos uma letra minúscula.")
  .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula.")
  .regex(/[0-9]/, "Inclua pelo menos um número.")
  .regex(/[^A-Za-z0-9]/, "Inclua pelo menos um caractere especial.");
