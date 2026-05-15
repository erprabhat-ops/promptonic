import { useState, useEffect } from "react";
import { fsGet, fsSet } from "../lib/firebase.js";

export default function FollowBtn({ targetUserId, currentUser, onLoginRequired, showToast }) {
  const [follows, setFollows] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { const f = await fsGet("follows") || {}; setFollows(f); setLoading(false); })();
  }, []);

  if (!targetUserId || loading) return null;
  if (currentUser && currentUser.id === targetUserId) return null;

  const myFollowing  = currentUser ? (follows[currentUser.id] || []) : [];
  const isFollowing  = myFollowing.includes(targetUserId);
  const followerCount = Object.values(follows).filter(arr => arr.includes(targetUserId)).length;

  const toggle = async () => {
    if (!currentUser) { onLoginRequired(); return; }
    const all  = await fsGet("follows") || {};
    const mine = all[currentUser.id] || [];
    const updated = {
      ...all,
      [currentUser.id]: isFollowing
        ? mine.filter(id => id !== targetUserId)
        : [...mine, targetUserId],
    };
    await fsSet("follows", updated);
    setFollows(updated);
    showToast(isFollowing ? "Unfollowed." : "✓ Following!");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button className="follow-btn" onClick={toggle} style={{
        background: isFollowing ? "rgba(167,139,250,0.12)" : "linear-gradient(135deg,#6d28d9,#a78bfa)",
        border: `1px solid ${isFollowing ? "rgba(167,139,250,0.3)" : "transparent"}`,
        borderRadius: 20, padding: "8px 20px",
        color: isFollowing ? "#a78bfa" : "#fff",
        fontSize: 13, fontWeight: 700, cursor: "pointer",
      }}>
        {isFollowing ? "✓ Following" : "+ Follow"}
      </button>
      <span style={{ fontSize: 12, color: "#4a4a6a" }}>
        {followerCount} follower{followerCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
