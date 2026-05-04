# 📚 Book Journal

Sua biblioteca pessoal conectada ao Notion.

## ✨ Funcionalidades

- **Cadastro de livros** — título, autor, gênero, série
- **Controle de progresso** — páginas lidas, status (lendo, completo, abandono)
- **Avaliações** — sistema de notas com estrelas e favoritos
- **Estatísticas** — livros por ano, gêneros mais lidos, autores favoritos
- **Filtragem e busca** — pesquise por título, autor ou status
- **Interface responsiva** — funciona em qualquer dispositivo

## 🛠️ Tecnologias

| Categoria | Tech |
|-----------|------|
| **Frontend** | Vue.js 3 (Composition API) |
| **Estado** | Pinia |
| **Rotas** | Vue Router |
| **Build** | Vite |
| **Animações** | GSAP, VueUse Motion |
| **HTTP** | Axios |
| **UI** | Swiper, Chart.js |
| **Estilo** | CSS customizado |

## 🚀 Começar

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## ⚙️ Configurar API

**Desenvolvimento** — edite `.env.development`:
```
VITE_API_URL=
```
(Uso do proxy Vite → localhost:3000)

**Produção** — adicione no Vercel:
```
VITE_API_URL=https://notion-api-green.vercel.app/api
```

---

Desenvolvido por **Camila Cristina Teixeira**