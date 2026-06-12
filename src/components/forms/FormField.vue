<script setup>
// Componente de campo de formulário — suporta text, number, select, checkbox, autocomplete e multi-select
import { computed, ref } from 'vue'

// Props recebidas pelo componente
const props = defineProps({
  // Valor do campo (v-model)
  modelValue: {
    type: [String, Number, Boolean, Array],
    default: '',
  },
  // Rótulo do campo (label)
  label: {
    type: String,
    required: true,
  },
  // Tipo do input: text, number, date, select, checkbox, autocomplete, email, password, url
  type: {
    type: String,
    default: 'text',
  },
  // Texto exibido quando campo está vazio
  placeholder: {
    type: String,
    default: '',
  },
  // Indica se campo é obrigatório (exibe asterisco)
  required: {
    type: Boolean,
    default: false,
  },
  // Mensagem de erro a ser exibida
  error: {
    type: String,
    default: '',
  },
  // Array de opções para selects e autocomplete
  options: {
    type: Array,
    default: () => [],
  },
  // Objeto com labels customizados para cada opção (key = valor, value = label exibido)
  // Ex: { '⭐⭐⭐⭐⭐': '5 Estrelas', '❤': 'Favorito' }
  labels: {
    type: Object,
    default: null,
  },
  // Valor mínimo (para inputs numéricos)
  min: {
    type: [String, Number],
    default: undefined,
  },
  // Valor máximo (para inputs numéricos)
  max: {
    type: [String, Number],
    default: undefined,
  },
  // Incremento (para inputs numéricos)
  step: {
    type: [String, Number],
    default: undefined,
  },
})

// Eventos emitidos para o pai (v-model)
const emit = defineEmits(['update:modelValue'])

// Estados reativos
const showSuggestions = ref(false)
const inputRef = ref(null)
const multiSearchText = ref('')
const showMultiSuggestions = ref(false)
const multiInputRef = ref(null)

// Ponte entre v-model do pai e o input (text, number, select, checkbox)
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
// Ponte entre v-model do pai e as tags (multi-select usa array)
const localMultiValue = computed({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: (value) => emit('update:modelValue', value),
})

// ID único para associar o <label> ao <input>
const fieldId = computed(() => `field-${Math.random().toString(36).substr(2, 9)}`)

// Converte o type do Vue para o atributo type do HTML (ex: "number" → number)
const inputType = computed(() => {
  switch (props.type) {
    case 'number': return 'number'
    case 'email': return 'email'
    case 'date': return 'date'
    case 'password': return 'password'
    case 'url': return 'url'
    default: return 'text'
  }
})

// Filtra as opções conforme o texto digitado (máx 10 resultados)
const filteredOptions = computed(() => {
  if (!props.options?.length || !localValue.value) return []

  const search = String(localValue.value).toLowerCase()
  return props.options.filter((opt) => String(opt).toLowerCase().includes(search)).slice(0, 10)
})

// Filtra as opções do multi-select, excluindo as já selecionadas
const multiFilteredOptions = computed(() => {
  if (!props.options?.length || !multiSearchText.value) return []
  const search = multiSearchText.value.toLowerCase()
  const selectedLower = localMultiValue.value.map((v) => String(v).toLowerCase())
  return props.options
    .filter((opt) => {
      const optStr = String(opt).toLowerCase()
      return optStr.includes(search) && !selectedLower.includes(optStr)
    })
    .slice(0, 10)
})

// Mostra "+ Adicionar" apenas se o texto não existe nas opções e não foi selecionado
const multiCanAddNew = computed(() => {
  if (!multiSearchText.value) return false
  const trimmed = multiSearchText.value.trim()
  if (!trimmed) return false
  if (multiFilteredOptions.value.length > 0) return false
  const alreadySelected = localMultiValue.value.some(
    (val) => String(val).toLowerCase() === trimmed.toLowerCase()
  )
  return !alreadySelected
})

// Métodos

// Seleciona uma sugestão e preenche o input
const selectSuggestion = (option) => {
  localValue.value = option
  showSuggestions.value = false
}

// Mostra o dropdown ao focar o input com opções disponíveis
const onInputFocus = () => {
  if (props.options?.length) showSuggestions.value = true
}

// Mostra o dropdown quando o usuário digita no multi-select
const onMultiInput = () => {
  showMultiSuggestions.value = multiSearchText.value.length > 0
}

// Adiciona um valor à lista, ignorando duplicatas (case-insensitive)
const addMultiValue = (val) => {
  const trimmed = val.trim()
  if (!trimmed) return

  const searchLower = trimmed.toLowerCase()
  const alreadySelected = localMultiValue.value.some((v) => String(v).toLowerCase() === searchLower)
  if (alreadySelected) {
    multiSearchText.value = ''
    showMultiSuggestions.value = false
    return
  }
  localMultiValue.value = [...localMultiValue.value, trimmed]
  multiSearchText.value = ''
  showMultiSuggestions.value = false
  multiInputRef.value?.focus()
}

// Remove um valor da lista pelo índice
const removeMultiValue = (index) => {
  localMultiValue.value = localMultiValue.value.filter((_, i) => i !== index)
}

// Mostra o dropdown ao focar no input do multi-select
const onMultiFocus = () => {
  if (props.options?.length) showMultiSuggestions.value = true
}

// Esconde o dropdown com delay para permitir clique na opção
const onMultiBlur = () => {
  setTimeout(() => (showMultiSuggestions.value = false), 200)
}
</script>

<template>
  <div class="form-field" :class="{ 'form-field--required': required }">
    <!-- Label do campo -->
    <label :for="fieldId" class="form-field__label">
      {{ label }}
      <!-- Asterisco para campos obrigatórios -->
      <span v-if="required" class="form-field__asterisk">*</span>
    </label>

    <div class="form-field__input-wrapper">
      <!-- SELECT: Dropdown com opções pré-definidas -->
      <select
        v-if="type === 'select'"
        :id="fieldId"
        v-model="localValue"
        class="form-field__input form-field__select"
        :class="{ 'form-field__input--error': error }"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="" disabled>{{ placeholder || 'Selecione uma opção' }}</option>

        <option v-for="option in options" :key="option" :value="option">
          {{ labels ? labels[option] : option }}
        </option>
      </select>

      <!-- CHECKBOX: Caixa de seleção -->
      <input
        v-else-if="type === 'checkbox'"
        :id="fieldId"
        type="checkbox"
        v-model="localValue"
        class="form-field__checkbox"
        @change="$emit('update:modelValue', $event.target.checked)"
      />

      <!-- AUTOCOMPLETE: Input com sugestões enquanto digita -->
      <div v-else-if="type === 'autocomplete'" class="form-field__autocomplete">
        <input
          ref="inputRef"
          :id="fieldId"
          :type="inputType"
          v-model="localValue"
          :placeholder="placeholder"
          :min="min"
          :max="max"
          :step="step"
          class="form-field__input"
          :class="{ 'form-field__input--error': error }"
          @input="$emit('update:modelValue', $event.target.value)"
          @focus="onInputFocus"
          @blur="onInputBlur"
        />

        <!-- Lista de sugestões (aparece quando há opções filtradas) -->
        <ul v-if="showSuggestions && filteredOptions.length" class="form-field__suggestions">
          <li
            v-for="option in filteredOptions"
            :key="option"
            @mousedown.prevent="selectSuggestion(option)"
          >
            {{ option }}
          </li>
        </ul>
      </div>

      <!-- MULTI-SELECT: Input + dropdown + tags removíveis -->
      <div v-else-if="type === 'multi-select'" class="form-field__multiselect">
        <div class="form-field__multiselect-input-wrapper">
          <input
            ref="multiInputRef"
            :id="fieldId"
            type="text"
            v-model="multiSearchText"
            :placeholder="placeholder"
            class="form-field__input"
            :class="{ 'form-field__input--error': error }"
            @input="onMultiInput"
            @focus="onMultiFocus"
            @blur="onMultiBlur"
            @keydown.enter.prevent="
              multiCanAddNew
                ? addMultiValue(multiSearchText)
                : multiFilteredOptions.length === 1
                ? addMultiValue(multiFilteredOptions[0])
                : null
            "
          />
          <!-- Sugestões filtradas ou "+ Adicionar" para novos valores -->
          <ul v-if="showMultiSuggestions" class="form-field__suggestions">
            <li
              v-for="option in multiFilteredOptions"
              :key="option"
              @mousedown.prevent="addMultiValue(option)"
            >
              {{ option }}
            </li>
            <li
              v-if="multiCanAddNew"
              class="form-field__suggestion--new"
              @mousedown.prevent="addMultiValue(multiSearchText)"
            >
              + Adicionar "{{ multiSearchText }}"
            </li>
          </ul>
        </div>
        <!-- Tags selecionadas com botão × para remover -->
        <div v-if="localMultiValue.length" class="form-field__multiselect-tags">
          <span
            v-for="(val, idx) in localMultiValue"
            :key="idx"
            class="form-field__multiselect-tag"
          >
            {{ val }}
            <button
              type="button"
              class="form-field__multiselect-remove"
              @click="removeMultiValue(idx)"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <!-- INPUT PADRÃO: text, number, date, email, password, url -->
      <input
        v-else
        :id="fieldId"
        :type="inputType"
        v-model="localValue"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        :step="step"
        class="form-field__input"
        :class="{ 'form-field__input--error': error }"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>

    <!-- Mensagem de erro -->
    <span v-if="error" class="form-field__error">{{ error }}</span>
  </div>
</template>


<style scoped>
/* Container principal do campo */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Container com erro: fundo sutil avermelhado */
.form-field:has(.form-field__input--error) {
  background: #fef2f2;
  padding: 0.5rem;
  border-radius: 0.375rem;
  margin: -0.5rem;
}

/* Label do campo */
.form-field__label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Asterisco para campos obrigatórios */
.form-field__asterisk {
  color: #dc2626;
  font-weight: 700;
}

/* Wrapper do input - permite posicionamento relativo dos filhos */
.form-field__input-wrapper {
  position: relative;
}

/* Estilos base para inputs */
.form-field__input {
  border: 2px solid #878a8f;
  border-right: none;
  border-top: none;
  background: transparent;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s;
}

/* Estado: input em foco */
.form-field__input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(218, 147, 143, 0.1);
}

/* Estado: input em hover (mas não em foco) */
.form-field__input:hover:not(:focus) {
  border-color: #6b7280;
}

/* Estado: input com erro */
.form-field__input--error {
  border-color: #dc2626;
  border-right: 2px solid #dc2626;
  border-top: 2px solid #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

/* Estado: input com erro em foco */
.form-field__input--error:focus {
  border-color: #dc2626;
  border-right: 2px solid #dc2626;
  border-top: 2px solid #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

/* Select: esconde seta nativa e adiciona seta customizada */
.form-field__select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

/* Select com erro */
.form-field__select.form-field__input--error {
  border-color: #dc2626;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23dc2626' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}

/* Checkbox: tamanho e cor */
.form-field__checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--accent);
  cursor: pointer;
}

/* Mensagem de erro */
.form-field__error {
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Ícone de erro antes do texto */
.form-field__error::before {
  content: '⚠';
}

/* Wrapper do autocomplete (necessário para posicionamento das sugestões) */
.form-field__autocomplete {
  position: relative;
  width: 100%;
}

/* Lista de sugestões */
.form-field__suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0.375rem;
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

/* Item da lista de sugestões */
.form-field__suggestions li {
  padding: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

/* Item em hover */
.form-field__suggestions li:hover {
  background: #f3f4f6;
}

/* Primeiro item: borda superior arredondada */
.form-field__suggestions li:first-child {
  border-radius: 0.375rem 0.375rem 0 0;
}

/* Último item: borda inferior arredondada */
.form-field__suggestions li:last-child {
  border-radius: 0 0 0.375rem 0.375rem;
}

/* MULTI-SELECT (Tags) — container e pills */
.form-field__multiselect {
  position: relative;
  width: 100%;
}
.form-field__multiselect-input-wrapper {
  position: relative;
}
.form-field__multiselect-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
/* Cada tag selecionada */
.form-field__multiselect-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  background: var(--accent_muted);
  border: 1px solid var(--accent3);
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--black);
  line-height: 1.4;
}
/* Botão × para remover tag */
.form-field__multiselect-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  font-size: 1.1rem;
  line-height: 1;
  padding: 0 0 0 0.125rem;
  margin: 0;
  transition: color 0.15s;
  border-radius: 0;
  transform: none;
}
.form-field__multiselect-remove:hover {
  color: #dc2626;
}
/* Opção "+ Adicionar" no dropdown */
.form-field__suggestion--new {
  padding: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--accent4);
  font-style: italic;
  border-top: 1px dashed #d1d5db;
}
.form-field__suggestion--new:hover {
  background: #f3f4f6;
}
</style>
