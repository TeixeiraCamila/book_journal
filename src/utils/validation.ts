// Validação de formulários — funções puras para validação de campos

// Valida se o título é obrigatório
export function validateRequired(
  value: string | null | undefined,
  fieldName: string,
): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} é obrigatório`;
  }
  return null;
}

// Valida se é um número positivo
export function validatePositiveNumber(
  value: string | number | null | undefined,
  fieldName: string,
): string | null {
  if (!value) return null;
  // Number() isola a coerção: `value < 0` não compila com string|number e o
  // Number.isNaN(Number(x)) equivale ao isNaN(x) global em runtime
  const number = Number(value);
  if (Number.isNaN(number) || number < 0) {
    return `${fieldName} deve ser um número positivo`;
  }
  return null;
}

// Valida percentual de progresso (0–100)
export function validatePercentage(
  value: string | number | null | undefined,
  fieldName: string,
): string | null {
  if (!value) return null;
  const number = Number(value);
  if (Number.isNaN(number) || number < 0 || number > 100) {
    return `${fieldName} deve estar entre 0 e 100`;
  }
  return null;
}

// Valida ano (4 dígitos)
export function validateYear(
  value: string | number | null | undefined,
  fieldName: string,
): string | null {
  // String() espelha a coerção que o test() já fazia em runtime
  if (value && !/^\d{4}$/.test(String(value))) {
    return `${fieldName} deve ter 4 dígitos`;
  }
  return null;
}

// Valida inteiro positivo (ex.: volume da série — o schema da API exige inteiro)
export function validatePositiveInteger(
  value: string | number | null | undefined,
  fieldName: string,
): string | null {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    return `${fieldName} deve ser um número inteiro positivo`;
  }
  return null;
}

// Valida que a data de término seja igual ou posterior à data de início
export function validateDateRange(
  startDate: string,
  endDate: string,
  fieldName = 'Data de término',
): string | null {
  if (new Date(startDate) > new Date(endDate)) {
    return `${fieldName} deve ser posterior à data de início`;
  }
  return null;
}

// Valida múltiplos valores separados por vírgula
export function parseCommaSeparated(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
