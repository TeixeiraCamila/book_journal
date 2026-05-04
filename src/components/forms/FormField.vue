<script setup>
import { computed, ref } from 'vue'

/**
 * =============================================================================
 * PROPS - Propriedades recebidas pelo componente
 * =============================================================================
 */

const props = defineProps({
  // Valor do campo (v-model)
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  // Rótulo do campo (label)
  label: {
    type: String,
    required: true
  },
  // Tipo do input: text, number, date, select, checkbox, autocomplete, email, password, url
  type: {
    type: String,
    default: 'text'
  },
  // Texto exibido quando campo está vazio
  placeholder: {
    type: String,
    default: ''
  },
  // Indica se campo é obrigatório (exibe asterisco)
  required: {
    type: Boolean,
    default: false
  },
  // Mensagem de erro a ser exibida
  error: {
    type: String,
    default: ''
  },
  // Array de opções para selects e autocomplete
  options: {
    type: Array,
    default: () => []
  },
  // Objeto com labels customizados para cada opção (key = valor, value = label exibido)
  // Ex: { '⭐⭐⭐⭐⭐': '5 Estrelas', '❤': 'Favorito' }
  labels: {
    type: Object,
    default: null
  },
  // Valor mínimo (para inputs numéricos)
  min: {
    type: [String, Number],
    default: undefined
  },
  // Valor máximo (para inputs numéricos)
  max: {
    type: [String, Number],
    default: undefined
  },
  // Incremento (para inputs numéricos)
  step: {
    type: [String, Number],
    default: undefined
  }
})

/**
 * =============================================================================
 * EMITS - Eventos emitidos pelo componente
 * =============================================================================
 */

// Emite evento update:modelValue para suporte a v-model
const emit = defineEmits(['update:modelValue'])


/**
 * =============================================================================
 * ESTADO REATIVO ( refs )
 * =============================================================================
 */

// Controla visibilidade da lista de sugestões (para autocomplete)
const showSuggestions = ref(false)
// Referência ao elemento input (para manipulação de foco)
const inputRef = ref(null)


/**
 * =============================================================================
 * COMPUTED PROPERTIES
 * =============================================================================
 */

// Conecta props.modelValue com emit (suporte a v-model)
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Gera ID único para cada campo (usado no label e input)
const fieldId = computed(() => `field-${Math.random().toString(36).substr(2, 9)}`)

// Mapeia tipo do Vue para tipo do HTML input
const inputType = computed(() => {
  switch (props.type) {
    case 'number':
      return 'number'
    case 'email':
      return 'email'
    case 'date':
      return 'date'
    case 'password':
      return 'password'
    case 'url':
      return 'url'
    case 'autocomplete':
      // Autocomplete usa tipo text internamente
      return 'text'
    default:
      return 'text'
  }
})

// Filtra opções do autocomplete baseadas no texto digitado
// Retorna máximo de 10 opções ordenadas
const filteredOptions = computed(() => {
  // Sem opções ou sem texto digitado = retorna vazio
  if (!props.options?.length || !localValue.value) return []

  const search = String(localValue.value).toLowerCase()

  return props.options.filter(opt =>
    String(opt).toLowerCase().includes(search)
  ).slice(0, 10)
})


/**
 * =============================================================================
 * MÉTODOS
 * =============================================================================

/**
 * Seleciona uma sugestão e preenche o input
 * @param {string} option - Opção selecionada
 */
const selectSuggestion = (option) => {
  localValue.value = option
  showSuggestions.value = false
}

/**
 * Handler para foco no input - mostra sugestões
 */
const onInputFocus = () => {
  if (props.options?.length) showSuggestions.value = true
}

/**
 * Handler para blur no input - esconde sugestões
 * Usa setTimeout para permitir click na sugestão antes de esconder
 */
const onInputBlur = () => {
  setTimeout(() => showSuggestions.value = false, 200)
};
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
      <select v-if="type === 'select'" :id="fieldId" v-model="localValue" class="form-field__input form-field__select"
        :class="{ 'form-field__input--error': error }" @change="$emit('update:modelValue', $event.target.value)">
        <option value="" disabled>{{ placeholder || 'Selecione uma opção' }}</option>

        <option v-for="option in options" :key="option" :value="option">
          {{ labels ? labels[option] : option }}
        </option>
      </select>


      <!-- CHECKBOX: Caixa de seleção -->
      <input v-else-if="type === 'checkbox'" :id="fieldId" type="checkbox" v-model="localValue"
        class="form-field__checkbox" @change="$emit('update:modelValue', $event.target.checked)" />

      <!-- AUTOCOMPLETE: Input com sugestões enquanto digita -->
      <div v-else-if="type === 'autocomplete'" class="form-field__autocomplete">
        <input ref="inputRef" :id="fieldId" :type="inputType" v-model="localValue" :placeholder="placeholder" :min="min"
          :max="max" :step="step" class="form-field__input" :class="{ 'form-field__input--error': error }"
          @input="$emit('update:modelValue', $event.target.value)" @focus="onInputFocus" @blur="onInputBlur" />

        <!-- Lista de sugestões (aparece quando há opções filtradas) -->
        <ul v-if="showSuggestions && filteredOptions.length" class="form-field__suggestions">
          <li v-for="option in filteredOptions" :key="option" @mousedown.prevent="selectSuggestion(option)">
            {{ option }}
          </li>
        </ul>
      </div>

      <!-- INPUT PADRÃO: text, number, date, email, password, url -->
      <input v-else :id="fieldId" :type="inputType" v-model="localValue" :placeholder="placeholder" :min="min"
        :max="max" :step="step" class="form-field__input" :class="{ 'form-field__input--error': error }"
        @input="$emit('update:modelValue', $event.target.value)" />
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
  /* posiciona abaixo do input */
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
</style>
