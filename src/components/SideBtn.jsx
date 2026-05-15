export default function SideBtn({ cat, active, count, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%",
      background: active ? `${cat.color}10` : "transparent",
      border: `1px solid ${active ? cat.color + "30" : "rgba(255,255,255,0.05)"}`,
      borderRadius: 10, padding: "10px 14px", textAlign: "left",
      color: active ? cat.color : "#6b7280",
      fontSize: 13, fontWeight: active ? 700 : 400,
      cursor: "pointer", transition: "all 0.15s",
    }}>
      <span>{cat.emoji}</span>
      <span style={{ flex: 1 }}>{cat.label}</span>
      <span style={{
        fontSize: 11, color: active ? cat.color : "#3a3a5a",
        background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "1px 7px",
      }}>{count}</span>
    </button>
  );
}
