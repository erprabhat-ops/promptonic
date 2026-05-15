import { useState } from "react";

export default function LeaderboardPage({ allPrompts, usersMap, likesMap, onBack, onViewCreator }) {
  const [tab, setTab] = useState("prompts");
  const medals = ["🥇","🥈","🥉"];

  const byPrompts = Object.values(usersMap)
    .map(u => ({ ...u, count: allPrompts.filter(p => p.submittedBy===u.id&&p.approved).length }))
    .filter(u => u.count > 0).sort((a,b) => b.count-a.count).slice(0,20);

  const byLikes = Object.values(usersMap)
    .map(u => {
      const up = allPrompts.filter(p => p.submittedBy===u.id&&p.approved);
      return { ...u, totalLikes: up.reduce((sum,p) => sum+(likesMap[p.id]||0),0) };
    })
    .filter(u => u.totalLikes > 0).sort((a,b) => b.totalLikes-a.totalLikes).slice(0,20);

  const list = tab === "prompts" ? byPrompts : byLikes;

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"28px 20px 80px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#6b7280",
        cursor:"pointer", fontSize:13, marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>
        ← Back
      </button>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:44, marginBottom:10 }}>🏆</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800,
          background:"linear-gradient(135deg,#fff,#fbbf24)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:6 }}>Leaderboard</h1>
        <p style={{ fontSize:13, color:"#4a4a6a" }}>Top contributors of Promptonic</p>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:24, padding:4,
        background:"rgba(255,255,255,0.03)", borderRadius:12, border:"1px solid rgba(255,255,255,0.05)" }}>
        {[["prompts","📂 Most Prompts"],["likes","❤️ Most Liked"]].map(([id,lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1, background:tab===id?"rgba(109,40,217,0.8)":"transparent",
            border:"none", borderRadius:9, padding:"10px",
            color:tab===id?"#fff":"#6b7280", fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}>
            {lbl}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"#2a2a3a" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>😴</div>
          <p>Koi data nahi abhi. Pehle prompts submit karo!</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {list.map((u, i) => (
            <div key={u.id} onClick={() => onViewCreator(u.id)}
              style={{
                display:"flex", alignItems:"center", gap:14,
                background: i < 3 ? "linear-gradient(135deg,#111118,#16161f)" : "#111118",
                border:`1px solid ${i===0?"rgba(251,191,36,0.2)":i===1?"rgba(148,163,184,0.15)":i===2?"rgba(180,120,60,0.15)":"rgba(255,255,255,0.06)"}`,
                borderRadius:16, padding:"14px 18px", cursor:"pointer", transition:"all 0.2s",
              }}>
              <div style={{ width:36, textAlign:"center", flexShrink:0 }}>
                {i < 3
                  ? <span style={{ fontSize:22 }}>{medals[i]}</span>
                  : <span style={{ fontSize:14, fontWeight:700, color:"#3a3a5a" }}>#{i+1}</span>}
              </div>
              <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                background:`linear-gradient(135deg,${i===0?"#d97706,#fbbf24":i===1?"#475569,#94a3b8":i===2?"#92400e,#d97706":"#6d28d9,#a78bfa"})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, fontWeight:800, color:"#fff" }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", marginBottom:2 }}>{u.name}</p>
                <p style={{ fontSize:11, color:"#4a4a6a" }}>@{u.username}</p>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <p style={{ fontSize:20, fontWeight:800, fontFamily:"'Syne',sans-serif",
                  color:i===0?"#fbbf24":i===1?"#94a3b8":i===2?"#d97706":"#a78bfa" }}>
                  {tab === "prompts" ? u.count : u.totalLikes}
                </p>
                <p style={{ fontSize:10, color:"#3a3a5a" }}>{tab === "prompts" ? "prompts" : "likes"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
