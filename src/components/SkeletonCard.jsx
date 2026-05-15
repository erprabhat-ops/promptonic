export default function SkeletonCard() {
  return (
    <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, overflow: "hidden" }}>
      <div className="skeleton" style={{ width: "100%", aspectRatio: "16/9" }} />
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skeleton" style={{ height: 11, width: "40%", borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 20, width: "70%", borderRadius: 6 }} />
        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="skeleton" style={{ height: 10, width: "30%", borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 12, width: "95%", borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 12, width: "80%", borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 12, width: "65%", borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}
