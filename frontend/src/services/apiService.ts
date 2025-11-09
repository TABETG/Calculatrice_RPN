/**
 * Service API RPN — MODE DÉMO pour GitHub Pages (pas de backend).
 * - Sur github.io => exécution locale (pile en localStorage), aucune variable d'env.
 * - En local (localhost) => tu peux toujours viser http://localhost:8000 en changeant USE_DEMO ci-dessous.
 *
 * Si plus tard tu as un backend HTTPS public, remplace USE_DEMO par false et mets BACKEND_URL.
 */

export interface StackResponse { stack: number[]; size: number; }
interface MessageResponse { message: string; }
interface ErrorResponse { detail?: string; }

/** -------- Réglages -------- */
const ON_GHPAGES = typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
const USE_DEMO = ON_GHPAGES;             // <= TEST sur GitHub Pages sans backend
const BACKEND_URL = "http://localhost:8000"; // utilisé si USE_DEMO === false en dev local

/** -------- Implémentation réseau (si backend) -------- */
class ApiHttp {
  private base = BACKEND_URL.replace(/\/+$/, "");

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (location.protocol === "https:" && this.base.startsWith("http://")) {
      throw new Error("Backend non-HTTPS : la page HTTPS bloque les appels HTTP");
    }
    const url = `${this.base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

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

/** -------- Implémentation démo (localStorage, même contrat) -------- */
class ApiDemo {
  private KEY = "rpn_stack_v1";

  private read(): number[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.map(Number).filter(Number.isFinite) : [];
    } catch { return []; }
  }
  private write(s: number[]) { localStorage.setItem(this.KEY, JSON.stringify(s)); }
  private state(): StackResponse { const s = this.read(); return { stack: s, size: s.length }; }
  private need(n: number) { const s = this.read(); if (s.length < n) throw new Error("Stack underflow"); return s; }

  async getStack(): Promise<StackResponse> { return this.state(); }
  async pushValue(value: number): Promise<StackResponse> {
    const s = this.read(); s.push(value); this.write(s); return this.state();
  }
  async clearStack(): Promise<MessageResponse> { this.write([]); return { message: "cleared" }; }
  async op(operation: "add"|"sub"|"mul"|"div"): Promise<StackResponse> {
    const s = this.need(2); const b = s.pop()!, a = s.pop()!; let r: number;
    switch (operation) {
      case "add": r = a + b; break;
      case "sub": r = a - b; break;
      case "mul": r = a * b; break;
      case "div": if (b === 0) throw new Error("Division par zéro"); r = a / b; break;
      default: throw new Error("Opération inconnue");
    }
    s.push(r); this.write(s); return this.state();
  }
  async adv(operation: "sqrt"|"power"|"pow"|"swap"|"dup"|"drop"): Promise<StackResponse> {
    const s = this.read();
    switch (operation) {
      case "sqrt": if (s.length < 1) throw new Error("Stack underflow"); {
        const x = s.pop()!; if (x < 0) throw new Error("Racine de nombre négatif"); s.push(Math.sqrt(x)); } break;
      case "power":
      case "pow": if (s.length < 2) throw new Error("Stack underflow"); {
        const exp = s.pop()!, base = s.pop()!; s.push(Math.pow(base, exp)); } break;
      case "swap": if (s.length < 2) throw new Error("Stack underflow"); {
        const a = s.pop()!, b = s.pop()!; s.push(a, b); } break;
      case "dup": if (s.length < 1) throw new Error("Stack underflow"); { s.push(s[s.length - 1]); } break;
      case "drop": if (s.length < 1) throw new Error("Stack underflow"); { s.pop(); } break;
      default: throw new Error("Opération avancée inconnue");
    }
    this.write(s); return this.state();
  }
}

/** -------- Export -------- */
const impl = USE_DEMO ? new ApiDemo() : new ApiHttp();
export const apiService = {
  getStack: () => impl.getStack(),
  pushValue: (v: number) => impl.pushValue(v),
  clearStack: () => impl.clearStack(),
  op: (op: "add"|"sub"|"mul"|"div") => impl.op(op),
  adv: (op: "sqrt"|"power"|"pow"|"swap"|"dup"|"drop") => impl.adv(op),
};
export type { StackResponse };
