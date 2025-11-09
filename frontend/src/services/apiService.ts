// frontend/src/services/apiService.ts
/**
 * API Service - Communication avec le backend FastAPI
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface StackResponse {
  stack: number[];
  size: number;
}

interface MessageResponse {
  message: string;
}

interface ErrorResponse {
  detail: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let msg = 'API request failed';
      try {
        const error: ErrorResponse = await response.json();
        msg = error?.detail || msg;
      } catch {
        // pas de body JSON
      }
      throw new Error(msg);
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : ({} as T));
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
    return this.request<MessageResponse>('/api/v1/stack', {
      method: 'DELETE',
    });
  }

  // ----- Opérations de base -----
  op(operation: 'add' | 'sub' | 'mul' | 'div'): Promise<StackResponse> {
    return this.request<StackResponse>(`/api/v1/op/${operation}`, { method: 'POST' });
  }

  // ----- Opérations avancées (compat 'pow' & 'power') -----
  adv(operation: 'sqrt' | 'power' | 'pow' | 'swap' | 'dup' | 'drop'): Promise<StackResponse> {
    return this.request<StackResponse>(`/api/v1/op/${operation}`, { method: 'POST' });
  }
}

export const apiService = new ApiService();
export type { StackResponse };
