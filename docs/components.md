# Componentes

## Estrutura

```
src/components/
├── books/BookCard/     — BookCard (container), CardFront, CardBack, CardStatus
├── books/BookList/     — BookList (grid + filtros + paginação)
├── features/ReadingList/ — Livros em leitura
├── features/TBRList/     — Livros para ler
├── features/ThisYearList/ — Lidos no ano (agrupado por mês)
├── features/Stack/       — CardIntro (animação GSAP)
├── feedback/ConfirmDialog — Modal de confirmação (deletar livro)
├── forms/BookForm/        — Formulário principal (criar/editar)
├── forms/FormField/       — Campo de formulário
├── forms/FormSection/     — Seção do formulário
├── forms/FormActions/     — Botões do formulário
├── navigation/Pagination/ — Paginação
├── navigation/Filters/    — Filtros
├── ui/Button/             — Botão reutilizável
├── ui/LoadingSpinner/     — Indicador de loading
├── ui/StateHandler/       — Estados loading/error/empty
└── ui/Skeleton/           — BookCardSkeleton, FormSkeleton
```

## Exemplo de estrutura (BookCard)

BookCard.vue é o container que gerencia o estado de flip (frente/verso) usando useAnimatedModal.
CardFront.vue exibe a capa do livro com sobreposição de status.
CardBack.vue exibe metadados (autor, páginas, gêneros, publicação) e botões de ação.
CardStatus.vue renderiza a fita de status ("Lendo", "Completo", etc.) com avaliação.

## Convenções

- **BEM CSS:** .block__element--modifier
  - Exemplo: .reading-card__cover, .reading-card__progress-fill
- **Variáveis CSS globais:** var(--accent), var(--black), var(--muted), var(--shadow)
- **PascalCase** para arquivos de componente
- **Alias** @/ para imports
