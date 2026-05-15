import { useState } from "react";
import { CATS, MODEL_CLR } from "../constants/index.js";
import { cc } from "../lib/utils.js";
import CommentsSection  from "./CommentsSection.jsx";
import StarRating       from "./StarRating.jsx";
import CollectionsModal from "./CollectionsModal.jsx";
import ShareBtn         from "./ShareBtn.jsx";

export default function PromptCard({ p, likes, userLiked, onLike, currentUser, onLoginRequired, showToast, onViewCreator }) {
  const [open,     setOpen]     = useState(false);
  const [imgErr,   setImgErr]   = useState(false);
  const [showCols, setShowCols] = useState(false);

  const hasImg     = p.previewUrl && !imgErr && (p.category === "image" || p.category === "video");
  const color      = cc(p.category);
  const cat        = CATS.find(c => c.id === p.category);
  const totalCopies = p.copies || 0;

  return (
    <div className="card" onClick={() => setOpen(o => !o)}
      style={{
        background: "#111118", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        animation: "fadeUp 0.3s ease",
        boxShadow: open
          ? "0 0 0 1px rgba(167,139,250,0.2),0 12px 40px rgba(0,0,0,0.4)"
          : "0 2px 8px rgba(0,0,0,0.3)",
      }}>

      {/* ── IMAGE / VIDEO PREVIEW ── */}
      {hasImg && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
          <img src={p.previewUrl} alt={p.title} onError={() => setImgErr(true)}
            style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
              filter: "brightness(0.65) saturate(1.05)",
              transition: "transform 0.5s", transform: open ? "scale(1.04)" : "scale(1)",
            }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top,#111118 0%,rgba(17,17,24,0.4) 50%,transparent 100%)",
          }} />
          {/* Category + AI model badges */}
          <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between" }}>
            <span style={{
              background: `${color}20`, border: `1px solid ${color}50`,
              color, borderRadius: 20, padding: "3px 11px",
              fontSize: 11, fontWeight: 700, backdropFilter: "blur(8px)", letterSpacing: "0.05em",
            }}>{cat?.emoji} {p.category.toUpperCase()}</span>
            {p.aiModel && (
              <span style={{
                background: `${MODEL_CLR[p.aiModel] || "#888"}20`,
                border: `1px solid ${MODEL_CLR[p.aiModel] || "#888"}50`,
                color: MODEL_CLR[p.aiModel] || "#fff",
                borderRadius: 20, padding: "3px 10px",
                fontSize: 11, fontWeight: 700, backdropFilter: "blur(8px)",
              }}>{p.aiModel}</span>
            )}
          </div>
          {/* Video play icon */}
          {p.videoIcon && (
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)", width: 52, height: 52, borderRadius: "50%",
              background: "rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, paddingLeft: 4, backdropFilter: "blur(4px)",
            }}>▶</div>
          )}
          {/* Title */}
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
            <h3 style={{
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700,
              color: "#fff", lineHeight: 1.5, textShadow: "0 2px 12px rgba(0,0,0,0.8)", marginBottom: 4,
            }}>{p.title}</h3>
            {p.description && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{p.description}</p>
            )}
          </div>
        </div>
      )}

      {/* ── NO-IMAGE HEADER ── */}
      {!hasImg && (
        <div style={{ padding: "18px 18px 0" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{
              background: `${color}15`, border: `1px solid ${color}35`,
              color, borderRadius: 20, padding: "3px 11px", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
            }}>{cat?.emoji} {p.category.toUpperCase()}</span>
            {p.subPack && (
              <span style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8", borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 600,
              }}>📦 {p.subPack}</span>
            )}
            {p.aiModel && (
              <span style={{
                background: `${MODEL_CLR[p.aiModel] || "#888"}15`,
                border: `1px solid ${MODEL_CLR[p.aiModel] || "#888"}35`,
                color: MODEL_CLR[p.aiModel] || "#888",
                borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 600,
              }}>{p.aiModel}</span>
            )}
          </div>
          <h3 style={{
            fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700,
            color: "#f1f5f9", marginBottom: 4, lineHeight: 1.5,
          }}>{p.title}</h3>
          {p.description && (
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{p.description}</p>
          )}
        </div>
      )}

      {/* ── BODY ── */}
      <div style={{ padding: "12px 18px 18px" }}>
        {/* Author + stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "linear-gradient(135deg,#6d28d9,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>{(p.submitterName || "A").charAt(0).toUpperCase()}</div>
          <span style={{ fontSize: 12, color: "#4a4a6a" }}>
            by{" "}
            <span
              onClick={e => { e.stopPropagation(); if (p.submittedBy && p.submittedBy !== "admin") onViewCreator(p.submittedBy); }}
              style={{
                color: "#94a3b8", fontWeight: 600,
                cursor: p.submittedBy && p.submittedBy !== "admin" ? "pointer" : "default",
                textDecoration: p.submittedBy && p.submittedBy !== "admin" ? "underline" : "none",
              }}>
              {p.submitterName || (p.submittedBy === "admin" ? "Admin" : p.submittedBy)}
            </span>
          </span>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#3a3a5a", display: "flex", alignItems: "center", gap: 4 }}>
              📋 <span style={{ color: "#6b7280" }}>{totalCopies.toLocaleString()}</span>
            </span>
            <button className="like-btn" onClick={e => { e.stopPropagation(); onLike(p.id); }}
              style={{
                background: "transparent",
                border: `1px solid ${userLiked ? "rgba(244,114,182,0.4)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 20, padding: "3px 10px",
                color: userLiked ? "#f472b6" : "#6b7280",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s",
              }}>
              {userLiked ? "❤️" : "🤍"} {likes}
            </button>
          </div>
        </div>

        {/* Prompt box */}
        <div style={{
          background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10, padding: "12px 14px", marginBottom: 12, position: "relative",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#3a3a5a", letterSpacing: "0.08em" }}>PROMPT</span>
            <button className="copy-btn" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(p.prompt); showToast("✓ Prompt copied!"); }}
              style={{
                background: "rgba(109,40,217,0.8)", border: "none",
                borderRadius: 8, padding: "4px 12px", color: "#fff",
                fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", gap: 5, transition: "background 0.15s",
              }}>📋 Copy Prompt</button>
          </div>
          <p style={{
            fontSize: 13, color: "#94a3b8", lineHeight: 1.7,
            display: open ? "block" : "-webkit-box",
            WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
            overflow: open ? "visible" : "hidden",
          }}>{p.prompt}</p>
          {!open && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
              background: "linear-gradient(to top,rgba(0,0,0,0.3),transparent)",
              borderRadius: "0 0 10px 10px", pointerEvents: "none",
            }} />
          )}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: open ? 12 : 0 }}>
          {(p.tags || []).map(t => (
            <span key={t} onClick={e => e.stopPropagation()}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                color: "#64748b", borderRadius: 20, padding: "3px 10px", fontSize: 11,
              }}>#{t}</span>
          ))}
          <span style={{ fontSize: 11, color: "#2a2a3a", alignSelf: "center", marginLeft: "auto" }}>
            {open ? "▲ less" : "▼ more"}
          </span>
        </div>

        {/* Expanded section */}
        {open && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}
            onClick={e => e.stopPropagation()}>

            {/* Action bar */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <ShareBtn p={p} showToast={showToast} />
              <button onClick={() => { if (!currentUser) { onLoginRequired(); return; } setShowCols(true); }}
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "6px 12px", color: "#6b7280", cursor: "pointer",
                  fontSize: 12, display: "flex", alignItems: "center", gap: 5,
                }}>📁 Save to Collection</button>
            </div>

            {/* Star rating */}
            <div style={{
              background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)",
              borderRadius: 10, padding: "10px 14px",
            }}>
              <p style={{ fontSize: 10, color: "#ca8a04", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
                ⭐ RATE THIS PROMPT
              </p>
              <StarRating promptId={p.id} currentUser={currentUser}
                onLoginRequired={onLoginRequired} showToast={showToast} />
            </div>

            {/* Negative prompt */}
            {p.negativePrompt && (
              <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 10, color: "#f87171", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>⛔ NEGATIVE PROMPT</p>
                <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{p.negativePrompt}</p>
              </div>
            )}

            {/* Parameters */}
            {p.mjParams && (
              <div style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.12)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 10, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>⚙️ PARAMETERS</p>
                <code style={{ fontSize: 12, color: "#a5b4fc", fontFamily: "'Courier New',monospace" }}>{p.mjParams}</code>
              </div>
            )}

            {/* Aspect ratio */}
            {p.aspectRatio && (
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#64748b",
                }}>📐 {p.aspectRatio}</span>
              </div>
            )}

            {/* Comments */}
            <CommentsSection promptId={p.id} currentUser={currentUser}
              onLoginRequired={onLoginRequired} showToast={showToast} />
          </div>
        )}
      </div>

      {/* Collections modal */}
      {showCols && currentUser && (
        <CollectionsModal
          promptId={p.id} promptTitle={p.title}
          currentUser={currentUser}
          onClose={() => setShowCols(false)}
          showToast={showToast} />
      )}
    </div>
  );
}
