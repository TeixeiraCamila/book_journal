// Pinia store de usuários — gerencia sessão (login/saída/visitante) e lista de usuários
import { defineStore } from 'pinia';
import { user_api, auth_api } from '../services/api';
import { extract_error_message, log_error } from '@/utils/errorHandler';

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
    users: [],
    user_active: null,
    loading: false,
    error: null,
    is_guest: false,
    token: null,
  }),

  getters: {
    all_users: (state) => state.users,

    is_authenticated: (state) => state.token !== null,

    get_user_by_id: (state) => (user_id) => {
      return state.users.find((user) => user.id === user_id);
    },

    get_users_by_type: (state) => (type) => {
      return state.users.filter((user) => user.type === type);
    },
  },

  actions: {
    async fetch_users(start_cursor = undefined, page_size = 100) {
      this.loading = true;
      this.error = null;

      try {
        const response = await user_api.list({
          startCursor: start_cursor,
          pageSize: page_size,
        });
        this.users = response.data.results;

        return response.data;
      } catch (error) {
        log_error('fetch_users', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetch_all_users() {
      this.loading = true;
      this.error = null;

      try {
        const response = await user_api.list_all();
        this.users = response.data.results || response.data || [];

        return this.users;
      } catch (error) {
        log_error('fetch_all_users', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetch_user(user_id) {
      if (!user_id) {
        throw new Error('User ID is required');
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await user_api.get_by_id(user_id);
        const data = response.data;

        const index = this.users.findIndex((u) => u.id === user_id);
        if (index !== -1) {
          this.users[index] = data;
        } else {
          this.users.push(data);
        }

        return data;
      } catch (error) {
        log_error('fetch_user', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Autentica no backend: email/nome + código de acesso → token de sessão
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
