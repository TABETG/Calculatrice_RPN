/**
 * API Service - NO MOCK
 * Requiert VITE_API_URL (ex: https://ton-backend.example.com)
 */
const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined);
if (location.hostname.endsWith("github.io") && !RAW_BASE) {
  throw new Error("Configuration manquante: VITE_API_URL non défini en production");
}
const API_BASE_URL = (RAW_BASE || "http://localhost:8000").replace(/\/+$/, "");

export interface StackResponse { stack: number[]; size: number; }
interface MessageResponse { message: string; }
interface ErrorResponse { detail?: string; }

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (location.protocol === "https:" && API_BASE_URL.startsWith("http://")) {
      throw new Error("Backend non-HTTPS : la page HTTPS bloque les appels HTTP");
    }
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    let res: Response;
    try {
      res = await fetch(url, {
        mode: "cors",
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        signal: controller.signal,
        ...options,
      });
    } catch (e: any) {
      clearTimeout(timer);
      if (e?.name === "AbortError") throw new Error("API timeout");
      throw new Error("Connexion API échouée");
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      try {
        const err: ErrorResponse = await res.json();
        throw new Error(err?.detail || `${res.status} ${res.statusText}` || "API request failed");
      } catch {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `${res.status} ${res.statusText}` || "API request failed");
      }
    }

    const text = await res.text();
    return (text ? (JSON.parse(text) as T) : ({} as T));
  }

  getStack(): Promise<StackResponse> { return this.request<StackResponse>("/api/v1/stack"); }
  pushValue(value: number): Promise<StackResponse> {
    return this.request<StackResponse>("/api/v1/stack", { method: "POST", body: JSON.stringify({ value }) });
  }
  clearStack(): Promise<MessageResponse> {
    return this.request<MessageResponse>("/api/v1/stack", { method: "DELETE" });
  }
  op(operation: "add"|"sub"|"mul"|"div"): Promise<StackResponse> {
    return this.request<StackResponse>(`/api/v1/op/${operation}`, { method: "POST" });
  }
  adv(operation: "sqrt"|"power"|"pow"|"swap"|"dup"|"drop"): Promise<StackResponse> {
    return this.request<StackResponse>(`/api/v1/op/${operation}`, { method: "POST" });
  }
}
export const apiService = new ApiService();
export type { StackResponse };
