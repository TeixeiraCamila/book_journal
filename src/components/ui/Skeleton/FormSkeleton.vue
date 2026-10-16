<script setup>
// Skeleton do formulário — replica o layout real renderizando o config de constants/formLayout.js
import Button from '@/components/ui/Button.vue';
import {
  BOOK_FORM_SECTIONS,
  BOOK_FORM_COVER_FIELD,
  BOOK_FORM_ACTIONS,
} from '@/constants/formLayout';
</script>

<template>
  <div class="form-skeleton">
    <form class="form-skeleton__content">
      <!-- Layout: 20% Capa | 70% Campos (espelha .book-form__layout) -->
      <div class="form-skeleton__layout">
        <div class="form-skeleton__cover-section">
          <div class="form-skeleton__cover"></div>
          <div class="form-skeleton__field">
            <label class="form-skeleton__label">{{ BOOK_FORM_COVER_FIELD.label }}</label>
            <div class="form-skeleton__input"></div>
          </div>
        </div>

        <div class="form-skeleton__fields">
          <div
            v-for="(section, key) in BOOK_FORM_SECTIONS"
            :key="key"
            class="form-skeleton__section"
          >
            <h3 class="form-skeleton__section-title">{{ section.title }}</h3>
            <div class="form-skeleton__grid">
              <template v-for="field in section.fields" :key="field.label">
                <div
                  v-if="field.kind === 'checkbox'"
                  class="form-skeleton__field form-skeleton__field--checkbox"
                >
                  <div class="form-skeleton__checkbox"></div>
                  <label class="form-skeleton__checkbox-label">{{ field.label }}</label>
                </div>
                <div v-else class="form-skeleton__field">
                  <label class="form-skeleton__label">{{ field.label }}</label>
                  <div
                    :class="
                      field.kind === 'select' ? 'form-skeleton__select' : 'form-skeleton__input'
                    "
                  ></div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="form-skeleton__actions">
        <Button variant="primary">{{ BOOK_FORM_ACTIONS.submit }}</Button>
        <Button variant="secondary">{{ BOOK_FORM_ACTIONS.cancel }}</Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-skeleton {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.form-skeleton__content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-skeleton__layout {
  display: grid;
  grid-template-columns: 20% 80%;
  gap: 1.5rem;
}

.form-skeleton__cover-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-skeleton__cover {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: var(--radius);
  background: #f3f4f6;
  box-shadow: 2px 2px rgba(218, 147, 143, 0.05);
}

.form-skeleton__fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
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

.form-skeleton__input,
.form-skeleton__select {
  height: 48px;
  border: 2px solid var(--accent3);
  border-radius: 8px;
  background: var(--white);
  width: 100%;
}

.form-skeleton__select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
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
}

.form-skeleton__actions {
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
  justify-content: flex-end;
}

.form-skeleton__actions :deep(.btn) {
  width: auto;
  min-width: 120px;
}

@media (max-width: 768px) {
  .form-skeleton__content {
    padding: 1rem;
  }

  .form-skeleton__layout {
    grid-template-columns: 1fr;
  }

  .form-skeleton__cover-section {
    order: -1;
  }

  .form-skeleton__grid {
    grid-template-columns: 1fr;
  }

  .form-skeleton__actions {
    flex-direction: column;
  }
}
</style>
