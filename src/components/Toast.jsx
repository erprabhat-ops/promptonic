export default function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: msg.startsWith("⚠") ? "#7c2d12" : "#14532d",
      color: "#fff", borderRadius: 24, padding: "11px 24px",
      fontWeight: 600, fontSize: 13, zIndex: 1000,
      whiteSpace: "nowrap", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      animation: "fadeUp 0.2s ease",
    }}>
      {msg}
    </div>
  );
}
