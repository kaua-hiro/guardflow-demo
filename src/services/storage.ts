/** Thin localStorage wrapper so app state survives a page refresh — this is
 * a client-only demo with no backend, but the product should still feel
 * persistent within a browser session. */

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable (private mode) — fail silently, state
    // just won't persist across reloads.
  }
}

export function clearAppState(keys: string[]): void {
  for (const key of keys) localStorage.removeItem(key);
}

export const STORAGE_KEYS = {
  grants: "guardflow.grants",
  checklist: "guardflow.checklist",
  policy: "guardflow.policy",
  auditLog: "guardflow.auditLog",
} as const;
