/**
 * Validação de formulários — funções puras para validação de campos
 */

// Valida se o título é obrigatório
export function validate_required(value, field_name) {
  if (!value || !value.trim()) {
    return `${field_name} é obrigatório`;
  }
  return null;
}

// Valida se é um número positivo
export function validate_positive_number(value, field_name) {
  if (value && (isNaN(value) || value < 0)) {
    return `${field_name} deve ser um número positivo`;
  }
  return null;
}

// Valida ano (4 dígitos)
export function validate_year(value, field_name) {
  if (value && !/^\d{4}$/.test(value)) {
    return `${field_name} deve ter 4 dígitos`;
  }
  return null;
}

// Valida múltiplos valores separados por vírgula
export function parse_comma_separated(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
