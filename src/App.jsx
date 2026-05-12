import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";

/* ─── SECURE HASH — SHA-256 via Web Crypto API ─── */
const sha256 = async (str) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
};

/* ─── BRUTE FORCE PROTECTION ─── */
const MAX_ATTEMPTS = 5;          // max login tries
const LOCKOUT_MS   = 15*60*1000; // 15 minute lockout

const checkLockout = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key)||"{}");
    if(data.lockedUntil && Date.now() < data.lockedUntil){
      const mins = Math.ceil((data.lockedUntil - Date.now())/60000);
      return {locked:true, mins};
    }
    return {locked:false, attempts: data.attempts||0};
  } catch { return {locked:false, attempts:0}; }
};

const recordAttempt = (key, success) => {
  try {
    const data = JSON.parse(localStorage.getItem(key)||"{}");
    if(success){
      localStorage.removeItem(key); return;
    }
    const attempts = (data.attempts||0) + 1;
    if(attempts >= MAX_ATTEMPTS){
      localStorage.setItem(key, JSON.stringify({attempts, lockedUntil: Date.now()+LOCKOUT_MS}));
    } else {
      localStorage.setItem(key, JSON.stringify({attempts}));
    }
  } catch {}
};

/* ─── ADMIN SESSION (expires in 8 hours) ─── */
const ADMIN_SESSION_MS = 8*60*60*1000;
const setAdminSession  = () => lsSet("ptn_admin_sess", {at: Date.now()});
const checkAdminSession= () => {
  const s = lsGet("ptn_admin_sess");
  return s && (Date.now() - s.at) < ADMIN_SESSION_MS;
};
const clearAdminSession= () => localStorage.removeItem("ptn_admin_sess");

/* ─── FIREBASE ─── */
const fsGet = async (key) => {
  try {
    const s = await getDoc(doc(db,"store",key));
    return s.exists()?s.data().value:null;
  } catch(e) {
    console.warn("fsGet failed:", key, e?.message);
    return null;
  }
};
const fsSet = async (key, value) => {
  try { await setDoc(doc(db,"store",key),{value}); }
  catch(e) { console.warn("fsSet failed:", key, e?.message); }
};
const lsGet = (k) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):null; } catch { return null; } };
const lsSet = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };
const timeAgo = ts=>{const d=(Date.now()-ts)/1000;if(d<60)return"just now";if(d<3600)return`${Math.floor(d/60)}m ago`;if(d<86400)return`${Math.floor(d/3600)}h ago`;return`${Math.floor(d/86400)}d ago`;};

/* ─── CATEGORIES ─── */
const CATS = [
  {id:"all",   label:"All",     emoji:"⚡", color:"#a78bfa"},
  {id:"image", label:"Image",   emoji:"🖼",  color:"#818cf8"},
  {id:"video", label:"Video",   emoji:"🎬",  color:"#fb923c"},
  {id:"text",  label:"Writing", emoji:"✍️",  color:"#34d399"},
  {id:"other", label:"Other",   emoji:"⚡",  color:"#f472b6"},
];
const IMG_MODELS    = ["All","Midjourney","SDXL","Flux","DALL-E"];
const ASPECT_RATIOS = ["All","1:1","16:9","9:16","4:3","3:2"];
const WRITING_PACKS = ["All","Captions","Hooks","Scripts","YouTube","Carousel","Philosophy","Psychology"];
const MODEL_CLR = {Midjourney:"#818cf8",SDXL:"#f472b6",Flux:"#34d399","DALL-E":"#fb923c"};

/* ─── SEED DATA ─── */
const SEED = [
  {id:"p1",category:"image",title:"Cinematic Portrait",
    description:"Create stunning cinematic portraits with golden hour lighting",
    prompt:"A cinematic portrait of a young woman, golden hour lighting, shallow depth of field, film grain, 35mm lens, ultra realistic, 8K resolution, professional photography",
    negativePrompt:"blur, low quality, watermark, ugly, distorted face",
    tags:["portrait","realistic","golden hour"],
    previewUrl:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&q=80",
    aiModel:"Midjourney",aspectRatio:"4:3",mjParams:"--ar 4:3 --v 6.1 --style raw --q 2",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000001,copies:1241},
  {id:"p2",category:"image",title:"Fantasy Landscape",
    description:"Epic fantasy worlds with floating islands and glowing crystals",
    prompt:"Epic fantasy landscape, floating islands with waterfalls, glowing crystals, dramatic storm clouds, God rays piercing through, hyperdetailed, concept art style, by Greg Rutkowski",
    negativePrompt:"low resolution, blurry, flat, cartoonish, modern buildings",
    tags:["landscape","fantasy","concept art"],
    previewUrl:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&q=80",
    aiModel:"SDXL",aspectRatio:"16:9",mjParams:"--ar 16:9 --v 6",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000002,copies:876},
  {id:"p3",category:"image",title:"Cyberpunk City Night",
    description:"Futuristic neon-lit cityscapes with cinematic atmosphere",
    prompt:"Futuristic cyberpunk city at night, neon signs, rain reflections on wet pavement, dense crowds with holographic displays, volumetric fog, ultra detailed, 8K cinematic",
    negativePrompt:"daylight, natural colors, old buildings, countryside, low quality",
    tags:["cyberpunk","city","neon"],
    previewUrl:"https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=700&q=80",
    aiModel:"Flux",aspectRatio:"16:9",mjParams:"--ar 16:9 --v 6.1 --style raw",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000003,copies:2103},
  {id:"p4",category:"image",title:"Luxury Product Shot",
    description:"High-end commercial photography for luxury products",
    prompt:"Minimalist luxury perfume bottle on white marble, soft directional shadows, studio strobe lighting, clean white background, commercial photography, ultra sharp",
    negativePrompt:"busy background, people, outdoor, props, low contrast",
    tags:["product","commercial","minimalist"],
    previewUrl:"https://images.unsplash.com/photo-1541643600914-78b084683702?w=700&q=80",
    aiModel:"DALL-E",aspectRatio:"1:1",mjParams:"--ar 1:1 --v 6 --style raw",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000004,copies:543},
  {id:"p5",category:"image",title:"Dramatic Ocean Sunset",
    description:"Ultra realistic ocean sunset with dramatic cloud formations",
    prompt:"Breathtaking ocean sunset, dramatic orange and pink clouds, calm water reflecting golden light, silhouette of lone sailboat, long exposure photography, ultra realistic, 8K",
    negativePrompt:"overexposed, flat sky, no clouds, city, people, CGI look",
    tags:["nature","sunset","ocean"],
    previewUrl:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=80",
    aiModel:"Midjourney",aspectRatio:"16:9",mjParams:"--ar 16:9 --v 6 --style scenic",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000005,copies:987},
  {id:"p6",category:"image",title:"Soft Studio Portrait",
    description:"Professional Vogue-style beauty photography",
    prompt:"Professional female portrait, soft box studio lighting, neutral grey background, beauty dish, sharp focus on eyes, 85mm lens bokeh, skin retouching, Vogue magazine style",
    negativePrompt:"harsh shadows, red eye, busy background, ugly, deformed",
    tags:["portrait","studio","fashion"],
    previewUrl:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&q=80",
    aiModel:"SDXL",aspectRatio:"4:3",mjParams:"--ar 4:3 --v 6.1 --style raw",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000006,copies:721},
  {id:"p7",category:"video",title:"Slow Mo Water Splash",
    description:"Ultra high-speed water splash in cinematic studio setting",
    prompt:"Ultra slow motion water splash in dark studio, crystal clear droplets frozen in air, black background, professional studio rim lighting, 1000fps high speed camera, 4K cinematic color grade",
    tags:["slow motion","water","studio"],
    previewUrl:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=700&q=80",
    videoIcon:true,approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000007,copies:432},
  {id:"p8",category:"video",title:"Rose Bloom Timelapse",
    description:"Beautiful macro timelapse of a rose blooming",
    prompt:"Timelapse of a red rose blooming from tight bud to full bloom, soft north-facing window light, macro lens, clean green bokeh background, 60fps smooth playback, cinematic grade",
    tags:["nature","timelapse","macro"],
    previewUrl:"https://images.unsplash.com/photo-1490750967868-88df5691cc25?w=700&q=80",
    videoIcon:true,approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000008,copies:312},
  {id:"p9",category:"video",title:"Aerial Mountain Flyover",
    description:"Epic cinematic drone footage over the Himalayas",
    prompt:"Cinematic aerial drone footage over Himalayan peaks at sunrise, golden morning mist filling deep valleys, ultra smooth slow pan, 4K LOG footage, landscape cinematography, epic scale",
    tags:["drone","cinematic","landscape"],
    previewUrl:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=80",
    videoIcon:true,approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000009,copies:689},
  {id:"p10",category:"video",title:"Cinematic Car Chase",
    description:"Action-packed car chase scene optimized for Kling AI",
    prompt:"Cinematic car chase scene on city highway at dusk, low angle follow cam, motion blur, wet road reflections, street lights streaking, handheld shaky cam, action movie grade, Kling AI optimized",
    tags:["action","car","cinematic"],
    previewUrl:"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=700&q=80",
    videoIcon:true,approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000010,copies:891},
  {id:"p11",category:"text",title:"Viral Instagram Hook",
    description:"Write hooks that stop the scroll and get instant engagement",
    subPack:"Hooks",
    prompt:"Write 5 viral Instagram hooks for [TOPIC]. Each hook must create instant curiosity, start with a bold statement or shocking fact, be under 12 words, trigger emotion (shock, curiosity, FOMO). No emojis in hooks.",
    tags:["instagram","viral","hooks"],
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000011,copies:3241},
  {id:"p12",category:"text",title:"YouTube Script Intro",
    description:"Hook viewers in the first 5 seconds with a powerful intro",
    subPack:"YouTube",
    prompt:"Write a YouTube video script intro for [TOPIC]. Hook in first 5 seconds, tease what viewer will learn, include a pattern interrupt, mention a relatable problem. Keep it under 45 seconds when spoken at normal pace.",
    tags:["youtube","script","intro"],
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000012,copies:2187},
  {id:"p13",category:"text",title:"Instagram Carousel",
    description:"7-slide educational carousel that drives saves and shares",
    subPack:"Carousel",
    prompt:"Write a 7-slide Instagram carousel about [TOPIC]. Slide 1: bold headline hook. Slides 2-6: one key insight per slide with example. Slide 7: strong CTA. Each slide: max 3 lines. Second person voice.",
    tags:["carousel","instagram","educational"],
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000013,copies:1876},
  {id:"p14",category:"other",title:"Brand Name Generator",
    description:"Generate 10 memorable brand names with taglines",
    prompt:"Generate 10 unique brand names for a [BUSINESS TYPE] targeting [AUDIENCE]. Each name: max 10 characters, easy to spell, suggest a one-line tagline. Include the vibe/meaning for each name.",
    tags:["branding","naming","startup"],
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000014,copies:1543},
];

/* ─── HELPERS ─── */
const cc = id => CATS.find(c=>c.id===id)?.color||"#a78bfa";

/* ─── GLOBAL CSS ─── */
const G = `
  *{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{background:#0a0a0f;color:#e2e8f0;font-family:'Inter',sans-serif;line-height:1.5;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-thumb{background:#1e1e3a;border-radius:4px;}
  input,textarea,select,button{font-family:'Inter',sans-serif;}

  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  @keyframes popIn{0%{transform:scale(0.9);opacity:0}100%{transform:scale(1);opacity:1}}

  /* Page transition */
  .page-enter{animation:fadeUp 0.25s ease both;}

  /* Cards */
  .card{transition:transform 0.2s ease,border-color 0.2s ease,box-shadow 0.2s ease !important;}
  .card:hover{border-color:rgba(167,139,250,0.25)!important;transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.5)!important;}
  .copy-btn:hover{background:rgba(109,40,217,1)!important;transform:scale(1.02);}
  .like-btn:hover{border-color:rgba(244,114,182,0.5)!important;}

  /* Skeleton shimmer */
  .skeleton{background:linear-gradient(90deg,#0f0f1a 25%,#1a1a2e 50%,#0f0f1a 75%);background-size:400px 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:8px;}

  /* Scrollbar */
  .no-scroll{scrollbar-width:none;-ms-overflow-style:none;}
  .no-scroll::-webkit-scrollbar{display:none;}

  /* Grid */
  .prompt-grid{display:grid;grid-template-columns:1fr;gap:16px;}
  @media(min-width:700px){.prompt-grid{grid-template-columns:1fr 1fr;gap:20px;}}
  @media(min-width:1100px){.prompt-grid{grid-template-columns:1fr 1fr 1fr;gap:24px;}}

  /* Layout */
  .page-wrap{max-width:1200px;margin:0 auto;padding:0 20px;}
  .sidebar-layout{display:block;}
  @media(min-width:960px){.sidebar-layout{display:grid;grid-template-columns:220px 1fr;gap:32px;align-items:start;}}
  .sidebar{display:none;}
  @media(min-width:960px){.sidebar{display:flex;flex-direction:column;gap:6px;position:sticky;top:80px;}}
  .mobile-cats{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:16px;}
  @media(min-width:960px){.mobile-cats{display:none;}}

  /* Hero */
  .hero-title{font-size:clamp(28px,5vw,52px);}
  .hero-sub{font-size:clamp(13px,1.5vw,16px);}

  /* Nav search */
  .nav-search-wrap{flex:1;max-width:440px;position:relative;}
  @media(max-width:640px){.nav-search-wrap{display:none;}}
  .nav-search-wrap.open{display:block !important;}
  .mobile-search-bar{display:none;padding:8px 16px 10px;background:rgba(10,10,15,0.97);border-bottom:1px solid rgba(255,255,255,0.05);}
  @media(max-width:640px){.mobile-search-bar.open{display:block;}}
  .search-icon-btn{display:none;}
  @media(max-width:640px){.search-icon-btn{display:flex;}}

  /* Desktop nav links */
  @media(min-width:768px){.desktop-nav-links{display:flex !important;}}

  /* Smooth image load */
  img{transition:opacity 0.3s ease;}

  /* Button press feel */
  button:active{transform:scale(0.97);}

  /* FAQ accordion */
  .faq-item{border-bottom:1px solid rgba(255,255,255,0.05);}
  .faq-item:last-child{border-bottom:none;}

  /* Follow btn */
  .follow-btn{transition:all 0.2s ease;}
  .follow-btn:hover{transform:scale(1.03);}
`;

const inp = {
  background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",
  borderRadius:10,padding:"11px 14px",color:"#e2e8f0",fontSize:14,
  width:"100%",outline:"none",
};

/* ─── TOAST ─── */
function Toast({msg}){
  if(!msg) return null;
  return(
    <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",
      background:msg.startsWith("⚠")?"#7c2d12":"#14532d",color:"#fff",
      borderRadius:24,padding:"11px 24px",fontWeight:600,fontSize:13,
      zIndex:1000,whiteSpace:"nowrap",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
      animation:"fadeUp 0.2s ease"}}>
      {msg}
    </div>
  );
}

/* ─── COMMENTS ─── */
function CommentsSection({promptId,currentUser,onLoginRequired,showToast}){
  const [comments,setComments]=useState([]);
  const [text,setText]=useState("");
  const [loading,setLoading]=useState(true);
  const [posting,setPosting]=useState(false);

  useEffect(()=>{
    (async()=>{const all=await fsGet("comments")||{};setComments(all[promptId]||[]);setLoading(false);})();
  },[promptId]);

  const post=async()=>{
    if(!currentUser){onLoginRequired();return;}
    if(!text.trim())return;
    setPosting(true);
    const c={id:`c_${Date.now()}`,promptId,userId:currentUser.id,
      userName:currentUser.name,username:currentUser.username,
      text:text.trim(),createdAt:Date.now()};
    const all=await fsGet("comments")||{};
    const up={...all,[promptId]:[...(all[promptId]||[]),c]};
    await fsSet("comments",up);
    setComments(up[promptId]);setText("");setPosting(false);
    showToast("💬 Comment posted!");
  };

  const del=async(cid)=>{
    const all=await fsGet("comments")||{};
    const up={...all,[promptId]:(all[promptId]||[]).filter(c=>c.id!==cid)};
    await fsSet("comments",up);setComments(up[promptId]||[]);
    showToast("Deleted.");
  };

  if(loading) return <p style={{fontSize:12,color:"#3a3a5a",padding:"8px 0"}}>Loading comments...</p>;

  return(
    <div onClick={e=>e.stopPropagation()} style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:16,marginTop:8}}>
      <p style={{fontSize:12,fontWeight:700,color:"#6b7280",marginBottom:12,letterSpacing:"0.05em"}}>
        COMMENTS ({comments.length})
      </p>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
        {comments.length===0&&(
          <p style={{fontSize:13,color:"#2a2a3a",textAlign:"center",padding:"12px 0"}}>No comments yet. Be first! 👇</p>
        )}
        {comments.map(c=>(
          <div key={c.id} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
              background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:11,fontWeight:800,color:"#fff"}}>
              {c.userName.charAt(0).toUpperCase()}
            </div>
            <div style={{flex:1,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"8px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#c4b5fd"}}>{c.userName}</span>
                  <span style={{fontSize:10,color:"#3a3a5a"}}>@{c.username}</span>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#2a2a3a"}}>{timeAgo(c.createdAt)}</span>
                  {currentUser&&currentUser.id===c.userId&&(
                    <button onClick={()=>del(c.id)} style={{background:"none",border:"none",
                      color:"#2a2a4a",cursor:"pointer",fontSize:12,lineHeight:1}}>✕</button>
                  )}
                </div>
              </div>
              <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.5}}>{c.text}</p>
            </div>
          </div>
        ))}
      </div>
      {currentUser?(
        <div style={{display:"flex",gap:8}}>
          <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
            background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:11,fontWeight:800,color:"#fff"}}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div style={{flex:1,display:"flex",gap:8}}>
            <input value={text} onChange={e=>setText(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();post();}}}
              placeholder="Write a comment..."
              style={{...inp,flex:1,padding:"8px 13px",fontSize:13,borderRadius:20}}/>
            <button onClick={post} disabled={!text.trim()||posting}
              style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                borderRadius:20,padding:"8px 16px",color:"#fff",fontSize:12,fontWeight:700,
                cursor:"pointer",opacity:(!text.trim()||posting)?0.4:1,whiteSpace:"nowrap"}}>
              Post
            </button>
          </div>
        </div>
      ):(
        <button onClick={onLoginRequired}
          style={{width:"100%",background:"rgba(167,139,250,0.05)",
            border:"1px solid rgba(167,139,250,0.12)",borderRadius:10,padding:"10px",
            color:"#6b7280",fontSize:12,cursor:"pointer",fontWeight:600}}>
          Sign in to comment →
        </button>
      )}
    </div>
  );
}

/* ─── PROMPT CARD ─── */
function PromptCard({p,likes,userLiked,onLike,currentUser,onLoginRequired,showToast,onViewCreator}){
  const [open,setOpen]=useState(false);
  const [imgErr,setImgErr]=useState(false);
  const [showCols,setShowCols]=useState(false);
  const hasImg=p.previewUrl&&!imgErr&&(p.category==="image"||p.category==="video");
  const color=cc(p.category);
  const cat=CATS.find(c=>c.id===p.category);
  const totalCopies=(p.copies||0);

  return(
    <div className="card" onClick={()=>setOpen(o=>!o)}
      style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",
        borderRadius:16,overflow:"hidden",cursor:"pointer",
        animation:"fadeUp 0.3s ease",
        boxShadow:open?"0 0 0 1px rgba(167,139,250,0.2),0 12px 40px rgba(0,0,0,0.4)":"0 2px 8px rgba(0,0,0,0.3)"}}>

      {/* ── IMAGE / VIDEO PREVIEW ── */}
      {hasImg&&(
        <div style={{position:"relative",width:"100%",aspectRatio:"16/9",overflow:"hidden"}}>
          <img src={p.previewUrl} alt={p.title} onError={()=>setImgErr(true)}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block",
              filter:"brightness(0.65) saturate(1.05)",
              transition:"transform 0.5s",transform:open?"scale(1.04)":"scale(1)"}}/>
          <div style={{position:"absolute",inset:0,
            background:"linear-gradient(to top,#111118 0%,rgba(17,17,24,0.4) 50%,transparent 100%)"}}/>
          {/* Badges */}
          <div style={{position:"absolute",top:12,left:12,right:12,display:"flex",justifyContent:"space-between"}}>
            <span style={{background:`${color}20`,border:`1px solid ${color}50`,
              color,borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:700,
              backdropFilter:"blur(8px)",letterSpacing:"0.05em"}}>
              {cat?.emoji} {p.category.toUpperCase()}
            </span>
            {p.aiModel&&(
              <span style={{background:`${MODEL_CLR[p.aiModel]||"#888"}20`,
                border:`1px solid ${MODEL_CLR[p.aiModel]||"#888"}50`,
                color:MODEL_CLR[p.aiModel]||"#fff",
                borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,
                backdropFilter:"blur(8px)"}}>
                {p.aiModel}
              </span>
            )}
          </div>
          {/* Video icon */}
          {p.videoIcon&&(
            <div style={{position:"absolute",top:"50%",left:"50%",
              transform:"translate(-50%,-50%)",width:52,height:52,borderRadius:"50%",
              background:"rgba(0,0,0,0.6)",border:"2px solid rgba(255,255,255,0.5)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:20,paddingLeft:4,backdropFilter:"blur(4px)"}}>▶</div>
          )}
          {/* Title on image */}
          <div style={{position:"absolute",bottom:14,left:16,right:16}}>
            <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700,
              color:"#fff",lineHeight:1.5,textShadow:"0 2px 12px rgba(0,0,0,0.8)",marginBottom:4}}>
              {p.title}
            </h3>
            {p.description&&(
              <p style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.4}}>{p.description}</p>
            )}
          </div>
        </div>
      )}

      {/* ── CARD BODY ── */}
      <div style={{padding:"16px 18px 18px"}}>

        {/* No-image header */}
        {!hasImg&&(
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <span style={{background:`${color}15`,border:`1px solid ${color}35`,
                color,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,letterSpacing:"0.05em"}}>
                {cat?.emoji} {p.category.toUpperCase()}
              </span>
              {p.subPack&&(
                <span style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
                  color:"#94a3b8",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>
                  {p.subPack}
                </span>
              )}
              {p.aiModel&&(
                <span style={{background:`${MODEL_CLR[p.aiModel]||"#888"}15`,
                  border:`1px solid ${MODEL_CLR[p.aiModel]||"#888"}35`,
                  color:MODEL_CLR[p.aiModel]||"#888",
                  borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>
                  {p.aiModel}
                </span>
              )}
            </div>
            <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700,
              color:"#f1f5f9",marginBottom:4,lineHeight:1.5}}>{p.title}</h3>
            {p.description&&(
              <p style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>{p.description}</p>
            )}
          </div>
        )}

        {/* Author + stats row */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:22,height:22,borderRadius:"50%",
            background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>
            {(p.submitterName||"A").charAt(0).toUpperCase()}
          </div>
          <span style={{fontSize:12,color:"#4a4a6a"}}>
            by{" "}
            <span
              onClick={e=>{e.stopPropagation();if(p.submittedBy&&p.submittedBy!=="admin")onViewCreator(p.submittedBy);}}
              style={{color:"#94a3b8",fontWeight:600,
                cursor:p.submittedBy&&p.submittedBy!=="admin"?"pointer":"default",
                textDecoration:p.submittedBy&&p.submittedBy!=="admin"?"underline":"none"}}>
              {p.submitterName||(p.submittedBy==="admin"?"Admin":p.submittedBy)}
            </span>
          </span>
          <div style={{display:"flex",gap:8,marginLeft:"auto",alignItems:"center"}}>
            <span style={{fontSize:11,color:"#3a3a5a",display:"flex",alignItems:"center",gap:4}}>
              📋 <span style={{color:"#6b7280"}}>{totalCopies.toLocaleString()}</span>
            </span>
            <button className="like-btn" onClick={e=>{e.stopPropagation();onLike(p.id);}}
              style={{background:"transparent",
                border:`1px solid ${userLiked?"rgba(244,114,182,0.4)":"rgba(255,255,255,0.08)"}`,
                borderRadius:20,padding:"3px 10px",
                color:userLiked?"#f472b6":"#6b7280",fontSize:11,fontWeight:600,
                cursor:"pointer",display:"flex",alignItems:"center",gap:4,transition:"all 0.15s"}}>
              {userLiked?"❤️":"🤍"} {likes}
            </button>
          </div>
        </div>

        {/* ── PROMPT BOX — always visible ── */}
        <div style={{background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:10,padding:"12px 14px",marginBottom:12,position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:8}}>
            <span style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:"0.08em"}}>PROMPT</span>
            <button className="copy-btn" onClick={e=>{
              e.stopPropagation();
              navigator.clipboard.writeText(p.prompt);
              showToast("✓ Prompt copied!");
            }} style={{background:"rgba(109,40,217,0.8)",border:"none",
              borderRadius:8,padding:"4px 12px",color:"#fff",fontSize:11,fontWeight:700,
              cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",gap:5,
              transition:"background 0.15s"}}>
              📋 Copy Prompt
            </button>
          </div>
          <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,
            display: open?"block":"-webkit-box",
            WebkitLineClamp:3,WebkitBoxOrient:"vertical",
            overflow:open?"visible":"hidden"}}>
            {p.prompt}
          </p>
          {!open&&(
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,
              background:"linear-gradient(to top,rgba(0,0,0,0.3),transparent)",
              borderRadius:"0 0 10px 10px",pointerEvents:"none"}}/>
          )}
        </div>

        {/* Tags */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom: open?12:0}}>
          {(p.tags||[]).map(t=>(
            <span key={t} onClick={e=>e.stopPropagation()}
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",
                color:"#64748b",borderRadius:20,padding:"3px 10px",fontSize:11}}>
              #{t}
            </span>
          ))}
          <span style={{fontSize:11,color:"#2a2a3a",alignSelf:"center",marginLeft:"auto"}}>
            {open?"▲ less":"▼ more"}
          </span>
        </div>

        {/* Expanded section */}
        {open&&(
          <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:4}}
            onClick={e=>e.stopPropagation()}>

            {/* ── Action bar: Share + Collections ── */}
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <ShareBtn p={p} showToast={showToast}/>
              <button onClick={()=>{
                if(!currentUser){onLoginRequired();return;}
                setShowCols(true);
              }} style={{background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,
                padding:"6px 12px",color:"#6b7280",cursor:"pointer",fontSize:12,
                display:"flex",alignItems:"center",gap:5}}>
                📁 Save to Collection
              </button>
            </div>

            {/* ── Star Rating ── */}
            <div style={{background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.1)",
              borderRadius:10,padding:"10px 14px"}}>
              <p style={{fontSize:10,color:"#ca8a04",fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>
                ⭐ RATE THIS PROMPT
              </p>
              <StarRating promptId={p.id} currentUser={currentUser}
                onLoginRequired={onLoginRequired} showToast={showToast}/>
            </div>

            {p.negativePrompt&&(
              <div style={{background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.12)",
                borderRadius:10,padding:"10px 14px"}}>
                <p style={{fontSize:10,color:"#f87171",fontWeight:700,letterSpacing:"0.08em",marginBottom:6}}>⛔ NEGATIVE PROMPT</p>
                <p style={{fontSize:12,color:"#6b7280",lineHeight:1.6}}>{p.negativePrompt}</p>
              </div>
            )}

            {p.mjParams&&(
              <div style={{background:"rgba(129,140,248,0.04)",border:"1px solid rgba(129,140,248,0.12)",
                borderRadius:10,padding:"10px 14px"}}>
                <p style={{fontSize:10,color:"#818cf8",fontWeight:700,letterSpacing:"0.08em",marginBottom:6}}>⚙️ PARAMETERS</p>
                <code style={{fontSize:12,color:"#a5b4fc",fontFamily:"'Courier New',monospace"}}>{p.mjParams}</code>
              </div>
            )}

            {p.aspectRatio&&(
              <div style={{display:"flex",gap:8}}>
                <span style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:8,padding:"4px 12px",fontSize:12,color:"#64748b"}}>
                  📐 {p.aspectRatio}
                </span>
              </div>
            )}

            {/* Comments */}
            <CommentsSection promptId={p.id} currentUser={currentUser}
              onLoginRequired={onLoginRequired} showToast={showToast}/>
          </div>
        )}
      </div>

      {/* Collections Modal */}
      {showCols&&currentUser&&(
        <CollectionsModal
          promptId={p.id}
          promptTitle={p.title}
          currentUser={currentUser}
          onClose={()=>setShowCols(false)}
          showToast={showToast}/>
      )}
    </div>
  );
}

/* ─── AUTH MODAL ─── */
function AuthModal({onClose,onSuccess,showToast}){
  const [tab,setTab]=useState("login");
  const [form,setForm]=useState({name:"",username:"",password:""});
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);

  const go=async()=>{
    setBusy(true);setErr("");
    if(tab==="login"){
      if(!form.username||!form.password){setErr("All fields required");setBusy(false);return;}
      // Check brute force lockout
      const lockKey=`ptn_lk_${form.username.toLowerCase()}`;
      const lock=checkLockout(lockKey);
      if(lock.locked){setErr(`Too many attempts. Try after ${lock.mins} min.`);setBusy(false);return;}
      const users=await fsGet("users")||{};
      const hashed=await sha256(form.password);
      const user=Object.values(users).find(u=>
        u.username.toLowerCase()===form.username.toLowerCase()&&
        u.passwordHash===hashed);
      if(!user){
        recordAttempt(lockKey, false);
        const lock2=checkLockout(lockKey);
        if(lock2.locked) setErr(`Too many attempts! Locked for ${lock2.mins} min.`);
        else setErr(`Wrong username or password. ${MAX_ATTEMPTS-(lock2.attempts)} attempts left.`);
        setBusy(false);return;
      }
      recordAttempt(lockKey, true);
      lsSet("ptn_session",{userId:user.id, at:Date.now()});
      onSuccess(user);
    } else {
      if(!form.name||!form.username||!form.password){setErr("All fields required");setBusy(false);return;}
      if(form.password.length<8){setErr("Password: min 8 characters");setBusy(false);return;}
      if(!/^[a-zA-Z0-9_]+$/.test(form.username)){setErr("Username: letters, numbers & _ only");setBusy(false);return;}
      const users=await fsGet("users")||{};
      if(Object.values(users).some(u=>u.username.toLowerCase()===form.username.toLowerCase())){
        setErr("Username already taken");setBusy(false);return;
      }
      const id=`u_${Date.now()}`;
      const hashed=await sha256(form.password);
      const user={id,name:form.name.trim(),username:form.username.trim(),
        passwordHash:hashed,createdAt:Date.now()};
      await fsSet("users",{...users,[id]:user});
      lsSet("ptn_session",{userId:id, at:Date.now()});
      showToast("✓ Welcome to Promptonic! 🎉");
      onSuccess(user);
    }
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",
      display:"flex",alignItems:"center",justifyContent:"center",
      zIndex:500,padding:20,backdropFilter:"blur(10px)"}}>
      <div style={{background:"#0f0f1a",border:"1px solid rgba(167,139,250,0.2)",
        borderRadius:20,padding:28,width:"100%",maxWidth:400,
        boxShadow:"0 24px 80px rgba(0,0,0,0.8)",animation:"fadeUp 0.2s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,
              background:"linear-gradient(135deg,#fff,#a78bfa)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:2}}>
              Promptonic
            </h2>
            <p style={{fontSize:12,color:"#4a4a6a"}}>
              {tab==="login"?"Welcome back!":"Free forever — join now"}
            </p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:8,padding:"6px 10px",color:"#6b7280",cursor:"pointer",fontSize:15}}>✕</button>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:20,padding:4,
          background:"rgba(255,255,255,0.03)",borderRadius:10}}>
          {["login","register"].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setErr("");}}
              style={{flex:1,background:tab===t?"rgba(109,40,217,0.8)":"transparent",
                border:"none",borderRadius:7,padding:"9px",
                color:tab===t?"#fff":"#6b7280",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {t==="login"?"Sign In":"Register"}
            </button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {tab==="register"&&(
            <input placeholder="Your name" value={form.name}
              onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp}/>
          )}
          <input placeholder="Username" value={form.username}
            onChange={e=>setForm(p=>({...p,username:e.target.value}))} style={inp}/>
          <input type="password" placeholder="Password" value={form.password}
            onChange={e=>setForm(p=>({...p,password:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&go()} style={inp}/>
          {err&&<p style={{fontSize:12,color:"#f87171"}}>⚠️ {err}</p>}
          <button onClick={go} disabled={busy}
            style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
              borderRadius:10,padding:"13px",color:"#fff",fontWeight:700,fontSize:14,
              cursor:"pointer",marginTop:4,opacity:busy?0.6:1}}>
            {busy?"...":(tab==="login"?"Sign In →":"Create Account →")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── STAR RATING ─── */
function StarRating({promptId, currentUser, onLoginRequired, showToast}){
  const [ratings, setRatings] = useState({});   // {userId: 1-5}
  const [loading, setLoading] = useState(true);
  const [hover,   setHover]   = useState(0);

  useEffect(()=>{
    (async()=>{
      const all = await fsGet("ratings")||{};
      setRatings(all[promptId]||{});
      setLoading(false);
    })();
  },[promptId]);

  const myRating = currentUser ? (ratings[currentUser.id]||0) : 0;
  const avgRating = Object.keys(ratings).length
    ? (Object.values(ratings).reduce((a,b)=>a+b,0)/Object.keys(ratings).length).toFixed(1)
    : null;
  const totalRatings = Object.keys(ratings).length;

  const rate = async(star) => {
    if(!currentUser){onLoginRequired();return;}
    const all = await fsGet("ratings")||{};
    const prev = all[promptId]||{};
    const updated = {...all, [promptId]:{...prev, [currentUser.id]:star}};
    await fsSet("ratings", updated);
    setRatings(updated[promptId]);
    showToast(`⭐ ${star}/5 rating diya!`);
  };

  if(loading) return null;

  return(
    <div onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      {/* Stars */}
      <div style={{display:"flex",gap:3}}>
        {[1,2,3,4,5].map(s=>(
          <button key={s}
            onClick={()=>rate(s)}
            onMouseEnter={()=>setHover(s)}
            onMouseLeave={()=>setHover(0)}
            style={{background:"none",border:"none",cursor:"pointer",padding:"2px",fontSize:18,
              color:(hover||myRating)>=s?"#fbbf24":"#2a2a45",
              transition:"color 0.1s, transform 0.1s",
              transform:(hover||myRating)>=s?"scale(1.15)":"scale(1)"}}>
            ★
          </button>
        ))}
      </div>
      {/* Avg */}
      {avgRating && (
        <span style={{fontSize:12,color:"#6b7280"}}>
          {avgRating} <span style={{color:"#3a3a5a"}}>({totalRatings})</span>
        </span>
      )}
      {myRating>0&&<span style={{fontSize:11,color:"#fbbf24"}}>Your rating: {myRating}★</span>}
    </div>
  );
}

/* ─── COLLECTIONS MODAL ─── */
function CollectionsModal({promptId, promptTitle, currentUser, onClose, showToast}){
  const [cols,    setCols]    = useState({});  // {colId:{name,promptIds[]}}
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const key = `ptn_cols_${currentUser.id}`;

  useEffect(()=>{
    const stored = lsGet(key)||{};
    setCols(stored);
    setLoading(false);
  },[]);

  const save = (updated) => { setCols(updated); lsSet(key, updated); };

  const createCol = () => {
    if(!newName.trim()) return;
    const id = `col_${Date.now()}`;
    save({...cols, [id]:{name:newName.trim(), promptIds:[], createdAt:Date.now()}});
    setNewName("");
    showToast("📁 Collection bana di!");
  };

  const togglePrompt = (colId) => {
    const col = cols[colId];
    const has = col.promptIds.includes(promptId);
    const updated = {...cols, [colId]:{...col,
      promptIds: has ? col.promptIds.filter(id=>id!==promptId) : [...col.promptIds, promptId]
    }};
    save(updated);
    showToast(has ? "Removed from collection" : `✓ Added to "${col.name}"`);
  };

  const deleteCol = (colId) => {
    const {[colId]:_, ...rest} = cols;
    save(rest);
    showToast("🗑 Collection delete ho gayi.");
  };

  return(
    <div onClick={e=>e.stopPropagation()}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",
        display:"flex",alignItems:"center",justifyContent:"center",
        zIndex:600,padding:20,backdropFilter:"blur(8px)"}}>
      <div style={{background:"#0f0f1a",border:"1px solid rgba(167,139,250,0.2)",
        borderRadius:20,padding:24,width:"100%",maxWidth:380,
        boxShadow:"0 24px 80px rgba(0,0,0,0.8)",animation:"fadeUp 0.2s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:"#e2e8f0"}}>
            📁 Save to Collection
          </h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"5px 9px",
            color:"#6b7280",cursor:"pointer",fontSize:14}}>✕</button>
        </div>
        <p style={{fontSize:12,color:"#4a4a6a",marginBottom:16}}>"{promptTitle}"</p>

        {/* Create new */}
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <input placeholder="Nayi collection ka naam..."
            value={newName} onChange={e=>setNewName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&createCol()}
            style={{...inp,flex:1,fontSize:13,padding:"9px 12px"}}/>
          <button onClick={createCol} disabled={!newName.trim()}
            style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
              borderRadius:10,padding:"9px 14px",color:"#fff",fontWeight:700,fontSize:13,
              cursor:"pointer",opacity:!newName.trim()?0.4:1}}>
            + New
          </button>
        </div>

        {/* Collections list */}
        {loading ? <p style={{color:"#3a3a5a",fontSize:13}}>Loading...</p> :
         Object.keys(cols).length===0 ? (
          <p style={{color:"#2a2a3a",fontSize:13,textAlign:"center",padding:"20px 0"}}>
            Koi collection nahi hai abhi. Upar se banao! 👆
          </p>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:280,overflowY:"auto"}}>
            {Object.entries(cols).map(([colId,col])=>{
              const has = col.promptIds.includes(promptId);
              return(
                <div key={colId} style={{display:"flex",alignItems:"center",gap:10,
                  background:"rgba(255,255,255,0.03)",border:`1px solid ${has?"rgba(167,139,250,0.3)":"rgba(255,255,255,0.06)"}`,
                  borderRadius:12,padding:"10px 14px",cursor:"pointer",transition:"all 0.15s"}}
                  onClick={()=>togglePrompt(colId)}>
                  <span style={{fontSize:18}}>{has?"📂":"📁"}</span>
                  <div style={{flex:1}}>
                    <p style={{fontSize:13,fontWeight:600,color:has?"#a78bfa":"#e2e8f0"}}>{col.name}</p>
                    <p style={{fontSize:11,color:"#3a3a5a"}}>{col.promptIds.length} prompts</p>
                  </div>
                  {has && <span style={{fontSize:12,color:"#a78bfa",fontWeight:700}}>✓ Added</span>}
                  <button onClick={e=>{e.stopPropagation();deleteCol(colId);}}
                    style={{background:"none",border:"none",color:"#2a2a4a",cursor:"pointer",
                      fontSize:13,padding:"2px 4px"}}>🗑</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SHARE PROMPT ─── */
function ShareBtn({p, showToast}){
  const [open,setOpen] = useState(false);
  const url = `${window.location.origin}?prompt=${p.id}`;
  const text = `Check out this AI prompt: "${p.title}" on Promptonic!`;

  const share = async (type) => {
    if(type==="copy"){
      await navigator.clipboard.writeText(url);
      showToast("🔗 Link copied!");
    } else if(type==="whatsapp"){
      window.open(`https://wa.me/?text=${encodeURIComponent(text+" "+url)}`,"_blank");
    } else if(type==="twitter"){
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,"_blank");
    } else if(type==="native"){
      if(navigator.share) navigator.share({title:p.title, text, url});
      else { await navigator.clipboard.writeText(url); showToast("🔗 Link copied!"); }
    }
    setOpen(false);
  };

  return(
    <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:8,padding:"6px 10px",color:"#6b7280",cursor:"pointer",fontSize:13,
          display:"flex",alignItems:"center",gap:5}}>
        ↗ Share
      </button>
      {open&&(
        <div style={{position:"absolute",bottom:"110%",right:0,
          background:"#0f0f1a",border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:14,padding:8,zIndex:50,minWidth:160,
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"fadeUp 0.15s ease"}}>
          {[
            ["📋","Copy Link","copy"],
            ["🐦","Twitter","twitter"],
            ["💬","WhatsApp","whatsapp"],
            ["📤","More options","native"],
          ].map(([em,lbl,type])=>(
            <button key={type} onClick={()=>share(type)}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",
                background:"transparent",border:"none",borderRadius:8,
                padding:"9px 12px",color:"#e2e8f0",fontSize:13,cursor:"pointer",
                transition:"background 0.15s"}}>
              <span>{em}</span> {lbl}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── LEADERBOARD PAGE ─── */
function LeaderboardPage({allPrompts, usersMap, likesMap, onBack, onViewCreator}){
  const [tab, setTab] = useState("prompts");

  // Top by prompts submitted
  const byPrompts = Object.values(usersMap)
    .map(u=>({...u, count: allPrompts.filter(p=>p.submittedBy===u.id&&p.approved).length}))
    .filter(u=>u.count>0)
    .sort((a,b)=>b.count-a.count)
    .slice(0,20);

  // Top by likes received
  const byLikes = Object.values(usersMap)
    .map(u=>{
      const userPrompts = allPrompts.filter(p=>p.submittedBy===u.id&&p.approved);
      const totalLikes = userPrompts.reduce((sum,p)=>sum+(likesMap[p.id]||0),0);
      return {...u, totalLikes};
    })
    .filter(u=>u.totalLikes>0)
    .sort((a,b)=>b.totalLikes-a.totalLikes)
    .slice(0,20);

  const list = tab==="prompts" ? byPrompts : byLikes;
  const medals = ["🥇","🥈","🥉"];

  return(
    <div style={{maxWidth:700,margin:"0 auto",padding:"28px 20px 80px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#6b7280",
        cursor:"pointer",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6}}>
        ← Back
      </button>

      {/* Header */}
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:44,marginBottom:10}}>🏆</div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,
          background:"linear-gradient(135deg,#fff,#fbbf24)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6}}>
          Leaderboard
        </h1>
        <p style={{fontSize:13,color:"#4a4a6a"}}>Top contributors of Promptonic</p>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:24,padding:4,
        background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.05)"}}>
        {[["prompts","📂 Most Prompts"],["likes","❤️ Most Liked"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,background:tab===id?"rgba(109,40,217,0.8)":"transparent",
              border:"none",borderRadius:9,padding:"10px",
              color:tab===id?"#fff":"#6b7280",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>
            {lbl}
          </button>
        ))}
      </div>

      {list.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:"#2a2a3a"}}>
          <div style={{fontSize:48,marginBottom:12}}>😴</div>
          <p>Koi data nahi abhi. Pehle prompts submit karo!</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {list.map((u,i)=>(
            <div key={u.id} onClick={()=>onViewCreator(u.id)}
              style={{display:"flex",alignItems:"center",gap:14,
                background: i<3?"linear-gradient(135deg,#111118,#16161f)":"#111118",
                border:`1px solid ${i===0?"rgba(251,191,36,0.2)":i===1?"rgba(148,163,184,0.15)":i===2?"rgba(180,120,60,0.15)":"rgba(255,255,255,0.06)"}`,
                borderRadius:16,padding:"14px 18px",cursor:"pointer",transition:"all 0.2s"}}>
              {/* Rank */}
              <div style={{width:36,textAlign:"center",flexShrink:0}}>
                {i<3
                  ? <span style={{fontSize:22}}>{medals[i]}</span>
                  : <span style={{fontSize:14,fontWeight:700,color:"#3a3a5a"}}>#{i+1}</span>
                }
              </div>
              {/* Avatar */}
              <div style={{width:44,height:44,borderRadius:12,flexShrink:0,
                background:`linear-gradient(135deg,${i===0?"#d97706,#fbbf24":i===1?"#475569,#94a3b8":i===2?"#92400e,#d97706":"#6d28d9,#a78bfa"})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:18,fontWeight:800,color:"#fff"}}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:2}}>{u.name}</p>
                <p style={{fontSize:11,color:"#4a4a6a"}}>@{u.username}</p>
              </div>
              {/* Score */}
              <div style={{textAlign:"right",flexShrink:0}}>
                <p style={{fontSize:20,fontWeight:800,fontFamily:"'Syne',sans-serif",
                  color:i===0?"#fbbf24":i===1?"#94a3b8":i===2?"#d97706":"#a78bfa"}}>
                  {tab==="prompts" ? u.count : u.totalLikes}
                </p>
                <p style={{fontSize:10,color:"#3a3a5a"}}>
                  {tab==="prompts" ? "prompts" : "likes"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── PUBLIC CREATOR PROFILE ─── */
function CreatorPage({creatorId, allPrompts, likesMap, usersMap, currentUser, onBack, onLoginRequired, showToast}){
  const creator = usersMap[creatorId];
  const prompts = allPrompts.filter(p=>p.submittedBy===creatorId&&p.approved);
  const totalLikes = prompts.reduce((sum,p)=>sum+(likesMap[p.id]||0),0);

  if(!creator) return(
    <div style={{textAlign:"center",padding:"80px 20px",color:"#2a2a3a"}}>
      <div style={{fontSize:44,marginBottom:12}}>👤</div>
      <p>Creator nahi mila.</p>
      <button onClick={onBack} style={{marginTop:16,background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:13}}>← Back</button>
    </div>
  );

  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:"28px 20px 80px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#6b7280",
        cursor:"pointer",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6}}>
        ← Back
      </button>

      {/* Creator card */}
      <div style={{background:"linear-gradient(135deg,#111118,#16161f)",
        border:"1px solid rgba(167,139,250,0.12)",borderRadius:22,padding:28,marginBottom:28,
        position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",
          background:"radial-gradient(circle,rgba(109,40,217,0.12),transparent 70%)",pointerEvents:"none"}}/>
        <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{width:80,height:80,borderRadius:20,
            background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:32,fontWeight:800,color:"#fff",flexShrink:0,
            boxShadow:"0 8px 24px rgba(109,40,217,0.4)"}}>
            {creator.name.charAt(0).toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#f1f5f9",marginBottom:4}}>
              {creator.name}
            </h2>
            <p style={{fontSize:13,color:"#4a4a6a",marginBottom:16}}>@{creator.username}</p>
            {/* Stats */}
            <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
              {[
                ["📂",prompts.length,"Prompts"],
                ["❤️",totalLikes,"Likes"],
                ["📅",new Date(creator.createdAt).toLocaleDateString("en-IN",{month:"short",year:"numeric"}),"Joined"],
              ].map(([em,v,lbl])=>(
                <div key={lbl}>
                  <p style={{fontSize:18,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#a78bfa",marginBottom:2}}>
                    {em} {v}
                  </p>
                  <p style={{fontSize:11,color:"#4a4a6a"}}>{lbl}</p>
                </div>
              ))}
            </div>
            {/* Follow */}
            <div style={{marginTop:16}}>
              <FollowBtn targetUserId={creatorId} currentUser={currentUser}
                onLoginRequired={onLoginRequired} showToast={showToast}/>
            </div>
          </div>
        </div>
      </div>

      {/* Prompts */}
      <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:"#94a3b8",
        marginBottom:16,letterSpacing:"0.05em"}}>
        PROMPTS BY {creator.name.toUpperCase()}
      </h3>

      {prompts.length===0?(
        <div style={{textAlign:"center",padding:"50px 20px",color:"#2a2a3a"}}>
          <div style={{fontSize:40,marginBottom:12}}>📂</div>
          <p>Is user ne abhi koi prompt submit nahi kiya.</p>
        </div>
      ):(
        <div className="prompt-grid">
          {prompts.map(p=>{
            const color=cc(p.category);const cat=CATS.find(c=>c.id===p.category);
            return(
              <div key={p.id} style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:16,overflow:"hidden",transition:"all 0.2s"}}
                className="card">
                {p.previewUrl&&<img src={p.previewUrl} alt={p.title}
                  style={{width:"100%",height:130,objectFit:"cover",display:"block",filter:"brightness(0.65)"}}
                  onError={e=>e.target.style.display="none"}/>}
                <div style={{padding:"14px 16px"}}>
                  <span style={{background:`${color}15`,border:`1px solid ${color}35`,color,
                    borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700,
                    display:"inline-block",marginBottom:8}}>
                    {cat?.emoji} {p.category}
                  </span>
                  <h4 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,
                    color:"#e2e8f0",marginBottom:6,lineHeight:1.4}}>{p.title}</h4>
                  <p style={{fontSize:12,color:"#4a4a6a",lineHeight:1.5,marginBottom:12,
                    display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                    {p.prompt}
                  </p>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:"#3a3a5a"}}>❤️ {likesMap[p.id]||0}</span>
                    <button onClick={()=>navigator.clipboard.writeText(p.prompt).then(()=>showToast("✓ Copied!"))}
                      style={{background:"rgba(109,40,217,0.7)",border:"none",borderRadius:8,
                        padding:"6px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>
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


function ProfilePage({user,allPrompts,userLikedIds,onLogout,onBack,onViewCreator}){
  const myPosts=allPrompts.filter(p=>p.submittedBy===user.id&&p.approved);
  const mySaved=allPrompts.filter(p=>p.approved&&userLikedIds.includes(p.id));
  const [tab,setTab]=useState("saved");
  const colKey=`ptn_cols_${user.id}`;
  const [cols,setCols]=useState(()=>lsGet(colKey)||{});
  const colList=Object.values(cols).sort((a,b)=>b.createdAt-a.createdAt);
  const list=tab==="saved"?mySaved:tab==="posts"?myPosts:[];

  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px 80px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#6b7280",
        cursor:"pointer",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6}}>
        ← Back to Promptonic
      </button>
      {/* Profile */}
      <div style={{background:"#111118",border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:20,padding:28,marginBottom:24}}>
        <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{width:72,height:72,borderRadius:18,
            background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:28,fontWeight:800,color:"#fff",
            boxShadow:"0 8px 24px rgba(109,40,217,0.35)"}}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#f1f5f9",marginBottom:4}}>{user.name}</h2>
            <p style={{fontSize:13,color:"#4a4a6a"}}>@{user.username}</p>
          </div>
          <div style={{display:"flex",gap:16,marginLeft:"auto"}}>
            {[["Posts",myPosts.length,"#a78bfa"],["Saved",mySaved.length,"#f472b6"]].map(([l,v,clr])=>(
              <div key={l} style={{textAlign:"center"}}>
                <p style={{fontSize:24,fontWeight:800,fontFamily:"'Syne',sans-serif",color:clr}}>{v}</p>
                <p style={{fontSize:11,color:"#4a4a6a"}}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onLogout} style={{marginTop:20,background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"9px 18px",
          color:"#6b7280",fontSize:12,cursor:"pointer"}}>
          Sign Out
        </button>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:20,padding:4,
        background:"rgba(255,255,255,0.03)",borderRadius:10,border:"1px solid rgba(255,255,255,0.05)"}}>
        {[["saved","❤️ Saved",mySaved.length],["posts","📂 Posts",myPosts.length],["cols","📁 Collections",colList.length]].map(([id,lbl,n])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,background:tab===id?"rgba(109,40,217,0.8)":"transparent",
              border:"none",borderRadius:8,padding:"9px 4px",
              color:tab===id?"#fff":"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {lbl} ({n})
          </button>
        ))}
      </div>

      {/* Collections tab */}
      {tab==="cols"&&(
        colList.length===0
          ?<div style={{textAlign:"center",padding:"50px 20px",color:"#2a2a3a"}}>
            <div style={{fontSize:40,marginBottom:12}}>📁</div>
            <p>Koi collection nahi abhi tak.<br/>Prompt expand karke "Save to Collection" karo!</p>
          </div>
          :<div style={{display:"flex",flexDirection:"column",gap:12}}>
            {colList.map(col=>{
              const colPrompts=allPrompts.filter(p=>p.approved&&col.promptIds.includes(p.id));
              return(
                <div key={col.name} style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",
                  borderRadius:16,padding:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div>
                      <h4 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:"#e2e8f0",marginBottom:2}}>
                        📁 {col.name}
                      </h4>
                      <p style={{fontSize:11,color:"#4a4a6a"}}>{colPrompts.length} prompts</p>
                    </div>
                    <button onClick={()=>{
                      const updated={...cols};
                      const colId=Object.keys(cols).find(k=>cols[k].name===col.name);
                      delete updated[colId];
                      setCols(updated);lsSet(colKey,updated);
                    }} style={{background:"transparent",border:"none",color:"#3a3a5a",cursor:"pointer",fontSize:13}}>🗑</button>
                  </div>
                  {colPrompts.length===0
                    ?<p style={{fontSize:12,color:"#2a2a3a"}}>Collection khali hai.</p>
                    :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {colPrompts.slice(0,3).map(p=>{
                        const color=cc(p.category);
                        return(
                          <div key={p.id} style={{display:"flex",gap:10,alignItems:"center",
                            padding:"8px 10px",background:"rgba(255,255,255,0.02)",borderRadius:10}}>
                            <span style={{background:`${color}15`,border:`1px solid ${color}35`,
                              color,borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:700,flexShrink:0}}>
                              {CATS.find(c=>c.id===p.category)?.emoji}
                            </span>
                            <span style={{fontSize:13,color:"#94a3b8",flex:1,
                              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</span>
                            <button onClick={()=>navigator.clipboard.writeText(p.prompt)}
                              style={{background:"rgba(109,40,217,0.6)",border:"none",borderRadius:6,
                                padding:"4px 10px",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                              Copy
                            </button>
                          </div>
                        );
                      })}
                      {colPrompts.length>3&&(
                        <p style={{fontSize:11,color:"#3a3a5a",textAlign:"center"}}>+{colPrompts.length-3} more prompts</p>
                      )}
                    </div>
                  }
                </div>
              );
            })}
          </div>
      )}
      {(tab==="saved"||tab==="posts")&&(list.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:"#2a2a3a"}}>
          <div style={{fontSize:48,marginBottom:12}}>{tab==="saved"?"❤️":"📂"}</div>
          <p style={{fontSize:14}}>{tab==="saved"?"Like prompts to save them here.":"Submit your first prompt!"}</p>
        </div>
      ):(
        <div className="prompt-grid">
          {list.map(p=>{
            const color=cc(p.category);const cat=CATS.find(c=>c.id===p.category);
            return(
              <div key={p.id} style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden"}}>
                {p.previewUrl&&<img src={p.previewUrl} alt={p.title}
                  style={{width:"100%",height:110,objectFit:"cover",display:"block",filter:"brightness(0.6)"}}
                  onError={e=>e.target.style.display="none"}/>}
                <div style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",gap:8,marginBottom:8}}>
                    <span style={{background:`${color}15`,border:`1px solid ${color}35`,color,
                      borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>
                      {cat?.emoji} {p.category}
                    </span>
                  </div>
                  <h4 style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:6}}>{p.title}</h4>
                  <p style={{fontSize:12,color:"#4a4a6a",lineHeight:1.5,marginBottom:12,
                    display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.prompt}</p>
                  <button onClick={()=>navigator.clipboard.writeText(p.prompt)}
                    style={{background:"rgba(109,40,217,0.7)",border:"none",borderRadius:8,
                      padding:"7px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                    📋 Copy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── SKELETON CARD ─── */
function SkeletonCard(){
  return(
    <div style={{background:"#111118",border:"1px solid rgba(255,255,255,0.04)",
      borderRadius:16,overflow:"hidden"}}>
      <div className="skeleton" style={{width:"100%",aspectRatio:"16/9"}}/>
      <div style={{padding:"16px 18px 18px",display:"flex",flexDirection:"column",gap:10}}>
        <div className="skeleton" style={{height:11,width:"40%",borderRadius:6}}/>
        <div className="skeleton" style={{height:20,width:"70%",borderRadius:6}}/>
        <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"12px 14px",
          display:"flex",flexDirection:"column",gap:8}}>
          <div className="skeleton" style={{height:10,width:"30%",borderRadius:4}}/>
          <div className="skeleton" style={{height:12,width:"95%",borderRadius:4}}/>
          <div className="skeleton" style={{height:12,width:"80%",borderRadius:4}}/>
          <div className="skeleton" style={{height:12,width:"65%",borderRadius:4}}/>
        </div>
        <div style={{display:"flex",gap:6}}>
          <div className="skeleton" style={{height:22,width:60,borderRadius:20}}/>
          <div className="skeleton" style={{height:22,width:70,borderRadius:20}}/>
        </div>
      </div>
    </div>
  );
}

/* ─── SCROLL TO TOP ─── */
function ScrollTop(){
  const [show,setShow]=useState(false);
  useEffect(()=>{
    const fn=()=>setShow(window.scrollY>500);
    window.addEventListener("scroll",fn,{passive:true});
    return ()=>window.removeEventListener("scroll",fn);
  },[]);
  if(!show) return null;
  return(
    <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
      style={{position:"fixed",bottom:24,right:20,zIndex:200,
        width:42,height:42,borderRadius:"50%",
        background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
        border:"none",color:"#fff",fontSize:18,cursor:"pointer",
        boxShadow:"0 4px 20px rgba(109,40,217,0.4)",
        display:"flex",alignItems:"center",justifyContent:"center",
        animation:"popIn 0.2s ease"}}>
      ↑
    </button>
  );
}

/* ─── TRENDING SECTION ─── */
function TrendingSection({allPrompts, likesMap, currentUser, userLikedIds, onLike, showToast}){
  const oneWeekAgo = Date.now() - 7*24*60*60*1000;
  let trending = allPrompts
    .filter(p=>p.approved && p.createdAt > oneWeekAgo)
    .sort((a,b)=>(likesMap[b.id]||0)-(likesMap[a.id]||0))
    .slice(0,8);
  if(trending.length < 3){
    trending = [...allPrompts].filter(p=>p.approved)
      .sort((a,b)=>(likesMap[b.id]||0)-(likesMap[a.id]||0)).slice(0,8);
  }
  if(trending.length === 0) return null;
  return(
    <div style={{marginBottom:32}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <span style={{fontSize:18}}>🔥</span>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:"#f1f5f9"}}>
          Trending This Week
        </h2>
      </div>
      <div className="no-scroll" style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:6}}>
        {trending.map(p=>{
          const color=cc(p.category);
          const cat=CATS.find(c=>c.id===p.category);
          const liked=userLikedIds.includes(p.id);
          return(
            <div key={p.id} style={{flexShrink:0,width:200,
              background:"#111118",border:"1px solid rgba(255,255,255,0.06)",
              borderRadius:14,overflow:"hidden"}} className="card">
              {p.previewUrl&&(
                <div style={{position:"relative",width:"100%",height:90,overflow:"hidden"}}>
                  <img src={p.previewUrl} alt={p.title} loading="lazy"
                    style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.65)"}}
                    onError={e=>e.target.style.display="none"}/>
                  <div style={{position:"absolute",inset:0,
                    background:"linear-gradient(to top,#111118,transparent)"}}/>
                  {p.videoIcon&&(
                    <div style={{position:"absolute",top:"50%",left:"50%",
                      transform:"translate(-50%,-50%)",
                      background:"rgba(0,0,0,0.6)",borderRadius:"50%",
                      width:30,height:30,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:12,paddingLeft:2}}>▶</div>
                  )}
                </div>
              )}
              <div style={{padding:"10px 12px"}}>
                <div style={{display:"flex",gap:5,marginBottom:5,alignItems:"center"}}>
                  <span style={{background:`${color}15`,border:`1px solid ${color}30`,
                    color,borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:700}}>
                    {cat?.emoji}
                  </span>
                  <span style={{fontSize:10,color:"#fbbf24",marginLeft:"auto"}}>
                    ❤️ {likesMap[p.id]||0}
                  </span>
                </div>
                <h4 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,
                  color:"#e2e8f0",lineHeight:1.4,marginBottom:8,
                  display:"-webkit-box",WebkitLineClamp:2,
                  WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                  {p.title}
                </h4>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={()=>onLike(p.id)}
                    style={{background:liked?"rgba(244,114,182,0.12)":"transparent",
                      border:`1px solid ${liked?"rgba(244,114,182,0.3)":"rgba(255,255,255,0.07)"}`,
                      borderRadius:20,padding:"3px 8px",
                      color:liked?"#f472b6":"#6b7280",fontSize:11,cursor:"pointer",fontWeight:600}}>
                    {liked?"❤️":"🤍"}
                  </button>
                  <button onClick={()=>navigator.clipboard.writeText(p.prompt)
                    .then(()=>showToast("✓ Copied!"))}
                    style={{background:"rgba(109,40,217,0.7)",border:"none",borderRadius:20,
                      padding:"3px 10px",color:"#fff",fontSize:11,fontWeight:700,
                      cursor:"pointer",flex:1}}>
                    Copy
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── FOLLOW BUTTON ─── */
function FollowBtn({targetUserId, currentUser, onLoginRequired, showToast}){
  const [follows, setFollows] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    (async()=>{const f=await fsGet("follows")||{};setFollows(f);setLoading(false);})();
  },[]);
  if(!targetUserId||loading) return null;
  if(currentUser&&currentUser.id===targetUserId) return null;
  const myFollowing = currentUser?(follows[currentUser.id]||[]):[];
  const isFollowing = myFollowing.includes(targetUserId);
  const followerCount = Object.values(follows).filter(arr=>arr.includes(targetUserId)).length;
  const toggle=async()=>{
    if(!currentUser){onLoginRequired();return;}
    const all=await fsGet("follows")||{};
    const mine=all[currentUser.id]||[];
    const updated={...all,
      [currentUser.id]:isFollowing
        ?mine.filter(id=>id!==targetUserId)
        :[...mine,targetUserId]};
    await fsSet("follows",updated);
    setFollows(updated);
    showToast(isFollowing?"Unfollowed.":"✓ Following!");
  };
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <button className="follow-btn" onClick={toggle}
        style={{background:isFollowing?"rgba(167,139,250,0.12)":"linear-gradient(135deg,#6d28d9,#a78bfa)",
          border:`1px solid ${isFollowing?"rgba(167,139,250,0.3)":"transparent"}`,
          borderRadius:20,padding:"8px 20px",
          color:isFollowing?"#a78bfa":"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
        {isFollowing?"✓ Following":"+ Follow"}
      </button>
      <span style={{fontSize:12,color:"#4a4a6a"}}>{followerCount} follower{followerCount!==1?"s":""}</span>
    </div>
  );
}

/* ─── ABOUT PAGE ─── */
function AboutPage({onBack}){
  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:"28px 20px 80px"}} className="page-enter">
      <button onClick={onBack} style={{background:"none",border:"none",color:"#6b7280",
        cursor:"pointer",fontSize:13,marginBottom:28,display:"flex",alignItems:"center",gap:6}}>
        ← Back
      </button>
      <div style={{textAlign:"center",marginBottom:44}}>
        <div style={{width:72,height:72,borderRadius:20,
          background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:32,margin:"0 auto 18px",boxShadow:"0 12px 40px rgba(109,40,217,0.35)"}}>⚡</div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,
          background:"linear-gradient(135deg,#fff,#a78bfa)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10}}>
          About Promptonic
        </h1>
        <p style={{fontSize:14,color:"#64748b",lineHeight:1.8,maxWidth:500,margin:"0 auto"}}>
          Ek free platform — AI prompts discover, share aur copy karo.
          Image, video, writing aur kaafi kuch ke liye.
        </p>
      </div>
      <div style={{background:"linear-gradient(135deg,#111118,#16161f)",
        border:"1px solid rgba(167,139,250,0.12)",borderRadius:20,padding:26,marginBottom:18}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:"#f1f5f9",marginBottom:10}}>
          🎯 Our Mission
        </h2>
        <p style={{fontSize:14,color:"#64748b",lineHeight:1.9}}>
          AI tools powerful hain, lekin sahi prompt likhna mushkil hai.
          Promptonic ka goal — <span style={{color:"#a78bfa",fontWeight:600}}>har kisi ke liye AI easy banana</span>.
          Experienced creators apne best prompts share karein, beginners seedha use karein.
        </p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:20}}>
        {[["🖼","Image Prompts","MJ, SDXL, Flux, DALL-E ready"],
          ["🎬","Video Prompts","Kling, Runway, Veo ke liye"],
          ["✍️","Writing Prompts","Instagram, YouTube, blogs"],
          ["⭐","Star Ratings","Community rated prompts"],
          ["📁","Collections","Favorites organize karo"],
          ["🏆","Leaderboard","Top contributors"],
        ].map(([em,t,d])=>(
          <div key={t} style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:14,padding:18}}>
            <div style={{fontSize:26,marginBottom:8}}>{em}</div>
            <h3 style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>{t}</h3>
            <p style={{fontSize:12,color:"#4a4a6a",lineHeight:1.6}}>{d}</p>
          </div>
        ))}
      </div>
      <div style={{background:"#111118",border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:20,padding:26}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,
          color:"#f1f5f9",marginBottom:18}}>👨‍💻 Developer</h2>
        <div style={{display:"flex",gap:18,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{width:68,height:68,borderRadius:18,flexShrink:0,
            background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:28,fontWeight:800,color:"#fff",
            boxShadow:"0 8px 24px rgba(109,40,217,0.3)"}}>P</div>
          <div style={{flex:1}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,
              color:"#f1f5f9",marginBottom:4}}>Prabhat</h3>
            <p style={{fontSize:12,color:"#4a4a6a",marginBottom:10}}>Faizabad, Uttar Pradesh 🇮🇳</p>
            <p style={{fontSize:13,color:"#64748b",lineHeight:1.7,marginBottom:14}}>
              18 saal ki umra mein, sirf ek phone aur zero budget se Promptonic banaya.
              AI aur technology ke passion se shuru hua yeh safar —
              ab ek growing community platform ban gaya hai.
            </p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[["💡","Self-taught"],["📱","Mobile Only"],["🆓","Zero Budget"]].map(([em,t])=>(
                <span key={t} style={{background:"rgba(167,139,250,0.08)",
                  border:"1px solid rgba(167,139,250,0.15)",
                  color:"#a78bfa",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:600}}>
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

/* ─── HELP PAGE ─── */
function HelpPage({onBack}){
  const [openFaq, setOpenFaq] = useState(null);
  const faqs=[
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
  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:"28px 20px 80px"}} className="page-enter">
      <button onClick={onBack} style={{background:"none",border:"none",color:"#6b7280",
        cursor:"pointer",fontSize:13,marginBottom:28,display:"flex",alignItems:"center",gap:6}}>
        ← Back
      </button>
      <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,
        background:"linear-gradient(135deg,#fff,#a78bfa)",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6}}>
        Help Center
      </h1>
      <p style={{fontSize:14,color:"#64748b",marginBottom:28}}>Koi sawaal? Yahan answers milenge.</p>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,
        color:"#f1f5f9",marginBottom:14}}>❓ Frequently Asked Questions</h2>
      <div style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",
        borderRadius:18,overflow:"hidden",marginBottom:28}}>
        {faqs.map(([q,a],i)=>(
          <div key={i} style={{borderBottom:i<faqs.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
            <button onClick={()=>setOpenFaq(openFaq===i?null:i)}
              style={{width:"100%",background:"transparent",border:"none",
                padding:"16px 20px",display:"flex",justifyContent:"space-between",
                alignItems:"center",gap:12,cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:14,fontWeight:600,color:"#e2e8f0",lineHeight:1.5}}>{q}</span>
              <span style={{fontSize:20,color:"#4a4a6a",flexShrink:0,
                transform:openFaq===i?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
            </button>
            {openFaq===i&&(
              <div style={{padding:"0 20px 18px",animation:"slideDown 0.2s ease"}}>
                <p style={{fontSize:13,color:"#64748b",lineHeight:1.8}}>{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{background:"linear-gradient(135deg,#111118,#16161f)",
        border:"1px solid rgba(167,139,250,0.12)",borderRadius:20,padding:26,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:10}}>✉️</div>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,
          color:"#f1f5f9",marginBottom:6}}>Still need help?</h2>
        <p style={{fontSize:13,color:"#64748b",marginBottom:18,lineHeight:1.7}}>
          Koi bhi query, suggestion, ya bug report — direct contact karo.
        </p>
        <a href="mailto:hello@promptonic.app"
          style={{display:"inline-flex",alignItems:"center",gap:10,
            background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.2)",
            borderRadius:12,padding:"12px 22px",textDecoration:"none",
            color:"#a78bfa",fontWeight:600,fontSize:13}}>
          📧 hello@promptonic.app
        </a>
      </div>
    </div>
  );
}

/* ─── FOOTER ─── */
function Footer({onNavigate}){
  return(
    <footer style={{background:"#07070f",borderTop:"1px solid rgba(255,255,255,0.05)",padding:"32px 20px 24px"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:24,marginBottom:24}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:24,height:24,background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
                borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>⚡</div>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,
                background:"linear-gradient(135deg,#fff,#a78bfa)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Promptonic</span>
            </div>
            <p style={{fontSize:12,color:"#3a3a5a",lineHeight:1.7}}>
              Free AI prompts for everyone.<br/>Built with ❤️ in India 🇮🇳
            </p>
          </div>
          <div>
            <p style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:"0.08em",marginBottom:10}}>EXPLORE</p>
            {[["🖼 Image","cat-image"],["🎬 Video","cat-video"],["✍️ Writing","cat-text"],["🏆 Leaderboard","leaderboard"]].map(([l,p])=>(
              <button key={p} onClick={()=>onNavigate(p)}
                style={{display:"block",background:"none",border:"none",color:"#3a3a5a",
                  fontSize:12,cursor:"pointer",marginBottom:7,padding:0,textAlign:"left"}}>
                {l}
              </button>
            ))}
          </div>
          <div>
            <p style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:"0.08em",marginBottom:10}}>COMPANY</p>
            {[["About Us","about"],["Help Center","help"],["Contact","help"]].map(([l,p])=>(
              <button key={l} onClick={()=>onNavigate(p)}
                style={{display:"block",background:"none",border:"none",color:"#3a3a5a",
                  fontSize:12,cursor:"pointer",marginBottom:7,padding:0,textAlign:"left"}}>
                {l}
              </button>
            ))}
          </div>
          <div>
            <p style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:"0.08em",marginBottom:10}}>PLATFORM</p>
            {["🆓 Always Free","🔒 Secure","📱 Mobile Optimized","🤝 Community"].map(t=>(
              <p key={t} style={{fontSize:12,color:"#3a3a5a",marginBottom:6}}>{t}</p>
            ))}
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.04)",paddingTop:18,
          display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <p style={{fontSize:11,color:"#2a2a3a"}}>
            © {new Date().getFullYear()} Promptonic. Made with ❤️ by Prabhat.
          </p>
          <p style={{fontSize:11,color:"#2a2a3a"}}>
            Built on mobile · Zero budget · 100% passion
          </p>
        </div>
      </div>
    </footer>
  );
}

function AdminPanel({allPrompts,usersMap,likesMap,onApprove,onDelete,onLogout}){
  const pending=allPrompts.filter(p=>!p.approved);
  const approved=allPrompts.filter(p=>p.approved);
  const [tab,setTab]=useState("stats");
  const [comments,setComments]=useState({});
  const [customCats,setCustomCats]=useState([]);
  const [catForm,setCatForm]=useState({label:"",emoji:"🔖",color:"#a78bfa"});
  const [catMsg,setCatMsg]=useState("");
  useEffect(()=>{fsGet("comments").then(c=>setComments(c||{}));},[]);
  useEffect(()=>{fsGet("customCats").then(c=>setCustomCats(c||[]));},[]);
  const totalLikes=Object.values(likesMap).reduce((a,b)=>a+b,0);
  const totalComments=Object.values(comments).reduce((a,b)=>a+b.length,0);

  const addCat=async()=>{
    if(!catForm.label.trim()){setCatMsg("⚠️ Label zaroori hai");return;}
    const id=catForm.label.toLowerCase().replace(/\s+/g,"_");
    if(customCats.find(c=>c.id===id)){setCatMsg("⚠️ Ye category pehle se hai");return;}
    const newCat={id,label:catForm.label.trim(),emoji:catForm.emoji,color:catForm.color};
    const updated=[...customCats,newCat];
    await fsSet("customCats",updated);
    setCustomCats(updated);
    setCatForm({label:"",emoji:"🔖",color:"#a78bfa"});
    setCatMsg("✓ Category add ho gayi!");
    setTimeout(()=>setCatMsg(""),2500);
  };
  const delCat=async(id)=>{
    const updated=customCats.filter(c=>c.id!==id);
    await fsSet("customCats",updated);
    setCustomCats(updated);
    setCatMsg("🗑 Category delete ho gayi.");
    setTimeout(()=>setCatMsg(""),2000);
  };

  const statCard=(em,v,lbl,clr)=>(
    <div style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",
      borderRadius:14,padding:20,textAlign:"center"}}>
      <div style={{fontSize:22,marginBottom:6}}>{em}</div>
      <p style={{fontSize:26,fontWeight:800,fontFamily:"'Syne',sans-serif",color:clr}}>{v}</p>
      <p style={{fontSize:11,color:"#4a4a6a",marginTop:2}}>{lbl}</p>
    </div>
  );

  const pItem=(p,isPending)=>(
    <div key={p.id} style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",
      borderRadius:14,padding:16,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{background:`${cc(p.category)}15`,border:`1px solid ${cc(p.category)}35`,
          color:cc(p.category),borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>
          {CATS.find(c=>c.id===p.category)?.emoji} {p.category}
        </span>
        <span style={{fontSize:11,color:"#4a4a6a"}}>by {p.submitterName}</span>
        <span style={{fontSize:11,color:"#3a3a5a",marginLeft:"auto"}}>❤️{likesMap[p.id]||0} 💬{(comments[p.id]||[]).length}</span>
      </div>
      <h4 style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#e2e8f0"}}>{p.title}</h4>
      <p style={{fontSize:12,color:"#4a4a6a",lineHeight:1.6,
        display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.prompt}</p>
      <div style={{display:"flex",gap:8}}>
        {isPending&&<button onClick={()=>onApprove(p.id)} style={{
          background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",color:"#4ade80",
          borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",flex:1}}>✓ Approve</button>}
        <button onClick={()=>onDelete(p.id)} style={{
          background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",color:"#f87171",
          borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",flex:isPending?1:"auto"}}>🗑 Delete</button>
      </div>
    </div>
  );

  return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 20px 80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,
            background:"linear-gradient(135deg,#fff,#a78bfa)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:2}}>Admin Panel</h1>
          <p style={{fontSize:12,color:"#4a4a6a"}}>Promptonic Control Center</p>
        </div>
        <button onClick={onLogout} style={{background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"8px 16px",
          color:"#6b7280",fontSize:12,cursor:"pointer"}}>Sign Out</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:24}} className="no-scroll">
        {[["stats","📊 Stats"],["pending",`⏳ Pending (${pending.length})`],["live",`✓ Live (${approved.length})`],["users",`👥 Users (${Object.keys(usersMap).length})`],["categories","🏷 Categories"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            background:tab===id?"rgba(109,40,217,0.7)":"rgba(255,255,255,0.03)",
            border:`1px solid ${tab===id?"rgba(167,139,250,0.3)":"rgba(255,255,255,0.06)"}`,
            color:tab===id?"#fff":"#6b7280",borderRadius:10,padding:"8px 16px",
            fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
            {lbl}
          </button>
        ))}
      </div>
      {tab==="stats"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
            {statCard("📂",approved.length,"Live","#a78bfa")}
            {statCard("⏳",pending.length,"Pending","#fb923c")}
            {statCard("👥",Object.keys(usersMap).length,"Users","#34d399")}
            {statCard("❤️",totalLikes,"Likes","#f472b6")}
            {statCard("💬",totalComments,"Comments","#818cf8")}
          </div>
          <div style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:20}}>
            <p style={{fontSize:12,fontWeight:700,color:"#6b7280",marginBottom:14,letterSpacing:"0.05em"}}>🔥 TOP LIKED</p>
            {[...approved].sort((a,b)=>(likesMap[b.id]||0)-(likesMap[a.id]||0)).slice(0,5).map(p=>(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <span style={{fontSize:13,color:"#94a3b8"}}>{p.title}</span>
                <div style={{display:"flex",gap:12}}>
                  <span style={{fontSize:12,color:"#f472b6",fontWeight:700}}>❤️ {likesMap[p.id]||0}</span>
                  <span style={{fontSize:12,color:"#818cf8",fontWeight:700}}>💬 {(comments[p.id]||[]).length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="pending"&&(
        pending.length===0
          ?<div style={{textAlign:"center",padding:"60px",color:"#2a2a3a"}}><div style={{fontSize:36,marginBottom:12}}>✓</div><p>No pending prompts!</p></div>
          :<div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))"}}>{pending.map(p=>pItem(p,true))}</div>
      )}
      {tab==="live"&&(
        <div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))"}}>
          {approved.map(p=>pItem(p,false))}
        </div>
      )}
      {tab==="users"&&(
        <div style={{display:"grid",gap:10,gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>
          {Object.values(usersMap).length===0
            ?<div style={{textAlign:"center",padding:"60px",color:"#2a2a3a"}}><div style={{fontSize:36,marginBottom:12}}>👥</div><p>No users yet.</p></div>
            :Object.values(usersMap).map(u=>(
              <div key={u.id} style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:14,padding:16,display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:40,height:40,borderRadius:12,flexShrink:0,
                  background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:16,fontWeight:800,color:"#fff"}}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:2}}>{u.name}</p>
                  <p style={{fontSize:11,color:"#4a4a6a"}}>@{u.username} · {allPrompts.filter(p=>p.submittedBy===u.id&&p.approved).length} posts</p>
                </div>
              </div>
            ))
          }
        </div>
      )}
      {/* ── CATEGORIES TAB ── */}
      {tab==="categories"&&(
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {/* Add new category */}
          <div style={{background:"#111118",border:"1px solid rgba(167,139,250,0.15)",borderRadius:16,padding:20}}>
            <p style={{fontSize:13,fontWeight:700,color:"#a78bfa",marginBottom:16,letterSpacing:"0.04em"}}>
              ✦ Nayi Category Banao
            </p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 80px 120px",gap:10,marginBottom:12}}>
              <input placeholder="Category naam (e.g. Coding, Music)" value={catForm.label}
                onChange={e=>setCatForm(f=>({...f,label:e.target.value}))}
                style={{...inp,fontSize:13}}/>
              <input placeholder="Emoji" value={catForm.emoji}
                onChange={e=>setCatForm(f=>({...f,emoji:e.target.value}))}
                style={{...inp,fontSize:18,textAlign:"center"}}/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="color" value={catForm.color}
                  onChange={e=>setCatForm(f=>({...f,color:e.target.value}))}
                  style={{width:36,height:36,border:"none",borderRadius:8,cursor:"pointer",background:"none"}}/>
                <span style={{fontSize:11,color:"#4a4a6a"}}>Color</span>
              </div>
            </div>
            {/* Preview */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <span style={{fontSize:11,color:"#4a4a6a"}}>Preview:</span>
              <span style={{background:`${catForm.color}15`,border:`1px solid ${catForm.color}40`,
                color:catForm.color,borderRadius:20,padding:"4px 13px",fontSize:12,fontWeight:700}}>
                {catForm.emoji} {catForm.label||"Category"}
              </span>
            </div>
            {catMsg&&<p style={{fontSize:12,color:catMsg.startsWith("✓")?"#4ade80":"#f87171",marginBottom:10}}>{catMsg}</p>}
            <button onClick={addCat}
              style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                borderRadius:10,padding:"11px 24px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
              + Add Category
            </button>
          </div>

          {/* Default categories */}
          <div style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:20}}>
            <p style={{fontSize:12,fontWeight:700,color:"#6b7280",marginBottom:14,letterSpacing:"0.05em"}}>
              DEFAULT CATEGORIES (delete nahi ho sakti)
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {id:"image",label:"Image",emoji:"🖼",color:"#818cf8"},
                {id:"video",label:"Video",emoji:"🎬",color:"#fb923c"},
                {id:"text", label:"Writing",emoji:"✍️",color:"#34d399"},
                {id:"other",label:"Other",emoji:"⚡",color:"#f472b6"},
              ].map(cat=>(
                <div key={cat.id} style={{display:"flex",alignItems:"center",gap:12,
                  padding:"10px 14px",background:"rgba(255,255,255,0.02)",borderRadius:10}}>
                  <span style={{background:`${cat.color}15`,border:`1px solid ${cat.color}35`,
                    color:cat.color,borderRadius:20,padding:"4px 13px",fontSize:12,fontWeight:700}}>
                    {cat.emoji} {cat.label}
                  </span>
                  <span style={{fontSize:11,color:"#2a2a3a",marginLeft:"auto"}}>
                    {allPrompts.filter(p=>p.category===cat.id&&p.approved).length} prompts
                  </span>
                  <span style={{fontSize:10,color:"#2a2a3a",
                    background:"rgba(255,255,255,0.04)",borderRadius:6,padding:"2px 8px"}}>Default</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom categories */}
          <div style={{background:"#111118",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:20}}>
            <p style={{fontSize:12,fontWeight:700,color:"#6b7280",marginBottom:14,letterSpacing:"0.05em"}}>
              CUSTOM CATEGORIES ({customCats.length})
            </p>
            {customCats.length===0?(
              <div style={{textAlign:"center",padding:"30px 20px",color:"#2a2a3a"}}>
                <div style={{fontSize:32,marginBottom:8}}>🏷</div>
                <p style={{fontSize:13}}>Abhi koi custom category nahi hai. Upar se banao!</p>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {customCats.map(cat=>(
                  <div key={cat.id} style={{display:"flex",alignItems:"center",gap:12,
                    padding:"10px 14px",background:"rgba(255,255,255,0.02)",borderRadius:10}}>
                    <span style={{background:`${cat.color}15`,border:`1px solid ${cat.color}35`,
                      color:cat.color,borderRadius:20,padding:"4px 13px",fontSize:12,fontWeight:700}}>
                      {cat.emoji} {cat.label}
                    </span>
                    <span style={{fontSize:11,color:"#2a2a3a",marginLeft:"auto"}}>
                      {allPrompts.filter(p=>p.category===cat.id&&p.approved).length} prompts
                    </span>
                    <button onClick={()=>delCat(cat.id)}
                      style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",
                        color:"#f87171",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,
                        cursor:"pointer",whiteSpace:"nowrap"}}>
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
function SubmitForm({user,onSubmit,onClose}){
  const [form,setForm]=useState({title:"",prompt:"",description:"",category:"image",tags:"",previewUrl:""});
  const [done,setDone]=useState(false);
  if(done) return(
    <div style={{background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.15)",
      borderRadius:16,padding:28,marginBottom:24,textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:12}}>🎉</div>
      <h3 style={{color:"#4ade80",fontFamily:"'Syne',sans-serif",marginBottom:8}}>Submitted!</h3>
      <p style={{color:"#4a4a6a",fontSize:13,marginBottom:16}}>Your prompt is under review. It'll go live once approved.</p>
      <button onClick={onClose} style={{background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.25)",
        color:"#4ade80",borderRadius:10,padding:"10px 24px",fontWeight:700,cursor:"pointer",fontSize:13}}>Done ✓</button>
    </div>
  );
  return(
    <div style={{background:"#0f0f1a",border:"1px solid rgba(167,139,250,0.12)",
      borderRadius:16,padding:20,marginBottom:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#a78bfa"}}>Submit a Prompt</h3>
        <span style={{fontSize:12,color:"#4a4a6a"}}>as @{user.username}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <input placeholder="Title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inp}/>
        <input placeholder="Short description (e.g. 'Create stunning cinematic portraits')" value={form.description}
          onChange={e=>setForm({...form,description:e.target.value})} style={inp}/>
        <textarea placeholder="Your full prompt *" value={form.prompt}
          onChange={e=>setForm({...form,prompt:e.target.value})} rows={4} style={{...inp,resize:"vertical",lineHeight:1.6}}/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inp}>
          <option value="image">🖼 Image</option><option value="video">🎬 Video</option>
          <option value="text">✍️ Writing</option><option value="other">⚡ Other</option>
        </select>
        <input placeholder="Preview image URL (from unsplash.com — optional)" value={form.previewUrl}
          onChange={e=>setForm({...form,previewUrl:e.target.value})} style={inp}/>
        <input placeholder="Tags — comma separated (portrait, ai, realistic)" value={form.tags}
          onChange={e=>setForm({...form,tags:e.target.value})} style={inp}/>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"12px",
            color:"#6b7280",cursor:"pointer",flex:1,fontSize:13}}>Cancel</button>
          <button onClick={async()=>{
            if(!form.title||!form.prompt)return;
            await onSubmit({...form,tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean),
              videoIcon:form.category==="video",copies:0});
            setDone(true);
          }} disabled={!form.title||!form.prompt}
            style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",borderRadius:10,
              padding:"12px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",flex:2,
              opacity:(!form.title||!form.prompt)?0.4:1}}>
            Submit for Review →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SIDEBAR BUTTON ─── */
function SideBtn({cat,active,count,onClick}){
  return(
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:10,width:"100%",
      background:active?`${cat.color}10`:"transparent",
      border:`1px solid ${active?cat.color+"30":"rgba(255,255,255,0.05)"}`,
      borderRadius:10,padding:"10px 14px",textAlign:"left",
      color:active?cat.color:"#6b7280",fontSize:13,fontWeight:active?700:400,cursor:"pointer",transition:"all 0.15s"}}>
      <span>{cat.emoji}</span>
      <span style={{flex:1}}>{cat.label}</span>
      <span style={{fontSize:11,color:active?cat.color:"#3a3a5a",
        background:"rgba(255,255,255,0.05)",borderRadius:20,padding:"1px 7px"}}>{count}</span>
    </button>
  );
}

/* ─── MAIN APP ─── */
export default function App(){
  const [allPrompts,   setAllPrompts]   = useState([]);
  const [likesMap,     setLikesMap]     = useState({});
  const [usersMap,     setUsersMap]     = useState({});
  const [currentUser,  setCurrentUser]  = useState(null);
  const [userLikedIds, setUserLikedIds] = useState([]);
  const [page,         setPage]         = useState("home");
  const [creatorId,    setCreatorId]    = useState(null);
  const [skeletonDone, setSkeletonDone] = useState(false);
  const [showAuth,     setShowAuth]     = useState(false);
  const [showSubmit,   setShowSubmit]   = useState(false);
  const [showSearch,   setShowSearch]   = useState(false);
  const [showAdminPw,  setShowAdminPw]  = useState(false);
  const [adminPw,      setAdminPw]      = useState("");
  const [adminPwErr,   setAdminPwErr]   = useState("");
  const [adminBusy,    setAdminBusy]    = useState(false);
  const [activeCat,    setActiveCat]    = useState("all");
  const [sort,         setSort]         = useState("recent");
  const [search,       setSearch]       = useState("");
  const [imgFilter,    setImgFilter]    = useState("All");
  const [arFilter,     setArFilter]     = useState("All");
  const [packFilter,   setPackFilter]   = useState("All");
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState("");

  const showToast=m=>{setToast(m);setTimeout(()=>setToast(""),2400);};

  // Secure admin login — password stored as SHA-256 hash in Firestore
  const handleAdminLogin = async () => {
    if(!adminPw){setAdminPwErr("Password daalo");return;}
    setAdminBusy(true); setAdminPwErr("");
    // Brute force check
    const lock=checkLockout("ptn_admin_lk");
    if(lock.locked){setAdminPwErr(`${lock.mins} min baad try karo.`);setAdminBusy(false);return;}
    // Hash input and compare with Firestore stored hash
    const inputHash = await sha256(adminPw);
    const storedHash = await fsGet("adminHash");
    if(!storedHash){
      // First time setup: no admin hash set yet
      setAdminPwErr("Admin setup nahi hua. Firebase console mein adminHash set karo.");
      setAdminBusy(false); return;
    }
    if(inputHash===storedHash){
      recordAttempt("ptn_admin_lk", true);
      setAdminSession();
      setPage("admin"); setShowAdminPw(false); setAdminPw("");
      setAdminBusy(false);
    } else {
      recordAttempt("ptn_admin_lk", false);
      const lock2=checkLockout("ptn_admin_lk");
      if(lock2.locked) setAdminPwErr(`Bahut zyada attempts! ${lock2.mins} min ke liye locked.`);
      else setAdminPwErr(`Galat password. ${MAX_ATTEMPTS-lock2.attempts} tries bachi hain.`);
      setAdminBusy(false);
    }
  };

  useEffect(()=>{
    (async()=>{
      try {
        let p=await fsGet("prompts");
        if(!p||!p.length){p=SEED;await fsSet("prompts",p);}
        setAllPrompts(p);
        setLikesMap(await fsGet("likes")||{});
        const um=await fsGet("users")||{};setUsersMap(um);
        // Load custom categories
        const cc2=await fsGet("customCats")||[];
        if(cc2.length>0){
          const existIds=new Set(CATS.map(c=>c.id));
          cc2.filter(c=>!existIds.has(c.id)).forEach(c=>CATS.push(c));
        }
        const sess=lsGet("ptn_session");
        if(sess?.userId&&um[sess.userId]){
          setCurrentUser(um[sess.userId]);
          setUserLikedIds(lsGet(`ptn_ul_${sess.userId}`)||[]);
        }
      } catch(err) {
        console.error("Promptonic load error:", err);
        // Firebase fail hone pe bhi seed data dikhaao
        setAllPrompts(SEED);
      } finally {
        setLoading(false);
        setTimeout(()=>setSkeletonDone(true), 500);
      }
    })();
  },[]);

  const handleLike=async(promptId)=>{
    if(!currentUser){setShowAuth(true);return;}
    const already=userLikedIds.includes(promptId);
    const newUL=already?userLikedIds.filter(x=>x!==promptId):[...userLikedIds,promptId];
    const newLM={...likesMap,[promptId]:Math.max(0,(likesMap[promptId]||0)+(already?-1:1))};
    setUserLikedIds(newUL);setLikesMap(newLM);
    lsSet(`ptn_ul_${currentUser.id}`,newUL);
    await fsSet("likes",newLM);
    if(!already)showToast("❤️ Saved!");
  };

  const handleAuthSuccess=async(user)=>{
    setCurrentUser(user);setShowAuth(false);
    setUserLikedIds(lsGet(`ptn_ul_${user.id}`)||[]);
    setUsersMap(await fsGet("users")||{});
    showToast(`✓ Welcome, ${user.name}!`);
  };

  const handleLogout=()=>{
    lsSet("ptn_session",null);setCurrentUser(null);setUserLikedIds([]);setPage("home");
    showToast("Signed out.");
  };

  const handleSubmit=async(fd)=>{
    const entry={id:`u_${Date.now()}`,...fd,approved:false,
      submittedBy:currentUser.id,submitterName:currentUser.name,createdAt:Date.now()};
    const up=[...allPrompts,entry];setAllPrompts(up);await fsSet("prompts",up);
    setShowSubmit(false);showToast("✓ Submitted for review!");
  };

  const handleApprove=async(id)=>{
    const up=allPrompts.map(p=>p.id===id?{...p,approved:true}:p);
    setAllPrompts(up);await fsSet("prompts",up);showToast("✓ Approved!");
  };
  const handleDelete=async(id)=>{
    const up=allPrompts.filter(p=>p.id!==id);
    setAllPrompts(up);await fsSet("prompts",up);showToast("🗑 Deleted.");
  };

  const pub=allPrompts.filter(p=>p.approved);
  const catCount=id=>id==="all"?pub.length:pub.filter(p=>p.category===id).length;

  let list=pub.filter(p=>activeCat==="all"||p.category===activeCat);
  if(imgFilter!=="All"&&activeCat==="image") list=list.filter(p=>p.aiModel===imgFilter);
  if(arFilter !=="All"&&activeCat==="image") list=list.filter(p=>p.aspectRatio===arFilter);
  if(packFilter!=="All"&&activeCat==="text") list=list.filter(p=>p.subPack===packFilter);
  if(search){const q=search.toLowerCase();list=list.filter(p=>
    p.title.toLowerCase().includes(q)||p.prompt.toLowerCase().includes(q)||(p.tags||[]).some(t=>t.includes(q)));}
  if(sort==="likes")  list=[...list].sort((a,b)=>(likesMap[b.id]||0)-(likesMap[a.id]||0));
  if(sort==="recent") list=[...list].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));

  if(loading) return(
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",gap:20}}>
      <style>{G}</style>
      <div style={{width:40,height:40,border:"3px solid rgba(167,139,250,0.15)",
        borderTop:"3px solid #a78bfa",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <p style={{color:"#3a3a5a",fontSize:14,letterSpacing:"0.06em"}}>Loading Promptonic...</p>
    </div>
  );

  return(
    <>
      <style>{G}</style>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Grotesk:wght@600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onSuccess={handleAuthSuccess} showToast={showToast}/>}

      {page==="about"&&<AboutPage onBack={()=>setPage("home")}/>}
      {page==="help"&&<HelpPage onBack={()=>setPage("home")}/>}

      {page==="admin"&&<AdminPanel allPrompts={allPrompts} usersMap={usersMap} likesMap={likesMap}
        onApprove={handleApprove} onDelete={handleDelete} onLogout={()=>{clearAdminSession();setPage("home");setAdminPw("");}}/>}

      {page==="leaderboard"&&(
        <LeaderboardPage
          allPrompts={allPrompts} usersMap={usersMap} likesMap={likesMap}
          onBack={()=>setPage("home")}
          onViewCreator={(id)=>{setCreatorId(id);setPage("creator");}}/>
      )}

      {page==="creator"&&creatorId&&(
        <CreatorPage
          creatorId={creatorId} allPrompts={allPrompts}
          likesMap={likesMap} usersMap={usersMap}
          currentUser={currentUser}
          onBack={()=>setPage(page==="creator"?"home":"leaderboard")}
          onLoginRequired={()=>setShowAuth(true)}
          showToast={showToast}/>
      )}

      {page==="profile"&&currentUser&&<ProfilePage user={currentUser} allPrompts={allPrompts}
        userLikedIds={userLikedIds} onLogout={handleLogout} onBack={()=>setPage("home")}/>}

      {page==="home"&&(
        <div style={{minHeight:"100vh",background:"#0a0a0f"}}>

          {/* ── NAV ── */}
          <nav style={{position:"sticky",top:0,zIndex:100,
            background:"rgba(10,10,15,0.92)",backdropFilter:"blur(20px)",
            borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <div className="page-wrap" style={{display:"flex",alignItems:"center",gap:16,height:60}}>
              {/* Logo */}
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <div style={{width:28,height:28,background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
                  borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,
                  background:"linear-gradient(135deg,#fff 30%,#a78bfa)",
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                  Promptonic
                </span>
              </div>
              {/* Search — desktop always visible */}
              <div className={`nav-search-wrap${showSearch?" open":""}`}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",
                  fontSize:14,color:"#3a3a5a",pointerEvents:"none"}}>🔍</span>
                <input placeholder="Search prompts..." value={search}
                  onChange={e=>setSearch(e.target.value)}
                  style={{...inp,paddingLeft:36,borderRadius:24,height:38,fontSize:13}}/>
              </div>
              {/* Actions */}
              <div style={{display:"flex",gap:8,marginLeft:"auto",flexShrink:0,alignItems:"center"}}>
                {/* Desktop nav links */}
                <div style={{display:"none"}} className="desktop-nav-links">
                  <button onClick={()=>setPage("about")} style={{background:"none",border:"none",
                    color:"#6b7280",fontSize:13,cursor:"pointer",padding:"0 8px"}}>About</button>
                  <button onClick={()=>setPage("help")} style={{background:"none",border:"none",
                    color:"#6b7280",fontSize:13,cursor:"pointer",padding:"0 8px"}}>Help</button>
                </div>
                {/* Search icon — mobile only */}
                <button className="search-icon-btn" onClick={()=>{setShowSearch(s=>!s);}}
                  style={{width:36,height:36,background:showSearch?"rgba(167,139,250,0.15)":"rgba(255,255,255,0.05)",
                    border:`1px solid ${showSearch?"rgba(167,139,250,0.3)":"rgba(255,255,255,0.08)"}`,
                    borderRadius:10,alignItems:"center",justifyContent:"center",
                    color:showSearch?"#a78bfa":"#94a3b8",fontSize:17,cursor:"pointer"}}>
                  🔍
                </button>
                {currentUser?(
                  <>
                    <button onClick={()=>setPage("leaderboard")}
                      style={{background:"transparent",
                        border:"1px solid rgba(255,255,255,0.08)",
                        borderRadius:10,padding:"7px 12px",color:"#6b7280",fontSize:13,cursor:"pointer",
                        display:"flex",alignItems:"center",gap:5}}>
                      🏆
                    </button>
                    <button onClick={()=>setShowSubmit(s=>!s)}
                      style={{background:showSubmit?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#6d28d9,#a78bfa)",
                        border:showSubmit?"1px solid rgba(255,255,255,0.07)":"none",
                        borderRadius:10,padding:"7px 16px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                      {showSubmit?"✕":"+ Submit"}
                    </button>
                    <button onClick={()=>setPage("profile")}
                      style={{width:34,height:34,borderRadius:10,flexShrink:0,
                        background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </button>
                  </>
                ):(
                  <button onClick={()=>setShowAuth(true)}
                    style={{background:"rgba(109,40,217,0.15)",border:"1px solid rgba(167,139,250,0.3)",
                      borderRadius:10,padding:"7px 18px",color:"#a78bfa",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                    Sign In →
                  </button>
                )}
                <button onClick={()=>setShowAdminPw(s=>!s)}
                  style={{background:"transparent",border:"none",
                    color:"rgba(255,255,255,0.06)",fontSize:14,cursor:"pointer",padding:"4px"}}>🔐</button>
              </div>
            </div>
          </nav>

          {/* Mobile search bar — slides open below nav */}
          <div className={`mobile-search-bar${showSearch?" open":""}`}>
            <div style={{position:"relative",maxWidth:"100%"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",
                fontSize:14,color:"#4a4a6a",pointerEvents:"none"}}>🔍</span>
              <input
                autoFocus={showSearch}
                placeholder="Search prompts..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
                onKeyDown={e=>e.key==="Escape"&&setShowSearch(false)}
                style={{...inp,paddingLeft:38,paddingRight:40,borderRadius:24,height:42,fontSize:14,width:"100%"}}/>
              {search&&(
                <button onClick={()=>setSearch("")}
                  style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                    background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:16}}>✕</button>
              )}
            </div>
          </div>

          {/* ── HERO ── */}
          <div style={{textAlign:"center",padding:"48px 20px 40px",
            background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(109,40,217,0.12),transparent)"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,
              background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.15)",
              borderRadius:20,padding:"5px 14px",marginBottom:20}}>
              <span style={{fontSize:13}}>⚡</span>
              <span style={{fontSize:12,color:"#a78bfa",fontWeight:600}}>
                Curated AI prompts for every use case
              </span>
            </div>
            <h1 className="hero-title" style={{fontFamily:"'Syne',sans-serif",fontWeight:800,
              color:"#f1f5f9",lineHeight:1.35,marginBottom:12,letterSpacing:"0.06em"}}>
              The best prompts,{" "}
              <span style={{background:"linear-gradient(135deg,#a78bfa,#818cf8)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                all in one place
              </span>
            </h1>
            <p className="hero-sub" style={{color:"#64748b",maxWidth:480,margin:"0 auto 28px",lineHeight:1.7}}>
              Discover, copy, and share powerful AI prompts for image generation, video, writing, and more.
            </p>
            {!currentUser&&(
              <button onClick={()=>setShowAuth(true)}
                style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                  borderRadius:12,padding:"12px 28px",color:"#fff",fontWeight:700,fontSize:14,
                  cursor:"pointer",boxShadow:"0 8px 24px rgba(109,40,217,0.35)"}}>
                Sign In to save &amp; submit prompts
              </button>
            )}
          </div>

          {/* ── MAIN ── */}
          <div className="page-wrap" style={{paddingBottom:80}}>

            {/* Admin pw */}
            {showAdminPw&&(
              <div style={{background:"#0f0f1a",border:"1px solid rgba(167,139,250,0.12)",
                borderRadius:14,padding:16,marginBottom:20,maxWidth:380,
                display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>🔐</span>
                  <p style={{fontSize:12,color:"#a78bfa",fontWeight:700,letterSpacing:"0.05em"}}>ADMIN LOGIN</p>
                  <span style={{marginLeft:"auto",fontSize:10,color:"#2a2a3a",
                    background:"rgba(255,255,255,0.04)",borderRadius:6,padding:"2px 8px"}}>
                    {MAX_ATTEMPTS} attempts max
                  </span>
                </div>
                <input type="password" placeholder="Admin password"
                  value={adminPw}
                  onChange={e=>{setAdminPw(e.target.value);setAdminPwErr("");}}
                  onKeyDown={e=>e.key==="Enter"&&handleAdminLogin()}
                  disabled={adminBusy}
                  style={{...inp,border:adminPwErr?"1px solid rgba(239,68,68,0.4)":inp.border}}/>
                {adminPwErr&&(
                  <p style={{fontSize:12,color:"#f87171",display:"flex",gap:6,alignItems:"center"}}>
                    ⚠️ {adminPwErr}
                  </p>
                )}
                <button onClick={handleAdminLogin} disabled={adminBusy||!adminPw}
                  style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                    borderRadius:10,padding:"11px",color:"#fff",fontWeight:700,fontSize:13,
                    cursor:"pointer",opacity:(adminBusy||!adminPw)?0.6:1}}>
                  {adminBusy?"Verifying...":"Enter Admin Panel →"}
                </button>
              </div>
            )}

            {/* Submit */}
            {showSubmit&&currentUser&&<SubmitForm user={currentUser} onSubmit={handleSubmit} onClose={()=>setShowSubmit(false)}/>}

            {/* Layout */}
            <div className="sidebar-layout">

              {/* ── DESKTOP SIDEBAR ── */}
              <div className="sidebar">
                <p style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:"0.1em",
                  marginBottom:8,paddingLeft:4}}>CATEGORIES</p>
                {CATS.map(cat=>(
                  <SideBtn key={cat.id} cat={cat} active={activeCat===cat.id}
                    count={catCount(cat.id)}
                    onClick={()=>{setActiveCat(cat.id);setImgFilter("All");setArFilter("All");setPackFilter("All");}}/>
                ))}
                <div style={{height:1,background:"rgba(255,255,255,0.04)",margin:"12px 0"}}/>
                <p style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:"0.1em",
                  marginBottom:8,paddingLeft:4}}>SORT</p>
                {[["recent","🆕 Recent"],["likes","❤️ Most Liked"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setSort(k)} style={{
                    display:"flex",alignItems:"center",gap:10,width:"100%",
                    background:sort===k?"rgba(167,139,250,0.08)":"transparent",
                    border:`1px solid ${sort===k?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.04)"}`,
                    borderRadius:10,padding:"10px 14px",
                    color:sort===k?"#c4b5fd":"#6b7280",fontSize:13,fontWeight:sort===k?700:400,
                    cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                    {l}
                  </button>
                ))}
                {!currentUser&&(
                  <>
                    <div style={{height:1,background:"rgba(255,255,255,0.04)",margin:"12px 0"}}/>
                    <div onClick={()=>setShowAuth(true)}
                      style={{background:"rgba(109,40,217,0.06)",border:"1px solid rgba(167,139,250,0.12)",
                        borderRadius:14,padding:16,cursor:"pointer"}}>
                      <p style={{fontSize:13,color:"#c4b5fd",fontWeight:700,marginBottom:6}}>Join Promptonic</p>
                      <p style={{fontSize:12,color:"#4a4a6a",lineHeight:1.6,marginBottom:12}}>Like, comment &amp; submit your own prompts</p>
                      <button style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                        borderRadius:8,padding:"8px 14px",color:"#fff",fontWeight:700,fontSize:12,
                        cursor:"pointer",width:"100%"}}>Sign In →</button>
                    </div>
                  </>
                )}
              </div>

              {/* ── MAIN CONTENT ── */}
              <div>
                {/* Mobile cats */}
                <div className="mobile-cats no-scroll">
                  {CATS.map(cat=>{
                    const active=activeCat===cat.id;
                    return(
                      <button key={cat.id} onClick={()=>{setActiveCat(cat.id);setImgFilter("All");setArFilter("All");setPackFilter("All");}}
                        style={{background:active?`${cat.color}15`:"rgba(255,255,255,0.03)",
                          border:`1px solid ${active?cat.color+"40":"rgba(255,255,255,0.06)"}`,
                          color:active?cat.color:"#6b7280",borderRadius:20,
                          padding:"7px 14px",fontSize:12,fontWeight:active?700:400,
                          whiteSpace:"nowrap",cursor:"pointer",flexShrink:0}}>
                        {cat.emoji} {cat.label} <span style={{opacity:0.5}}>({catCount(cat.id)})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile sort + sub-filters */}
                <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                  {[["recent","🆕 Recent"],["likes","❤️ Most Liked"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setSort(k)} style={{
                      background:sort===k?"rgba(167,139,250,0.1)":"transparent",
                      border:`1px solid ${sort===k?"rgba(167,139,250,0.3)":"rgba(255,255,255,0.06)"}`,
                      color:sort===k?"#c4b5fd":"#6b7280",borderRadius:20,
                      padding:"6px 14px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                      {l}
                    </button>
                  ))}
                </div>

                {/* Image filters */}
                {activeCat==="image"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                    <div className="no-scroll" style={{display:"flex",gap:6,overflowX:"auto"}}>
                      <span style={{fontSize:10,fontWeight:700,color:"#3a3a5a",alignSelf:"center",
                        marginRight:4,whiteSpace:"nowrap",letterSpacing:"0.06em"}}>MODEL</span>
                      {IMG_MODELS.map(m=>(
                        <button key={m} onClick={()=>setImgFilter(m)} style={{
                          background:imgFilter===m?"rgba(129,140,248,0.1)":"transparent",
                          border:`1px solid ${imgFilter===m?"rgba(129,140,248,0.35)":"rgba(255,255,255,0.06)"}`,
                          color:imgFilter===m?"#818cf8":"#6b7280",borderRadius:20,
                          padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{m}</button>
                      ))}
                    </div>
                    <div className="no-scroll" style={{display:"flex",gap:6,overflowX:"auto"}}>
                      <span style={{fontSize:10,fontWeight:700,color:"#3a3a5a",alignSelf:"center",
                        marginRight:4,whiteSpace:"nowrap",letterSpacing:"0.06em"}}>RATIO</span>
                      {ASPECT_RATIOS.map(r=>(
                        <button key={r} onClick={()=>setArFilter(r)} style={{
                          background:arFilter===r?"rgba(52,211,153,0.1)":"transparent",
                          border:`1px solid ${arFilter===r?"rgba(52,211,153,0.35)":"rgba(255,255,255,0.06)"}`,
                          color:arFilter===r?"#34d399":"#6b7280",borderRadius:20,
                          padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{r}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Writing filters */}
                {activeCat==="text"&&(
                  <div className="no-scroll" style={{display:"flex",gap:6,overflowX:"auto",marginBottom:16}}>
                    <span style={{fontSize:10,fontWeight:700,color:"#3a3a5a",alignSelf:"center",
                      marginRight:4,whiteSpace:"nowrap",letterSpacing:"0.06em"}}>PACK</span>
                    {WRITING_PACKS.map(pk=>(
                      <button key={pk} onClick={()=>setPackFilter(pk)} style={{
                        background:packFilter===pk?"rgba(52,211,153,0.1)":"transparent",
                        border:`1px solid ${packFilter===pk?"rgba(52,211,153,0.35)":"rgba(255,255,255,0.06)"}`,
                        color:packFilter===pk?"#34d399":"#6b7280",borderRadius:20,
                        padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{pk}</button>
                    ))}
                  </div>
                )}

                {/* Count */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <p style={{fontSize:13,color:"#3a3a5a",fontWeight:500}}>
                    <span style={{color:"#6b7280",fontWeight:700}}>{list.length}</span> prompt{list.length!==1?"s":""}
                    {search&&<span style={{color:"#4a4a6a"}}> for "<span style={{color:"#94a3b8"}}>{search}</span>"</span>}
                  </p>
                </div>

                {/* Trending — only on All tab, no search */}
                {activeCat==="all"&&!search&&(
                  <TrendingSection
                    allPrompts={publicPrompts}
                    likesMap={likesMap}
                    currentUser={currentUser}
                    userLikedIds={userLikedIds}
                    onLike={handleLike}
                    showToast={showToast}/>
                )}

                {/* Cards */}
                {!skeletonDone?(
                  <div className="prompt-grid">
                    {Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>)}
                  </div>
                ):list.length===0?(
                  <div style={{textAlign:"center",padding:"80px 20px",color:"#2a2a3a"}}>
                    <div style={{fontSize:52,marginBottom:16}}>🔮</div>
                    <p style={{fontSize:14,color:"#3a3a5a"}}>
                      {search?`No results for "${search}"`:"No prompts here yet."}
                    </p>
                  </div>
                ):(
                  <div className="prompt-grid">
                    {list.map(p=>(
                      <PromptCard key={p.id} p={p}
                        likes={likesMap[p.id]||0}
                        userLiked={userLikedIds.includes(p.id)}
                        onLike={handleLike}
                        currentUser={currentUser}
                        onLoginRequired={()=>setShowAuth(true)}
                        showToast={showToast}
                        onViewCreator={(id)=>{setCreatorId(id);setPage("creator");}}/>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Footer onNavigate={(p)=>{
            if(p==="leaderboard"){setPage("leaderboard");}
            else if(p==="about"){setPage("about");}
            else if(p==="help"){setPage("help");}
            else if(p==="cat-image"){setActiveCat("image");window.scrollTo({top:400,behavior:"smooth"});}
            else if(p==="cat-video"){setActiveCat("video");window.scrollTo({top:400,behavior:"smooth"});}
            else if(p==="cat-text"){setActiveCat("text");window.scrollTo({top:400,behavior:"smooth"});}
          }}/>
        </div>
      )}

      {/* Pages with footer */}
      {(page==="about"||page==="help")&&(
        <Footer onNavigate={(p)=>{
          if(p==="leaderboard"){setPage("leaderboard");}
          else if(p==="about"){setPage("about");}
          else if(p==="help"){setPage("help");}
        }}/>
      )}

      <ScrollTop/>
      <Toast msg={toast}/>
    </>
  );
}
