<script setup>
// Skeleton para formulário — placeholder visual durante carregamento assíncrono de dados
import Button from '@/components/ui/Button.vue'
</script>

<template>
  <div class="form-skeleton">
    <!-- Header Section -->
    <div class="form-skeleton__header">
      <h2 class="form-skeleton__title">Adicionar Novo Livro</h2>
      <Button class="form-skeleton__close-btn">×</Button>
    </div>

    <form class="form-skeleton__content">
      <div class="form-skeleton__section">
        <h3 class="form-skeleton__section-title">Informações Básicas</h3>
        <div class="form-skeleton__grid">
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Título</label>
            <div class="form-skeleton__input"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Autor</label>
            <div class="form-skeleton__input"></div>
          </div>
        </div>
      </div>

      <div class="form-skeleton__section">
        <h3 class="form-skeleton__section-title">Status e Progresso</h3>
        <div class="form-skeleton__grid">
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Status</label>
            <div class="form-skeleton__select"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Total de páginas</label>
            <div class="form-skeleton__input"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Página atual</label>
            <div class="form-skeleton__input"></div>
          </div>
        </div>
      </div>

      <div class="form-skeleton__section">
        <h3 class="form-skeleton__section-title">Avaliação e Classificação</h3>
        <div class="form-skeleton__grid">
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Avaliação</label>
            <div class="form-skeleton__select"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Tipo</label>
            <div class="form-skeleton__input"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Gêneros/Tags</label>
            <div class="form-skeleton__input"></div>
          </div>
        </div>
      </div>

      <div class="form-skeleton__section">
        <h3 class="form-skeleton__section-title">Detalhes da Publicação</h3>
        <div class="form-skeleton__grid">
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Ano de publicação</label>
            <div class="form-skeleton__input"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Publicado por</label>
            <div class="form-skeleton__input"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Série do livro</label>
            <div class="form-skeleton__input"></div>
          </div>
          <div class="form-skeleton__field form-skeleton__field--checkbox">
            <div class="form-skeleton__checkbox"></div>
            <label class="form-skeleton__checkbox-label">Possuo cópia física</label>
          </div>
        </div>
      </div>

      <div class="form-skeleton__section">
        <h3 class="form-skeleton__section-title">Leitura e Metadados</h3>
        <div class="form-skeleton__grid">
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Lido em</label>
            <div class="form-skeleton__input"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Data de início</label>
            <div class="form-skeleton__input form-skeleton__input--date"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Data de término</label>
            <div class="form-skeleton__input form-skeleton__input--date"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Atlas literário</label>
            <div class="form-skeleton__input"></div>
          </div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">Capa (URLs)</label>
            <div class="form-skeleton__input"></div>
          </div>
        </div>
      </div>

      <div class="form-skeleton__actions">
        <Button class="form-skeleton__button form-skeleton__button--primary">Salvar Livro</Button>
        <Button class="form-skeleton__button form-skeleton__button--secondary">Cancelar</Button>
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

.form-skeleton__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-skeleton__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  width: 100%;
  height: 24px;
  margin: 0;
}

.form-skeleton__content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-skeleton__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-skeleton__section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  width: 100%;
  height: 20px;
}

.form-skeleton__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.form-skeleton__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-skeleton__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  width: 100%;
  height: 14px;
}

.form-skeleton__input {
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

.form-skeleton__input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent3_muted);
}

.form-skeleton__select {
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

.form-skeleton__select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent3_muted);
}

.form-skeleton__input--date {
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

.form-skeleton__input--date:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent3_muted);
}

.form-skeleton__field--checkbox {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(218, 147, 143, 0.05);
  border-radius: 0.5rem;
  border: 1px solid var(--accent_muted);
}

.form-skeleton__checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--accent3);
  border-radius: 4px;
  background: var(--white);
}

.form-skeleton__checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  width: 200px;
  height: 16px;
}

.form-skeleton__actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-skeleton__button {
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

.form-skeleton__button:hover {
  background: var(--accent_muted);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.form-skeleton__button:active {
  transform: translateY(0);
  box-shadow: var(--shadow);
}

.form-skeleton__button--primary {
  background: var(--accent);
  color: var(--white);
  width: 140px;
}

.form-skeleton__button--secondary {
  background: #e5e7eb;
  color: #374151;
  width: 120px;
}

.form-skeleton__button--secondary:hover {
  background: #d1d5db;
  transform: translateY(-1px);
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
  .form-skeleton__content {
    padding: 1rem;
  }

  .form-skeleton__grid {
    grid-template-columns: 1fr;
  }
}
</style>
