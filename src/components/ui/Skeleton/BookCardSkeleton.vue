<!-- Skeleton para card de livro — placeholder animado (shimmer) enquanto dados carregam -->
<template>
  <div class="book-card-skeleton">
    <div class="book-card-skeleton__front">
      <div class="book-card-skeleton__tape">
        <div class="book-card-skeleton__line book-card-skeleton__line--tape-text"></div>
        <div class="book-card-skeleton__line book-card-skeleton__line--tape"></div>
      </div>
      <div class="book-card-skeleton__cover">
        <div class="book-card-skeleton__shimmer"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-card-skeleton {
  padding: 1rem;
  background: var(--white);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: var(--card-w);
  margin: 0 auto;
  transform-origin: center center;
  position: relative;
  border-radius: 8px;
  height: 288px;
}

.book-card-skeleton__front {
  position: relative;
  width: 100%;
  height: 100%;
}

.book-card-skeleton__tape {
  position: absolute;
  top: -38px;
  left: 11%;
  transform: rotate(-10deg);
  width: 150px;
}

.book-card-skeleton__line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.book-card-skeleton__line--tape-text {
  height: 12px;
  width: 60%;
  margin: 0 auto;
}

.book-card-skeleton__line--tape {
  height: 30px;
  width: 100%;
  margin-top: 5px;
}

.book-card-skeleton__cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.book-card-skeleton__shimmer {
  display: none;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (max-width: 768px) {
  .book-card-skeleton {
    width: 90vw;
    max-width: 320px;
    height: 480px;
  }
}

@media (max-width: 480px) {
  .book-card-skeleton {
    width: 95vw;
    max-width: 280px;
    height: 420px;
  }
}
</style>
