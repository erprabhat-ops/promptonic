export default function AboutPage({ onBack }) {
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"28px 20px 80px" }} className="page-enter">
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#6b7280",
        cursor:"pointer", fontSize:13, marginBottom:28, display:"flex", alignItems:"center", gap:6 }}>
        ← Back
      </button>

      <div style={{ textAlign:"center", marginBottom:44 }}>
        <div style={{ width:72, height:72, borderRadius:20,
          background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:32, margin:"0 auto 18px", boxShadow:"0 12px 40px rgba(109,40,217,0.35)" }}>⚡</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:30, fontWeight:800,
          background:"linear-gradient(135deg,#fff,#a78bfa)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:10 }}>
          About Promptonic
        </h1>
        <p style={{ fontSize:14, color:"#64748b", lineHeight:1.8, maxWidth:500, margin:"0 auto" }}>
          Ek free platform — AI prompts discover, share aur copy karo.
          Image, video, writing aur kaafi kuch ke liye.
        </p>
      </div>

      <div style={{ background:"linear-gradient(135deg,#111118,#16161f)",
        border:"1px solid rgba(167,139,250,0.12)", borderRadius:20, padding:26, marginBottom:18 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:"#f1f5f9", marginBottom:10 }}>
          🎯 Our Mission
        </h2>
        <p style={{ fontSize:14, color:"#64748b", lineHeight:1.9 }}>
          AI tools powerful hain, lekin sahi prompt likhna mushkil hai.
          Promptonic ka goal —{" "}
          <span style={{ color:"#a78bfa", fontWeight:600 }}>har kisi ke liye AI easy banana</span>.
          Experienced creators apne best prompts share karein, beginners seedha use karein.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:20 }}>
        {[
          ["🖼","Image Prompts","MJ, SDXL, Flux, DALL-E ready"],
          ["🎬","Video Prompts","Kling, Runway, Veo ke liye"],
          ["✍️","Writing Prompts","Instagram, YouTube, blogs"],
          ["⭐","Star Ratings","Community rated prompts"],
          ["📁","Collections","Favorites organize karo"],
          ["🏆","Leaderboard","Top contributors"],
        ].map(([em, t, d]) => (
          <div key={t} style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:18 }}>
            <div style={{ fontSize:26, marginBottom:8 }}>{em}</div>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", marginBottom:4 }}>{t}</h3>
            <p style={{ fontSize:12, color:"#4a4a6a", lineHeight:1.6 }}>{d}</p>
          </div>
        ))}
      </div>

      <div style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:26 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:"#f1f5f9", marginBottom:18 }}>
          👨‍💻 Developer
        </h2>
        <div style={{ display:"flex", gap:18, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ width:68, height:68, borderRadius:18, flexShrink:0,
            background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28, fontWeight:800, color:"#fff", boxShadow:"0 8px 24px rgba(109,40,217,0.3)" }}>P</div>
          <div style={{ flex:1 }}>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:"#f1f5f9", marginBottom:4 }}>Prabhat</h3>
            <p style={{ fontSize:12, color:"#4a4a6a", marginBottom:10 }}>Faizabad, Uttar Pradesh 🇮🇳</p>
            <p style={{ fontSize:13, color:"#64748b", lineHeight:1.7, marginBottom:14 }}>
              18 saal ki umra mein, sirf ek phone aur zero budget se Promptonic banaya.
              AI aur technology ke passion se shuru hua yeh safar —
              ab ek growing community platform ban gaya hai.
            </p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[["💡","Self-taught"],["📱","Mobile Only"],["🆓","Zero Budget"]].map(([em, t]) => (
                <span key={t} style={{ background:"rgba(167,139,250,0.08)",
                  border:"1px solid rgba(167,139,250,0.15)",
                  color:"#a78bfa", borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:600 }}>
                  {em} {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
