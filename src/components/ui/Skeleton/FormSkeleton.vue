<script>
import Button from '../Button.vue';
</script>

<template>
  <div class="form-skeleton">
    <!-- Header Section -->
    <div class="form-skeleton__header">
      <h2 class="skeleton-line skeleton-title">Adicionar Novo Livro</h2>
      <Button class="skeleton-line skeleton-close-btn">×</Button>
    </div>

    <!-- Form Content -->
    <form class="form-skeleton__content">
      <!-- Section 1: Informações Básicas -->
      <div class="form-skeleton__section">
        <h3 class="skeleton-line skeleton-section-title">Informações Básicas</h3>
        <div class="form-skeleton__grid">
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Título</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Autor</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
        </div>
      </div>

      <!-- Section 2: Status e Progresso -->
      <div class="form-skeleton__section">
        <h3 class="skeleton-line skeleton-section-title">Status e Progresso</h3>
        <div class="form-skeleton__grid">
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Status</label>
            <div class="skeleton-line skeleton-select"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Total de páginas</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Página atual</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
        </div>
      </div>

      <!-- Section 3: Avaliação e Classificação -->
      <div class="form-skeleton__section">
        <h3 class="skeleton-line skeleton-section-title">Avaliação e Classificação</h3>
        <div class="form-skeleton__grid">
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Avaliação</label>
            <div class="skeleton-line skeleton-select"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Tipo</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Gêneros/Tags</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
        </div>
      </div>

      <!-- Section 4: Detalhes da Publicação -->
      <div class="form-skeleton__section">
        <h3 class="skeleton-line skeleton-section-title">Detalhes da Publicação</h3>
        <div class="form-skeleton__grid">
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Ano de publicação</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Publicado por</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Série do livro</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
          <div class="skeleton-checkbox-wrapper">
            <div class="skeleton-line skeleton-checkbox"></div>
            <label class="skeleton-line skeleton-checkbox-label">Possuo cópia física</label>
          </div>
        </div>
      </div>

      <!-- Section 5: Leitura e Metadados -->
      <div class="form-skeleton__section">
        <h3 class="skeleton-line skeleton-section-title">Leitura e Metadados</h3>
        <div class="form-skeleton__grid">
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Lido em</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Data de início</label>
            <div class="skeleton-line skeleton-input skeleton-input--date"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Data de término</label>
            <div class="skeleton-line skeleton-input skeleton-input--date"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Atlas literário</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
          <div class="skeleton-field-wrapper">
            <label class="skeleton-line skeleton-label">Capa (URLs)</label>
            <div class="skeleton-line skeleton-input"></div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-skeleton__actions">
        <Button class="skeleton-line skeleton-button skeleton-button--primary">Salvar Livro</Button>
        <Button class="skeleton-line skeleton-button skeleton-button--secondary">Cancelar</Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-skeleton {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
}

/* Header - Mesmo estilo do BookForm */
.form-skeleton__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.skeleton-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  width: 100%;
  height: 24px;
  margin: 0;
}

.skeleton-close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Content - Mesmo padding e layout do BookForm */
.form-skeleton__content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Sections - Mesmo gap do BookForm */
.form-skeleton__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  width: 100%;
  height: 20px;
  font-weight: 600;
}

/* Fields - Mesmo grid do BookForm */
.form-skeleton__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.skeleton-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  width: 100%;
  height: 14px;
}

/* Inputs - Mesmo estilo do BookForm */
.skeleton-input {
  height: 48px;
  border: 2px solid var(--accent3);
  border-radius: 8px;
  background: var(--white);
  width: 100%;
  color: var(--black);
  font-family: inherit;
  font-size: var(--font);
  transition: border-color 0.2s ease;
  outline: none;
}

.skeleton-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent3_muted);
}

.skeleton-select {
  height: 48px;
  border: 2px solid var(--accent3);
  border-radius: 8px;
  background: var(--white);
  width: 100%;
  color: var(--black);
  font-family: inherit;
  font-size: var(--font);
  cursor: pointer;
  transition: border-color 0.2s ease;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

.skeleton-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent3_muted);
}

.skeleton-input--date {
  height: 48px;
  border: 2px solid var(--accent3);
  border-radius: 8px;
  background: var(--white);
  width: 100%;
  color: var(--black);
  font-family: inherit;
  font-size: var(--font);
  transition: border-color 0.2s ease;
  outline: none;
}

.skeleton-input--date:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent3_muted);
}

/* Checkbox - Mesmo estilo do BookForm */
.skeleton-checkbox-wrapper {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(218, 147, 143, 0.05);
  border-radius: 0.5rem;
  border: 1px solid var(--accent_muted);
}

.skeleton-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--accent3);
  border-radius: 4px;
  background: var(--white);
}

.skeleton-checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  width: 200px;
  height: 16px;
}

/* Actions - Mesmo estilo do BookForm */
.form-skeleton__actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.skeleton-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: var(--white);
  font-family: inherit;
  font-size: var(--font);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
  height: 48px;
}

.skeleton-button:hover {
  background: var(--accent_muted);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.skeleton-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow);
}

.skeleton-button--primary {
  background: var(--accent);
  color: var(--white);
  width: 140px;
}

.skeleton-button--secondary {
  background: #e5e7eb;
  color: #374151;
  width: 120px;
}

.skeleton-button--secondary:hover {
  background: #d1d5db;
  transform: translateY(-1px);
}

/* Base skeleton animation */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Skeleton line styles */
.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

/* Responsividade - Mesmo breakpoint do BookForm */
@media (max-width: 768px) {
  .form-skeleton__content {
    padding: 1rem;
  }

  .form-skeleton__grid {
    grid-template-columns: 1fr;
  }
}
</style>
