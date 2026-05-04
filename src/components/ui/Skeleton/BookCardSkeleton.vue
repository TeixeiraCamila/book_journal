<template>
  <div class="book-card-skeleton">
    <!-- Card Front -->
    <div class="book-card-skeleton__front">
      <!-- Status Tape -->
      <div class="card-status__tape">
        <div class="skeleton-line skeleton-status-text"></div>
        <div class="skeleton-line skeleton-tape"></div>
      </div>

      <!-- Cover Image Placeholder -->
      <div class="book-card-skeleton__cover">
        <div class="skeleton-shimmer"></div>
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

/* Card Front */
.book-card-skeleton__front {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Status Tape - Mesmas dimensões do card real */
.card-status__tape {
  position: absolute;
  top: -38px;
  left: 11%;
  transform: rotate(-10deg);
  width: 150px;
}

.skeleton-status-text {
  height: 12px;
  width: 60%;
  margin: 0 auto;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-tape {
  height: 30px;
  width: 100%;
  margin-top: 5px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* Cover Image - Mesmo tamanho do card real */
.book-card-skeleton__cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* RESPONSIVO - Mesmas breakpoints do card real */
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
