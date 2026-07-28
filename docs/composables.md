# Composables

## useBookFormatters

**Arquivo:** src/composables/useBookFormatters.js

**Motivo:** As funções getAuthorString, getPagesString e getPublicationString estavam duplicadas em CardBack.vue e ReadingList.vue. Extraídas para um composable central.

**O que faz:** Formata dados do livro para exibição.

**Exemplo:**
```js
import { useBookFormatters } from "@/composables/useBookFormatters"

const { getAuthorString, getPagesString, getPublicationString } = useBookFormatters()

getAuthorString(book)
// "Atlas Literário João, Maria"

getPagesString(book)
// "Páginas: 50 / 200 (25%)"

getPublicationString(book)
// "Publicado por Editora X em 2024"
```

## useNotifications

**Arquivo:** src/composables/useNotifications.js

**Motivo:** Centralizar o disparo de notificações toast com tipo definido, evitando chamadas diretas ao vue-toastification em cada componente.

**O que faz:** Abstrai vue-toastification com suporte a success/error/warning/info.

**Exemplo:**
```js
import { useNotifications } from "@/composables/useNotifications"

const { addNotification, removeNotification } = useNotifications()

addNotification("Livro salvo!", "success")
addNotification("Erro ao salvar", "error", { timeout: 5000 })
removeNotification(toastId)
```

## useAnimatedModal

**Arquivo:** src/composables/useAnimatedModal.js

**Motivo:** Gerenciar o estado de um modal com flip 3D para visualização de cards de livro, controlando animações de abertura/fechamento e face exibida.

**O que faz:** Controla abertura, fechamento, flip (frente/verso) e animações de um modal.

**Exemplo:**
```js
import { useAnimatedModal } from "@/composables/useAnimatedModal"

const { isModalOpen, isFlipped, openAnimatedModal, closeModal, toggleFlip } = useAnimatedModal(cardRef, randomTilt)

openAnimatedModal() // abre com fade-in, vira para o verso após 2s
closeModal() // fecha com fade-out
toggleFlip() // alterna entre frente e verso
flipToBack() // vira para o verso
flipToFront() // vira para a frente
```

**Observação:** closeModal e closeModalWithAnimation são idênticas — duplicação a ser resolvida.
