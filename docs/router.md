# Router

**Arquivo:** src/router/index.js

**Motivo:** Gerenciar navegação SPA com lazy loading e proteção de rotas (autenticação).

**Rotas:**

| Path | Nome | Componente | Requer Auth |
|------|------|-----------|-------------|
| /login | login | LoginView | Não |
| / | home | CardStackView | Sim |
| /criar | create | CreateBookView | Sim |
| /editar/:id | edit | CreateBookView | Sim |

**Guard de navegação:**
```js
router.beforeEach((to, from, next) => {
  const saved = localStorage.getItem("USER_LOGADO")
  const isGuest = localStorage.getItem("IS_GUEST") === "true"

  if (requiresAuth && !isAuthenticated) return next({ name: "login" })
  else if (to.name === "login" && isAuthenticated) return next({ name: "home" })
  else next()
})
```

**Exemplo de lazy loading:**
```js
{
  path: "/",
  name: "home",
  component: () => import("@/views/CardStackView.vue"),
  meta: { requiresAuth: true },
}
```
