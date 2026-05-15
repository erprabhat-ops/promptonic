import { useState, useEffect } from "react";
import { fsGet, fsSet } from "../lib/firebase.js";

export default function StarRating({ promptId, currentUser, onLoginRequired, showToast }) {
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [hover,   setHover]   = useState(0);

  useEffect(() => {
    (async () => {
      const all = await fsGet("ratings") || {};
      setRatings(all[promptId] || {});
      setLoading(false);
    })();
  }, [promptId]);

  const myRating    = currentUser ? (ratings[currentUser.id] || 0) : 0;
  const totalRatings = Object.keys(ratings).length;
  const avgRating    = totalRatings
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / totalRatings).toFixed(1)
    : null;

  const rate = async (star) => {
    if (!currentUser) { onLoginRequired(); return; }
    const all  = await fsGet("ratings") || {};
    const prev = all[promptId] || {};
    const updated = { ...all, [promptId]: { ...prev, [currentUser.id]: star } };
    await fsSet("ratings", updated);
    setRatings(updated[promptId]);
    showToast(`⭐ ${star}/5 rating diya!`);
  };

  if (loading) return null;

  return (
    <div onClick={e => e.stopPropagation()}
      style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s}
            onClick={() => rate(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "2px", fontSize: 18,
              color: (hover || myRating) >= s ? "#fbbf24" : "#2a2a45",
              transition: "color 0.1s, transform 0.1s",
              transform: (hover || myRating) >= s ? "scale(1.15)" : "scale(1)",
            }}>
            ★
          </button>
        ))}
      </div>
      {avgRating && (
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          {avgRating} <span style={{ color: "#3a3a5a" }}>({totalRatings})</span>
        </span>
      )}
      {myRating > 0 && (
        <span style={{ fontSize: 11, color: "#fbbf24" }}>Your rating: {myRating}★</span>
      )}
    </div>
  );
}
