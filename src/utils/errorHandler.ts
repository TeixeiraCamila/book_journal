// Funções utilitárias para tratamento de erros

// Forma estrutural do erro Axios lida pelo extractErrorMessage (cast único sobre unknown)
type ErrorLike = {
  response?: { status?: number; data?: { message?: string } };
  request?: unknown;
  message?: string;
};

export function extractErrorMessage(error: unknown): string {
  if (!error) return 'Erro desconhecido';
  const err = error as ErrorLike;
  if (err.response) {
    const status = err.response.status;
    const message = err.response.data?.message || err.message;
    const statusMessages: Record<number, string> = {
      400: 'Dados inválidos. Verifique as informações enviadas.',
      401: 'Não autorizado. Verifique suas credenciais.',
      404: 'Recurso não encontrado.',
      500: 'Erro no servidor. Tente novamente mais tarde.',
    };
    // `||` final espelha o JS original; a mensagem do axios praticamente sempre existe
    const statusMessage = status !== undefined ? statusMessages[status] : undefined;
    return (statusMessage || message) as string;
  }
  if (err.request) return 'Erro de conexão. Verifique sua internet.';
  return err.message || 'Erro desconhecido';
}

export function logError(action: string, error: unknown): void {
  console.error(`❌ Erro em ${action}:`, error);
}
