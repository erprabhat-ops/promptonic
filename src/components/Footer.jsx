export default function Footer({ onNavigate }) {
  return (
    <footer style={{ background:"#07070f", borderTop:"1px solid rgba(255,255,255,0.05)", padding:"32px 20px 24px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:24, marginBottom:24 }}>
          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:24, height:24, background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
                borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>⚡</div>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800,
                background:"linear-gradient(135deg,#fff,#a78bfa)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Promptonic</span>
            </div>
            <p style={{ fontSize:12, color:"#3a3a5a", lineHeight:1.7 }}>
              Free AI prompts for everyone.<br />Built with ❤️ in India 🇮🇳
            </p>
          </div>

          {/* Explore */}
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:"#3a3a5a", letterSpacing:"0.08em", marginBottom:10 }}>EXPLORE</p>
            {[["🖼 Image","cat-image"],["🎬 Video","cat-video"],["✍️ Writing","cat-text"],["🏆 Leaderboard","leaderboard"]].map(([l, p]) => (
              <button key={p} onClick={() => onNavigate(p)}
                style={{ display:"block", background:"none", border:"none", color:"#3a3a5a",
                  fontSize:12, cursor:"pointer", marginBottom:7, padding:0, textAlign:"left" }}>
                {l}
              </button>
            ))}
          </div>

          {/* Company */}
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:"#3a3a5a", letterSpacing:"0.08em", marginBottom:10 }}>COMPANY</p>
            {[["About Us","about"],["Help Center","help"],["Contact","help"]].map(([l, p]) => (
              <button key={l} onClick={() => onNavigate(p)}
                style={{ display:"block", background:"none", border:"none", color:"#3a3a5a",
                  fontSize:12, cursor:"pointer", marginBottom:7, padding:0, textAlign:"left" }}>
                {l}
              </button>
            ))}
          </div>

          {/* Platform */}
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:"#3a3a5a", letterSpacing:"0.08em", marginBottom:10 }}>PLATFORM</p>
            {["🆓 Always Free","🔒 Secure","📱 Mobile Optimized","🤝 Community"].map(t => (
              <p key={t} style={{ fontSize:12, color:"#3a3a5a", marginBottom:6 }}>{t}</p>
            ))}
          </div>
        </div>

        <div style={{ borderTop:"1px solid rgba(255,255,255,0.04)", paddingTop:18,
          display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <p style={{ fontSize:11, color:"#2a2a3a" }}>
            © {new Date().getFullYear()} Promptonic. Made with ❤️ by Prabhat.
          </p>
          <p style={{ fontSize:11, color:"#2a2a3a" }}>
            Built on mobile · Zero budget · 100% passion
          </p>
        </div>
      </div>
    </footer>
  );
}
