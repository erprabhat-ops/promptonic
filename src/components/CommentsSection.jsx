import { useState, useEffect } from "react";
import { fsGet, fsSet } from "../lib/firebase.js";
import { timeAgo } from "../lib/utils.js";
import { inp } from "../constants/styles.js";

export default function CommentsSection({ promptId, currentUser, onLoginRequired, showToast }) {
  const [comments, setComments] = useState([]);
  const [text,     setText]     = useState("");
  const [loading,  setLoading]  = useState(true);
  const [posting,  setPosting]  = useState(false);

  useEffect(() => {
    (async () => {
      const all = await fsGet("comments") || {};
      setComments(all[promptId] || []);
      setLoading(false);
    })();
  }, [promptId]);

  const post = async () => {
    if (!currentUser) { onLoginRequired(); return; }
    if (!text.trim()) return;
    setPosting(true);
    const c = {
      id: `c_${Date.now()}`, promptId,
      userId: currentUser.id, userName: currentUser.name,
      username: currentUser.username, text: text.trim(), createdAt: Date.now(),
    };
    const all = await fsGet("comments") || {};
    const up  = { ...all, [promptId]: [...(all[promptId] || []), c] };
    await fsSet("comments", up);
    setComments(up[promptId]);
    setText(""); setPosting(false);
    showToast("💬 Comment posted!");
  };

  const del = async (cid) => {
    const all = await fsGet("comments") || {};
    const up  = { ...all, [promptId]: (all[promptId] || []).filter(c => c.id !== cid) };
    await fsSet("comments", up);
    setComments(up[promptId] || []);
    showToast("Deleted.");
  };

  if (loading) return <p style={{ fontSize: 12, color: "#3a3a5a", padding: "8px 0" }}>Loading comments...</p>;

  return (
    <div onClick={e => e.stopPropagation()}
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, marginTop: 8 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 12, letterSpacing: "0.05em" }}>
        COMMENTS ({comments.length})
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {comments.length === 0 && (
          <p style={{ fontSize: 13, color: "#2a2a3a", textAlign: "center", padding: "12px 0" }}>
            No comments yet. Be first! 👇
          </p>
        )}
        {comments.map(c => (
          <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#6d28d9,#a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: "#fff",
            }}>
              {c.userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd" }}>{c.userName}</span>
                  <span style={{ fontSize: 10, color: "#3a3a5a" }}>@{c.username}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#2a2a3a" }}>{timeAgo(c.createdAt)}</span>
                  {currentUser && currentUser.id === c.userId && (
                    <button onClick={() => del(c.id)}
                      style={{ background: "none", border: "none", color: "#2a2a4a", cursor: "pointer", fontSize: 12, lineHeight: 1 }}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{c.text}</p>
            </div>
          </div>
        ))}
      </div>
      {currentUser ? (
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#6d28d9,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: "#fff",
          }}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, display: "flex", gap: 8 }}>
            <input value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); post(); } }}
              placeholder="Write a comment..."
              style={{ ...inp, flex: 1, padding: "8px 13px", fontSize: 13, borderRadius: 20 }} />
            <button onClick={post} disabled={!text.trim() || posting}
              style={{
                background: "linear-gradient(135deg,#6d28d9,#a78bfa)", border: "none",
                borderRadius: 20, padding: "8px 16px", color: "#fff",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                opacity: (!text.trim() || posting) ? 0.4 : 1, whiteSpace: "nowrap",
              }}>
              Post
            </button>
          </div>
        </div>
      ) : (
        <button onClick={onLoginRequired}
          style={{
            width: "100%", background: "rgba(167,139,250,0.05)",
            border: "1px solid rgba(167,139,250,0.12)", borderRadius: 10,
            padding: "10px", color: "#6b7280", fontSize: 12, cursor: "pointer", fontWeight: 600,
          }}>
          Sign in to comment →
        </button>
      )}
    </div>
  );
}
