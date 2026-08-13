export const passwordRules = [
  { label: "10+ caracteres", test: (value: string) => value.length >= 10 },
  { label: "Letra maiúscula", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Letra minúscula", test: (value: string) => /[a-z]/.test(value) },
  { label: "Número", test: (value: string) => /[0-9]/.test(value) },
  { label: "Caractere especial", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;
