/**
 * API Service - Communication avec le backend FastAPI
 * En prod (github.io), VITE_API_URL doit être défini (ex: https://rpn-api.onrender.com)
 */
const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';
// retire le slash final si présent
const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

export interface StackResponse {
  stack: number[];
  size: number;
}

interface MessageResponse {
  message: string;
}

interface ErrorResponse {
  detail?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // sécurité: VITE_API_URL obligatoire en prod
    if (location.hostname.endsWith('github.io') && !import.meta.env.VITE_API_URL) {
      throw new Error('Configuration manquante: VITE_API_URL non défini en production');
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    // timeout pour éviter le spinner infini
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(url, {
      mode: 'cors',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
      ...options,
    }).catch((e) => {
      clearTimeout(timer);
      if (e.name === 'AbortError') throw new Error('API timeout');
      throw new Error('Connexion API échouée');
    });

    clearTimeout(timer);

    if (!res.ok) {
      // tente de lire un JSON {detail:"..."} sinon fallback
      try {
        const err: ErrorResponse = await res.json();
        throw new Error(err?.detail || res.statusText || 'API request failed');
      } catch {
        throw new Error(res.statusText || 'API request failed');
      }
    }

    // gère 204 / réponses vides
    const text = await res.text();
    return (text ? (JSON.parse(text) as T) : ({} as T));
  }

  // ----- Stack -----
  getStack(): Promise<StackResponse> {
    return this.request<StackResponse>('/api/v1/stack');
  }

  pushValue(value: number): Promise<StackResponse> {
    return this.request<StackResponse>('/api/v1/stack', {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  clearStack(): Promise<MessageResponse> {
    return this.request<MessageResponse>('/api/v1/stack', { method: 'DELETE' });
  }

  // ----- Opérations de base -----
  op(operation: 'add' | 'sub' | 'mul' | 'div'): Promise<StackResponse> {
    return this.request<StackResponse>(`/api/v1/op/${operation}`, { method: 'POST' });
  }

  // ----- Opérations avancées -----
  adv(operation: 'sqrt' | 'power' | 'pow' | 'swap' | 'dup' | 'drop'): Promise<StackResponse> {
    return this.request<StackResponse>(`/api/v1/op/${operation}`, { method: 'POST' });
  }
}

export const apiService = new ApiService();
export type { StackResponse };
