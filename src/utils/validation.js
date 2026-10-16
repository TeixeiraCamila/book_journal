/**
 * Validação de formulários — funções puras para validação de campos
 */

// Valida se o título é obrigatório
export function validateRequired(value, fieldName) {
  if (!value || !value.trim()) {
    return `${fieldName} é obrigatório`;
  }
  return null;
}

// Valida se é um número positivo
export function validatePositiveNumber(value, fieldName) {
  if (value && (isNaN(value) || value < 0)) {
    return `${fieldName} deve ser um número positivo`;
  }
  return null;
}

// Valida ano (4 dígitos)
export function validateYear(value, fieldName) {
  if (value && !/^\d{4}$/.test(value)) {
    return `${fieldName} deve ter 4 dígitos`;
  }
  return null;
}

// Valida inteiro positivo (ex.: volume da série — o schema da API exige inteiro)
export function validatePositiveInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    return `${fieldName} deve ser um número inteiro positivo`;
  }
  return null;
}

// Valida que a data de término seja igual ou posterior à data de início
export function validateDateRange(startDate, endDate, fieldName = 'Data de término') {
  if (new Date(startDate) > new Date(endDate)) {
    return `${fieldName} deve ser posterior à data de início`;
  }
  return null;
}

// Valida múltiplos valores separados por vírgula
export function parseCommaSeparated(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
