# Plano: app mobile (Capacitor + TypeScript)

Transformar a SPA em um **APK Android instalável** no celular pessoal, consumindo o backend da Vercel, com migração incremental para TypeScript.

## Decisões confirmadas

- **Plataforma:** Android (app instalado por sideload, sem Play Store, sem assinatura paga).
- **Backend:** `notion-api-green.vercel.app` (deploy existente do `notion_api`).
- **Uso:** pessoal, 100% online, dados vindos do Notion via API.
- **Sistema de build:** WSL2 no Windows 11 — build CLI dentro do WSL, instalação via **wireless adb**.
- **TypeScript:** entra como fase de migração incremental **após** o APK funcionando (M1 → M2).

### Arquitetura alvo

```
Celular (Android WebView)                Vercel
┌────────────────────────────┐   HTTPS   ┌──────────────────┐
│ dist/ (Vue 3 + TS)         │ ────────► │ notion_api       │
│ · services/api.ts (Axios)  │  CORS     │ · /api/books     │
│ · stores (Pinia)           │  origem   │ · /api/auth      │
│ · @capacitor/app (back)    │  localhost│ └────────────────┘
│ · @capacitor/preferences   │           └── Notion API ───► Notion
└────────────────────────────┘
```

O Capacitor copia o `dist/` para o projeto nativo em `android/` e o WebView serve de `https://localhost` (origin de origem do CORS).

---

## Fase 0 — Ambiente Android (WSL2)

Pré-requisitos verificados: Ubuntu 26.04 LTS no WSL2 (kernel 6.18), x86_64, `openjdk-21-jdk` disponível no apt, `unzip` ausente (instalar).

1. Instalar JDK 21 + ferramentas de extração:

   ```bash
   sudo apt update
   sudo apt install openjdk-21-jdk unzip
   java -version
   ```

2. Baixar o **command-line tools** do Android e instalar o SDK **na ext4** (`~/android-sdk`). Nunca em `/mnt/c` (I/O do mount do Windows é lento demais para o Gradle).

   ```bash
   mkdir -p ~/android-sdk/cmdline-tools
   cd ~/android-sdk/cmdline-tools
   wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
   unzip commandlinetools-linux-11076708_latest.zip
   mv cmdline-tools latest
   ```

3. Instalar pacotes e aceitar licenças:

   ```bash
   export ANDROID_HOME=$HOME/android-sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
   yes | sdkmanager --licenses
   sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
   ```

4. Tornar as variáveis permanentes no `~/.zshrc` (shell do ambiente):

   ```bash
   export ANDROID_HOME=$HOME/android-sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
   ```

**Verificação:** `adb version` e `sdkmanager --list_installed` respondem.

> Sem Android Studio e sem emulador: o build é 100% CLI (o Gradle wrapper do Capacitor baixa o Gradle sozinho).

---

## Fase 1 — Backend: liberar origem do app no CORS

O WebView Android envia o header `Origin: https://localhost`. O middleware de `notion_api/server.js` só aceita origens exatas da lista ou `http://localhost` — negaria a origem do app.

**Arquivo:** `notion_api/server.js` (linhas 26–31), adicionar à lista:

```js
const allowed_origins = [
  'https://book-journal-chi.vercel.app',
  'https://no-sleep-land.vercel.app',
  'https://dashboard-journal.vercel.app',
  'https://localhost', // origem do WebView Android (Capacitor)
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
].filter(Boolean);
```

**Alternativa sem tocar em código:** setar `CORS_ORIGINS=https://localhost` nas env vars do deploy na Vercel (o `server.js` já lê essa variável).

**Impacto de rede:** o backend está na Vercel com HTTPS; `credentials: true` e header `Authorization` já são tratados — nenhuma mudança no fluxo de login.

---

## Fase 2 — Scaffold do Capacitor

1. Instalar dependências:

   ```bash
   npm i @capacitor/core @capacitor/app @capacitor/preferences
   npm i -D @capacitor/cli @capacitor/android
   ```

2. Criar `capacitor.config.ts` na raiz:

   ```ts
   import type { CapacitorConfig } from '@capacitor/cli'

   const config: CapacitorConfig = {
     appId: 'com.teixeira.bookjournal',
     appName: 'Book Journal',
     webDir: 'dist',
   }

   export default config
   ```

3. Adicionar scripts no `package.json`:

   ```json
   "cap:sync": "cap sync android",
   "cap:apk": "npm run build && cap sync android && cd android && ./gradlew assembleDebug",
   "typecheck": "vue-tsc --noEmit"
   ```

4. Gerar o projeto nativo:

   ```bash
   npx cap add android
   ```

5. Ícone e splash: gerar via `@capacitor/assets` a partir dos favicons existentes (`public/favicon.svg`). Uso pessoal não exige padrão de loja.

6. **Antes do build, apontar o backend certo em `.env`** (hoje está ativo `http://localhost:3000`):

   ```env
   # url do backend
   VITE_API_URL=https://notion-api-green.vercel.app
   ```

   O build embute essa URL no bundle; sem ela, o app tentaria `localhost` do próprio celular.

7. Ajuste de memória do Gradle (RAM de 7,5 GB): em `android/gradle.properties`:

   ```
   org.gradle.jvmargs=-Xmx2g
   ```

**Dev loop:** `npx cap run android` (Wireless adb) roda o app no aparelho. Como o backend é a Vercel, o proxy local do Vite (`/api → localhost:3000`) não interfere no app instalado.

---

## Fase 3 — Adaptações do front em `src/`

### 3.1. Interceptor 401 sem reload (`services/api.js`)

Hoje o interceptor redireciona com `window.location.href = '/login'` — no WebView isso navega para `https://localhost/login` (arquivo inexistente → quebra). Trocar por `router.push` com **import dinâmico** (evita ciclo de imports router → stores → api):

```js
import { use_user_store_redirect } from './login-redirect' // alternativa: evento customizado
```

A implementação mínima mantém o comportamento e usa o router:

```js
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    const is_auth_call = url.startsWith('/api/auth/')
    const is_on_login_page = typeof window !== 'undefined' && window.location.pathname === '/login'

    if (status === 401 && !is_auth_call && !is_on_login_page) {
      localStorage.removeItem('SESSION_TOKEN')
      localStorage.removeItem('SESSION_USER')
      const { default: router } = await import('@/router')
      router.push({ name: 'login' })
    }
    return Promise.reject(error)
  },
)
```

O `window.location.pathname` continua válido: o Capacitor serve o SPA em history mode pelo servidor local `https://localhost`.

### 3.2. Botão voltar do Android (`App.vue` ou `main.js`)

O WebView não navega SPA com o botão físico; escutar `@capacitor/app` e delegar ao router:

```js
import { App } from '@capacitor/app'
import router from '@/router'

App.addListener('backButton', () => {
  if (window.history.state?.back) {
    router.back()
  } else {
    App.exitApp()
  }
})
```

`viagem`: `vue-router` em history mode grava `back`/`forward` em `history.state` — fecha a tela aberta se houver histórico, senão minimiza/sai do app.

### 3.3. Safe-area e viewport (`index.html`)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

E aplicar `env(safe-area-inset-*)` nos elementos fixos em colisão com a barra de status/navegação (logo, header, toasts) — adicionar junto às variáveis em `assets/css/vars.css`:

```css
/* Espaço reservado da área segura (notch/barra de gestos) */
--safe-top: env(safe-area-inset-top, 0px);
--safe-bottom: env(safe-area-inset-bottom, 0px);
```

### 3.4. Asset quebrado (`ThisYearList.vue` linha 155)

`background-image: url('/src/assets/images/cards/card_this_year/this-year__header.png')` aponta para arquivo **inexistente** e usa caminho absoluto que quebra no bundle de produção. Corrigir importando um asset existente (`card_this_year/`) ou removendo o bloco — verificar com o Vite em build.

### 3.5. Sessão persistente (opcional)

`localStorage` **funciona** no WebView Android (persiste entre sessões). Se a robustez importar (purga do sistema), migrar os `STORAGE_KEYS` do `userStore` para `@capacitor/preferences` (API assíncrona `get`/`set`):

- Tokens: `SESSION_TOKEN`, `SESSION_USER`, `IS_GUEST`.
- Ajustar `load_session()`, `login()`, `logout()` e o interceptor de `api.js` (leitura do token).

Não é bloqueador para M1.

---

## Fase 4 — Build e instalação (marco M1)

1. Build do bundle web + sincronizar com o projeto Android:

   ```bash
   npm run build
   npx cap sync android
   ```

2. Gerar o APK (debug assinado, suficiente p/ sideload pessoal):

   ```bash
   cd android && ./gradlew assembleDebug
   ```

   Saída: `android/app/build/outputs/apk/debug/app-debug.apk`.

3. Conectar o celular por **wireless adb** (Android 11+, mesma rede Wi‑Fi do PC):

   - Celular: `Opções de desenvolvedor → Depuração sem fio`, tocar em *Pair device* (mostra código de pareamento).
   - No WSL:

   ```bash
   adb pair <ip-do-celular>:<porta>      # com o código exibido
   adb connect <ip-do-celular>:<porta>
   adb devices                           # deve listar "device"
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

   Alternativa via USB exige `usbipd-win` no Windows (PowerShell admin: `usbipd bind`/`attach --wsl`).

4. **Verificação funcional:** abrir o app, fazer login com email + código (API da Vercel), criar/editar/arquivar um livro, filtrar por status e testar o botão voltar.

> A primeira instalação pede para habilitar "fontes desconhecidas" no celular — aceitar (1 vez).

---

## Fase 5 — Migração TypeScript incremental (marco M2)

O `tsconfig.json` existente é resíduo (não há `typescript`/`vue-tsc` instalados). A migração não toca o projeto nativo — só `src/`, que o Capacitor copia via `dist/`.

### 5.1. Dependências

```bash
npm i -D typescript vue-tsc @types/node typescript-eslint
```

### 5.2. Configuração

- Relaxar `tsconfig.json` para o modo incremental e **reapertar ao fim**:

  ```json
  {
    "compilerOptions": {
      "strict": false,
      "noUnusedLocals": false,
      "noUnusedParameters": false
    }
  }
  ```

- Criar `src/env.d.ts` com `/// <reference types="vite/client" />` (tipa `import.meta.env`).
- Adicionar `"typecheck": "vue-tsc --noEmit"` (já listado na Fase 2) e rodar no pipeline de lint.
- Atualizar `eslint.config.js` para TypeScript (flat config v9):

  ```js
  import tseslint from 'typescript-eslint'
  // files: ['**/*.{js,mjs,jsx,ts,mts,tsx,vue}']
  // ...tseslint.configs.recommended
  ```

### 5.3. Tipos compartilhados (`src/types/`)

Criar interfaces reutilizadas por serviços e stores:

- `src/types/book.ts` — `Book`, `BookStatus`, `BookOptions`, resposta paginada (`{ data, pagination }`).
- `src/types/auth.ts` — `User`, `LoginResponse`, `GuestUser`.

### 5.4. Ordem de migração (JS → TS, um arquivo por vez)

| Etapa | Arquivos | Ganho |
|-------|----------|-------|
| 1 | `constants/book.js`, `constants/toast.js` | valores tipados (status/opções) |
| 2 | `utils/errorHandler.js`, `utils/validation.js` | contrato de erros |
| 3 | `services/api.js` → `api.ts` | **maior ROI**: tipa endpoints e payloads |
| 4 | `stores/bookStore.js`, `stores/userStore.js` | estado e actions tipados |
| 5 | `composables/*` | hooks tipados |
| 6 | `views/*` e `components/**` (`<script setup lang="ts">`) | props/emits tipados |
| 7 | `router/index.js` | rotas e meta tipados |

Regras:

- Renomear `.js` → `.ts` e atualizar imports (alias `@/` já cobre).
- Em componentes, trocar a tag para `<script setup lang="ts">` e tipar `defineProps` com as interfaces de `src/types/`.
- Não misturar num commit migração + mudança de comportamento.
- `npm run lint` e `npm run format` após cada etapa; rodar `npm run typecheck` no fim.
- Remover `jsconfig.json` quando o `tsconfig.json` assumir os paths `@/*`.

---

## Riscos e avisos

- **`unzip` ausente** — instalar na Fase 0 antes de extrair o SDK.
- **RAM 7,5 GB** — build Gradle pesado; o `-Xmx2g` em `gradle.properties` mitiga OOM.
- **WSL sem USB nativo** — wireless adb resolve; usbipd-win é o plano B.
- **Dois repos** — `notion_api` (CORS) e `book_journal` (todo o resto) são commits diferentes; manter Conventional Commits e atomicidade.
- **Sem loja** — a atualização do app é só refazer o APK e reinstalar (ou aplicará live-update futuro, fora de escopo).
- **100% online** — celular sem internet não carrega nada; offline não é requisito.
- **appId fixo** — `com.teixeira.bookjournal` definido na Fase 2; trocar depois da criação do projeto exigiria recriar o target Android.

## Marcos

| Marco | Entrega | Resultado |
|-------|---------|-----------|
| M1 | Fases 0–4 | APK instalado e navegando no celular (JS) |
| M2 | Fase 5 | App full TypeScript com `vue-tsc` limpo |