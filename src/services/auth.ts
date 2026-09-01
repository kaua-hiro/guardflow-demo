import type { AppUser } from "../types";

/**
 * Mock authentication layer. There is no backend: sessions live in
 * localStorage, mirroring the pattern used across this portfolio's other
 * demos (e.g. Ledger). Good enough to demonstrate the product flow
 * (credentials -> 2FA -> session) without standing up real auth infra.
 */

const SESSION_KEY = "guardflow.session";
const DEMO_EMAIL = "kaua@guardflow.demo";
const DEMO_PASSWORD = "guardflow123";

export function attemptLogin(email: string, password: string): { ok: boolean; error?: string } {
  if (!email || !password) {
    return { ok: false, error: "Informe e-mail e senha." };
  }
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return { ok: false, error: "Credenciais inválidas. Use as credenciais de demonstração exibidas abaixo." };
  }
  return { ok: true };
}

export function verifyTwoFactorCode(code: string): { ok: boolean; error?: string } {
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "O código precisa ter 6 dígitos." };
  }
  // Demo mode: any well-formed 6-digit code is accepted, matching how a
  // sandboxed product demo works without a real SMS/TOTP provider.
  return { ok: true };
}

export function createSession(): AppUser {
  const user: AppUser = {
    name: "Kauã Hiro Mizumoto",
    email: DEMO_EMAIL,
    role: "Compliance Administrator",
    company: "Nortis Tecnologia Ltda.",
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function getSession(): AppUser | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };
