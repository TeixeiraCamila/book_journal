// Pinia store de usuários — gerencia sessão (login/saída/visitante) e lista de usuários
import { defineStore } from 'pinia';
import { userAPI, authAPI } from '../services/api';
import { extractErrorMessage, logError } from '@/utils/errorHandler';

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

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    userActive: null,
    loading: false,
    error: null,
    isGuest: false,
    token: null,
  }),

  getters: {
    allUsers: (state) => state.users,

    isAuthenticated: (state) => state.token !== null,

    getUserById: (state) => (userId) => {
      return state.users.find((user) => user.id === userId);
    },

    getUsersByType: (state) => (type) => {
      return state.users.filter((user) => user.type === type);
    },
  },

  actions: {
    async fetchUsers(startCursor = undefined, pageSize = 100) {
      this.loading = true;
      this.error = null;

      try {
        const response = await userAPI.list({ startCursor, pageSize });
        this.users = response.data.results;

        return response.data;
      } catch (error) {
        logError('fetchUsers', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAllUsers() {
      this.loading = true;
      this.error = null;

      try {
        const response = await userAPI.listAll();
        this.users = response.data.results || response.data || [];

        return this.users;
      } catch (error) {
        logError('fetchAllUsers', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser(userId) {
      if (!userId) {
        throw new Error('User ID is required');
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await userAPI.getById(userId);
        const data = response.data;

        const index = this.users.findIndex((u) => u.id === userId);
        if (index !== -1) {
          this.users[index] = data;
        } else {
          this.users.push(data);
        }

        return data;
      } catch (error) {
        logError('fetchUser', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Autentica no backend: email/nome + código de acesso → token de sessão
    async login({ email, codigo }) {
      this.error = null;

      try {
        const { data } = await authAPI.login({ email, codigo });

        this.token = data.token;
        this.userActive = data.user;
        this.isGuest = false;

        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        localStorage.removeItem(STORAGE_KEYS.GUEST);

        return data.user;
      } catch (error) {
        // Mensagem específica do backend (ex: "O código não confere.")
        this.error = error.response?.data?.message || extractErrorMessage(error);
        throw error;
      }
    },

    // Restaura a sessão persistida (token ou modo visitante)
    loadSession() {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (token && storedUser) {
        try {
          this.token = token;
          this.userActive = JSON.parse(storedUser);
          this.isGuest = false;
          return true;
        } catch {
          this.logout();
        }
      }

      if (localStorage.getItem(STORAGE_KEYS.GUEST) === 'true') {
        this.setGuestUser();
        return true;
      }

      return false;
    },

    // Modo visitante: acesso de leitura sem conta
    setGuestUser() {
      this.userActive = { ...GUEST_USER };
      this.isGuest = true;
      this.token = null;

      localStorage.setItem(STORAGE_KEYS.GUEST, 'true');
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    },

    // Encerra a sessão (login ou visitante) e limpa o armazenamento
    logout() {
      this.token = null;
      this.userActive = null;
      this.isGuest = false;

      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.GUEST);
    },
  },
});