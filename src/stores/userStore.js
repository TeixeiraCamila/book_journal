// Pinia store de sessão — login/saída/visitante. Não guarda lista de usuários:
// o backend valida o email contra o workspace e o front não conhece essa lista.
import { defineStore } from 'pinia';
import { auth_api } from '../services/api';
import { extract_error_message } from '@/utils/errorHandler';

const GUEST_USER = {
  id: 'guest',
  name: 'Visitante',
  type: 'guest',
};

const STORAGE_KEYS = {
  TOKEN: 'SESSION_TOKEN',
  USER: 'SESSION_USER',
  GUEST: 'IS_GUEST',
};

export const use_user_store = defineStore('user', {
  state: () => ({
    user_active: null,
    error: null,
    is_guest: false,
    token: null,
  }),

  getters: {
    is_authenticated: (state) => state.token !== null,
  },

  actions: {
    // Autentica no backend: email + código de acesso → token de sessão
    async login({ email, codigo }) {
      this.error = null;

      try {
        const { data } = await auth_api.login({ email, codigo });

        this.token = data.token;
        this.user_active = data.user;
        this.is_guest = false;

        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        localStorage.removeItem(STORAGE_KEYS.GUEST);

        return data.user;
      } catch (error) {
        // Mensagem específica do backend (ex: "O código não confere.")
        this.error = error.response?.data?.message || extract_error_message(error);
        throw error;
      }
    },

    // Restaura a sessão persistida (token ou modo visitante)
    load_session() {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const stored_user = localStorage.getItem(STORAGE_KEYS.USER);

      if (token && stored_user) {
        try {
          this.token = token;
          this.user_active = JSON.parse(stored_user);
          this.is_guest = false;
          return true;
        } catch {
          this.logout();
        }
      }

      if (localStorage.getItem(STORAGE_KEYS.GUEST) === 'true') {
        this.set_guest_user();
        return true;
      }

      return false;
    },

    // Modo visitante: acesso de leitura sem conta
    set_guest_user() {
      this.user_active = { ...GUEST_USER };
      this.is_guest = true;
      this.token = null;

      localStorage.setItem(STORAGE_KEYS.GUEST, 'true');
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    },

    // Encerra a sessão (login ou visitante) e limpa o armazenamento
    logout() {
      this.token = null;
      this.user_active = null;
      this.is_guest = false;

      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.GUEST);
    },
  },
});
