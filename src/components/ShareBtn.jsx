import { useState } from "react";

export default function ShareBtn({ p, showToast }) {
  const [open, setOpen] = useState(false);
  const url  = `${window.location.origin}?prompt=${p.id}`;
  const text = `Check out this AI prompt: "${p.title}" on Promptonic!`;

  const share = async (type) => {
    if (type === "copy") {
      await navigator.clipboard.writeText(url);
      showToast("🔗 Link copied!");
    } else if (type === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    } else if (type === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
    } else if (type === "native") {
      if (navigator.share) navigator.share({ title: p.title, text, url });
      else { await navigator.clipboard.writeText(url); showToast("🔗 Link copied!"); }
    }
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, padding: "6px 10px", color: "#6b7280", cursor: "pointer",
          fontSize: 13, display: "flex", alignItems: "center", gap: 5,
        }}>
        ↗ Share
      </button>
      {open && (
        <div style={{
          position: "absolute", bottom: "110%", right: 0,
          background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14, padding: 8, zIndex: 50, minWidth: 160,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)", animation: "fadeUp 0.15s ease",
        }}>
          {[
            ["📋", "Copy Link",    "copy"],
            ["🐦", "Twitter",      "twitter"],
            ["💬", "WhatsApp",     "whatsapp"],
            ["📤", "More options", "native"],
          ].map(([em, lbl, type]) => (
            <button key={type} onClick={() => share(type)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                background: "transparent", border: "none", borderRadius: 8,
                padding: "9px 12px", color: "#e2e8f0", fontSize: 13,
                cursor: "pointer", transition: "background 0.15s",
              }}>
              <span>{em}</span> {lbl}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
