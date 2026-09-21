<script setup>
// Componente de campo de formulário — suporta text, number, select, checkbox, autocomplete e multi-select
import { computed, ref } from 'vue';

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
});

// Eventos emitidos para o pai (v-model)
const emit = defineEmits(['update:modelValue']);

// Estados reativos
const show_suggestions = ref(false);
const input_ref = ref(null);
const multi_search_text = ref('');
const show_multi_suggestions = ref(false);
const multi_input_ref = ref(null);

// Ponte entre v-model do pai e o input (text, number, select, checkbox)
const local_value = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
// Ponte entre v-model do pai e as tags (multi-select usa array)
const local_multi_value = computed({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: (value) => emit('update:modelValue', value),
});

// ID único para associar o <label> ao <input>
const field_id = computed(() => `field-${Math.random().toString(36).substr(2, 9)}`);

// Converte o type do Vue para o atributo type do HTML (ex: "number" → number)
const input_type = computed(() => {
  switch (props.type) {
    case 'number':
      return 'number';
    case 'email':
      return 'email';
    case 'date':
      return 'date';
    case 'password':
      return 'password';
    case 'url':
      return 'url';
    default:
      return 'text';
  }
});

// Filtra as opções conforme o texto digitado (máx 10 resultados)
const filtered_options = computed(() => {
  if (!props.options?.length || !local_value.value) return [];

  const search = String(local_value.value).toLowerCase();
  return props.options.filter((opt) => String(opt).toLowerCase().includes(search)).slice(0, 10);
});

// Filtra as opções do multi-select, excluindo as já selecionadas
const multi_filtered_options = computed(() => {
  if (!props.options?.length || !multi_search_text.value) return [];
  const search = multi_search_text.value.toLowerCase();
  const selected_lower = local_multi_value.value.map((v) => String(v).toLowerCase());
  return props.options
    .filter((opt) => {
      const opt_str = String(opt).toLowerCase();
      return opt_str.includes(search) && !selected_lower.includes(opt_str);
    })
    .slice(0, 10);
});

// Mostra "+ Adicionar" apenas se o texto não existe nas opções e não foi selecionado
const multi_can_add_new = computed(() => {
  if (!multi_search_text.value) return false;
  const trimmed = multi_search_text.value.trim();
  if (!trimmed) return false;
  if (multi_filtered_options.value.length > 0) return false;
  const already_selected = local_multi_value.value.some(
    (val) => String(val).toLowerCase() === trimmed.toLowerCase(),
  );
  return !already_selected;
});

// Métodos

// Seleciona uma sugestão e preenche o input
const select_suggestion = (option) => {
  local_value.value = option;
  show_suggestions.value = false;
};

// Mostra o dropdown ao focar o input com opções disponíveis
const on_input_focus = () => {
  if (props.options?.length) show_suggestions.value = true;
};

// Mostra o dropdown quando o usuário digita no multi-select
const on_multi_input = () => {
  show_multi_suggestions.value = multi_search_text.value.length > 0;
};

// Adiciona um valor à lista, ignorando duplicatas (case-insensitive)
const add_multi_value = (val) => {
  const trimmed = val.trim();
  if (!trimmed) return;

  const search_lower = trimmed.toLowerCase();
  const already_selected = local_multi_value.value.some(
    (v) => String(v).toLowerCase() === search_lower,
  );
  if (already_selected) {
    multi_search_text.value = '';
    show_multi_suggestions.value = false;
    return;
  }
  local_multi_value.value = [...local_multi_value.value, trimmed];
  multi_search_text.value = '';
  show_multi_suggestions.value = false;
  multi_input_ref.value?.focus();
};

// Remove um valor da lista pelo índice
const remove_multi_value = (index) => {
  local_multi_value.value = local_multi_value.value.filter((_, i) => i !== index);
};

// Mostra o dropdown ao focar no input do multi-select
const on_multi_focus = () => {
  if (props.options?.length) show_multi_suggestions.value = true;
};

// Esconde o dropdown com delay para permitir clique na opção
const on_multi_blur = () => {
  setTimeout(() => (show_multi_suggestions.value = false), 200);
};
</script>

<template>
  <div class="form-field" :class="{ 'form-field--required': required }">
    <!-- Label do campo -->
    <label :for="field_id" class="form-field__label">
      {{ label }}
      <!-- Asterisco para campos obrigatórios -->
      <span v-if="required" class="form-field__asterisk">*</span>
    </label>

    <div class="form-field__input-wrapper">
      <!-- SELECT: Dropdown com opções pré-definidas -->
      <div v-if="type === 'select'" class="select_wrapper">
        <select
          :id="field_id"
          v-model="local_value"
          class="form-field__input form-field__select"
          :class="{ 'form-field__input--error': error }"
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <option value="" disabled>{{ placeholder || 'Selecione uma opção' }}</option>

          <option v-for="option in options" :key="option" :value="option">
            {{ labels ? labels[option] : option }}
          </option>
        </select>
      </div>

      <!-- CHECKBOX: Caixa de seleção -->
      <input
        v-else-if="type === 'checkbox'"
        :id="field_id"
        type="checkbox"
        v-model="local_value"
        class="form-field__checkbox"
        @change="$emit('update:modelValue', $event.target.checked)"
      />

      <!-- AUTOCOMPLETE: Input com sugestões enquanto digita -->
      <div v-else-if="type === 'autocomplete'" class="form-field__autocomplete">
        <input
          ref="input_ref"
          :id="field_id"
          :type="input_type"
          v-model="local_value"
          :placeholder="placeholder"
          :min="min"
          :max="max"
          :step="step"
          class="form-field__input"
          :class="{ 'form-field__input--error': error }"
          @input="$emit('update:modelValue', $event.target.value)"
          @focus="on_input_focus"
          @blur="onInputBlur"
        />

        <!-- Lista de sugestões (aparece quando há opções filtradas) -->
        <ul v-if="show_suggestions && filtered_options.length" class="form-field__suggestions">
          <li
            v-for="option in filtered_options"
            :key="option"
            @mousedown.prevent="select_suggestion(option)"
          >
            {{ option }}
          </li>
        </ul>
      </div>

      <!-- MULTI-SELECT: Input + dropdown + tags removíveis -->
      <div v-else-if="type === 'multi-select'" class="form-field__multiselect">
        <div class="form-field__multiselect-input-wrapper">
          <input
            ref="multi_input_ref"
            :id="field_id"
            type="text"
            v-model="multi_search_text"
            :placeholder="placeholder"
            class="form-field__input"
            :class="{ 'form-field__input--error': error }"
            @input="on_multi_input"
            @focus="on_multi_focus"
            @blur="on_multi_blur"
            @keydown.enter.prevent="
              multi_can_add_new
                ? add_multi_value(multi_search_text)
                : multi_filtered_options.length === 1
                  ? add_multi_value(multi_filtered_options[0])
                  : null
            "
          />
          <!-- Sugestões filtradas ou "+ Adicionar" para novos valores -->
          <ul v-if="show_multi_suggestions" class="form-field__suggestions">
            <li
              v-for="option in multi_filtered_options"
              :key="option"
              @mousedown.prevent="add_multi_value(option)"
            >
              {{ option }}
            </li>
            <li
              v-if="multi_can_add_new"
              class="form-field__suggestion--new"
              @mousedown.prevent="add_multi_value(multi_search_text)"
            >
              + Adicionar "{{ multi_search_text }}"
            </li>
          </ul>
        </div>
        <!-- Tags selecionadas com botão × para remover -->
        <div v-if="local_multi_value.length" class="form-field__multiselect-tags">
          <span
            v-for="(val, idx) in local_multi_value"
            :key="idx"
            class="form-field__multiselect-tag"
          >
            {{ val }}
            <button
              type="button"
              class="form-field__multiselect-remove"
              @click="remove_multi_value(idx)"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <!-- INPUT PADRÃO: text, number, date, email, password, url -->
      <input
        v-else
        :id="field_id"
        :type="input_type"
        v-model="local_value"
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
  color: var(--danger);
  font-weight: 700;
}

/* Wrapper do input - permite posicionamento relativo dos filhos */
.form-field__input-wrapper {
  position: relative;
}

/* Estilos base para inputs */
/* .form-field__input {
  border-right: none;
  border-top: none;
  background: transparent;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s;
} */

/* Estado: input em foco */
/* .form-field__input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(218, 147, 143, 0.1);
} */

/* Estado: input com erro */
.form-field__input--error {
  border-color: var(--danger);
  border-right: 2px solid var(--danger);
  border-top: 2px solid var(--danger);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

/* Estado: input com erro em foco */
.form-field__input--error:focus {
  border-color: var(--danger);
  border-right: 2px solid var(--danger);
  border-top: 2px solid var(--danger);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

/* Select: cursor pointer */
.form-field__select {
  cursor: pointer;
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
  color: var(--danger);
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
  background: var(--white);
  border-radius: var(--radius);
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
  color: var(--danger);
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
