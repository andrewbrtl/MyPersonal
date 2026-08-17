import { z } from "zod";

import { INPUT_LIMITS } from "@/lib/input-validation";

export const strongPasswordSchema = z.string()
  .min(10, "Use pelo menos 10 caracteres.")
  .max(INPUT_LIMITS.password, `Use no máximo ${INPUT_LIMITS.password} caracteres.`)
  .regex(/[a-z]/, "Inclua pelo menos uma letra minúscula.")
  .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula.")
  .regex(/[0-9]/, "Inclua pelo menos um número.")
  .regex(/[^A-Za-z0-9]/, "Inclua pelo menos um caractere especial.");
