import { CATS } from "../constants/index.js";
import { cc } from "../lib/utils.js";

export default function TrendingSection({ allPrompts, likesMap, userLikedIds, onLike, showToast }) {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let trending = allPrompts
    .filter(p => p.approved && p.createdAt > oneWeekAgo)
    .sort((a, b) => (likesMap[b.id] || 0) - (likesMap[a.id] || 0))
    .slice(0, 8);
  if (trending.length < 3) {
    trending = [...allPrompts]
      .filter(p => p.approved)
      .sort((a, b) => (likesMap[b.id] || 0) - (likesMap[a.id] || 0))
      .slice(0, 8);
  }
  if (trending.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>🔥</span>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>
          Trending This Week
        </h2>
      </div>
      <div className="no-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
        {trending.map(p => {
          const color = cc(p.category);
          const cat   = CATS.find(c => c.id === p.category);
          const liked = userLikedIds.includes(p.id);
          return (
            <div key={p.id} className="card"
              style={{
                flexShrink: 0, width: 200,
                background: "#111118", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, overflow: "hidden",
              }}>
              {p.previewUrl && (
                <div style={{ position: "relative", width: "100%", height: 90, overflow: "hidden" }}>
                  <img src={p.previewUrl} alt={p.title} loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65)" }}
                    onError={e => e.target.style.display = "none"} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,#111118,transparent)" }} />
                  {p.videoIcon && (
                    <div style={{
                      position: "absolute", top: "50%", left: "50%",
                      transform: "translate(-50%,-50%)",
                      background: "rgba(0,0,0,0.6)", borderRadius: "50%",
                      width: 30, height: 30, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 12, paddingLeft: 2,
                    }}>▶</div>
                  )}
                </div>
              )}
              <div style={{ padding: "10px 12px" }}>
                <div style={{ display: "flex", gap: 5, marginBottom: 5, alignItems: "center" }}>
                  <span style={{
                    background: `${color}15`, border: `1px solid ${color}30`,
                    color, borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700,
                  }}>{cat?.emoji}</span>
                  <span style={{ fontSize: 10, color: "#fbbf24", marginLeft: "auto" }}>
                    ❤️ {likesMap[p.id] || 0}
                  </span>
                </div>
                <h4 style={{
                  fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700,
                  color: "#e2e8f0", lineHeight: 1.4, marginBottom: 8,
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>{p.title}</h4>
                <div style={{ display: "flex", gap: 5 }}>
                  <button onClick={() => onLike(p.id)} style={{
                    background: liked ? "rgba(244,114,182,0.12)" : "transparent",
                    border: `1px solid ${liked ? "rgba(244,114,182,0.3)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 20, padding: "3px 8px",
                    color: liked ? "#f472b6" : "#6b7280",
                    fontSize: 11, cursor: "pointer", fontWeight: 600,
                  }}>{liked ? "❤️" : "🤍"}</button>
                  <button
                    onClick={() => navigator.clipboard.writeText(p.prompt).then(() => showToast("✓ Copied!"))}
                    style={{
                      background: "rgba(109,40,217,0.7)", border: "none", borderRadius: 20,
                      padding: "3px 10px", color: "#fff", fontSize: 11,
                      fontWeight: 700, cursor: "pointer", flex: 1,
                    }}>Copy</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
