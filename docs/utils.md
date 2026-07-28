# Utilitários

## errorHandler.js

**Arquivo:** src/utils/errorHandler.js

**Motivo:** O tratamento de erros estava duplicado entre bookStore.js e userStore.js com lógicas similares. Extraído para utilitário compartilhado.

**O que faz:** Extrai mensagens de erro amigáveis baseadas no status HTTP e loga no console.

**Exemplo:**
```js
import { extractErrorMessage, logError } from "@/utils/errorHandler"

try {
  await api.get("/books")
} catch (error) {
  const msg = extractErrorMessage(error)
  // 400 → "Dados inválidos. Verifique as informações enviadas."
  // 401 → "Não autorizado. Verifique suas credenciais."
  // 404 → "Recurso não encontrado."
  // 500 → "Erro no servidor. Tente novamente mais tarde."
  // erro de rede → "Erro de conexão. Verifique sua internet."
  logError("fetchBooks", error) // ❌ Erro em fetchBooks: ...
}
```

## validation.js

**Arquivo:** src/utils/validation.js

**Motivo:** Centralizar validações de formulário usadas no BookForm, evitando repetição de lógica de validação inline.

**O que faz:** Funções puras para validar campos de formulário.

**Exemplo:**
```js
import { validateRequired, validatePositiveNumber, validateYear, parseCommaSeparated } from "@/utils/validation"

validateRequired("", "Título") // "Título é obrigatório"
validatePositiveNumber(-5, "Páginas") // "Páginas deve ser um número positivo"
validateYear(\"abc", "Ano") // "Ano deve ter 4 dígitos"
parseCommaSeparated("a, b, c") // ["a", "b", "c"]
```
