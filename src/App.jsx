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

/* ─── DATA ─── */
const CATS = [
  {id:"all",   label:"All",     emoji:"✦", color:"#c4b5fd"},
  {id:"image", label:"Image",   emoji:"🖼", color:"#a78bfa"},
  {id:"video", label:"Video",   emoji:"🎬", color:"#fb923c"},
  {id:"text",  label:"Writing", emoji:"✍️", color:"#34d399"},
  {id:"other", label:"Other",   emoji:"⚡", color:"#f472b6"},
];
const IMG_MODELS    = ["All","Midjourney","SDXL","Flux","DALL-E"];
const ASPECT_RATIOS = ["All","1:1","16:9","9:16","4:3","3:2"];
const WRITING_PACKS = ["All","Captions","Hooks","Scripts","YouTube","Carousel","Philosophy","Psychology"];
const MODEL_CLR = {Midjourney:"#818cf8",SDXL:"#f472b6",Flux:"#34d399","DALL-E":"#fb923c"};

const SEED = [
  {id:"p1",category:"image",title:"Cinematic Portrait",
    prompt:"A cinematic portrait of a young woman, golden hour lighting, shallow depth of field, film grain, 35mm lens, ultra realistic, 8K resolution, professional photography",
    negativePrompt:"blur, low quality, watermark, ugly, distorted face",
    tags:["portrait","realistic","golden hour"],
    previewUrl:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&q=80",
    aiModel:"Midjourney",aspectRatio:"4:3",mjParams:"--ar 4:3 --v 6.1 --style raw --q 2",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000001},
  {id:"p2",category:"image",title:"Fantasy Landscape",
    prompt:"Epic fantasy landscape, floating islands with waterfalls, glowing crystals, dramatic storm clouds, God rays piercing through, hyperdetailed, concept art style",
    negativePrompt:"low resolution, blurry, flat, cartoonish",
    tags:["landscape","fantasy","concept art"],
    previewUrl:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&q=80",
    aiModel:"SDXL",aspectRatio:"16:9",mjParams:"--ar 16:9 --v 6",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000002},
  {id:"p3",category:"image",title:"Cyberpunk City Night",
    prompt:"Futuristic cyberpunk city at night, neon signs, rain reflections on wet pavement, volumetric fog, ultra detailed, 8K cinematic",
    negativePrompt:"daylight, natural colors, old buildings, low quality",
    tags:["cyberpunk","city","neon"],
    previewUrl:"https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=700&q=80",
    aiModel:"Flux",aspectRatio:"16:9",mjParams:"--ar 16:9 --v 6.1 --style raw",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000003},
  {id:"p4",category:"image",title:"Luxury Product Shot",
    prompt:"Minimalist luxury perfume bottle on white marble, soft directional shadows, studio strobe lighting, clean white background, commercial photography, ultra sharp",
    negativePrompt:"busy background, people, outdoor, low contrast",
    tags:["product","commercial","minimalist"],
    previewUrl:"https://images.unsplash.com/photo-1541643600914-78b084683702?w=700&q=80",
    aiModel:"DALL-E",aspectRatio:"1:1",mjParams:"--ar 1:1 --v 6 --style raw",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000004},
  {id:"p5",category:"image",title:"Dramatic Ocean Sunset",
    prompt:"Breathtaking ocean sunset, dramatic orange and pink clouds, calm water reflecting golden light, silhouette of lone sailboat, long exposure photography, ultra realistic, 8K",
    negativePrompt:"overexposed, flat sky, no clouds, CGI look",
    tags:["nature","sunset","ocean"],
    previewUrl:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=80",
    aiModel:"Midjourney",aspectRatio:"16:9",mjParams:"--ar 16:9 --v 6 --style scenic",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000005},
  {id:"p6",category:"image",title:"Soft Studio Portrait",
    prompt:"Professional female portrait, soft box studio lighting, neutral grey background, beauty dish, sharp focus on eyes, 85mm lens bokeh, Vogue magazine style",
    negativePrompt:"harsh shadows, red eye, busy background, ugly",
    tags:["portrait","studio","fashion"],
    previewUrl:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&q=80",
    aiModel:"SDXL",aspectRatio:"4:3",mjParams:"--ar 4:3 --v 6.1",
    approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000006},
  {id:"p7",category:"video",title:"Slow Mo Water Splash",
    prompt:"Ultra slow motion water splash in dark studio, crystal clear droplets frozen in air, black background, professional studio rim lighting, 1000fps, 4K cinematic color grade",
    tags:["slow motion","water","studio"],
    previewUrl:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=700&q=80",
    videoIcon:true,approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000007},
  {id:"p8",category:"video",title:"Rose Bloom Timelapse",
    prompt:"Timelapse of a red rose blooming from bud to full bloom, soft window light, macro lens, clean green bokeh background, 60fps smooth playback, cinematic grade",
    tags:["nature","timelapse","macro"],
    previewUrl:"https://images.unsplash.com/photo-1490750967868-88df5691cc25?w=700&q=80",
    videoIcon:true,approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000008},
  {id:"p9",category:"video",title:"Aerial Mountain Flyover",
    prompt:"Cinematic aerial drone footage over Himalayan peaks at sunrise, golden mist in valleys, ultra smooth slow pan, 4K LOG footage, landscape cinematography, epic scale",
    tags:["drone","cinematic","landscape"],
    previewUrl:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=80",
    videoIcon:true,approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000009},
  {id:"p10",category:"video",title:"Cinematic Car Chase",
    prompt:"Cinematic car chase on city highway at dusk, low angle follow cam, motion blur, wet road reflections, handheld shaky cam, action movie grade, Kling AI optimized",
    tags:["action","car","cinematic"],
    previewUrl:"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=700&q=80",
    videoIcon:true,approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000010},
  {id:"p11",category:"text",title:"Viral Instagram Hook",subPack:"Hooks",
    prompt:"Write 5 viral Instagram hooks for [TOPIC]. Each hook must create instant curiosity, start with a bold statement or shocking fact, be under 12 words, trigger emotion (shock, curiosity, FOMO). No emojis.",
    tags:["instagram","viral","hooks"],approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000011},
  {id:"p12",category:"text",title:"YouTube Script Intro",subPack:"YouTube",
    prompt:"Write a YouTube video script intro for [TOPIC]. Hook in first 5 seconds, tease what viewer will learn, include a pattern interrupt, mention a relatable problem. Under 45 seconds when spoken.",
    tags:["youtube","script","intro"],approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000012},
  {id:"p13",category:"text",title:"Carousel Post Writer",subPack:"Carousel",
    prompt:"Write a 7-slide Instagram carousel about [TOPIC]. Slide 1: bold headline hook. Slides 2-6: one key insight per slide with example. Slide 7: strong CTA. Each slide: max 3 lines. Second person voice.",
    tags:["carousel","instagram","educational"],approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000013},
  {id:"p14",category:"other",title:"Brand Name Generator",
    prompt:"Generate 10 unique brand names for a [BUSINESS TYPE] targeting [AUDIENCE]. Max 10 characters, easy to spell, suggest one-line tagline. Include vibe/meaning for each.",
    tags:["branding","naming","startup"],approved:true,submittedBy:"admin",submitterName:"Admin",createdAt:1700000014},
];

/* ─── UTILS ─── */
const cc = id => CATS.find(c=>c.id===id)?.color||"#a78bfa";
const simpleHash = s=>{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return h.toString(36);};
const timeAgo = ts=>{const d=(Date.now()-ts)/1000;if(d<60)return"abhi";if(d<3600)return`${Math.floor(d/60)}m`;if(d<86400)return`${Math.floor(d/3600)}h`;return`${Math.floor(d/86400)}d`;};

/* ─── GLOBAL STYLES ─── */
const G = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#07071a;color:#fff;font-family:'Inter',sans-serif;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#2d2d4a;border-radius:4px;}
  input,textarea,select{font-family:'Inter',sans-serif;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}

  /* Responsive grid */
  .card-grid{display:grid;grid-template-columns:1fr;gap:20px;}
  @media(min-width:768px){.card-grid{grid-template-columns:1fr 1fr;gap:24px;}}
  @media(min-width:1200px){.card-grid{grid-template-columns:1fr 1fr 1fr;}}

  /* Sidebar layout on desktop */
  .layout{display:flex;flex-direction:column;}
  @media(min-width:1024px){.layout{flex-direction:row;align-items:flex-start;gap:28px;}}
  .sidebar{display:none;}
  @media(min-width:1024px){.sidebar{display:flex;flex-direction:column;gap:12px;width:220px;flex-shrink:0;position:sticky;top:24px;}}
  .main-content{flex:1;min-width:0;}

  /* Scrollbar hide */
  .no-scroll{scrollbar-width:none;-ms-overflow-style:none;}
  .no-scroll::-webkit-scrollbar{display:none;}

  /* Cat pills mobile scroll */
  .cat-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;}
  @media(min-width:1024px){.cat-row{display:none;}}

  /* Hover effects */
  .card-wrap:hover{border-color:rgba(167,139,250,0.25)!important;transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.4)!important;}
  .card-wrap{transition:all 0.2s ease!important;}
  .pill-btn:hover{opacity:0.85;}

  /* Filter strip */
  .filter-strip{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;}
  .filter-strip::-webkit-scrollbar{display:none;}
`;

const iS = {
  background:"#0f0f24", border:"1px solid rgba(255,255,255,0.08)",
  borderRadius:10, padding:"11px 14px", color:"#e2e8f0",
  fontSize:14, width:"100%", outline:"none",
};

/* ─── TOAST ─── */
function Toast({msg}){
  if(!msg) return null;
  return (
    <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",
      background:msg.startsWith("⚠")?"#7c2d12":"#14532d",
      color:"#fff",borderRadius:24,padding:"11px 24px",fontWeight:600,fontSize:13,
      zIndex:1000,whiteSpace:"nowrap",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
      animation:"fadeIn 0.2s ease"}}>
      {msg}
    </div>
  );
}

/* ─── COPY BTN ─── */
function CopyBtn({text,small}){
  const [ok,setOk]=useState(false);
  return (
    <button onClick={e=>{e.stopPropagation();navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),2000);}}
      style={{background:ok?"#15803d":"rgba(109,40,217,0.9)",
        border:"none",borderRadius:9,padding:small?"7px 14px":"9px 20px",
        color:"#fff",fontSize:small?11:13,fontWeight:700,cursor:"pointer",
        transition:"all 0.2s",whiteSpace:"nowrap"}}>
      {ok?"✓ Copied!":"Copy Prompt"}
    </button>
  );
}

/* ─── AVATAR ─── */
function Avatar({name,size=36}){
  return (
    <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:size*0.38,fontWeight:800,color:"#fff",letterSpacing:"-0.5px"}}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── BADGE ─── */
function Badge({color,children,style={}}){
  return (
    <span style={{background:`${color}18`,border:`1px solid ${color}44`,
      color,borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:700,
      letterSpacing:"0.04em",whiteSpace:"nowrap",...style}}>
      {children}
    </span>
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
    setComments(up[promptId]);
    setText("");setPosting(false);
    showToast("💬 Comment posted!");
  };

  const del=async(cid)=>{
    const all=await fsGet("comments")||{};
    const up={...all,[promptId]:(all[promptId]||[]).filter(c=>c.id!==cid)};
    await fsSet("comments",up);setComments(up[promptId]||[]);
    showToast("🗑 Deleted.");
  };

  if(loading) return <p style={{fontSize:12,color:"#3a3a5a",padding:"8px 0"}}>Loading...</p>;

  return (
    <div onClick={e=>e.stopPropagation()} style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:16,marginTop:4}}>
      <p style={{fontSize:12,color:"#6b6b8a",fontWeight:700,marginBottom:12}}>
        💬 {comments.length} Comment{comments.length!==1?"s":""}
      </p>
      {comments.length===0 && (
        <p style={{fontSize:13,color:"#2a2a45",textAlign:"center",padding:"12px 0",marginBottom:12}}>
          Be the first to comment ✨
        </p>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
        {comments.map(c=>(
          <div key={c.id} style={{background:"rgba(255,255,255,0.02)",
            border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"10px 12px"}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <Avatar name={c.userName} size={28}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#c4b5fd"}}>{c.userName}</span>
                  <span style={{fontSize:10,color:"#3a3a5a"}}>@{c.username}</span>
                  <span style={{fontSize:10,color:"#2a2a45",marginLeft:"auto"}}>{timeAgo(c.createdAt)}</span>
                </div>
                <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.5}}>{c.text}</p>
              </div>
              {currentUser&&(currentUser.id===c.userId)&&(
                <button onClick={()=>del(c.id)} style={{background:"none",border:"none",
                  color:"#2a2a45",cursor:"pointer",fontSize:14,flexShrink:0,padding:"2px"}}>✕</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {currentUser?(
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Avatar name={currentUser.name} size={30}/>
          <input value={text} onChange={e=>setText(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();post();}}}
            placeholder="Write a comment..." style={{...iS,flex:1,padding:"9px 13px",fontSize:13,borderRadius:20}}/>
          <button onClick={post} disabled={!text.trim()||posting}
            style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
              borderRadius:20,padding:"9px 16px",color:"#fff",fontSize:13,cursor:"pointer",
              opacity:(!text.trim()||posting)?0.4:1,whiteSpace:"nowrap",fontWeight:600}}>Send</button>
        </div>
      ):(
        <button onClick={onLoginRequired} style={{width:"100%",background:"rgba(167,139,250,0.05)",
          border:"1px solid rgba(167,139,250,0.15)",borderRadius:10,padding:"11px",
          color:"#6b6b8a",fontSize:13,cursor:"pointer",fontWeight:600}}>
          Login to comment →
        </button>
      )}
    </div>
  );
}

/* ─── PROMPT CARD ─── */
function Card({p,likes,userLiked,onLike,currentUser,onLoginRequired,showToast}){
  const [open,setOpen]=useState(false);
  const [imgErr,setImgErr]=useState(false);
  const hasImg=p.previewUrl&&!imgErr;
  const color=cc(p.category);
  const cat=CATS.find(c=>c.id===p.category);

  return (
    <div className="card-wrap" onClick={()=>setOpen(o=>!o)}
      style={{background:"linear-gradient(160deg,#0c0c1f 0%,#0f0f24 100%)",
        border:`1px solid rgba(255,255,255,${open?0.12:0.05})`,
        borderRadius:18,overflow:"hidden",cursor:"pointer",
        boxShadow:open?`0 8px 40px rgba(0,0,0,0.5),0 0 0 1px ${color}22`:"0 2px 12px rgba(0,0,0,0.3)",
        animation:"fadeIn 0.3s ease"}}>

      {/* Image */}
      {hasImg&&(
        <div style={{position:"relative",width:"100%",aspectRatio:"16/9",overflow:"hidden"}}>
          <img src={p.previewUrl} alt={p.title} onError={()=>setImgErr(true)}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block",
              filter:"brightness(0.65) saturate(1.1)",
              transition:"transform 0.5s ease,filter 0.3s",
              transform:open?"scale(1.05)":"scale(1)"}}/>
          {/* Gradient */}
          <div style={{position:"absolute",inset:0,
            background:"linear-gradient(to top,#0f0f24 0%,rgba(15,15,36,0.5) 45%,rgba(15,15,36,0.1) 100%)"}}/>
          {/* Top badges */}
          <div style={{position:"absolute",top:12,left:12,right:12,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <Badge color={color}>{cat?.emoji} {p.category.toUpperCase()}</Badge>
            {p.aiModel&&<Badge color={MODEL_CLR[p.aiModel]||"#888"}>{p.aiModel}</Badge>}
          </div>
          {/* Aspect ratio */}
          {p.aspectRatio&&(
            <div style={{position:"absolute",bottom:48,right:12,
              background:"rgba(0,0,0,0.6)",border:"1px solid rgba(255,255,255,0.12)",
              color:"#94a3b8",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600}}>
              {p.aspectRatio}
            </div>
          )}
          {/* Video play */}
          {p.videoIcon&&(
            <div style={{position:"absolute",top:"50%",left:"50%",
              transform:"translate(-50%,-50%)",width:54,height:54,borderRadius:"50%",
              background:"rgba(0,0,0,0.65)",border:"2px solid rgba(255,255,255,0.5)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:22,paddingLeft:4,backdropFilter:"blur(4px)"}}>▶</div>
          )}
          {/* Title */}
          <div style={{position:"absolute",bottom:14,left:16,right:16}}>
            <h3 style={{margin:0,fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,
              color:"#fff",lineHeight:1.3,textShadow:"0 2px 12px rgba(0,0,0,0.8)"}}>{p.title}</h3>
          </div>
        </div>
      )}

      {/* No image header */}
      {!hasImg&&(
        <div style={{padding:"18px 18px 0",display:"flex",gap:8,alignItems:"flex-start",justifyContent:"space-between"}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
              <Badge color={color}>{cat?.emoji} {p.category.toUpperCase()}</Badge>
              {p.subPack&&<Badge color="#64748b">📦 {p.subPack}</Badge>}
            </div>
            <h3 style={{margin:0,fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:"#e2e8f0"}}>{p.title}</h3>
          </div>
          {/* Big emoji icon for text/other */}
          <div style={{width:48,height:48,borderRadius:14,background:`${color}15`,
            border:`1px solid ${color}25`,display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:22,flexShrink:0}}>
            {cat?.emoji}
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{padding:"12px 18px 18px"}}>
        {/* Like + meta */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <button onClick={e=>{e.stopPropagation();onLike(p.id);}}
            style={{background:userLiked?`${color}18`:"rgba(255,255,255,0.04)",
              border:`1px solid ${userLiked?color:"rgba(255,255,255,0.08)"}`,
              borderRadius:20,padding:"5px 13px",
              color:userLiked?color:"#6b7280",fontSize:12,fontWeight:700,
              cursor:"pointer",display:"flex",alignItems:"center",gap:5,
              transition:"all 0.2s",flexShrink:0}}>
            {userLiked?"❤️":"🤍"} {likes}
          </button>
          <span style={{fontSize:11,color:"#3a3a5a"}}>
            by {p.submitterName||(p.submittedBy==="admin"?"Admin ✦":p.submittedBy)}
          </span>
          {!open&&<span style={{fontSize:11,color:"#2a2a45",marginLeft:"auto"}}>tap ↓</span>}
        </div>

        {/* Prompt preview */}
        <p style={{margin:"0 0 8px",fontSize:13.5,color:"#64748b",lineHeight:1.7,
          display:open?"block":"-webkit-box",WebkitLineClamp:2,
          WebkitBoxOrient:"vertical",overflow:open?"visible":"hidden"}}>
          {p.prompt}
        </p>

        {/* Expanded */}
        {open&&(
          <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:8}}
            onClick={e=>e.stopPropagation()}>
            {p.negativePrompt&&(
              <div style={{background:"rgba(239,68,68,0.05)",border:"1px solid rgba(239,68,68,0.15)",
                borderRadius:12,padding:"12px 14px"}}>
                <p style={{margin:"0 0 5px",fontSize:11,color:"#f87171",fontWeight:700,letterSpacing:"0.05em"}}>⛔ NEGATIVE PROMPT</p>
                <p style={{margin:0,fontSize:12.5,color:"#6b7280",lineHeight:1.6}}>{p.negativePrompt}</p>
              </div>
            )}
            {p.mjParams&&(
              <div style={{background:"rgba(129,140,248,0.05)",border:"1px solid rgba(129,140,248,0.15)",
                borderRadius:12,padding:"12px 14px"}}>
                <p style={{margin:"0 0 5px",fontSize:11,color:"#818cf8",fontWeight:700,letterSpacing:"0.05em"}}>⚙️ PARAMETERS</p>
                <code style={{fontSize:12,color:"#a5b4fc",fontFamily:"monospace"}}>{p.mjParams}</code>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(p.tags||[]).map(t=>(
                  <span key={t} style={{background:`${color}10`,border:`1px solid ${color}25`,
                    color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{t}</span>
                ))}
              </div>
              <CopyBtn text={p.prompt}/>
            </div>
            <p style={{margin:0,fontSize:11,color:"#2a2a45"}}>
              {timeAgo(p.createdAt)} ago · by {p.submitterName}
            </p>
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
      lsSet("ptn_session",{userId:user.id});
      onSuccess(user);
    } else {
      if(!form.name||!form.username||!form.password){setErr("All fields required");setBusy(false);return;}
      if(form.password.length<6){setErr("Password must be at least 6 characters");setBusy(false);return;}
      if(!/^[a-zA-Z0-9_]+$/.test(form.username)){setErr("Username: letters, numbers and _ only");setBusy(false);return;}
      const users=await fsGet("users")||{};
      if(Object.values(users).some(u=>u.username.toLowerCase()===form.username.toLowerCase())){
        setErr("Username already taken");setBusy(false);return;
      }
      const id=`u_${Date.now()}`;
      const user={id,name:form.name.trim(),username:form.username.trim(),
        passwordHash:simpleHash(form.password),createdAt:Date.now()};
      await fsSet("users",{...users,[id]:user});
      lsSet("ptn_session",{userId:id});
      showToast("✓ Account created! Welcome 🎉");
      onSuccess(user);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",
      display:"flex",alignItems:"center",justifyContent:"center",
      zIndex:500,padding:20,backdropFilter:"blur(8px)"}}>
      <div style={{background:"#0d0d22",border:"1px solid rgba(167,139,250,0.2)",
        borderRadius:24,padding:28,width:"100%",maxWidth:400,
        boxShadow:"0 24px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(167,139,250,0.1)",
        animation:"fadeIn 0.25s ease"}}>
        {/* Logo */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
          <div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,
              background:"linear-gradient(135deg,#fff,#a78bfa)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4}}>
              Promptonic
            </h2>
            <p style={{fontSize:12,color:"#4a4a6a"}}>
              {tab==="login"?"Welcome back!":"Join for free — takes 30 seconds"}
            </p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,
            padding:"7px 11px",color:"#6b7280",cursor:"pointer",fontSize:16}}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",gap:8,marginBottom:20,background:"rgba(255,255,255,0.03)",
          padding:4,borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}>
          {["login","register"].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setErr("");}}
              style={{flex:1,background:tab===t?"rgba(109,40,217,0.8)":"transparent",
                border:"none",borderRadius:9,padding:"10px",
                color:tab===t?"#fff":"#6b7280",fontSize:13,fontWeight:700,cursor:"pointer",
                transition:"all 0.2s"}}>
              {t==="login"?"Login":"Register"}
            </button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {tab==="register"&&(
            <input placeholder="Your name" value={form.name}
              onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={iS}/>
          )}
          <input placeholder="Username" value={form.username}
            onChange={e=>setForm(p=>({...p,username:e.target.value}))} style={iS}/>
          <input type="password" placeholder="Password"
            value={form.password}
            onChange={e=>setForm(p=>({...p,password:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&go()} style={iS}/>
          {err&&<p style={{fontSize:12,color:"#f87171",padding:"2px 4px"}}>⚠️ {err}</p>}
          <button onClick={go} disabled={busy}
            style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
              borderRadius:12,padding:"14px",color:"#fff",fontWeight:700,fontSize:14,
              cursor:"pointer",marginTop:4,opacity:busy?0.6:1,transition:"opacity 0.2s"}}>
            {busy?"...":(tab==="login"?"Login →":"Create Account →")}
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

  return (
    <div style={{maxWidth:700,margin:"0 auto",padding:"24px 16px 80px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#6b7280",
        cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
        ← Back to Promptonic
      </button>
      {/* Profile card */}
      <div style={{background:"linear-gradient(135deg,#0f0f26,#141430)",
        border:"1px solid rgba(167,139,250,0.15)",borderRadius:24,padding:28,marginBottom:24,
        position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:200,height:200,borderRadius:"50%",
          background:"radial-gradient(circle,rgba(109,40,217,0.15),transparent 70%)",pointerEvents:"none"}}/>
        <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
          <div style={{width:80,height:80,borderRadius:20,
            background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:32,fontWeight:800,color:"#fff",flexShrink:0,
            boxShadow:"0 8px 24px rgba(109,40,217,0.4)"}}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#f1f5f9",marginBottom:4}}>{user.name}</h2>
            <p style={{fontSize:13,color:"#4a4a6a",marginBottom:16}}>@{user.username}</p>
            <div style={{display:"flex",gap:12}}>
              {[["Posts",myPosts.length,"#a78bfa"],["Saved",mySaved.length,"#f472b6"]].map(([l,v,clr])=>(
                <div key={l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:14,padding:"12px 20px",textAlign:"center"}}>
                  <p style={{fontSize:22,fontWeight:800,fontFamily:"'Syne',sans-serif",color:clr,margin:0}}>{v}</p>
                  <p style={{fontSize:11,color:"#4a4a6a",marginTop:2}}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button onClick={onLogout} style={{marginTop:20,background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 20px",
          color:"#6b7280",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          Logout
        </button>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:20,background:"rgba(255,255,255,0.03)",
        padding:4,borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}>
        {[["saved","❤️ Saved",mySaved.length],["posts","📂 My Posts",myPosts.length]].map(([id,lbl,n])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,background:tab===id?"rgba(109,40,217,0.8)":"transparent",
              border:"none",borderRadius:9,padding:"10px",
              color:tab===id?"#fff":"#6b7280",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            {lbl} ({n})
          </button>
        ))}
      </div>
      {list.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:"#2a2a45"}}>
          <div style={{fontSize:48,marginBottom:16}}>{tab==="saved"?"❤️":"📂"}</div>
          <p style={{fontSize:14,lineHeight:1.7}}>
            {tab==="saved"?"No saved prompts yet.\nLike prompts to save them!":"No posts yet.\nSubmit your first prompt!"}
          </p>
        </div>
      ):(
        <div className="card-grid">
          {list.map(p=>{
            const color=cc(p.category);const cat=CATS.find(c=>c.id===p.category);
            return (
              <div key={p.id} style={{background:"#0c0c1f",border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:16,overflow:"hidden"}}>
                {p.previewUrl&&<img src={p.previewUrl} alt={p.title}
                  style={{width:"100%",height:120,objectFit:"cover",display:"block",filter:"brightness(0.6)"}}
                  onError={e=>e.target.style.display="none"}/>}
                <div style={{padding:"12px 14px"}}>
                  <Badge color={color} style={{marginBottom:8,display:"inline-block"}}>{cat?.emoji} {p.category}</Badge>
                  <h4 style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#e2e8f0",margin:"8px 0 6px"}}>{p.title}</h4>
                  <p style={{fontSize:12,color:"#4a4a6a",lineHeight:1.5,marginBottom:10,
                    display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.prompt}</p>
                  <CopyBtn text={p.prompt} small/>
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
    <div style={{background:"#0f0f24",border:"1px solid rgba(255,255,255,0.06)",
      borderRadius:16,padding:"20px 16px",textAlign:"center"}}>
      <div style={{fontSize:24,marginBottom:8}}>{em}</div>
      <p style={{fontSize:26,fontWeight:800,fontFamily:"'Syne',sans-serif",color:clr,margin:0}}>{v}</p>
      <p style={{fontSize:11,color:"#4a4a6a",marginTop:4}}>{lbl}</p>
    </div>
  );

  const pItem=(p,isPending)=>(
    <div key={p.id} style={{background:"#0c0c1f",border:"1px solid rgba(255,255,255,0.06)",
      borderRadius:16,padding:18,display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <Badge color={cc(p.category)}>{CATS.find(c=>c.id===p.category)?.emoji} {p.category}</Badge>
        <span style={{fontSize:11,color:"#4a4a6a"}}>by {p.submitterName}</span>
        <span style={{fontSize:11,color:"#3a3a5a",marginLeft:"auto"}}>❤️{likesMap[p.id]||0} 💬{(comments[p.id]||[]).length}</span>
      </div>
      <h4 style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#e2e8f0"}}>{p.title}</h4>
      <p style={{fontSize:12,color:"#4a4a6a",lineHeight:1.6,
        display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.prompt}</p>
      <div style={{display:"flex",gap:8}}>
        {isPending&&<button onClick={()=>onApprove(p.id)} style={{
          background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",color:"#4ade80",
          borderRadius:10,padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",flex:1}}>✓ Approve</button>}
        <button onClick={()=>onDelete(p.id)} style={{
          background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",color:"#f87171",
          borderRadius:10,padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",flex:isPending?1:"auto"}}>🗑 Delete</button>
      </div>
    </div>
  );

  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"24px 16px 80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,
            background:"linear-gradient(135deg,#fff,#a78bfa)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4}}>Admin Panel</h1>
          <p style={{fontSize:12,color:"#4a4a6a"}}>Promptonic Control ✦</p>
        </div>
        <button onClick={onLogout} style={{background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"9px 16px",
          color:"#6b7280",fontSize:12,cursor:"pointer"}}>Logout</button>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:24,overflowX:"auto"}} className="no-scroll">
        {[["stats","📊 Stats"],["pending",`⏳ Pending (${pending.length})`],["live",`✓ Live (${approved.length})`],["users",`👥 Users (${Object.keys(usersMap).length})`]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            background:tab===id?"rgba(109,40,217,0.8)":"rgba(255,255,255,0.03)",
            border:`1px solid ${tab===id?"rgba(167,139,250,0.4)":"rgba(255,255,255,0.06)"}`,
            color:tab===id?"#fff":"#6b7280",borderRadius:10,padding:"8px 16px",
            fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
            {lbl}
          </button>
        ))}
      </div>

      {tab==="stats"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
            {statCard("📂",approved.length,"Live Prompts","#a78bfa")}
            {statCard("⏳",pending.length,"Pending","#fb923c")}
            {statCard("👥",Object.keys(usersMap).length,"Users","#34d399")}
            {statCard("❤️",totalLikes,"Total Likes","#f472b6")}
            {statCard("💬",totalComments,"Comments","#818cf8")}
          </div>
          <div style={{background:"#0f0f24",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:20}}>
            <p style={{fontSize:13,color:"#6b7280",fontWeight:700,marginBottom:14}}>🔥 Top Liked Prompts</p>
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
          ?<div style={{textAlign:"center",padding:"60px",color:"#2a2a45"}}><div style={{fontSize:40,marginBottom:12}}>✓</div><p>No pending prompts!</p></div>
          :<div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))"}}>{pending.map(p=>pItem(p,true))}</div>
      )}
      {tab==="live"&&(
        <div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))"}}>
          {approved.map(p=>pItem(p,false))}
        </div>
      )}
      {tab==="users"&&(
        <div style={{display:"grid",gap:10,gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"}}>
          {Object.values(usersMap).length===0
            ?<div style={{textAlign:"center",padding:"60px",color:"#2a2a45"}}><div style={{fontSize:40,marginBottom:12}}>👥</div><p>No users yet.</p></div>
            :Object.values(usersMap).map(u=>(
              <div key={u.id} style={{background:"#0c0c1f",border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:14,padding:16,display:"flex",gap:12,alignItems:"center"}}>
                <Avatar name={u.name} size={44}/>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:2}}>{u.name}</p>
                  <p style={{fontSize:11,color:"#4a4a6a",marginBottom:6}}>@{u.username}</p>
                  <p style={{fontSize:11,color:"#a78bfa",fontWeight:600}}>
                    {allPrompts.filter(p=>p.submittedBy===u.id&&p.approved).length} posts
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
function SubmitForm({user,onSubmit,onClose}){
  const [form,setForm]=useState({title:"",prompt:"",category:"image",tags:"",previewUrl:""});
  const [done,setDone]=useState(false);
  if(done) return (
    <div style={{background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.2)",
      borderRadius:20,padding:28,marginBottom:20,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:12}}>🎉</div>
      <h3 style={{color:"#4ade80",fontFamily:"'Syne',sans-serif",marginBottom:8}}>Submitted!</h3>
      <p style={{color:"#4a4a6a",fontSize:13,marginBottom:16}}>Admin will review your prompt before going live.</p>
      <button onClick={onClose} style={{background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.3)",
        color:"#4ade80",borderRadius:10,padding:"10px 24px",fontWeight:700,cursor:"pointer",fontSize:13}}>Done ✓</button>
    </div>
  );
  return (
    <div style={{background:"#0d0d22",border:"1px solid rgba(167,139,250,0.15)",
      borderRadius:20,padding:20,marginBottom:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <p style={{color:"#a78bfa",fontWeight:700,fontFamily:"'Syne',sans-serif",fontSize:14}}>✦ Submit a Prompt</p>
        <span style={{fontSize:12,color:"#4a4a6a"}}>as @{user.username}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <input placeholder="Title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={iS}/>
        <textarea placeholder="Your prompt *" value={form.prompt} onChange={e=>setForm({...form,prompt:e.target.value})}
          rows={4} style={{...iS,resize:"vertical",lineHeight:1.6}}/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={iS}>
          <option value="image">🖼 Image</option><option value="video">🎬 Video</option>
          <option value="text">✍️ Writing</option><option value="other">⚡ Other</option>
        </select>
        <input placeholder="Preview image URL (optional — from unsplash.com)" value={form.previewUrl}
          onChange={e=>setForm({...form,previewUrl:e.target.value})} style={iS}/>
        <input placeholder="Tags (comma separated)" value={form.tags}
          onChange={e=>setForm({...form,tags:e.target.value})} style={iS}/>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"12px",
            color:"#6b7280",cursor:"pointer",flex:1,fontSize:13}}>Cancel</button>
          <button onClick={async()=>{if(!form.title||!form.prompt)return;
            await onSubmit({...form,tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean),videoIcon:form.category==="video"});
            setDone(true);}}
            disabled={!form.title||!form.prompt}
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

/* ─── SIDEBAR CAT BUTTON (desktop) ─── */
function SidebarCatBtn({cat,active,count,onClick}){
  return (
    <button onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:10,width:"100%",
      background:active?`${cat.color}12`:"transparent",
      border:`1px solid ${active?cat.color+"44":"rgba(255,255,255,0.05)"}`,
      borderRadius:12,padding:"11px 14px",
      color:active?cat.color:"#6b7280",
      fontSize:13,fontWeight:active?700:500,cursor:"pointer",
      transition:"all 0.2s",textAlign:"left"}}>
      <span style={{fontSize:16}}>{cat.emoji}</span>
      <span style={{flex:1}}>{cat.label}</span>
      <span style={{fontSize:11,opacity:0.5,background:"rgba(255,255,255,0.06)",
        borderRadius:20,padding:"2px 8px"}}>{count}</span>
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

  const showToast=m=>{setToast(m);setTimeout(()=>setToast(""),2500);};

  useEffect(()=>{
    (async()=>{
      let prompts=await fsGet("prompts");
      if(!prompts||!prompts.length){prompts=SEED;await fsSet("prompts",prompts);}
      setAllPrompts(prompts);
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
    if(!already)showToast("❤️ Saved to your profile!");
  };

  const handleAuthSuccess=async(user)=>{
    setCurrentUser(user);setShowAuth(false);
    setUserLikedIds(lsGet(`ptn_ul_${user.id}`)||[]);
    setUsersMap(await fsGet("users")||{});
    showToast(`✓ Welcome, ${user.name}!`);
  };

  const handleLogout=()=>{
    lsSet("ptn_session",null);setCurrentUser(null);setUserLikedIds([]);setPage("home");
    showToast("Logged out.");
  };

  const handleSubmit=async(formData)=>{
    const entry={id:`u_${Date.now()}`,...formData,approved:false,
      submittedBy:currentUser.id,submitterName:currentUser.name,createdAt:Date.now()};
    const updated=[...allPrompts,entry];
    setAllPrompts(updated);await fsSet("prompts",updated);
    setShowSubmit(false);showToast("✓ Submitted! Under review.");
  };

  const handleApprove=async(id)=>{
    const up=allPrompts.map(p=>p.id===id?{...p,approved:true}:p);
    setAllPrompts(up);await fsSet("prompts",up);showToast("✓ Approved!");
  };
  const handleDelete=async(id)=>{
    const up=allPrompts.filter(p=>p.id!==id);
    setAllPrompts(up);await fsSet("prompts",up);showToast("🗑 Deleted.");
  };

  const publicPrompts=allPrompts.filter(p=>p.approved);
  const catCount=id=>id==="all"?publicPrompts.length:publicPrompts.filter(p=>p.category===id).length;

  let list=publicPrompts.filter(p=>activeCat==="all"||p.category===activeCat);
  if(imgFilter !=="All"&&activeCat==="image") list=list.filter(p=>p.aiModel===imgFilter);
  if(arFilter  !=="All"&&activeCat==="image") list=list.filter(p=>p.aspectRatio===arFilter);
  if(packFilter!=="All"&&activeCat==="text")  list=list.filter(p=>p.subPack===packFilter);
  if(search){const q=search.toLowerCase();list=list.filter(p=>
    p.title.toLowerCase().includes(q)||p.prompt.toLowerCase().includes(q)||(p.tags||[]).some(t=>t.includes(q)));}
  if(sort==="likes")  list=[...list].sort((a,b)=>(likesMap[b.id]||0)-(likesMap[a.id]||0));
  if(sort==="recent") list=[...list].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#07071a",display:"flex",
      flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <style>{G}</style>
      <div style={{width:44,height:44,border:"3px solid rgba(167,139,250,0.2)",
        borderTop:"3px solid #a78bfa",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <p style={{color:"#3a3a5a",fontSize:14,fontFamily:"'Inter',sans-serif",letterSpacing:"0.05em"}}>
        Loading Promptonic...
      </p>
    </div>
  );

  return (
    <>
      <style>{G}</style>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

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
        <div style={{minHeight:"100vh",background:"#07071a"}}>
          {/* Fixed top glow */}
          <div style={{position:"fixed",top:-100,left:"50%",transform:"translateX(-50%)",
            width:600,height:400,borderRadius:"50%",pointerEvents:"none",zIndex:0,
            background:"radial-gradient(ellipse,rgba(109,40,217,0.12) 0%,transparent 70%)"}}/>

          {/* ── NAVBAR ── */}
          <nav style={{position:"sticky",top:0,zIndex:100,
            background:"rgba(7,7,26,0.85)",backdropFilter:"blur(20px)",
            borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{maxWidth:1200,margin:"0 auto",padding:"0 20px",
              height:60,display:"flex",alignItems:"center",gap:16}}>
              {/* Logo */}
              <h1 onClick={()=>setPage("home")} style={{fontFamily:"'Syne',sans-serif",
                fontSize:20,fontWeight:800,cursor:"pointer",flexShrink:0,
                background:"linear-gradient(135deg,#fff 30%,#a78bfa 100%)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                Promptonic
              </h1>
              {/* Search — grows */}
              <div style={{flex:1,position:"relative",maxWidth:480}}>
                <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",
                  fontSize:14,color:"#3a3a5a",pointerEvents:"none"}}>🔍</span>
                <input placeholder="Search prompts..." value={search}
                  onChange={e=>setSearch(e.target.value)}
                  style={{...iS,paddingLeft:38,borderRadius:20,fontSize:13,
                    height:38,background:"rgba(255,255,255,0.04)"}}/>
              </div>
              {/* Right actions */}
              <div style={{display:"flex",gap:8,alignItems:"center",marginLeft:"auto",flexShrink:0}}>
                {currentUser?(
                  <>
                    <button onClick={()=>setShowSubmit(s=>!s)}
                      style={{background:showSubmit?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#6d28d9,#a78bfa)",
                        border:showSubmit?"1px solid rgba(255,255,255,0.08)":"none",
                        borderRadius:10,padding:"8px 16px",color:"#fff",fontWeight:700,
                        fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>
                      {showSubmit?"✕ Cancel":"+ Submit"}
                    </button>
                    <button onClick={()=>setPage("profile")} style={{
                      background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
                      border:"none",borderRadius:10,width:36,height:36,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </button>
                  </>
                ):(
                  <button onClick={()=>setShowAuth(true)}
                    style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                      borderRadius:10,padding:"8px 18px",color:"#fff",fontWeight:700,
                      fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>
                    Login / Register
                  </button>
                )}
                <button onClick={()=>setShowAdminPw(s=>!s)}
                  style={{background:"transparent",border:"1px solid rgba(255,255,255,0.04)",
                    borderRadius:10,padding:"8px 10px",color:"rgba(255,255,255,0.1)",fontSize:14,cursor:"pointer"}}
                  title="Admin">🔐</button>
              </div>
            </div>
          </nav>

          {/* ── MAIN CONTENT ── */}
          <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 20px 80px",position:"relative",zIndex:1}}>

            {/* Admin pw */}
            {showAdminPw&&(
              <div style={{background:"#0d0d22",border:"1px solid rgba(167,139,250,0.15)",
                borderRadius:16,padding:16,marginBottom:20,maxWidth:380,
                display:"flex",flexDirection:"column",gap:10}}>
                <p style={{fontSize:12,color:"#a78bfa",fontWeight:700}}>🔐 Admin Login</p>
                <input type="password" placeholder="Password" value={adminPw}
                  onChange={e=>{setAdminPw(e.target.value);setAdminPwErr(false);}}
                  onKeyDown={e=>{if(e.key==="Enter"){if(adminPw===ADMIN_PASSWORD){setPage("admin");setShowAdminPw(false);setAdminPw("");}else setAdminPwErr(true);}}}
                  style={iS}/>
                {adminPwErr&&<p style={{fontSize:12,color:"#f87171"}}>❌ Wrong password</p>}
                <button onClick={()=>{if(adminPw===ADMIN_PASSWORD){setPage("admin");setShowAdminPw(false);setAdminPw("");}else setAdminPwErr(true);}}
                  style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",borderRadius:10,
                    padding:"11px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Enter →</button>
              </div>
            )}

            {/* Submit form */}
            {showSubmit&&currentUser&&(
              <SubmitForm user={currentUser} onSubmit={handleSubmit} onClose={()=>setShowSubmit(false)}/>
            )}

            {/* Layout: sidebar + main */}
            <div className="layout">

              {/* ── DESKTOP SIDEBAR ── */}
              <div className="sidebar">
                <p style={{fontSize:11,color:"#3a3a5a",fontWeight:700,letterSpacing:"0.08em",marginBottom:4,paddingLeft:4}}>
                  CATEGORIES
                </p>
                {CATS.map(cat=>(
                  <SidebarCatBtn key={cat.id} cat={cat} active={activeCat===cat.id}
                    count={catCount(cat.id)}
                    onClick={()=>{setActiveCat(cat.id);setImgFilter("All");setArFilter("All");setPackFilter("All");}}/>
                ))}
                <div style={{height:1,background:"rgba(255,255,255,0.05)",margin:"8px 0"}}/>
                {/* Sort */}
                <p style={{fontSize:11,color:"#3a3a5a",fontWeight:700,letterSpacing:"0.08em",marginBottom:4,paddingLeft:4}}>SORT BY</p>
                {[["recent","🆕 Recent"],["likes","❤️ Most Liked"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setSort(k)} style={{
                    display:"flex",alignItems:"center",gap:10,width:"100%",
                    background:sort===k?"rgba(167,139,250,0.1)":"transparent",
                    border:`1px solid ${sort===k?"rgba(167,139,250,0.3)":"rgba(255,255,255,0.04)"}`,
                    borderRadius:12,padding:"10px 14px",
                    color:sort===k?"#c4b5fd":"#6b7280",
                    fontSize:13,fontWeight:sort===k?700:500,cursor:"pointer",
                    transition:"all 0.2s",textAlign:"left"}}>
                    {l}
                  </button>
                ))}
                {/* Login prompt */}
                {!currentUser&&(
                  <>
                    <div style={{height:1,background:"rgba(255,255,255,0.05)",margin:"8px 0"}}/>
                    <div onClick={()=>setShowAuth(true)} style={{
                      background:"rgba(109,40,217,0.08)",border:"1px solid rgba(167,139,250,0.15)",
                      borderRadius:14,padding:16,cursor:"pointer"}}>
                      <p style={{fontSize:12,color:"#c4b5fd",fontWeight:700,marginBottom:6}}>Join Promptonic</p>
                      <p style={{fontSize:11,color:"#4a4a6a",lineHeight:1.6,marginBottom:10}}>
                        Like, comment & submit prompts
                      </p>
                      <button style={{background:"linear-gradient(135deg,#6d28d9,#a78bfa)",border:"none",
                        borderRadius:8,padding:"8px 14px",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",width:"100%"}}>
                        Login / Register →
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* ── MAIN CONTENT ── */}
              <div className="main-content">
                {/* Mobile: category row */}
                <div className="cat-row no-scroll" style={{marginBottom:12}}>
                  {CATS.map(cat=>{
                    const active=activeCat===cat.id;
                    return (
                      <button key={cat.id} onClick={()=>{setActiveCat(cat.id);setImgFilter("All");setArFilter("All");setPackFilter("All");}}
                        style={{background:active?`${cat.color}18`:"rgba(255,255,255,0.03)",
                          border:`1px solid ${active?cat.color+"55":"rgba(255,255,255,0.06)"}`,
                          color:active?cat.color:"#6b7280",borderRadius:20,
                          padding:"7px 14px",fontSize:12,fontWeight:600,
                          whiteSpace:"nowrap",cursor:"pointer",flexShrink:0}}>
                        {cat.emoji} {cat.label} <span style={{opacity:0.5}}>({catCount(cat.id)})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile: sort */}
                <div style={{display:"flex",gap:8,marginBottom:14}} className="no-scroll">
                  {[["recent","🆕 Recent"],["likes","❤️ Most Liked"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setSort(k)} style={{
                      background:sort===k?"rgba(167,139,250,0.12)":"transparent",
                      border:`1px solid ${sort===k?"rgba(167,139,250,0.35)":"rgba(255,255,255,0.06)"}`,
                      color:sort===k?"#c4b5fd":"#6b7280",borderRadius:20,
                      padding:"6px 14px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                      {l}
                    </button>
                  ))}
                </div>

                {/* Sub-filters: Image */}
                {activeCat==="image"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                    <div className="filter-strip">
                      <span style={{fontSize:10,color:"#3a3a5a",alignSelf:"center",marginRight:4,whiteSpace:"nowrap",fontWeight:700}}>MODEL</span>
                      {IMG_MODELS.map(m=>(
                        <button key={m} onClick={()=>setImgFilter(m)} style={{
                          background:imgFilter===m?"rgba(129,140,248,0.12)":"transparent",
                          border:`1px solid ${imgFilter===m?"rgba(129,140,248,0.4)":"rgba(255,255,255,0.06)"}`,
                          color:imgFilter===m?"#818cf8":"#6b7280",borderRadius:20,
                          padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{m}</button>
                      ))}
                    </div>
                    <div className="filter-strip">
                      <span style={{fontSize:10,color:"#3a3a5a",alignSelf:"center",marginRight:4,whiteSpace:"nowrap",fontWeight:700}}>RATIO</span>
                      {ASPECT_RATIOS.map(r=>(
                        <button key={r} onClick={()=>setArFilter(r)} style={{
                          background:arFilter===r?"rgba(52,211,153,0.12)":"transparent",
                          border:`1px solid ${arFilter===r?"rgba(52,211,153,0.4)":"rgba(255,255,255,0.06)"}`,
                          color:arFilter===r?"#34d399":"#6b7280",borderRadius:20,
                          padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{r}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-filters: Text */}
                {activeCat==="text"&&(
                  <div className="filter-strip" style={{marginBottom:14}}>
                    <span style={{fontSize:10,color:"#3a3a5a",alignSelf:"center",marginRight:4,whiteSpace:"nowrap",fontWeight:700}}>PACK</span>
                    {WRITING_PACKS.map(pk=>(
                      <button key={pk} onClick={()=>setPackFilter(pk)} style={{
                        background:packFilter===pk?"rgba(52,211,153,0.12)":"transparent",
                        border:`1px solid ${packFilter===pk?"rgba(52,211,153,0.4)":"rgba(255,255,255,0.06)"}`,
                        color:packFilter===pk?"#34d399":"#6b7280",borderRadius:20,
                        padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{pk}</button>
                    ))}
                  </div>
                )}

                {/* Count */}
                <p style={{fontSize:11,color:"#2a2a45",marginBottom:16,fontWeight:500}}>
                  {list.length} prompt{list.length!==1?"s":""}
                  {search&&<span style={{color:"#4a4a6a"}}> for "{search}"</span>}
                </p>

                {/* Login banner (mobile only) */}
                {!currentUser&&(
                  <div onClick={()=>setShowAuth(true)} style={{
                    background:"rgba(109,40,217,0.06)",border:"1px solid rgba(167,139,250,0.12)",
                    borderRadius:14,padding:"12px 16px",marginBottom:16,cursor:"pointer",
                    display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <p style={{fontSize:12,color:"#6b7280"}}>
                      ❤️ Like · 💬 Comment · 📂 Submit —{" "}
                      <span style={{color:"#a78bfa",fontWeight:700}}>login to join</span>
                    </p>
                    <span style={{color:"#a78bfa",fontSize:12,fontWeight:700,marginLeft:8,flexShrink:0}}>→</span>
                  </div>
                )}

                {/* Cards grid */}
                {list.length===0?(
                  <div style={{textAlign:"center",padding:"80px 20px",color:"#2a2a45"}}>
                    <div style={{fontSize:52,marginBottom:16,animation:"float 3s ease-in-out infinite"}}>🔮</div>
                    <p style={{fontSize:15,lineHeight:1.7}}>
                      {search?`No results for "${search}"`:"No prompts here yet."}
                    </p>
                  </div>
                ):(
                  <div className="card-grid">
                    {list.map(p=>(
                      <Card key={p.id} p={p}
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
