import { useState } from "react";
import { inp } from "../constants/styles.js";

export default function SubmitForm({ user, onSubmit, onClose }) {
  const [form, setForm] = useState({ title:"", prompt:"", description:"", category:"image", tags:"", previewUrl:"" });
  const [done, setDone] = useState(false);

  if (done) return (
    <div style={{ background:"rgba(34,197,94,0.04)", border:"1px solid rgba(34,197,94,0.15)",
      borderRadius:16, padding:28, marginBottom:24, textAlign:"center" }}>
      <div style={{ fontSize:44, marginBottom:12 }}>🎉</div>
      <h3 style={{ color:"#4ade80", fontFamily:"'Syne',sans-serif", marginBottom:8 }}>Submitted!</h3>
      <p style={{ color:"#4a4a6a", fontSize:13, marginBottom:16 }}>Your prompt is under review. It'll go live once approved.</p>
      <button onClick={onClose} style={{ background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.25)",
        color:"#4ade80", borderRadius:10, padding:"10px 24px", fontWeight:700, cursor:"pointer", fontSize:13 }}>
        Done ✓
      </button>
    </div>
  );

  return (
    <div style={{ background:"#0f0f1a", border:"1px solid rgba(167,139,250,0.12)",
      borderRadius:16, padding:20, marginBottom:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"#a78bfa" }}>Submit a Prompt</h3>
        <span style={{ fontSize:12, color:"#4a4a6a" }}>as @{user.username}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <input placeholder="Title *" value={form.title}
          onChange={e => setForm({ ...form, title:e.target.value })} style={inp} />
        <input placeholder="Short description (e.g. 'Create stunning cinematic portraits')"
          value={form.description} onChange={e => setForm({ ...form, description:e.target.value })} style={inp} />
        <textarea placeholder="Your full prompt *" value={form.prompt}
          onChange={e => setForm({ ...form, prompt:e.target.value })}
          rows={4} style={{ ...inp, resize:"vertical", lineHeight:1.6 }} />
        <select value={form.category} onChange={e => setForm({ ...form, category:e.target.value })} style={inp}>
          <option value="image">🖼 Image</option>
          <option value="video">🎬 Video</option>
          <option value="text">✍️ Writing</option>
          <option value="other">⚡ Other</option>
        </select>
        <input placeholder="Preview image URL (from unsplash.com — optional)"
          value={form.previewUrl} onChange={e => setForm({ ...form, previewUrl:e.target.value })} style={inp} />
        <input placeholder="Tags — comma separated (portrait, ai, realistic)"
          value={form.tags} onChange={e => setForm({ ...form, tags:e.target.value })} style={inp} />
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px",
            color:"#6b7280", cursor:"pointer", flex:1, fontSize:13 }}>Cancel</button>
          <button
            onClick={async () => {
              if (!form.title || !form.prompt) return;
              await onSubmit({ ...form,
                tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
                videoIcon: form.category === "video", copies: 0 });
              setDone(true);
            }}
            disabled={!form.title || !form.prompt}
            style={{ background:"linear-gradient(135deg,#6d28d9,#a78bfa)", border:"none",
              borderRadius:10, padding:"12px", color:"#fff", fontWeight:700, fontSize:13,
              cursor:"pointer", flex:2, opacity:(!form.title||!form.prompt)?0.4:1 }}>
            Submit for Review →
          </button>
        </div>
      </div>
    </div>
  );
}
