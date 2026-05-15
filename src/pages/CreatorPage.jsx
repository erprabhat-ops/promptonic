import { CATS } from "../constants/index.js";
import { cc } from "../lib/utils.js";
import FollowBtn from "../components/FollowBtn.jsx";

export default function CreatorPage({ creatorId, allPrompts, likesMap, usersMap, currentUser, onBack, onLoginRequired, showToast }) {
  const creator    = usersMap[creatorId];
  const prompts    = allPrompts.filter(p => p.submittedBy === creatorId && p.approved);
  const totalLikes = prompts.reduce((sum, p) => sum + (likesMap[p.id] || 0), 0);

  if (!creator) return (
    <div style={{ textAlign:"center", padding:"80px 20px", color:"#2a2a3a" }}>
      <div style={{ fontSize:44, marginBottom:12 }}>👤</div>
      <p>Creator nahi mila.</p>
      <button onClick={onBack} style={{ marginTop:16, background:"none", border:"none", color:"#6b7280", cursor:"pointer", fontSize:13 }}>← Back</button>
    </div>
  );

  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"28px 20px 80px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#6b7280",
        cursor:"pointer", fontSize:13, marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>
        ← Back
      </button>

      {/* Creator card */}
      <div style={{ background:"linear-gradient(135deg,#111118,#16161f)",
        border:"1px solid rgba(167,139,250,0.12)", borderRadius:22, padding:28, marginBottom:28,
        position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(109,40,217,0.12),transparent 70%)", pointerEvents:"none" }} />
        <div style={{ display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
          <div style={{ width:80, height:80, borderRadius:20,
            background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:32, fontWeight:800, color:"#fff", flexShrink:0,
            boxShadow:"0 8px 24px rgba(109,40,217,0.4)" }}>
            {creator.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#f1f5f9", marginBottom:4 }}>
              {creator.name}
            </h2>
            <p style={{ fontSize:13, color:"#4a4a6a", marginBottom:16 }}>@{creator.username}</p>
            <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
              {[
                ["📂", prompts.length, "Prompts"],
                ["❤️", totalLikes,    "Likes"],
                ["📅", new Date(creator.createdAt).toLocaleDateString("en-IN",{month:"short",year:"numeric"}), "Joined"],
              ].map(([em, v, lbl]) => (
                <div key={lbl}>
                  <p style={{ fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif", color:"#a78bfa", marginBottom:2 }}>
                    {em} {v}
                  </p>
                  <p style={{ fontSize:11, color:"#4a4a6a" }}>{lbl}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16 }}>
              <FollowBtn targetUserId={creatorId} currentUser={currentUser}
                onLoginRequired={onLoginRequired} showToast={showToast} />
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:"#94a3b8",
        marginBottom:16, letterSpacing:"0.05em" }}>
        PROMPTS BY {creator.name.toUpperCase()}
      </h3>

      {prompts.length === 0 ? (
        <div style={{ textAlign:"center", padding:"50px 20px", color:"#2a2a3a" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📂</div>
          <p>Is user ne abhi koi prompt submit nahi kiya.</p>
        </div>
      ) : (
        <div className="prompt-grid">
          {prompts.map(p => {
            const color = cc(p.category);
            const cat   = CATS.find(c => c.id === p.category);
            return (
              <div key={p.id} className="card"
                style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.06)",
                  borderRadius:16, overflow:"hidden" }}>
                {p.previewUrl && (
                  <img src={p.previewUrl} alt={p.title}
                    style={{ width:"100%", height:130, objectFit:"cover", display:"block", filter:"brightness(0.65)" }}
                    onError={e => e.target.style.display = "none"} />
                )}
                <div style={{ padding:"14px 16px" }}>
                  <span style={{ background:`${color}15`, border:`1px solid ${color}35`, color,
                    borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700,
                    display:"inline-block", marginBottom:8 }}>
                    {cat?.emoji} {p.category}
                  </span>
                  <h4 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:700,
                    color:"#e2e8f0", marginBottom:6, lineHeight:1.4 }}>{p.title}</h4>
                  <p style={{ fontSize:12, color:"#4a4a6a", lineHeight:1.5, marginBottom:12,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {p.prompt}
                  </p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, color:"#3a3a5a" }}>❤️ {likesMap[p.id] || 0}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(p.prompt).then(() => showToast("✓ Copied!"))}
                      style={{ background:"rgba(109,40,217,0.7)", border:"none", borderRadius:8,
                        padding:"6px 14px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                      📋 Copy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
