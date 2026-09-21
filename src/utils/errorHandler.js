export function extract_error_message(error) {
  if (!error) return 'Erro desconhecido';
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    const status_messages = {
      400: 'Dados inválidos. Verifique as informações enviadas.',
      401: 'Não autorizado. Verifique suas credenciais.',
      404: 'Recurso não encontrado.',
      500: 'Erro no servidor. Tente novamente mais tarde.',
    };
    return status_messages[status] || message;
  }
  if (error.request) return 'Erro de conexão. Verifique sua internet.';
  return error.message || 'Erro desconhecido';
}

export function log_error(action, error) {
  console.error(`❌ Erro em ${action}:`, error);
}
