import { useState } from "react";

const FAQS = [
  ["Promptonic kya hai?",
   "Ek free AI prompt library. Yahan image (Midjourney, SDXL, Flux), video (Kling, Runway), writing ke ready-made prompts milenge — copy karke seedha use karo."],
  ["Account banana zaroori hai?",
   "Bilkul nahi! Browse aur copy bina account ke. Account sirf like/save, comment aur submit ke liye. Aur yeh bilkul free hai."],
  ["Apna prompt kaise submit karoon?",
   "Login karke '+ Submit' click karo. Title, prompt, category daalo. Admin review ke baad live ho jaega."],
  ["Collections kaise kaam karti hain?",
   "Prompt expand karo → 'Save to Collection' → folder banao ya existing mein add karo. Collections sirf tumhare profile mein dikhti hain."],
  ["Star rating kya hai?",
   "Logged in users 1-5 stars de sakte hain. Average rating sab ko dikhti hai. Best prompts naturally upar aate hain."],
  ["Mera prompt approve kyon nahi hua?",
   "Reasons: too short, irrelevant, inappropriate, ya duplicate. Quality prompts jaldi approve hote hain. Better prompt ke saath dobara try karo!"],
  ["Trending section kaise kaam karta hai?",
   "Last 7 days ke prompts mein sabse zyada likes wale 'Trending This Week' mein dikhte hain."],
];

export default function HelpPage({ onBack }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"28px 20px 80px" }} className="page-enter">
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#6b7280",
        cursor:"pointer", fontSize:13, marginBottom:28, display:"flex", alignItems:"center", gap:6 }}>
        ← Back
      </button>

      <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800,
        background:"linear-gradient(135deg,#fff,#a78bfa)",
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:6 }}>
        Help Center
      </h1>
      <p style={{ fontSize:14, color:"#64748b", marginBottom:28 }}>Koi sawaal? Yahan answers milenge.</p>

      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"#f1f5f9", marginBottom:14 }}>
        ❓ Frequently Asked Questions
      </h2>

      <div style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.06)",
        borderRadius:18, overflow:"hidden", marginBottom:28 }}>
        {FAQS.map(([q, a], i) => (
          <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width:"100%", background:"transparent", border:"none",
                padding:"16px 20px", display:"flex", justifyContent:"space-between",
                alignItems:"center", gap:12, cursor:"pointer", textAlign:"left" }}>
              <span style={{ fontSize:14, fontWeight:600, color:"#e2e8f0", lineHeight:1.5 }}>{q}</span>
              <span style={{ fontSize:20, color:"#4a4a6a", flexShrink:0,
                transform: openFaq === i ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}>›</span>
            </button>
            {openFaq === i && (
              <div style={{ padding:"0 20px 18px", animation:"slideDown 0.2s ease" }}>
                <p style={{ fontSize:13, color:"#64748b", lineHeight:1.8 }}>{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ background:"linear-gradient(135deg,#111118,#16161f)",
        border:"1px solid rgba(167,139,250,0.12)", borderRadius:20, padding:26, textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:10 }}>✉️</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:"#f1f5f9", marginBottom:6 }}>
          Still need help?
        </h2>
        <p style={{ fontSize:13, color:"#64748b", marginBottom:18, lineHeight:1.7 }}>
          Koi bhi query, suggestion, ya bug report — direct contact karo.
        </p>
        <a href="mailto:hello@promptonic.app"
          style={{ display:"inline-flex", alignItems:"center", gap:10,
            background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.2)",
            borderRadius:12, padding:"12px 22px", textDecoration:"none",
            color:"#a78bfa", fontWeight:600, fontSize:13 }}>
          📧 hello@promptonic.app
        </a>
      </div>
    </div>
  );
}
