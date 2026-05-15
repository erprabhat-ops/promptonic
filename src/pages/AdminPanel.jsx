import { useState, useEffect } from "react";
import { fsGet, fsSet } from "../lib/firebase.js";
import { CATS } from "../constants/index.js";
import { inp } from "../constants/styles.js";
import { cc } from "../lib/utils.js";

export default function AdminPanel({ allPrompts, usersMap, likesMap, onApprove, onDelete, onLogout }) {
  const pending  = allPrompts.filter(p => !p.approved);
  const approved = allPrompts.filter(p => p.approved);
  const [tab,       setTab]       = useState("stats");
  const [comments,  setComments]  = useState({});
  const [customCats,setCustomCats]= useState([]);
  const [catForm,   setCatForm]   = useState({ label:"", emoji:"🔖", color:"#a78bfa" });
  const [catMsg,    setCatMsg]    = useState("");

  useEffect(() => { fsGet("comments").then(c => setComments(c || {})); }, []);
  useEffect(() => { fsGet("customCats").then(c => setCustomCats(c || [])); }, []);

  const totalLikes    = Object.values(likesMap).reduce((a, b) => a + b, 0);
  const totalComments = Object.values(comments).reduce((a, b) => a + b.length, 0);

  const addCat = async () => {
    if (!catForm.label.trim()) { setCatMsg("⚠️ Label zaroori hai"); return; }
    const id = catForm.label.toLowerCase().replace(/\s+/g, "_");
    if (customCats.find(c => c.id === id)) { setCatMsg("⚠️ Ye category pehle se hai"); return; }
    const newCat  = { id, label: catForm.label.trim(), emoji: catForm.emoji, color: catForm.color };
    const updated = [...customCats, newCat];
    await fsSet("customCats", updated);
    setCustomCats(updated);
    setCatForm({ label:"", emoji:"🔖", color:"#a78bfa" });
    setCatMsg("✓ Category add ho gayi!");
    setTimeout(() => setCatMsg(""), 2500);
  };

  const delCat = async (id) => {
    const updated = customCats.filter(c => c.id !== id);
    await fsSet("customCats", updated);
    setCustomCats(updated);
    setCatMsg("🗑 Category delete ho gayi.");
    setTimeout(() => setCatMsg(""), 2000);
  };

  const statCard = (em, v, lbl, clr) => (
    <div style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:20, textAlign:"center" }}>
      <div style={{ fontSize:22, marginBottom:6 }}>{em}</div>
      <p style={{ fontSize:26, fontWeight:800, fontFamily:"'Syne',sans-serif", color:clr }}>{v}</p>
      <p style={{ fontSize:11, color:"#4a4a6a", marginTop:2 }}>{lbl}</p>
    </div>
  );

  const pItem = (p, isPending) => (
    <div key={p.id} style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.06)",
      borderRadius:14, padding:16, display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ background:`${cc(p.category)}15`, border:`1px solid ${cc(p.category)}35`,
          color:cc(p.category), borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>
          {CATS.find(c => c.id === p.category)?.emoji} {p.category}
        </span>
        <span style={{ fontSize:11, color:"#4a4a6a" }}>by {p.submitterName}</span>
        <span style={{ fontSize:11, color:"#3a3a5a", marginLeft:"auto" }}>
          ❤️{likesMap[p.id]||0} 💬{(comments[p.id]||[]).length}
        </span>
      </div>
      <h4 style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#e2e8f0" }}>{p.title}</h4>
      <p style={{ fontSize:12, color:"#4a4a6a", lineHeight:1.6,
        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.prompt}</p>
      <div style={{ display:"flex", gap:8 }}>
        {isPending && (
          <button onClick={() => onApprove(p.id)} style={{ background:"rgba(34,197,94,0.08)",
            border:"1px solid rgba(34,197,94,0.25)", color:"#4ade80",
            borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer", flex:1 }}>
            ✓ Approve
          </button>
        )}
        <button onClick={() => onDelete(p.id)} style={{ background:"rgba(239,68,68,0.06)",
          border:"1px solid rgba(239,68,68,0.2)", color:"#f87171",
          borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer",
          flex: isPending ? 1 : "auto" }}>
          🗑 Delete
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 20px 80px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800,
            background:"linear-gradient(135deg,#fff,#a78bfa)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:2 }}>Admin Panel</h1>
          <p style={{ fontSize:12, color:"#4a4a6a" }}>Promptonic Control Center</p>
        </div>
        <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"8px 16px",
          color:"#6b7280", fontSize:12, cursor:"pointer" }}>Sign Out</button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:24, overflowX:"auto" }} className="no-scroll">
        {[["stats","📊 Stats"],["pending",`⏳ Pending (${pending.length})`],["live",`✓ Live (${approved.length})`],
          ["users",`👥 Users (${Object.keys(usersMap).length})`],["categories","🏷 Categories"]].map(([id,lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: tab===id?"rgba(109,40,217,0.7)":"rgba(255,255,255,0.03)",
            border:`1px solid ${tab===id?"rgba(167,139,250,0.3)":"rgba(255,255,255,0.06)"}`,
            color: tab===id?"#fff":"#6b7280", borderRadius:10, padding:"8px 16px",
            fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === "stats" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
            {statCard("📂", approved.length, "Live",     "#a78bfa")}
            {statCard("⏳", pending.length,  "Pending",  "#fb923c")}
            {statCard("👥", Object.keys(usersMap).length, "Users", "#34d399")}
            {statCard("❤️", totalLikes,      "Likes",    "#f472b6")}
            {statCard("💬", totalComments,   "Comments", "#818cf8")}
          </div>
          <div style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#6b7280", marginBottom:14, letterSpacing:"0.05em" }}>🔥 TOP LIKED</p>
            {[...approved].sort((a,b) => (likesMap[b.id]||0)-(likesMap[a.id]||0)).slice(0,5).map(p => (
              <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize:13, color:"#94a3b8" }}>{p.title}</span>
                <div style={{ display:"flex", gap:12 }}>
                  <span style={{ fontSize:12, color:"#f472b6", fontWeight:700 }}>❤️ {likesMap[p.id]||0}</span>
                  <span style={{ fontSize:12, color:"#818cf8", fontWeight:700 }}>💬 {(comments[p.id]||[]).length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending */}
      {tab === "pending" && (
        pending.length === 0
          ? <div style={{ textAlign:"center", padding:"60px", color:"#2a2a3a" }}><div style={{ fontSize:36, marginBottom:12 }}>✓</div><p>No pending prompts!</p></div>
          : <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))" }}>{pending.map(p => pItem(p, true))}</div>
      )}

      {/* Live */}
      {tab === "live" && (
        <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))" }}>
          {approved.map(p => pItem(p, false))}
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div style={{ display:"grid", gap:10, gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))" }}>
          {Object.values(usersMap).length === 0
            ? <div style={{ textAlign:"center", padding:"60px", color:"#2a2a3a" }}><div style={{ fontSize:36, marginBottom:12 }}>👥</div><p>No users yet.</p></div>
            : Object.values(usersMap).map(u => (
              <div key={u.id} style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:14, padding:16, display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:40, height:40, borderRadius:12, flexShrink:0,
                  background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, fontWeight:800, color:"#fff" }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", marginBottom:2 }}>{u.name}</p>
                  <p style={{ fontSize:11, color:"#4a4a6a" }}>@{u.username} · {allPrompts.filter(p => p.submittedBy===u.id&&p.approved).length} posts</p>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Categories */}
      {tab === "categories" && (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Add */}
          <div style={{ background:"#111118", border:"1px solid rgba(167,139,250,0.15)", borderRadius:16, padding:20 }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#a78bfa", marginBottom:16, letterSpacing:"0.04em" }}>✦ Nayi Category Banao</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 120px", gap:10, marginBottom:12 }}>
              <input placeholder="Category naam" value={catForm.label}
                onChange={e => setCatForm(f => ({ ...f, label:e.target.value }))} style={{ ...inp, fontSize:13 }} />
              <input placeholder="Emoji" value={catForm.emoji}
                onChange={e => setCatForm(f => ({ ...f, emoji:e.target.value }))}
                style={{ ...inp, fontSize:18, textAlign:"center" }} />
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="color" value={catForm.color}
                  onChange={e => setCatForm(f => ({ ...f, color:e.target.value }))}
                  style={{ width:36, height:36, border:"none", borderRadius:8, cursor:"pointer", background:"none" }} />
                <span style={{ fontSize:11, color:"#4a4a6a" }}>Color</span>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <span style={{ fontSize:11, color:"#4a4a6a" }}>Preview:</span>
              <span style={{ background:`${catForm.color}15`, border:`1px solid ${catForm.color}40`,
                color:catForm.color, borderRadius:20, padding:"4px 13px", fontSize:12, fontWeight:700 }}>
                {catForm.emoji} {catForm.label || "Category"}
              </span>
            </div>
            {catMsg && <p style={{ fontSize:12, color:catMsg.startsWith("✓")?"#4ade80":"#f87171", marginBottom:10 }}>{catMsg}</p>}
            <button onClick={addCat} style={{ background:"linear-gradient(135deg,#6d28d9,#a78bfa)", border:"none",
              borderRadius:10, padding:"11px 24px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              + Add Category
            </button>
          </div>

          {/* Defaults */}
          <div style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#6b7280", marginBottom:14, letterSpacing:"0.05em" }}>
              DEFAULT CATEGORIES (delete nahi ho sakti)
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[{id:"image",label:"Image",emoji:"🖼",color:"#818cf8"},{id:"video",label:"Video",emoji:"🎬",color:"#fb923c"},
                {id:"text",label:"Writing",emoji:"✍️",color:"#34d399"},{id:"other",label:"Other",emoji:"⚡",color:"#f472b6"}]
                .map(cat => (
                <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:12,
                  padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:10 }}>
                  <span style={{ background:`${cat.color}15`, border:`1px solid ${cat.color}35`,
                    color:cat.color, borderRadius:20, padding:"4px 13px", fontSize:12, fontWeight:700 }}>
                    {cat.emoji} {cat.label}
                  </span>
                  <span style={{ fontSize:11, color:"#2a2a3a", marginLeft:"auto" }}>
                    {allPrompts.filter(p => p.category===cat.id&&p.approved).length} prompts
                  </span>
                  <span style={{ fontSize:10, color:"#2a2a3a", background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"2px 8px" }}>Default</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom */}
          <div style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#6b7280", marginBottom:14, letterSpacing:"0.05em" }}>
              CUSTOM CATEGORIES ({customCats.length})
            </p>
            {customCats.length === 0 ? (
              <div style={{ textAlign:"center", padding:"30px 20px", color:"#2a2a3a" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🏷</div>
                <p style={{ fontSize:13 }}>Abhi koi custom category nahi hai. Upar se banao!</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {customCats.map(cat => (
                  <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:12,
                    padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:10 }}>
                    <span style={{ background:`${cat.color}15`, border:`1px solid ${cat.color}35`,
                      color:cat.color, borderRadius:20, padding:"4px 13px", fontSize:12, fontWeight:700 }}>
                      {cat.emoji} {cat.label}
                    </span>
                    <span style={{ fontSize:11, color:"#2a2a3a", marginLeft:"auto" }}>
                      {allPrompts.filter(p => p.category===cat.id&&p.approved).length} prompts
                    </span>
                    <button onClick={() => delCat(cat.id)} style={{ background:"rgba(239,68,68,0.08)",
                      border:"1px solid rgba(239,68,68,0.2)", color:"#f87171",
                      borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                      🗑 Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
