// Tipos de autenticação espelhados de docs/API.md (contrato de /auth/login e /auth/me)

// Usuário autenticado no backend; email e avatar_url só vêm no login, não no /me
export interface SessionUser {
  id: string;
  name: string;
  nivel: string;
  email?: string;
  avatar_url?: string;
}

export interface LoginResponse {
  token: string;
  user: SessionUser;
}

// Modo visitante: leitura sem conta; `type` distingue do SessionUser do backend
export interface GuestUser {
  id: 'guest';
  name: string;
  type: 'guest';
}
