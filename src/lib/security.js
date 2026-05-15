import { lsGet, lsSet } from "./storage.js";

export const MAX_ATTEMPTS = 5;
export const LOCKOUT_MS   = 15 * 60 * 1000;

export const sha256 = async (str) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
};

export const checkLockout = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "{}");
    if (data.lockedUntil && Date.now() < data.lockedUntil) {
      const mins = Math.ceil((data.lockedUntil - Date.now()) / 60000);
      return { locked: true, mins };
    }
    return { locked: false, attempts: data.attempts || 0 };
  } catch {
    return { locked: false, attempts: 0 };
  }
};

export const recordAttempt = (key, success) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "{}");
    if (success) { localStorage.removeItem(key); return; }
    const attempts = (data.attempts || 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem(key, JSON.stringify({ attempts, lockedUntil: Date.now() + LOCKOUT_MS }));
    } else {
      localStorage.setItem(key, JSON.stringify({ attempts }));
    }
  } catch {}
};

const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000;
export const setAdminSession   = () => lsSet("ptn_admin_sess", { at: Date.now() });
export const checkAdminSession = () => {
  const s = lsGet("ptn_admin_sess");
  return s && (Date.now() - s.at) < ADMIN_SESSION_MS;
};
export const clearAdminSession = () => localStorage.removeItem("ptn_admin_sess");
