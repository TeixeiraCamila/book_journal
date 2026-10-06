# Book Journal

Web app for personal library management. You can add books, track reading progress, rate works, and organize them by status, genre, and series. Data is persisted in Notion through a custom API.

## Description

Book Journal is a SPA for cataloging and tracking your reading. You add books manually, mark progress, rate with stars, and favorite them.

It consumes the API backend in `backend__final`, **Books** domain.

## Tech Stack

- **Vue.js 3** (Composition API + `<script setup>`)
- **Pinia**: State management
- **Vue Router 4**: SPA routing
- **Vite 7**: Build tool
- **Axios**: HTTP client
- **GSAP**: Advanced animations
- **VueUse Motion**: Declarative animations
- **Swiper**: Sliders and carousels
- **Lucide Vue**: Icons
- **vue-toastification**: Toast notifications
- **ESLint + Prettier**: Code quality

## Features

- Complete book registration (title, author, genres, series, type)
- Progress tracking (pages read, status: reading/completed/abandoned)
- Star ratings and favorites
- Status filtering with single-select radios and partial search by title, author or genre (debounced)
- Cursor-based pagination
- Card view with flip animation
- Guest mode without login
- Responsive interface

## Layout

Cards are the core of the interface. The flip animates details on hover.

## Folder Structure

```
src/
├── App.vue                  # Root component
├── main.js                  # Entry point (Pinia, Router, Toast)
├── assets/
│   └── main.css             # Global styles
├── components/
│   ├── index.js             # Barrel exports
│   ├── books/
│   │   ├── BookCard/        # Card with flip animation
│   │   │   ├── BookCard.vue
│   │   │   ├── CardBack.vue
│   │   │   ├── CardFront.vue
│   │   │   └── CardStatus.vue
│   │   └── BookList/        # Book list
│   ├── features/
│   │   ├── Stack/           # Card stack
│   │   ├── ReadingList/     # Current reading list
│   │   └── TBRList/         # "To read" list
│   ├── forms/
│   │   ├── BookForm/        # Book form
│   │   ├── FormField.vue
│   │   ├── FormSection.vue
│   │   └── FormActions.vue
│   ├── ui/                  # Base components
│   │   ├── Button.vue
│   │   ├── LoadingSpinner.vue
│   │   ├── Modal.vue
│   │   ├── Badge.vue
│   │   ├── Card.vue
│   │   └── Skeleton/        # Loading states
│   ├── layout/
│   │   ├── Header.vue
│   │   ├── Layout.vue
│   │   └── Container.vue
│   ├── navigation/
│   │   ├── Pagination.vue
│   │   ├── Filters.vue
│   └── feedback/
│       ├── Notification.vue
│       ├── ToastContainer.vue
│       └── ConfirmDialog.vue
├── composables/
│   ├── useAnimatedModal.js
│   └── useNotifications.js
├── constants/
│   └── book.js              # Status, type, label constants
├── router/
│   └── index.js             # Routes + auth guard
├── services/
│   └── api.js               # Axios client + endpoints
├── stores/
│   ├── bookStore.js         # Book state (Pinia)
│   └── userStore.js         # User state (Pinia)
├── utils/
│   └── validation.js        # Validation helpers
└── views/
    ├── HomeView.vue
    ├── CardStackView.vue
    ├── CreateBookView.vue
    └── LoginView.vue
```

## Installation

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run vercel-build` | Production build for Vercel |

**Production** (Vercel):
```
VITE_API_URL=
```

## Architecture

The app follows a **Vue 3 SPA** architecture:

- **Composition API** with `<script setup>` in every component
- **Pinia** as the global store, split per domain (`bookStore`, `userStore`)
- **Vue Router** with lazy-loaded views and an auth navigation guard
- **Service layer** centralized in `services/api.js` with Axios
- **Constants** in `constants/` as fallback for backend options
- **Composables** for reusable logic (animated modals, notifications)
- **Barrel exports** in `components/index.js` for easier imports

### Data flow

```
Views → Pinia Stores → services/api.js (Axios) → Backend API → Notion CMS
```

## API Consumption

The app consumes these endpoints from the `backend__final` backend:

| Endpoint | Usage |
|---|---|
| `GET /api/books` | List books (paginated); accepts `search`, `searchBy` (`title`/`author`/`genre`) and `status` |
| `GET /api/books/all` | All books |
| `GET /api/books/:id` | Book details |
| `GET /api/books/options` | Filter options (status, authors, genres) |
| `POST /api/books` | Create book |
| `PATCH /api/books/:id` | Update book |
| `DELETE /api/books/:id` | Archive book |
| `POST /api/auth/login` | Sign in (email + access code) |

## Responsiveness

The interface is responsive from mobile to desktop. The layout uses CSS Grid and Flexbox with media queries to rearrange cards and navigation per viewport.

## Accessibility

- Adequate contrast between text and background
- Visible focus on interactive elements
- Alt text on images
- Keyboard navigation
- Animations respect `prefers-reduced-motion`

## Deploy

Deployed on **Vercel** as an SPA:

```bash
# 1. Connect the repository on Vercel
# 2. Set VITE_API_URL as an environment variable
# 3. vercel.json redirects every route to index.html
```