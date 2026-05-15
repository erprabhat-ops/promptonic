import { useState } from "react";
import { CATS } from "../constants/index.js";
import { cc } from "../lib/utils.js";
import { lsGet, lsSet } from "../lib/storage.js";

export default function ProfilePage({ user, allPrompts, userLikedIds, onLogout, onBack, onViewCreator }) {
  const myPosts = allPrompts.filter(p => p.submittedBy === user.id && p.approved);
  const mySaved = allPrompts.filter(p => p.approved && userLikedIds.includes(p.id));
  const [tab, setTab] = useState("saved");
  const colKey = `ptn_cols_${user.id}`;
  const [cols, setCols] = useState(() => lsGet(colKey) || {});
  const colList = Object.values(cols).sort((a, b) => b.createdAt - a.createdAt);
  const list = tab === "saved" ? mySaved : tab === "posts" ? myPosts : [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 80px" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: "#6b7280",
        cursor: "pointer", fontSize: 13, marginBottom: 24,
        display: "flex", alignItems: "center", gap: 6,
      }}>← Back to Promptonic</button>

      {/* Profile card */}
      <div style={{
        background: "#111118", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20, padding: 28, marginBottom: 24,
      }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, flexShrink: 0,
            background: "linear-gradient(135deg,#6d28d9,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, color: "#fff",
            boxShadow: "0 8px 24px rgba(109,40,217,0.35)",
          }}>{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>
              {user.name}
            </h2>
            <p style={{ fontSize: 13, color: "#4a4a6a" }}>@{user.username}</p>
          </div>
          <div style={{ display: "flex", gap: 16, marginLeft: "auto" }}>
            {[["Posts", myPosts.length, "#a78bfa"], ["Saved", mySaved.length, "#f472b6"]].map(([l, v, clr]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: clr }}>{v}</p>
                <p style={{ fontSize: 11, color: "#4a4a6a" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onLogout} style={{
          marginTop: 20, background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10,
          padding: "9px 18px", color: "#6b7280", fontSize: 12, cursor: "pointer",
        }}>Sign Out</button>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20, padding: 4,
        background: "rgba(255,255,255,0.03)", borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.05)",
      }}>
        {[["saved", "❤️ Saved", mySaved.length], ["posts", "📂 Posts", myPosts.length], ["cols", "📁 Collections", colList.length]].map(([id, lbl, n]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, background: tab === id ? "rgba(109,40,217,0.8)" : "transparent",
            border: "none", borderRadius: 8, padding: "9px 4px",
            color: tab === id ? "#fff" : "#6b7280", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>{lbl} ({n})</button>
        ))}
      </div>

      {/* Collections tab */}
      {tab === "cols" && (
        colList.length === 0
          ? <div style={{ textAlign: "center", padding: "50px 20px", color: "#2a2a3a" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
              <p>Koi collection nahi abhi tak.<br />Prompt expand karke "Save to Collection" karo!</p>
            </div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {colList.map(col => {
                const colPrompts = allPrompts.filter(p => p.approved && col.promptIds.includes(p.id));
                return (
                  <div key={col.name} style={{
                    background: "#111118", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: 18,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>
                          📁 {col.name}
                        </h4>
                        <p style={{ fontSize: 11, color: "#4a4a6a" }}>{colPrompts.length} prompts</p>
                      </div>
                      <button onClick={() => {
                        const updated = { ...cols };
                        const colId = Object.keys(cols).find(k => cols[k].name === col.name);
                        delete updated[colId];
                        setCols(updated); lsSet(colKey, updated);
                      }} style={{ background: "transparent", border: "none", color: "#3a3a5a", cursor: "pointer", fontSize: 13 }}>🗑</button>
                    </div>
                    {colPrompts.length === 0
                      ? <p style={{ fontSize: 12, color: "#2a2a3a" }}>Collection khali hai.</p>
                      : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {colPrompts.slice(0, 3).map(p => {
                            const color = cc(p.category);
                            return (
                              <div key={p.id} style={{
                                display: "flex", gap: 10, alignItems: "center",
                                padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 10,
                              }}>
                                <span style={{
                                  background: `${color}15`, border: `1px solid ${color}35`,
                                  color, borderRadius: 20, padding: "1px 8px",
                                  fontSize: 10, fontWeight: 700, flexShrink: 0,
                                }}>{CATS.find(c => c.id === p.category)?.emoji}</span>
                                <span style={{
                                  fontSize: 13, color: "#94a3b8", flex: 1,
                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>{p.title}</span>
                                <button onClick={() => navigator.clipboard.writeText(p.prompt)} style={{
                                  background: "rgba(109,40,217,0.6)", border: "none", borderRadius: 6,
                                  padding: "4px 10px", color: "#fff", fontSize: 10, fontWeight: 700,
                                  cursor: "pointer", flexShrink: 0,
                                }}>Copy</button>
                              </div>
                            );
                          })}
                          {colPrompts.length > 3 && (
                            <p style={{ fontSize: 11, color: "#3a3a5a", textAlign: "center" }}>
                              +{colPrompts.length - 3} more prompts
                            </p>
                          )}
                        </div>
                    }
                  </div>
                );
              })}
            </div>
      )}

      {/* Saved / Posts tab */}
      {(tab === "saved" || tab === "posts") && (
        list.length === 0
          ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#2a2a3a" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{tab === "saved" ? "❤️" : "📂"}</div>
              <p style={{ fontSize: 14 }}>
                {tab === "saved" ? "Like prompts to save them here." : "Submit your first prompt!"}
              </p>
            </div>
          : <div className="prompt-grid">
              {list.map(p => {
                const color = cc(p.category);
                const cat = CATS.find(c => c.id === p.category);
                return (
                  <div key={p.id} style={{
                    background: "#111118", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, overflow: "hidden",
                  }}>
                    {p.previewUrl && (
                      <img src={p.previewUrl} alt={p.title}
                        style={{ width: "100%", height: 110, objectFit: "cover", display: "block", filter: "brightness(0.6)" }}
                        onError={e => e.target.style.display = "none"} />
                    )}
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span style={{
                          background: `${color}15`, border: `1px solid ${color}35`,
                          color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700,
                        }}>{cat?.emoji} {p.category}</span>
                      </div>
                      <h4 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                        {p.title}
                      </h4>
                      <p style={{
                        fontSize: 12, color: "#4a4a6a", lineHeight: 1.5, marginBottom: 12,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>{p.prompt}</p>
                      <button onClick={() => navigator.clipboard.writeText(p.prompt)} style={{
                        background: "rgba(109,40,217,0.7)", border: "none", borderRadius: 8,
                        padding: "7px 14px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer",
                      }}>📋 Copy</button>
                    </div>
                  </div>
                );
              })}
            </div>
      )}
    </div>
  );
}
