// Pinia store de sessão — login/saída/visitante. Não guarda lista de usuários:
// o backend valida o email contra o workspace e o front não conhece essa lista.
import { defineStore } from 'pinia';
import { authApi } from '../services/api';
import { extractErrorMessage } from '@/utils/errorHandler';

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
    userActive: null,
    error: null,
    isGuest: false,
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => state.token !== null,
  },

  actions: {
    // Autentica no backend: email + código de acesso → token de sessão
    async login({ email, codigo }) {
      this.error = null;

      try {
        const { data } = await authApi.login({ email, codigo });

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

    // Revalida o token guardado contra o /me no boot; só 401 derruba a sessão
    // (rede/timeout/5xx não provam nada sobre o token, então mantêm o login)
    async validateSession() {
      if (!this.token) return true;

      try {
        await authApi.me({ timeout: 5000 });
        return true;
      } catch (erro) {
        if (erro.response?.status === 401) {
          this.logout();
          return false;
        }
        return true;
      }
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
