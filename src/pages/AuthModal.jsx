import { useState } from "react";
import { fsGet, fsSet } from "../lib/firebase.js";
import { lsSet } from "../lib/storage.js";
import { sha256, checkLockout, recordAttempt, MAX_ATTEMPTS } from "../lib/security.js";
import { inp } from "../constants/styles.js";

export default function AuthModal({ onClose, onSuccess, showToast }) {
  const [tab,  setTab]  = useState("login");
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true); setErr("");
    if (tab === "login") {
      if (!form.username || !form.password) { setErr("All fields required"); setBusy(false); return; }
      const lockKey = `ptn_lk_${form.username.toLowerCase()}`;
      const lock = checkLockout(lockKey);
      if (lock.locked) { setErr(`Too many attempts. Try after ${lock.mins} min.`); setBusy(false); return; }
      const users  = await fsGet("users") || {};
      const hashed = await sha256(form.password);
      const user   = Object.values(users).find(u =>
        u.username.toLowerCase() === form.username.toLowerCase() && u.passwordHash === hashed);
      if (!user) {
        recordAttempt(lockKey, false);
        const lock2 = checkLockout(lockKey);
        setErr(lock2.locked
          ? `Too many attempts! Locked for ${lock2.mins} min.`
          : `Wrong username or password. ${MAX_ATTEMPTS - lock2.attempts} attempts left.`);
        setBusy(false); return;
      }
      recordAttempt(lockKey, true);
      lsSet("ptn_session", { userId: user.id, at: Date.now() });
      onSuccess(user);
    } else {
      if (!form.name || !form.username || !form.password) { setErr("All fields required"); setBusy(false); return; }
      if (form.password.length < 8) { setErr("Password: min 8 characters"); setBusy(false); return; }
      if (!/^[a-zA-Z0-9_]+$/.test(form.username)) { setErr("Username: letters, numbers & _ only"); setBusy(false); return; }
      const users = await fsGet("users") || {};
      if (Object.values(users).some(u => u.username.toLowerCase() === form.username.toLowerCase())) {
        setErr("Username already taken"); setBusy(false); return;
      }
      const id     = `u_${Date.now()}`;
      const hashed = await sha256(form.password);
      const user   = { id, name: form.name.trim(), username: form.username.trim(), passwordHash: hashed, createdAt: Date.now() };
      await fsSet("users", { ...users, [id]: user });
      lsSet("ptn_session", { userId: id, at: Date.now() });
      showToast("✓ Welcome to Promptonic! 🎉");
      onSuccess(user);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 500, padding: 20, backdropFilter: "blur(10px)",
    }}>
      <div style={{
        background: "#0f0f1a", border: "1px solid rgba(167,139,250,0.2)",
        borderRadius: 20, padding: 28, width: "100%", maxWidth: 400,
        boxShadow: "0 24px 80px rgba(0,0,0,0.8)", animation: "fadeUp 0.2s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{
              fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800,
              background: "linear-gradient(135deg,#fff,#a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 2,
            }}>Promptonic</h2>
            <p style={{ fontSize: 12, color: "#4a4a6a" }}>
              {tab === "login" ? "Welcome back!" : "Free forever — join now"}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "6px 10px", color: "#6b7280", cursor: "pointer", fontSize: 15,
          }}>✕</button>
        </div>

        <div style={{
          display: "flex", gap: 6, marginBottom: 20, padding: 4,
          background: "rgba(255,255,255,0.03)", borderRadius: 10,
        }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setErr(""); }} style={{
              flex: 1, background: tab === t ? "rgba(109,40,217,0.8)" : "transparent",
              border: "none", borderRadius: 7, padding: "9px",
              color: tab === t ? "#fff" : "#6b7280", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>{t === "login" ? "Sign In" : "Register"}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tab === "register" && (
            <input placeholder="Your name" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp} />
          )}
          <input placeholder="Username" value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))} style={inp} />
          <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && go()} style={inp} />
          {err && <p style={{ fontSize: 12, color: "#f87171" }}>⚠️ {err}</p>}
          <button onClick={go} disabled={busy} style={{
            background: "linear-gradient(135deg,#6d28d9,#a78bfa)", border: "none",
            borderRadius: 10, padding: "13px", color: "#fff", fontWeight: 700, fontSize: 14,
            cursor: "pointer", marginTop: 4, opacity: busy ? 0.6 : 1,
          }}>
            {busy ? "..." : (tab === "login" ? "Sign In →" : "Create Account →")}
          </button>
        </div>
      </div>
    </div>
  );
}
