import { useState, useEffect } from "react";
import { lsGet, lsSet } from "../lib/storage.js";
import { inp } from "../constants/styles.js";

export default function CollectionsModal({ promptId, promptTitle, currentUser, onClose, showToast }) {
  const [cols,    setCols]    = useState({});
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  const key = `ptn_cols_${currentUser.id}`;

  useEffect(() => {
    setCols(lsGet(key) || {});
    setLoading(false);
  }, []);

  const save = (updated) => { setCols(updated); lsSet(key, updated); };

  const createCol = () => {
    if (!newName.trim()) return;
    const id = `col_${Date.now()}`;
    save({ ...cols, [id]: { name: newName.trim(), promptIds: [], createdAt: Date.now() } });
    setNewName("");
    showToast("📁 Collection bana di!");
  };

  const togglePrompt = (colId) => {
    const col = cols[colId];
    const has = col.promptIds.includes(promptId);
    save({ ...cols, [colId]: { ...col, promptIds: has ? col.promptIds.filter(id => id !== promptId) : [...col.promptIds, promptId] } });
    showToast(has ? "Removed from collection" : `✓ Added to "${col.name}"`);
  };

  const deleteCol = (colId) => {
    const { [colId]: _, ...rest } = cols;
    save(rest);
    showToast("🗑 Collection delete ho gayi.");
  };

  return (
    <div onClick={e => e.stopPropagation()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 600, padding: 20, backdropFilter: "blur(8px)",
      }}>
      <div style={{
        background: "#0f0f1a", border: "1px solid rgba(167,139,250,0.2)",
        borderRadius: 20, padding: 24, width: "100%", maxWidth: 380,
        boxShadow: "0 24px 80px rgba(0,0,0,0.8)", animation: "fadeUp 0.2s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
            📁 Save to Collection
          </h3>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "5px 9px", color: "#6b7280", cursor: "pointer", fontSize: 14,
          }}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: "#4a4a6a", marginBottom: 16 }}>"{promptTitle}"</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input placeholder="Nayi collection ka naam..."
            value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createCol()}
            style={{ ...inp, flex: 1, fontSize: 13, padding: "9px 12px" }} />
          <button onClick={createCol} disabled={!newName.trim()} style={{
            background: "linear-gradient(135deg,#6d28d9,#a78bfa)", border: "none",
            borderRadius: 10, padding: "9px 14px", color: "#fff",
            fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: !newName.trim() ? 0.4 : 1,
          }}>+ New</button>
        </div>

        {loading ? (
          <p style={{ color: "#3a3a5a", fontSize: 13 }}>Loading...</p>
        ) : Object.keys(cols).length === 0 ? (
          <p style={{ color: "#2a2a3a", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            Koi collection nahi hai abhi. Upar se banao! 👆
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {Object.entries(cols).map(([colId, col]) => {
              const has = col.promptIds.includes(promptId);
              return (
                <div key={colId}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${has ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 12, padding: "10px 14px", cursor: "pointer", transition: "all 0.15s",
                  }}
                  onClick={() => togglePrompt(colId)}>
                  <span style={{ fontSize: 18 }}>{has ? "📂" : "📁"}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: has ? "#a78bfa" : "#e2e8f0" }}>{col.name}</p>
                    <p style={{ fontSize: 11, color: "#3a3a5a" }}>{col.promptIds.length} prompts</p>
                  </div>
                  {has && <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700 }}>✓ Added</span>}
                  <button onClick={e => { e.stopPropagation(); deleteCol(colId); }}
                    style={{ background: "none", border: "none", color: "#2a2a4a", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>
                    🗑
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
