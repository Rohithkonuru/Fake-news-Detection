import type { User } from '../types';

const TOKEN_KEY = 'truthlens_token';
const USER_KEY = 'truthlens_user';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setSession(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async register(username: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    this.setSession(data.access_token, data.user);
    return { token: data.access_token, user: data.user };
  },

  async login(emailOrUsername: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_or_username: emailOrUsername, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Invalid username/email or password');
    }
    const data = await res.json();
    this.setSession(data.access_token, data.user);
    return { token: data.access_token, user: data.user };
  },

  async fetchMe(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        this.clearSession();
        return null;
      }
      const user = await res.json();
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  },
};
