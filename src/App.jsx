import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";

/* ─── CONFIG ─── */
const ADMIN_PASSWORD = "prabhat@admin2024";

/* ─── FIREBASE ─── */
const fsGet = async (key) => {
  try { const s = await getDoc(doc(db,"store",key)); return s.exists()?s.data().value:null; } catch { return null; }
};
const fsSet = async (key, value) => {
  try { await setDoc(doc(db,"store",key),{value}); } catch {}
};
const lsGet = (k) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):null; } catch { return null; } };
const lsSet = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };
const simpleHash = s=>{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return h.toString(36);};
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
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  .card:hover{border-color:rgba(167,139,250,0.2)!important;transform:translateY(-1px);}
  .card{transition:all 0.2s ease!important;}
  .copy-btn:hover{background:rgba(109,40,217,1)!important;}
  .like-btn:hover{border-color:rgba(244,114,182,0.5)!important;}
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
function PromptCard({p,likes,userLiked,onLike,currentUser,onLoginRequired,showToast}){
  const [open,setOpen]=useState(false);
  const [imgErr,setImgErr]=useState(false);
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
            <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,
              color:"#fff",lineHeight:1.2,textShadow:"0 2px 12px rgba(0,0,0,0.8)",marginBottom:4}}>
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
            <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,
              color:"#f1f5f9",marginBottom:4,lineHeight:1.3}}>{p.title}</h3>
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
            by <span style={{color:"#94a3b8",fontWeight:600}}>{p.submitterName||(p.submittedBy==="admin"?"Admin":p.submittedBy)}</span>
          </span>
          <div style={{display:"flex",gap:12,marginLeft:"auto",alignItems:"center"}}>
            <span style={{fontSize:11,color:"#3a3a5a",display:"flex",alignItems:"center",gap:4}}>
              📋 <span style={{color:"#6b7280"}}>{(totalCopies).toLocaleString()}</span>
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
      const users=await fsGet("users")||{};
      const user=Object.values(users).find(u=>
        u.username.toLowerCase()===form.username.toLowerCase()&&
        u.passwordHash===simpleHash(form.password));
      if(!user){setErr("Wrong username or password");setBusy(false);return;}
      lsSet("ptn_session",{userId:user.id});onSuccess(user);
    } else {
      if(!form.name||!form.username||!form.password){setErr("All fields required");setBusy(false);return;}
      if(form.password.length<6){setErr("Password: min 6 characters");setBusy(false);return;}
      if(!/^[a-zA-Z0-9_]+$/.test(form.username)){setErr("Username: letters, numbers & _ only");setBusy(false);return;}
      const users=await fsGet("users")||{};
      if(Object.values(users).some(u=>u.username.toLowerCase()===form.username.toLowerCase())){
        setErr("Username already taken");setBusy(false);return;
      }
      const id=`u_${Date.now()}`;
      const user={id,name:form.name.trim(),username:form.username.trim(),
        passwordHash:simpleHash(form.password),createdAt:Date.now()};
      await fsSet("users",{...users,[id]:user});
      lsSet("ptn_session",{userId:id});
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

/* ─── PROFILE PAGE ─── */
function ProfilePage({user,allPrompts,userLikedIds,onLogout,onBack}){
  const myPosts=allPrompts.filter(p=>p.submittedBy===user.id&&p.approved);
  const mySaved=allPrompts.filter(p=>p.approved&&userLikedIds.includes(p.id));
  const [tab,setTab]=useState("saved");
  const list=tab==="saved"?mySaved:myPosts;

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
      <div style={{display:"flex",gap:8,marginBottom:20,padding:4,
        background:"rgba(255,255,255,0.03)",borderRadius:10,border:"1px solid rgba(255,255,255,0.05)"}}>
        {[["saved","❤️ Saved",mySaved.length],["posts","📂 My Posts",myPosts.length]].map(([id,lbl,n])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,background:tab===id?"rgba(109,40,217,0.8)":"transparent",
              border:"none",borderRadius:8,padding:"10px",
              color:tab===id?"#fff":"#6b7280",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            {lbl} ({n})
          </button>
        ))}
      </div>
      {list.length===0?(
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
      )}
    </div>
  );
}

/* ─── ADMIN PANEL ─── */
function AdminPanel({allPrompts,usersMap,likesMap,onApprove,onDelete,onLogout}){
  const pending=allPrompts.filter(p=>!p.approved);
  const approved=allPrompts.filter(p=>p.approved);
  const [tab,setTab]=useState("stats");
  const [comments,setComments]=useState({});
  useEffect(()=>{fsGet("comments").then(c=>setComments(c||{}));},[]);
  const totalLikes=Object.values(likesMap).reduce((a,b)=>a+b,0);
  const totalComments=Object.values(comments).reduce((a,b)=>a+b.length,0);

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
        {[["stats","📊 Stats"],["pending",`⏳ Pending (${pending.length})`],["live",`✓ Live (${approved.length})`],["users",`👥 Users (${Object.keys(usersMap).length})`]].map(([id,lbl])=>(
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
    </div>
  );
}

/* ─── SUBMIT FORM ─── */
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

  const showToast=m=>{setToast(m);setTimeout(()=>setToast(""),2400);};

  useEffect(()=>{
    (async()=>{
      let p=await fsGet("prompts");
      if(!p||!p.length){p=SEED;await fsSet("prompts",p);}
      setAllPrompts(p);
      setLikesMap(await fsGet("likes")||{});
      const um=await fsGet("users")||{};setUsersMap(um);
      const sess=lsGet("ptn_session");
      if(sess?.userId&&um[sess.userId]){
        setCurrentUser(um[sess.userId]);
        setUserLikedIds(lsGet(`ptn_ul_${sess.userId}`)||[]);
      }
      setLoading(false);
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
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onSuccess={handleAuthSuccess} showToast={showToast}/>}

      {page==="admin"&&<AdminPanel allPrompts={allPrompts} usersMap={usersMap} likesMap={likesMap}
        onApprove={handleApprove} onDelete={handleDelete} onLogout={()=>{setPage("home");setAdminPw("");}}/>}

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
              {/* Search */}
              <div style={{flex:1,maxWidth:440,position:"relative"}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",
                  fontSize:14,color:"#3a3a5a",pointerEvents:"none"}}>🔍</span>
                <input placeholder="Search prompts..." value={search}
                  onChange={e=>setSearch(e.target.value)}
                  style={{...inp,paddingLeft:36,borderRadius:24,height:38,fontSize:13}}/>
              </div>
              {/* Actions */}
              <div style={{display:"flex",gap:8,marginLeft:"auto",flexShrink:0,alignItems:"center"}}>
                {currentUser?(
                  <>
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
                borderRadius:14,padding:16,marginBottom:20,maxWidth:360,
                display:"flex",flexDirection:"column",gap:10}}>
                <p style={{fontSize:12,color:"#a78bfa",fontWeight:700,letterSpacing:"0.05em"}}>🔐 ADMIN LOGIN</p>
                <input type="password" placeholder="Password" value={adminPw}
                  onChange={e=>{setAdminPw(e.target.value);setAdminPwErr(false);}}
                  onKeyDown={e=>{if(e.key==="Enter"){if(adminPw===ADMIN_PASSWORD){setPage("admin");setShowAdminPw(false);setAdminPw("");}else setAdminPwErr(true);}}}
                  style={inp}/>
                {adminPwErr&&<p style={{fontSize:12,color:"#f87171"}}>❌ Wrong password</p>}
                <button onClick={()=>{if(adminPw===ADMIN_PASSWORD){setPage("admin");setShowAdminPw(false);setAdminPw("");}else setAdminPwErr(true);}}
                  style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                    borderRadius:10,padding:"11px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  Enter Admin Panel →
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

                {/* Cards */}
                {list.length===0?(
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
                        showToast={showToast}/>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Toast msg={toast}/>
    </>
  );
}
