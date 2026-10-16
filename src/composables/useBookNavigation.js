// Navegação compartilhada para a tela de edição de livro
import { useRouter } from 'vue-router';

export function useBookNavigation() {
  const router = useRouter();

  const navigateToEdit = (bookId) => {
    router.push(`/editar/${bookId}`);
  };

  return { navigateToEdit };
}
