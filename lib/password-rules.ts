import { NEW_PASSWORD_LIMITS } from "@/lib/input-validation";

export const passwordRules = [
  { label: `${NEW_PASSWORD_LIMITS.min}–${NEW_PASSWORD_LIMITS.max} caracteres`, test: (value: string) => value.length >= NEW_PASSWORD_LIMITS.min && value.length <= NEW_PASSWORD_LIMITS.max },
  { label: "Letra maiúscula", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Letra minúscula", test: (value: string) => /[a-z]/.test(value) },
  { label: "Número", test: (value: string) => /[0-9]/.test(value) },
  { label: "Caractere especial", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;
