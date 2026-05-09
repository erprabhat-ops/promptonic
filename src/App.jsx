import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";

/* ─── CONFIG ─── */
const ADMIN_PASSWORD = "prabhat@admin2024";

/* ─── FIREBASE STORAGE HELPERS ─── */
// Shared data (everyone sees same) → Firestore
const fsGet = async (key) => {
  try {
    const snap = await getDoc(doc(db, "store", key));
    return snap.exists() ? snap.data().value : null;
  } catch { return null; }
};
const fsSet = async (key, value) => {
  try { await setDoc(doc(db, "store", key), { value }); } catch {}
};

// Private data (per browser) → localStorage
const lsGet = (key) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
};
const lsSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

/* ─── STATIC DATA ─── */
const CATS = [
  { id:"all",   label:"All",     emoji:"✦", color:"#e2e8f0" },
  { id:"image", label:"Image",   emoji:"🖼", color:"#a78bfa" },
  { id:"video", label:"Video",   emoji:"🎬", color:"#fb923c" },
  { id:"text",  label:"Writing", emoji:"✍️", color:"#34d399" },
  { id:"other", label:"Other",   emoji:"⚡", color:"#f472b6" },
];
const IMG_MODELS    = ["All","Midjourney","SDXL","Flux","DALL-E"];
const ASPECT_RATIOS = ["All","1:1","16:9","9:16","4:3","3:2"];
const WRITING_PACKS = ["All","Captions","Hooks","Scripts","YouTube","Carousel","Philosophy","Psychology"];
const MODEL_CLR = {"Midjourney":"#818cf8","SDXL":"#f472b6","Flux":"#34d399","DALL-E":"#fb923c"};

const SEED_PROMPTS = [
  { id:"p1", category:"image", title:"Cinematic Portrait",
    prompt:"A cinematic portrait of a young woman, golden hour lighting, shallow depth of field, film grain, 35mm lens, ultra realistic, 8K resolution, professional photography",
    negativePrompt:"blur, low quality, watermark, ugly, distorted face",
    tags:["portrait","realistic","golden hour"],
    previewUrl:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    aiModel:"Midjourney", aspectRatio:"4:3", mjParams:"--ar 4:3 --v 6.1 --style raw --q 2",
    approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000001 },
  { id:"p2", category:"image", title:"Fantasy Landscape",
    prompt:"Epic fantasy landscape, floating islands with waterfalls, glowing crystals, dramatic storm clouds, God rays piercing through, hyperdetailed, concept art style",
    negativePrompt:"low resolution, blurry, flat, cartoonish",
    tags:["landscape","fantasy","concept art"],
    previewUrl:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
    aiModel:"SDXL", aspectRatio:"16:9", mjParams:"--ar 16:9 --v 6",
    approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000002 },
  { id:"p3", category:"image", title:"Cyberpunk City Night",
    prompt:"Futuristic cyberpunk city at night, neon signs, rain reflections on wet pavement, volumetric fog, ultra detailed, 8K cinematic",
    negativePrompt:"daylight, natural colors, old buildings, low quality",
    tags:["cyberpunk","city","neon"],
    previewUrl:"https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80",
    aiModel:"Flux", aspectRatio:"16:9", mjParams:"--ar 16:9 --v 6.1 --style raw",
    approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000003 },
  { id:"p4", category:"image", title:"Luxury Product Shot",
    prompt:"Minimalist luxury perfume bottle on white marble, soft directional shadows, studio strobe lighting, clean white background, commercial photography, ultra sharp",
    negativePrompt:"busy background, people, outdoor, low contrast",
    tags:["product","commercial","minimalist"],
    previewUrl:"https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",
    aiModel:"DALL-E", aspectRatio:"1:1", mjParams:"--ar 1:1 --v 6 --style raw",
    approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000004 },
  { id:"p5", category:"image", title:"Dramatic Ocean Sunset",
    prompt:"Breathtaking ocean sunset, dramatic orange and pink clouds, calm water reflecting golden light, silhouette of lone sailboat, long exposure photography, ultra realistic, 8K",
    negativePrompt:"overexposed, flat sky, no clouds, CGI look",
    tags:["nature","sunset","ocean"],
    previewUrl:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    aiModel:"Midjourney", aspectRatio:"16:9", mjParams:"--ar 16:9 --v 6 --style scenic",
    approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000005 },
  { id:"p6", category:"image", title:"Soft Studio Portrait",
    prompt:"Professional female portrait, soft box studio lighting, neutral grey background, beauty dish, sharp focus on eyes, 85mm lens bokeh, Vogue magazine style",
    negativePrompt:"harsh shadows, red eye, busy background, ugly",
    tags:["portrait","studio","fashion"],
    previewUrl:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    aiModel:"SDXL", aspectRatio:"4:3", mjParams:"--ar 4:3 --v 6.1",
    approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000006 },
  { id:"p7", category:"video", title:"Slow Mo Water Splash",
    prompt:"Ultra slow motion water splash in dark studio, crystal clear droplets frozen in air, black background, professional studio rim lighting, 1000fps, 4K cinematic color grade",
    tags:["slow motion","water","studio"],
    previewUrl:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
    videoIcon:true, approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000007 },
  { id:"p8", category:"video", title:"Rose Bloom Timelapse",
    prompt:"Timelapse of a red rose blooming from bud to full bloom, soft window light, macro lens, clean green bokeh background, 60fps smooth playback, cinematic grade",
    tags:["nature","timelapse","macro"],
    previewUrl:"https://images.unsplash.com/photo-1490750967868-88df5691cc25?w=600&q=80",
    videoIcon:true, approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000008 },
  { id:"p9", category:"video", title:"Aerial Mountain Flyover",
    prompt:"Cinematic aerial drone footage over Himalayan peaks at sunrise, golden mist in valleys, ultra smooth slow pan, 4K LOG footage, landscape cinematography, epic scale",
    tags:["drone","cinematic","landscape"],
    previewUrl:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    videoIcon:true, approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000009 },
  { id:"p10", category:"video", title:"Cinematic Car Chase",
    prompt:"Cinematic car chase on city highway at dusk, low angle follow cam, motion blur, wet road reflections, handheld shaky cam, action movie grade, Kling AI optimized",
    tags:["action","car","cinematic"],
    previewUrl:"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80",
    videoIcon:true, approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000010 },
  { id:"p11", category:"text", title:"Viral Instagram Hook", subPack:"Hooks",
    prompt:"Write 5 viral Instagram hooks for [TOPIC]. Each hook must create instant curiosity, start with a bold statement or shocking fact, be under 12 words, trigger emotion (shock, curiosity, FOMO). No emojis.",
    tags:["instagram","viral","hooks"], approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000011 },
  { id:"p12", category:"text", title:"YouTube Script Intro", subPack:"YouTube",
    prompt:"Write a YouTube video script intro for [TOPIC]. Hook in first 5 seconds, tease what viewer will learn, include a pattern interrupt, mention a relatable problem. Under 45 seconds when spoken.",
    tags:["youtube","script","intro"], approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000012 },
  { id:"p13", category:"text", title:"Carousel Post Writer", subPack:"Carousel",
    prompt:"Write a 7-slide Instagram carousel about [TOPIC]. Slide 1: bold headline hook. Slides 2-6: one key insight per slide with example. Slide 7: strong CTA. Each slide: max 3 lines. Second person voice.",
    tags:["carousel","instagram","educational"], approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000013 },
  { id:"p14", category:"other", title:"Brand Name Generator",
    prompt:"Generate 10 unique brand names for a [BUSINESS TYPE] targeting [AUDIENCE]. Max 10 characters, easy to spell, suggest one-line tagline. Include vibe/meaning for each.",
    tags:["branding","naming","startup"], approved:true, submittedBy:"admin", submitterName:"Admin", createdAt:1700000014 },
];

/* ─── UTILS ─── */
const catColor = id => CATS.find(c=>c.id===id)?.color || "#fff";
const simpleHash = s => { let h=0; for(let i=0;i<s.length;i++) h=(Math.imul(31,h)+s.charCodeAt(i))|0; return h.toString(36); };
const timeAgo = ts => {
  const d = (Date.now()-ts)/1000;
  if(d<60) return "abhi abhi";
  if(d<3600) return `${Math.floor(d/60)}m pehle`;
  if(d<86400) return `${Math.floor(d/3600)}h pehle`;
  return `${Math.floor(d/86400)}d pehle`;
};

const iS = { background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:10,
  padding:"11px 14px", color:"#fff", fontSize:13, fontFamily:"inherit",
  width:"100%", outline:"none", boxSizing:"border-box" };

/* ─── PARTICLES ─── */
function Particles() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {Array.from({length:14},(_,i)=>(
        <div key={i} style={{position:"absolute",width:2+i%3,height:2+i%3,borderRadius:"50%",
          background:`rgba(167,139,250,${0.12+i%3*0.08})`,
          left:`${(i*17+9)%100}%`,top:`${(i*13+5)%100}%`,
          animation:`pf ${4+i%4}s ease-in-out ${i*0.35}s infinite alternate`,
          boxShadow:`0 0 ${4+i%5}px rgba(167,139,250,0.35)`}}/>
      ))}
      <style>{`@keyframes pf{0%{transform:translateY(0);opacity:.25}100%{transform:translateY(-16px);opacity:.7}}`}</style>
    </div>
  );
}

function Toast({msg}) {
  if(!msg) return null;
  return (
    <div style={{position:"fixed",bottom:26,left:"50%",transform:"translateX(-50%)",
      background:msg.startsWith("⚠")?"#92400e":"#15803d",
      color:"#fff",borderRadius:24,padding:"10px 22px",fontWeight:600,fontSize:13,
      zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.6)"}}>
      {msg}
    </div>
  );
}

function CopyBtn({text}) {
  const [ok,setOk]=useState(false);
  return (
    <button onClick={e=>{e.stopPropagation();navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),2000);}}
      style={{background:ok?"#16a34a":"linear-gradient(135deg,#6d28d9,#a78bfa)",
        border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",
        fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
      {ok?"✓ Copied!":"Copy Prompt"}
    </button>
  );
}

/* ─── COMMENTS ─── */
function CommentsSection({promptId, currentUser, isAdmin, onLoginRequired, showToast}) {
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [posting, setPosting]   = useState(false);

  useEffect(()=>{
    (async()=>{
      const all = await fsGet("comments") || {};
      setComments(all[promptId] || []);
      setLoading(false);
    })();
  },[promptId]);

  const postComment = async () => {
    if(!currentUser){ onLoginRequired(); return; }
    if(!text.trim()) return;
    setPosting(true);
    const newComment = { id:`c_${Date.now()}`, promptId,
      userId:currentUser.id, userName:currentUser.name,
      username:currentUser.username, text:text.trim(), createdAt:Date.now() };
    const all = await fsGet("comments") || {};
    const updated = {...all, [promptId]:[...(all[promptId]||[]), newComment]};
    await fsSet("comments", updated);
    setComments(updated[promptId]);
    setText(""); setPosting(false);
    showToast("💬 Comment post ho gaya!");
  };

  const deleteComment = async (commentId) => {
    const all = await fsGet("comments") || {};
    const updated = {...all, [promptId]:(all[promptId]||[]).filter(c=>c.id!==commentId)};
    await fsSet("comments", updated);
    setComments(updated[promptId]);
    showToast("🗑 Comment delete ho gaya.");
  };

  if(loading) return <div style={{padding:"12px 0",textAlign:"center",color:"#333",fontSize:12}}>Loading...</div>;

  return (
    <div onClick={e=>e.stopPropagation()} style={{borderTop:"1px solid #ffffff08",marginTop:4,paddingTop:14}}>
      <p style={{margin:"0 0 12px",fontSize:12,color:"#555",fontWeight:700}}>💬 Comments ({comments.length})</p>
      {comments.length===0
        ? <p style={{fontSize:12,color:"#2a2a45",margin:"0 0 12px",textAlign:"center",padding:"8px 0"}}>Pehla comment karo! 👇</p>
        : <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {comments.map(c=>(
              <div key={c.id} style={{background:"#0a0a18",border:"1px solid #ffffff08",borderRadius:12,padding:"10px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                    <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                      background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:12,fontWeight:800,color:"#fff"}}>
                      {c.userName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:12,fontWeight:700,color:"#ccc"}}>{c.userName}</span>
                        <span style={{fontSize:10,color:"#333"}}>@{c.username}</span>
                        <span style={{fontSize:10,color:"#2a2a45",marginLeft:"auto"}}>{timeAgo(c.createdAt)}</span>
                      </div>
                      <p style={{margin:"4px 0 0",fontSize:13,color:"#888",lineHeight:1.5}}>{c.text}</p>
                    </div>
                  </div>
                  {(isAdmin||(currentUser&&currentUser.id===c.userId))&&(
                    <button onClick={()=>deleteComment(c.id)} style={{background:"transparent",border:"none",
                      color:"#2a2a45",fontSize:14,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>🗑</button>
                  )}
                </div>
              </div>
            ))}
          </div>
      }
      {currentUser ? (
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,
            background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:13,fontWeight:800,color:"#fff"}}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();postComment();}}}
            placeholder="Comment likho..." rows={1}
            style={{...iS,flex:1,resize:"none",padding:"9px 12px",fontSize:12,
              lineHeight:1.5,borderRadius:10,borderColor:text?"#a78bfa44":"#ffffff10"}}/>
          <button onClick={postComment} disabled={!text.trim()||posting}
            style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
              borderRadius:10,padding:"9px 14px",color:"#fff",fontSize:14,cursor:"pointer",
              opacity:(!text.trim()||posting)?0.4:1,flexShrink:0}}>↑</button>
        </div>
      ):(
        <button onClick={onLoginRequired} style={{width:"100%",background:"#a78bfa0a",
          border:"1px solid #a78bfa22",borderRadius:10,padding:"10px",color:"#666",
          fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
          💬 Comment karne ke liye login karo →
        </button>
      )}
    </div>
  );
}

/* ─── PROMPT CARD ─── */
function Card({p, likes, userLiked, onLike, currentUser, isAdmin, onLoginRequired, showToast}) {
  const [open,setOpen]     = useState(false);
  const [imgErr,setImgErr] = useState(false);
  const hasImg = p.previewUrl && !imgErr;
  const color  = catColor(p.category);

  return (
    <div onClick={()=>setOpen(o=>!o)}
      style={{background:"linear-gradient(160deg,#0c0c1e,#0f0f20)",
        border:`1px solid ${open?color+"55":"#ffffff0e"}`,
        borderRadius:20,overflow:"hidden",cursor:"pointer",
        transition:"all 0.25s",boxShadow:open?`0 0 24px ${color}15`:""}}>

      {hasImg&&(
        <div style={{position:"relative",width:"100%",aspectRatio:"16/9",overflow:"hidden"}}>
          <img src={p.previewUrl} alt={p.title} onError={()=>setImgErr(true)}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block",
              filter:"brightness(0.7)",transition:"transform 0.4s",
              transform:open?"scale(1.04)":"scale(1)"}}/>
          <div style={{position:"absolute",inset:0,
            background:"linear-gradient(to top,#0f0f20 0%,rgba(15,15,32,0.3) 55%,transparent 100%)"}}/>
          <div style={{position:"absolute",top:10,left:12,background:"rgba(0,0,0,0.6)",
            border:`1px solid ${color}60`,color,borderRadius:20,padding:"3px 11px",
            fontSize:10,fontWeight:700,backdropFilter:"blur(6px)"}}>
            {CATS.find(c=>c.id===p.category)?.emoji} {p.category.toUpperCase()}
          </div>
          {p.aiModel&&(
            <div style={{position:"absolute",top:10,right:12,
              background:`${MODEL_CLR[p.aiModel]||"#888"}22`,
              border:`1px solid ${MODEL_CLR[p.aiModel]||"#888"}55`,
              color:MODEL_CLR[p.aiModel]||"#fff",borderRadius:20,padding:"3px 10px",
              fontSize:10,fontWeight:700,backdropFilter:"blur(6px)"}}>
              {p.aiModel}
            </div>
          )}
          {p.aspectRatio&&(
            <div style={{position:"absolute",bottom:46,right:12,
              background:"rgba(0,0,0,0.55)",border:"1px solid #ffffff20",
              color:"#ccc",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600}}>
              {p.aspectRatio}
            </div>
          )}
          {p.videoIcon&&(
            <div style={{position:"absolute",top:"50%",left:"50%",
              transform:"translate(-50%,-50%)",width:52,height:52,borderRadius:"50%",
              background:"rgba(0,0,0,0.6)",border:"2px solid rgba(255,255,255,0.5)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,paddingLeft:3}}>▶</div>
          )}
          <div style={{position:"absolute",bottom:12,left:14,right:14}}>
            <h3 style={{margin:0,fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,
              color:"#fff",textShadow:"0 1px 8px rgba(0,0,0,0.9)",lineHeight:1.3}}>{p.title}</h3>
          </div>
        </div>
      )}

      {!hasImg&&(
        <div style={{padding:"16px 16px 0"}}>
          <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
            <span style={{background:`${color}18`,border:`1px solid ${color}44`,
              color,borderRadius:20,padding:"3px 11px",fontSize:10,fontWeight:700}}>
              {CATS.find(c=>c.id===p.category)?.emoji} {p.category.toUpperCase()}
            </span>
            {p.subPack&&<span style={{background:"#ffffff08",border:"1px solid #ffffff18",
              color:"#888",borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:600}}>📦 {p.subPack}</span>}
          </div>
          <h3 style={{margin:0,fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:"#eee"}}>{p.title}</h3>
        </div>
      )}

      <div style={{padding:"12px 16px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <button onClick={e=>{e.stopPropagation();onLike(p.id);}}
            style={{background:userLiked?"#ff4d4d1a":"transparent",
              border:`1px solid ${userLiked?"#ff4d4d":"#ffffff18"}`,
              borderRadius:20,padding:"5px 12px",
              color:userLiked?"#ff4d4d":"#555",fontSize:12,fontWeight:700,
              cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all 0.2s"}}>
            {userLiked?"❤️":"🤍"} {likes}
          </button>
          {!open&&<span style={{fontSize:10,color:"#2a2a45"}}>
            by {p.submitterName||(p.submittedBy==="admin"?"Admin ✦":p.submittedBy)}
          </span>}
          {!open&&<span style={{fontSize:10,color:"#1a1a30",marginLeft:"auto"}}>Tap ↓</span>}
        </div>

        <p style={{margin:"0 0 8px",fontSize:13,color:"#777",lineHeight:1.65,
          display:open?"block":"-webkit-box",WebkitLineClamp:open?"unset":2,
          WebkitBoxOrient:"vertical",overflow:open?"visible":"hidden"}}>
          {p.prompt}
        </p>

        {open&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}} onClick={e=>e.stopPropagation()}>
            {p.negativePrompt&&(
              <div style={{background:"#ff000008",border:"1px solid #ff000020",borderRadius:10,padding:"10px 12px"}}>
                <p style={{margin:"0 0 4px",fontSize:11,color:"#f87171",fontWeight:700}}>⛔ Negative Prompt</p>
                <p style={{margin:0,fontSize:12,color:"#666",lineHeight:1.5}}>{p.negativePrompt}</p>
              </div>
            )}
            {p.mjParams&&(
              <div style={{background:"#818cf808",border:"1px solid #818cf820",borderRadius:10,padding:"10px 12px"}}>
                <p style={{margin:"0 0 4px",fontSize:11,color:"#818cf8",fontWeight:700}}>⚙️ Parameters</p>
                <code style={{fontSize:12,color:"#a5b4fc"}}>{p.mjParams}</code>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(p.tags||[]).map(t=>(
                  <span key={t} style={{background:`${color}10`,border:`1px solid ${color}30`,
                    color,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600}}>{t}</span>
                ))}
              </div>
              <CopyBtn text={p.prompt}/>
            </div>
            <p style={{margin:0,fontSize:11,color:"#2a2a45"}}>
              by {p.submitterName||(p.submittedBy==="admin"?"Admin ✦":p.submittedBy)} · {timeAgo(p.createdAt)}
            </p>
            <CommentsSection promptId={p.id} currentUser={currentUser} isAdmin={isAdmin}
              onLoginRequired={onLoginRequired} showToast={showToast}/>
          </div>
        )}
        {!open&&<p style={{margin:0,fontSize:11,color:"#1a1a30"}}>Tap to expand ↓</p>}
      </div>
    </div>
  );
}

/* ─── AUTH MODAL ─── */
function AuthModal({onClose, onSuccess, showToast}) {
  const [tab,  setTab]  = useState("login");
  const [form, setForm] = useState({name:"",username:"",password:""});
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const go = async () => {
    setBusy(true); setErr("");
    if(tab==="login") {
      if(!form.username||!form.password){setErr("Sab fields bharo");setBusy(false);return;}
      const users = await fsGet("users") || {};
      const user = Object.values(users).find(u=>
        u.username.toLowerCase()===form.username.toLowerCase() &&
        u.passwordHash===simpleHash(form.password)
      );
      if(!user){setErr("Username ya password galat hai");setBusy(false);return;}
      lsSet("ptn_session",{userId:user.id});
      onSuccess(user);
    } else {
      if(!form.name||!form.username||!form.password){setErr("Sab fields bharo");setBusy(false);return;}
      if(form.password.length<6){setErr("Password kam se kam 6 characters ka ho");setBusy(false);return;}
      if(!/^[a-zA-Z0-9_]+$/.test(form.username)){setErr("Username: letters, numbers, _ only");setBusy(false);return;}
      const users = await fsGet("users") || {};
      if(Object.values(users).some(u=>u.username.toLowerCase()===form.username.toLowerCase())){
        setErr("Ye username pehle se liya hua hai");setBusy(false);return;
      }
      const id=`u_${Date.now()}`;
      const user={id,name:form.name.trim(),username:form.username.trim(),
        passwordHash:simpleHash(form.password),createdAt:Date.now()};
      await fsSet("users",{...users,[id]:user});
      lsSet("ptn_session",{userId:id});
      showToast("✓ Account ban gaya! Welcome 🎉");
      onSuccess(user);
    }
  };

  const tabBtn=(id,lbl)=>(
    <button onClick={()=>{setTab(id);setErr("");}} style={{flex:1,
      background:tab===id?"#a78bfa18":"transparent",
      border:`1px solid ${tab===id?"#a78bfa":"#ffffff10"}`,
      color:tab===id?"#a78bfa":"#444",borderRadius:10,padding:"10px",
      fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lbl}</button>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",
      display:"flex",alignItems:"center",justifyContent:"center",
      zIndex:200,padding:"0 16px",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#0d0d1e",border:"1px solid #a78bfa33",borderRadius:22,
        padding:24,width:"100%",maxWidth:380,display:"flex",flexDirection:"column",gap:14,
        boxShadow:"0 0 60px #7c3aed28"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h2 style={{margin:0,fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,
              background:"linear-gradient(135deg,#fff,#a78bfa)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Promptonic</h2>
            <p style={{margin:"3px 0 0",fontSize:11,color:"#444"}}>
              {tab==="login"?"Login karo":"Bilkul free — abhi join karo"}
            </p>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid #1e1e38",
            borderRadius:8,padding:"6px 10px",color:"#444",cursor:"pointer",fontSize:14}}>✕</button>
        </div>
        <div style={{display:"flex",gap:8}}>{tabBtn("login","Login")}{tabBtn("register","Register")}</div>
        {tab==="register"&&<input placeholder="Tumhara naam *" value={form.name} onChange={e=>f("name",e.target.value)} style={iS}/>}
        <input placeholder="Username *" value={form.username} onChange={e=>f("username",e.target.value)} style={iS}/>
        <input type="password" placeholder="Password *" value={form.password}
          onChange={e=>f("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={iS}/>
        {err&&<p style={{margin:0,fontSize:12,color:"#f87171"}}>⚠️ {err}</p>}
        <button onClick={go} disabled={busy} style={{
          background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
          borderRadius:12,padding:"13px",color:"#fff",fontWeight:700,fontSize:14,
          cursor:"pointer",fontFamily:"inherit",opacity:busy?0.6:1}}>
          {busy?"...":(tab==="login"?"Login →":"Account Banao →")}
        </button>
      </div>
    </div>
  );
}

/* ─── PROFILE PAGE ─── */
function ProfilePage({user, allPrompts, userLikedIds, onLogout, onBack}) {
  const myPosts = allPrompts.filter(p=>p.submittedBy===user.id&&p.approved);
  const mySaved = allPrompts.filter(p=>p.approved&&userLikedIds.includes(p.id));
  const [tab,setTab] = useState("saved");

  const tabBtn=(id,lbl,n)=>(
    <button onClick={()=>setTab(id)} style={{flex:1,
      background:tab===id?"#a78bfa18":"transparent",
      border:`1px solid ${tab===id?"#a78bfa":"#ffffff10"}`,
      color:tab===id?"#a78bfa":"#444",borderRadius:10,padding:"10px",
      fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
      {lbl} ({n})
    </button>
  );

  const mini=(p)=>{
    const color=catColor(p.category);
    return (
      <div key={p.id} style={{background:"#0c0c1e",border:"1px solid #ffffff0e",borderRadius:14,overflow:"hidden"}}>
        {p.previewUrl&&<img src={p.previewUrl} alt={p.title}
          style={{width:"100%",height:90,objectFit:"cover",display:"block",filter:"brightness(0.65)"}}
          onError={e=>e.target.style.display="none"}/>}
        <div style={{padding:"10px 12px"}}>
          <span style={{fontSize:10,color,background:`${color}18`,border:`1px solid ${color}33`,
            borderRadius:20,padding:"2px 9px",fontWeight:700}}>
            {CATS.find(c=>c.id===p.category)?.emoji} {p.category}
          </span>
          <h4 style={{margin:"6px 0 4px",fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:"#eee"}}>{p.title}</h4>
          <p style={{margin:"0 0 8px",fontSize:11,color:"#555",lineHeight:1.5,
            display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.prompt}</p>
          <CopyBtn text={p.prompt}/>
        </div>
      </div>
    );
  };

  return (
    <div style={{padding:"22px 13px 100px",position:"relative",zIndex:1}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",
        color:"#555",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:"0 0 16px"}}>← Back</button>
      <div style={{background:"linear-gradient(135deg,#0f0f22,#13132a)",
        border:"1px solid #a78bfa22",borderRadius:22,padding:22,marginBottom:20}}>
        <div style={{width:72,height:72,borderRadius:"50%",
          background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:28,fontWeight:800,color:"#fff",marginBottom:14,
          boxShadow:"0 0 20px #a78bfa40"}}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h2 style={{margin:"0 0 4px",fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#fff"}}>{user.name}</h2>
        <p style={{margin:"0 0 16px",fontSize:13,color:"#555"}}>@{user.username}</p>
        <div style={{display:"flex",gap:10}}>
          {[["📂",myPosts.length,"Posts"],["❤️",mySaved.length,"Saved"]].map(([em,v,lbl])=>(
            <div key={lbl} style={{background:"#ffffff05",border:"1px solid #ffffff0e",
              borderRadius:14,padding:"12px 16px",flex:1,textAlign:"center"}}>
              <p style={{margin:0,fontSize:10,color:"#444"}}>{em} {lbl}</p>
              <p style={{margin:"4px 0 0",fontSize:22,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#a78bfa"}}>{v}</p>
            </div>
          ))}
        </div>
        <button onClick={onLogout} style={{marginTop:16,background:"transparent",
          border:"1px solid #1e1e38",borderRadius:10,padding:"10px",
          color:"#444",fontSize:12,cursor:"pointer",fontFamily:"inherit",width:"100%"}}>Logout</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {tabBtn("saved","❤️ Saved",mySaved.length)}{tabBtn("posts","📂 My Posts",myPosts.length)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {tab==="saved"&&(mySaved.length===0
          ?<div style={{textAlign:"center",padding:"50px 20px",color:"#1e1e38"}}><div style={{fontSize:40}}>❤️</div><p style={{marginTop:12}}>Koi prompt save nahi kiya abhi tak.</p></div>
          :mySaved.map(p=>mini(p)))}
        {tab==="posts"&&(myPosts.length===0
          ?<div style={{textAlign:"center",padding:"50px 20px",color:"#1e1e38"}}><div style={{fontSize:40}}>📂</div><p style={{marginTop:12}}>Koi prompt submit nahi kiya abhi tak.</p></div>
          :myPosts.map(p=>mini(p)))}
      </div>
    </div>
  );
}

/* ─── ADMIN PANEL ─── */
function AdminPanel({allPrompts, usersMap, likesMap, onApprove, onDelete, onLogout}) {
  const pending  = allPrompts.filter(p=>!p.approved);
  const approved = allPrompts.filter(p=>p.approved);
  const [tab,setTab]       = useState("stats");
  const [comments,setComments] = useState({});

  useEffect(()=>{ fsGet("comments").then(c=>setComments(c||{})); },[]);

  const totalLikes    = Object.values(likesMap).reduce((a,b)=>a+b,0);
  const totalUsers    = Object.keys(usersMap).length;
  const totalComments = Object.values(comments).reduce((a,b)=>a+b.length,0);

  const tabBtn=(id,lbl)=>(
    <button onClick={()=>setTab(id)} style={{
      background:tab===id?"#a78bfa18":"transparent",
      border:`1px solid ${tab===id?"#a78bfa":"#ffffff10"}`,
      color:tab===id?"#a78bfa":"#444",borderRadius:20,
      padding:"7px 13px",fontSize:11,fontWeight:600,
      cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{lbl}</button>
  );

  const statBox=(em,v,lbl,clr="#a78bfa")=>(
    <div style={{background:"#0f0f1e",border:"1px solid #ffffff0e",borderRadius:14,padding:"14px",flex:1,textAlign:"center"}}>
      <div style={{fontSize:18}}>{em}</div>
      <p style={{margin:"4px 0 2px",fontSize:20,fontWeight:800,fontFamily:"'Syne',sans-serif",color:clr}}>{v}</p>
      <p style={{margin:0,fontSize:10,color:"#444"}}>{lbl}</p>
    </div>
  );

  const deleteComment = async (promptId, commentId) => {
    const all = await fsGet("comments") || {};
    const up = {...all,[promptId]:(all[promptId]||[]).filter(c=>c.id!==commentId)};
    await fsSet("comments",up);
    setComments(up);
  };

  const promptItem=(p,isPending)=>(
    <div key={p.id} style={{background:"#0c0c1e",border:"1px solid #ffffff0e",borderRadius:14,padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:catColor(p.category),fontWeight:700,
          background:`${catColor(p.category)}18`,border:`1px solid ${catColor(p.category)}33`,
          borderRadius:20,padding:"2px 9px"}}>
          {CATS.find(c=>c.id===p.category)?.emoji} {p.category}
        </span>
        <span style={{fontSize:11,color:"#444"}}>by {p.submitterName}</span>
        <span style={{fontSize:11,color:"#2a2a45",marginLeft:"auto"}}>❤️{likesMap[p.id]||0} · 💬{(comments[p.id]||[]).length}</span>
      </div>
      <h4 style={{margin:0,fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#eee"}}>{p.title}</h4>
      <p style={{margin:0,fontSize:12,color:"#555",lineHeight:1.5,
        display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.prompt}</p>
      {(comments[p.id]||[]).length>0&&(
        <div style={{background:"#08080f",borderRadius:10,padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
          <p style={{margin:0,fontSize:11,color:"#555",fontWeight:700}}>💬 Comments</p>
          {(comments[p.id]||[]).map(c=>(
            <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div><span style={{fontSize:11,color:"#a78bfa",fontWeight:700}}>@{c.username}</span>
                <span style={{fontSize:12,color:"#666",marginLeft:8}}>{c.text}</span></div>
              <button onClick={()=>deleteComment(p.id,c.id)} style={{background:"transparent",border:"none",color:"#333",fontSize:13,cursor:"pointer",flexShrink:0}}>🗑</button>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:8}}>
        {isPending&&<button onClick={()=>onApprove(p.id)} style={{
          background:"#16a34a22",border:"1px solid #16a34a55",color:"#4ade80",
          borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flex:1}}>✓ Approve</button>}
        <button onClick={()=>onDelete(p.id)} style={{
          background:"#dc262622",border:"1px solid #dc262655",color:"#f87171",
          borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flex:isPending?1:"auto"}}>🗑 Delete</button>
      </div>
    </div>
  );

  return (
    <div style={{padding:"22px 13px 100px",position:"relative",zIndex:1}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,margin:0,
            background:"linear-gradient(135deg,#fff,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Admin Panel</h1>
          <p style={{margin:"3px 0 0",fontSize:11,color:"#444"}}>Promptonic Control ✦</p>
        </div>
        <button onClick={onLogout} style={{background:"transparent",border:"1px solid #1e1e38",
          borderRadius:10,padding:"8px 14px",color:"#555",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Logout</button>
      </div>
      <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginBottom:18,scrollbarWidth:"none"}}>
        {tabBtn("stats","📊 Stats")}
        {tabBtn("pending",`⏳ Pending (${pending.length})`)}
        {tabBtn("live",`✓ Live (${approved.length})`)}
        {tabBtn("users",`👥 Users (${totalUsers})`)}
      </div>
      {tab==="stats"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",gap:10}}>{statBox("📂",approved.length,"Live Prompts","#a78bfa")}{statBox("⏳",pending.length,"Pending","#fb923c")}</div>
          <div style={{display:"flex",gap:10}}>{statBox("👥",totalUsers,"Users","#34d399")}{statBox("❤️",totalLikes,"Likes","#f472b6")}</div>
          <div style={{display:"flex",gap:10}}>{statBox("💬",totalComments,"Comments","#818cf8")}</div>
          <div style={{background:"#0f0f1e",border:"1px solid #ffffff0e",borderRadius:16,padding:16}}>
            <p style={{margin:"0 0 12px",fontSize:12,color:"#555",fontWeight:700}}>🔥 Top Liked</p>
            {[...approved].sort((a,b)=>(likesMap[b.id]||0)-(likesMap[a.id]||0)).slice(0,5).map(p=>(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #ffffff06"}}>
                <span style={{fontSize:13,color:"#ccc"}}>{p.title}</span>
                <div style={{display:"flex",gap:10}}>
                  <span style={{fontSize:12,color:"#f472b6",fontWeight:700}}>❤️{likesMap[p.id]||0}</span>
                  <span style={{fontSize:12,color:"#818cf8",fontWeight:700}}>💬{(comments[p.id]||[]).length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="pending"&&(pending.length===0
        ?<div style={{textAlign:"center",padding:"50px 20px",color:"#2a2a45"}}><div style={{fontSize:36}}>✓</div><p>Koi pending prompt nahi!</p></div>
        :<div style={{display:"flex",flexDirection:"column",gap:12}}>{pending.map(p=>promptItem(p,true))}</div>
      )}
      {tab==="live"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>{approved.map(p=>promptItem(p,false))}</div>}
      {tab==="users"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {Object.values(usersMap).length===0
            ?<div style={{textAlign:"center",padding:"50px 20px",color:"#1e1e38"}}><div style={{fontSize:36}}>👥</div><p>Koi user nahi abhi tak.</p></div>
            :Object.values(usersMap).map(u=>(
              <div key={u.id} style={{background:"#0c0c1e",border:"1px solid #ffffff0e",
                borderRadius:14,padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:38,height:38,borderRadius:"50%",
                    background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:16,fontWeight:800,color:"#fff"}}>{u.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p style={{margin:0,fontSize:13,fontWeight:700,color:"#eee"}}>{u.name}</p>
                    <p style={{margin:"2px 0 0",fontSize:11,color:"#444"}}>@{u.username}</p>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{margin:0,fontSize:10,color:"#333"}}>Posts</p>
                  <p style={{margin:"2px 0 0",fontSize:14,fontWeight:700,color:"#a78bfa"}}>
                    {allPrompts.filter(p=>p.submittedBy===u.id&&p.approved).length}
                  </p>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

/* ─── SUBMIT FORM ─── */
function SubmitForm({user, onSubmit, onClose}) {
  const [form,setForm]=useState({title:"",prompt:"",category:"image",tags:"",previewUrl:""});
  const [done,setDone]=useState(false);
  const go=async()=>{
    if(!form.title||!form.prompt) return;
    await onSubmit({...form,tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean),videoIcon:form.category==="video"});
    setDone(true);
  };
  if(done) return (
    <div style={{background:"#0f0f1e",border:"1px solid #34d39933",borderRadius:18,padding:24,marginBottom:20,textAlign:"center"}}>
      <div style={{fontSize:40}}>🎉</div>
      <h3 style={{color:"#34d399",fontFamily:"'Syne',sans-serif",margin:"12px 0 8px"}}>Submitted!</h3>
      <p style={{color:"#555",fontSize:13,margin:"0 0 16px"}}>Admin review ke baad live ho jaega.</p>
      <button onClick={onClose} style={{background:"#34d39918",border:"1px solid #34d39944",color:"#34d399",
        borderRadius:10,padding:"10px 22px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Done</button>
    </div>
  );
  return (
    <div style={{background:"#0f0f1e",border:"1px solid #a78bfa28",borderRadius:18,padding:16,marginBottom:20,display:"flex",flexDirection:"column",gap:10}}>
      <p style={{margin:0,color:"#a78bfa",fontWeight:700,fontFamily:"'Syne',sans-serif",fontSize:13}}>✦ Submit as @{user.username}</p>
      <input placeholder="Title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={iS}/>
      <textarea placeholder="Prompt *" value={form.prompt} onChange={e=>setForm({...form,prompt:e.target.value})} rows={3} style={{...iS,resize:"vertical"}}/>
      <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{...iS,cursor:"pointer"}}>
        <option value="image">🖼 Image</option><option value="video">🎬 Video</option>
        <option value="text">✍️ Writing</option><option value="other">⚡ Other</option>
      </select>
      <input placeholder="Preview image URL (optional)" value={form.previewUrl} onChange={e=>setForm({...form,previewUrl:e.target.value})} style={iS}/>
      <input placeholder="Tags (portrait, ai, realistic)" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} style={iS}/>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onClose} style={{...iS,background:"transparent",border:"1px solid #1e1e38",color:"#444",cursor:"pointer",flex:1,textAlign:"center"}}>Cancel</button>
        <button onClick={go} disabled={!form.title||!form.prompt} style={{
          background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",borderRadius:10,
          padding:"11px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",flex:2,
          opacity:(!form.title||!form.prompt)?0.4:1}}>Submit →</button>
      </div>
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App() {
  const [allPrompts,   setAllPrompts]   = useState([]);
  const [likesMap,     setLikesMap]     = useState({});
  const [usersMap,     setUsersMap]     = useState({});
  const [currentUser,  setCurrentUser]  = useState(null);
  const [userLikedIds, setUserLikedIds] = useState([]);
  const [page,         setPage]         = useState("home");
  const [showAuth,     setShowAuth]     = useState(false);
  const [showSubmit,   setShowSubmit]   = useState(false);
  const [showAdminPw,  setShowAdminPw]  = useState(false);
  const [adminPw,      setAdminPw]      = useState("");
  const [adminPwErr,   setAdminPwErr]   = useState(false);
  const [activeCat,    setActiveCat]    = useState("all");
  const [sort,         setSort]         = useState("recent");
  const [search,       setSearch]       = useState("");
  const [imgFilter,    setImgFilter]    = useState("All");
  const [arFilter,     setArFilter]     = useState("All");
  const [packFilter,   setPackFilter]   = useState("All");
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState("");

  const showToast = m => { setToast(m); setTimeout(()=>setToast(""),2400); };

  useEffect(()=>{
    (async()=>{
      // Load shared data from Firestore
      let prompts = await fsGet("prompts");
      if(!prompts||!prompts.length){ prompts=SEED_PROMPTS; await fsSet("prompts",prompts); }
      setAllPrompts(prompts);
      setLikesMap(await fsGet("likes")||{});
      const um = await fsGet("users")||{};
      setUsersMap(um);
      // Restore session from localStorage
      const sess = lsGet("ptn_session");
      if(sess?.userId && um[sess.userId]){
        setCurrentUser(um[sess.userId]);
        setUserLikedIds(lsGet(`ptn_ul_${sess.userId}`)||[]);
      }
      setLoading(false);
    })();
  },[]);

  const handleLike = async (promptId) => {
    if(!currentUser){ setShowAuth(true); return; }
    const already = userLikedIds.includes(promptId);
    const newUL  = already ? userLikedIds.filter(x=>x!==promptId) : [...userLikedIds,promptId];
    const newLM  = {...likesMap,[promptId]:Math.max(0,(likesMap[promptId]||0)+(already?-1:1))};
    setUserLikedIds(newUL); setLikesMap(newLM);
    lsSet(`ptn_ul_${currentUser.id}`,newUL);   // private → localStorage
    await fsSet("likes",newLM);                 // shared  → Firestore
    if(!already) showToast("❤️ Saved!");
  };

  const handleAuthSuccess = async (user) => {
    setCurrentUser(user); setShowAuth(false);
    setUserLikedIds(lsGet(`ptn_ul_${user.id}`)||[]);
    setUsersMap(await fsGet("users")||{});
    showToast(`✓ Welcome, ${user.name}!`);
  };

  const handleLogout = () => {
    lsSet("ptn_session",null); setCurrentUser(null); setUserLikedIds([]); setPage("home");
    showToast("Logout ho gaye.");
  };

  const handleSubmit = async (formData) => {
    const entry={id:`u_${Date.now()}`,...formData,approved:false,
      submittedBy:currentUser.id,submitterName:currentUser.name,createdAt:Date.now()};
    const updated=[...allPrompts,entry];
    setAllPrompts(updated); await fsSet("prompts",updated);
    setShowSubmit(false); showToast("✓ Submitted! Admin review karega.");
  };

  const handleApprove = async (id) => {
    const up=allPrompts.map(p=>p.id===id?{...p,approved:true}:p);
    setAllPrompts(up); await fsSet("prompts",up); showToast("✓ Approved!");
  };

  const handleDelete = async (id) => {
    const up=allPrompts.filter(p=>p.id!==id);
    setAllPrompts(up); await fsSet("prompts",up); showToast("🗑 Deleted.");
  };

  // Filters
  const publicPrompts = allPrompts.filter(p=>p.approved);
  let list = publicPrompts.filter(p=>activeCat==="all"||p.category===activeCat);
  if(imgFilter !=="All"&&activeCat==="image") list=list.filter(p=>p.aiModel===imgFilter);
  if(arFilter  !=="All"&&activeCat==="image") list=list.filter(p=>p.aspectRatio===arFilter);
  if(packFilter!=="All"&&activeCat==="text")  list=list.filter(p=>p.subPack===packFilter);
  if(search){const q=search.toLowerCase();list=list.filter(p=>
    p.title.toLowerCase().includes(q)||p.prompt.toLowerCase().includes(q)||(p.tags||[]).some(t=>t.includes(q)));}
  if(sort==="likes")  list=[...list].sort((a,b)=>(likesMap[b.id]||0)-(likesMap[a.id]||0));
  if(sort==="recent") list=[...list].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#06060f",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:40,height:40,border:"3px solid #a78bfa33",borderTop:"3px solid #a78bfa",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <p style={{color:"#444",fontSize:13,fontFamily:"sans-serif"}}>Loading Promptonic...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#06060f",color:"#fff",
      fontFamily:"'Inter',sans-serif",maxWidth:500,margin:"0 auto",position:"relative"}}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
      <Particles/>
      <div style={{position:"fixed",top:-120,left:"50%",transform:"translateX(-50%)",
        width:500,height:500,borderRadius:"50%",
        background:"radial-gradient(circle,#7c3aed1a 0%,transparent 70%)",
        pointerEvents:"none",zIndex:0}}/>

      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onSuccess={handleAuthSuccess} showToast={showToast}/>}

      {page==="admin"&&(
        <AdminPanel allPrompts={allPrompts} usersMap={usersMap} likesMap={likesMap}
          onApprove={handleApprove} onDelete={handleDelete}
          onLogout={()=>{setPage("home");setAdminPw("");}}/>
      )}

      {page==="profile"&&currentUser&&(
        <ProfilePage user={currentUser} allPrompts={allPrompts}
          userLikedIds={userLikedIds} onLogout={handleLogout} onBack={()=>setPage("home")}/>
      )}

      {page==="home"&&(
        <div style={{position:"relative",zIndex:1,padding:"22px 13px 110px"}}>

          {/* HEADER */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
            <div>
              <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,margin:0,
                background:"linear-gradient(135deg,#fff 20%,#a78bfa 100%)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Promptonic</h1>
              <p style={{margin:"3px 0 0",color:"#2a2a45",fontSize:11}}>{publicPrompts.length} prompts · Free</p>
            </div>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              {currentUser?(
                <>
                  <button onClick={()=>setPage("profile")} style={{
                    background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                    borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",
                    justifyContent:"center",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </button>
                  <button onClick={()=>setShowSubmit(s=>!s)} style={{
                    background:showSubmit?"transparent":"linear-gradient(135deg,#6d28d9,#a78bfa)",
                    border:showSubmit?"1px solid #333":"none",
                    borderRadius:10,padding:"8px 13px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                    {showSubmit?"✕":"+ Submit"}
                  </button>
                </>
              ):(
                <button onClick={()=>setShowAuth(true)} style={{
                  background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                  borderRadius:10,padding:"9px 14px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  Login
                </button>
              )}
              <button onClick={()=>setShowAdminPw(s=>!s)} style={{
                background:"transparent",border:"1px solid #1a1a2e",
                borderRadius:10,padding:"9px 10px",color:"#1e1e38",fontSize:14,cursor:"pointer"}} title="Admin">🔐</button>
            </div>
          </div>

          {showAdminPw&&(
            <div style={{background:"#0f0f1e",border:"1px solid #a78bfa1a",borderRadius:14,padding:14,marginBottom:16,display:"flex",flexDirection:"column",gap:8}}>
              <p style={{margin:0,fontSize:12,color:"#a78bfa",fontWeight:700,fontFamily:"'Syne',sans-serif"}}>🔐 Admin Login</p>
              <input type="password" placeholder="Password" value={adminPw}
                onChange={e=>{setAdminPw(e.target.value);setAdminPwErr(false);}}
                onKeyDown={e=>{if(e.key==="Enter"){if(adminPw===ADMIN_PASSWORD){setPage("admin");setShowAdminPw(false);setAdminPw("");}else setAdminPwErr(true);}}}
                style={{...iS,border:adminPwErr?"1px solid #f87171":iS.border}}/>
              {adminPwErr&&<p style={{margin:0,fontSize:11,color:"#f87171"}}>❌ Wrong password</p>}
              <button onClick={()=>{if(adminPw===ADMIN_PASSWORD){setPage("admin");setShowAdminPw(false);setAdminPw("");}else setAdminPwErr(true);}}
                style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",borderRadius:10,padding:"10px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Enter →</button>
            </div>
          )}

          {showSubmit&&currentUser&&<SubmitForm user={currentUser} onSubmit={handleSubmit} onClose={()=>setShowSubmit(false)}/>}

          <input placeholder="🔍  Search prompts..." value={search}
            onChange={e=>setSearch(e.target.value)} style={{...iS,marginBottom:12}}/>

          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[["recent","🆕 Recent"],["likes","❤️ Most Liked"]].map(([k,l])=>(
              <button key={k} onClick={()=>setSort(k)} style={{
                background:sort===k?"#a78bfa18":"transparent",
                border:`1px solid ${sort===k?"#a78bfa":"#ffffff10"}`,
                color:sort===k?"#a78bfa":"#444",borderRadius:20,
                padding:"6px 14px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
            ))}
          </div>

          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:6,marginBottom:12,scrollbarWidth:"none"}}>
            {CATS.map(cat=>{
              const active=activeCat===cat.id;
              const count=cat.id==="all"?publicPrompts.length:publicPrompts.filter(p=>p.category===cat.id).length;
              return (
                <button key={cat.id} onClick={()=>{setActiveCat(cat.id);setImgFilter("All");setArFilter("All");setPackFilter("All");}} style={{
                  background:active?`${cat.color}18`:"transparent",
                  border:`1px solid ${active?cat.color:"#ffffff0e"}`,
                  color:active?cat.color:"#444",borderRadius:20,
                  padding:"7px 13px",fontSize:11,fontWeight:600,
                  whiteSpace:"nowrap",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
                  {cat.emoji} {cat.label} <span style={{opacity:0.4}}>({count})</span>
                </button>
              );
            })}
          </div>

          {activeCat==="image"&&(<>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:8,scrollbarWidth:"none"}}>
              <span style={{fontSize:10,color:"#333",alignSelf:"center",marginRight:2,whiteSpace:"nowrap"}}>Model:</span>
              {IMG_MODELS.map(m=><button key={m} onClick={()=>setImgFilter(m)} style={{
                background:imgFilter===m?"#818cf818":"transparent",border:`1px solid ${imgFilter===m?"#818cf8":"#ffffff0e"}`,
                color:imgFilter===m?"#818cf8":"#444",borderRadius:20,padding:"5px 11px",fontSize:10,fontWeight:600,whiteSpace:"nowrap",cursor:"pointer",fontFamily:"inherit"}}>{m}</button>)}
            </div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:12,scrollbarWidth:"none"}}>
              <span style={{fontSize:10,color:"#333",alignSelf:"center",marginRight:2,whiteSpace:"nowrap"}}>Ratio:</span>
              {ASPECT_RATIOS.map(r=><button key={r} onClick={()=>setArFilter(r)} style={{
                background:arFilter===r?"#34d39918":"transparent",border:`1px solid ${arFilter===r?"#34d399":"#ffffff0e"}`,
                color:arFilter===r?"#34d399":"#444",borderRadius:20,padding:"5px 11px",fontSize:10,fontWeight:600,whiteSpace:"nowrap",cursor:"pointer",fontFamily:"inherit"}}>{r}</button>)}
            </div>
          </>)}

          {activeCat==="text"&&(
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:12,scrollbarWidth:"none"}}>
              <span style={{fontSize:10,color:"#333",alignSelf:"center",marginRight:2,whiteSpace:"nowrap"}}>Pack:</span>
              {WRITING_PACKS.map(pk=><button key={pk} onClick={()=>setPackFilter(pk)} style={{
                background:packFilter===pk?"#34d39918":"transparent",border:`1px solid ${packFilter===pk?"#34d399":"#ffffff0e"}`,
                color:packFilter===pk?"#34d399":"#444",borderRadius:20,padding:"5px 11px",fontSize:10,fontWeight:600,whiteSpace:"nowrap",cursor:"pointer",fontFamily:"inherit"}}>{pk}</button>)}
            </div>
          )}

          <p style={{fontSize:11,color:"#1a1a30",marginBottom:14}}>{list.length} prompts</p>

          {!currentUser&&(
            <div onClick={()=>setShowAuth(true)} style={{
              background:"#a78bfa08",border:"1px solid #a78bfa18",borderRadius:14,
              padding:"12px 16px",marginBottom:16,cursor:"pointer",
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{margin:0,fontSize:12,color:"#555"}}>
                ❤️ Like · 💬 Comment · 📂 Submit ke liye <span style={{color:"#a78bfa",fontWeight:700}}>login karo</span>
              </p>
              <span style={{fontSize:11,color:"#a78bfa",fontWeight:700,marginLeft:8,whiteSpace:"nowrap"}}>→</span>
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {list.length===0
              ?<div style={{textAlign:"center",padding:"60px 20px",color:"#1a1a30"}}><div style={{fontSize:44}}>🔮</div><p style={{marginTop:14}}>Koi prompt nahi mila.</p></div>
              :list.map(p=>(
                <Card key={p.id} p={p}
                  likes={likesMap[p.id]||0}
                  userLiked={userLikedIds.includes(p.id)}
                  onLike={handleLike}
                  currentUser={currentUser}
                  isAdmin={false}
                  onLoginRequired={()=>setShowAuth(true)}
                  showToast={showToast}/>
              ))
            }
          </div>
        </div>
      )}
      <Toast msg={toast}/>
    </div>
  );
}
