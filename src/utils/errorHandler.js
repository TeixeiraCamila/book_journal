export function extractErrorMessage(error) {
  if (!error) return 'Erro desconhecido';
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    const statusMessages = {
      400: 'Dados inválidos. Verifique as informações enviadas.',
      401: 'Não autorizado. Verifique suas credenciais.',
      404: 'Recurso não encontrado.',
      500: 'Erro no servidor. Tente novamente mais tarde.',
    };
    return statusMessages[status] || message;
  }
  if (error.request) return 'Erro de conexão. Verifique sua internet.';
  return error.message || 'Erro desconhecido';
}

export function logError(action, error) {
  console.error(`❌ Erro em ${action}:`, error);
}
