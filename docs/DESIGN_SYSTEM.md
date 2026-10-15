# Design System

Fonte de verdade do vocabulário visual. Tokens reais vivem em `src/assets/css/vars.css`; este documento explica o que eles são e quando usá-los.

## 1. Direção de Design

Estilo:

Papel/caderno (notebook journaling) — texturas de papel, fitas adesivas, sombras marcadas.

Clima:

Acolhedor, artesanal, levemente retrô/typewriter. Nada "flat" ou corporativo.

Princípios de Design:

- Priorizar calor e textura sobre minimalismo limpo
- Cores pastéis só como acento; fundo sempre creme
- Cards são a unidade central da interface (com flip 3D)
- Animações presentes, mas nunca no caminho do usuário

---

## 2. Marca

Nome do Produto:

Book Journal ("Diário de Leitura" na tela de login)

Voz da Marca:

Pessoal, curta, em pt-BR. Ex.: "Sua estante espera por você."

---

## 3. Paleta de Cores

Definidas como variáveis CSS em `vars.css` — usar sempre via `var(--token)`, nunca hex literal.

Primária (acento rosa):

`--accent: #fec9c3` · `--accent_muted: #f6cec87c`

Secundária (bege):

`--accent2: #efd0b1` · `--accent2_muted: #efd0b17c`

Acentos 3–5 (sage, terracota, azul):

`--accent3: #c8c2aa` · `--accent4: #d19793` · `--accent5: #b3c6d5` (cada um com variante `_muted` a `7c` de alpha)

Fundo / Superfície:

`--bg: linear-gradient(to bottom right, #fff9ee, white, #fff9ee)` · `--white: #fff9ee` (creme, não branco puro)

Texto:

`--black: #2b2b2b` (texto principal) · `--muted: #6b7280` (texto secundário)

Erro:

`--danger: #991b1b` · `--danger-dark: #7f1d1d`

Cores dos slides da home (definidas no scoped style de `CardStackView.vue`):

intro `#123d17` (verde escuro) · acervo `#537d9e` (azul) · lendo `--accent4` · ano `--accent2` · TBR `#e98378` (coral)

Sem tokens globais de sucesso/aviso — feedback de sucesso usa os toasts (`vue-toastification`) com o estilo padrão da lib, sobrescrito em `assets/css/toast-override.css`.

---

## 4. Tipografia

Família Principal (corpo):

`'Sour Gummy', sans-serif` — definida em `:root` com `font-size: clamp(0.875rem, 1rem, 1rem)`, `line-height: 1.5`, `font-weight: 400`

Fonte de Títulos/Apoio:

`'Raleway'` — importada em `vars.css`; usada em títulos e elementos de interface que pedem contraste com a Sour Gummy

Não há escala tipográfica formal de H1–H3; títulos usam `font-weight: 500–600` e tamanhos por contexto (ex.: título da view de criar `1.25rem`).

---

## 5. Espaçamento

Não existe escala de espaçamento formal (sem tokens `--space-*`). Padrões observados no código:

- Padding de card/slide: `2rem` (desktop), `1rem` (mobile ≤768px)
- Gap entre elementos de lista/formulário: `1rem`–`2rem`
- Gap interno de componentes: `0.5rem`

Ao criar componentes novos, seguir a escala implícita: `0.5 / 1 / 1.5 / 2rem`.

---

## 6. Raio de Borda

Small:

`--radius: 8px` (inputs, botões, cards pequenos)

Large:

`--radius-lg: 18px` (slides, modais, superfícies grandes)

Não há token "pill".

---

## 7. Sombras

`--shadow-sm: 0 1px 3px #0000001a` — cards leves

`--shadow: 0 8px 20px rgba(0, 0, 0, 0.15)` — sombra padrão

`--shadow-lg: 0 15px 35px rgba(0, 0, 0, 0.15)` — elevação máxima

`--box-shadow` (neumórfica, assinatura do projeto):

```css
7px 7px 15px -10px #bbcfda, -4px -4px 13px #ffffff,
inset 7px 7px 3px #d1d9e659, inset -11px -11px 3px #ffffff4d;
```

Usada em superfícies "papel" (ex.: header da view de criar). Usar `--box-shadow` para superfícies de papel e `--shadow*` para elevação simples.

---

## 8. Botões

Componente: `src/components/ui/Button.vue` (variantes ativas; ver `DECISIONS.md`).

Regras:

- Primary: fundo acento, texto escuro
- Secondary: contorno/fundo neutro
- Danger: usa `--danger`
- Disabled/loading: desabilitar interação e mostrar estado (o form usa `isSubmitting`)
- Erros de formulário e de API sempre em `--danger`

---

## 9. Inputs

Componente: `src/components/forms/FormField.vue` (tipos: text, number, select, autocomplete, multi-select, radio, checkbox, date).

Regras:

- Estado padrão, foco visível (obrigatório — acessibilidade), erro em `--danger` via prop `error`, placeholder em `--muted`
- Multi-select para gêneros; autocomplete com opções vindas de `/api/books/options`

---

## 10. Cards

Tamanhos de card (tokens):

`--card-front-w/h: 150px` (frente) · `--card-back-w: 200px` · `--card-back-h: 300px` (verso)

Card de livro (`BookCard`):

Frente = capa (ou placeholder), verso = detalhes (autor, páginas, série, nota, status) com flip 3D no hover. Fundos decorativos em `assets/images/cards/`.

---

## 11. Navegação

Header/Layout:

Não há header global fixo; cada view cuida do seu cabeçalho (ex.: `CreateBookView` com link "← Voltar para lista").

Navegação Principal:

A home **é** a navegação — pilha vertical de cartas (Swiper EffectCards) em `/`.

Mobile:

`@media (max-width: 768px)`: swiper `95vw × 90vh`, padding reduzido (`1rem`).

---

## 12. Estados

Loading:

`LoadingSpinner` (async components), `BookCardSkeleton`, `FormSkeleton`, ou `StateHandler` (genérico; ainda não aplicado nas 4 listas — ver `ROADMAP.md`).

Vazio:

Ícone + título + texto (ex.: "Nenhum livro encontrado" / "Comece adicionando seu primeiro livro!"); texto diferente quando há filtro ativo.

Erro:

Ícone ⚠️ + `bookStore.error` + botão "Tentar Novamente".

Sucesso:

Toasts (`useNotifications`), 3 s, `top-right`.

---

## 13. Ícones

Biblioteca:

`lucide-vue-next`

Alguns estados usam emojis diretamente (⚠️ 📚) — aceito como atalho nos empty/error states.

---

## 14. Design Responsivo

Breakpoints:

Mobile: `≤ 768px` (único breakpoint formal no código)

Desktop: acima de 768px

Regras:

- Grid/Flex + media queries por componente
- Slides: `80vw/80vh` (desktop) → `95vw/90vh` (mobile)
- Capas e listas reorganizam colunas no mobile

---

## 15. Acessibilidade

- Contraste adequado entre texto (`--black`) e fundo creme
- Foco visível em elementos interativos
- `alt` text em imagens (corrigido: não usar URL como alt)
- Navegação por teclado
- Animações respeitam `prefers-reduced-motion` (regra do AGENTS.md para transitions)
