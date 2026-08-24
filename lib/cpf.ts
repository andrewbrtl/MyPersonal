export const CPF_FORMATTED_MAX_LENGTH = 14;

const CPF_INPUT_FORMAT = /^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidCpfInput(value: string) {
  const trimmed = value.trim();
  return CPF_INPUT_FORMAT.test(trimmed) && isValidCpf(trimmed);
}

export function isValidCpf(value: string) {
  const cpf = normalizeCpf(value);
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;

  const firstVerifier = calculateVerifier(cpf.slice(0, 9));
  const secondVerifier = calculateVerifier(cpf.slice(0, 10));
  return Number(cpf[9]) === firstVerifier && Number(cpf[10]) === secondVerifier;
}

export function formatCpfInput(value: string) {
  const digits = normalizeCpf(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function calculateVerifier(digits: string) {
  const total = [...digits].reduce((sum, digit, index) => sum + Number(digit) * (digits.length + 1 - index), 0);
  const verifier = (total * 10) % 11;
  return verifier === 10 ? 0 : verifier;
}
