export const G = `
  *{box-sizing:border-box;margin:0;padding:0;}

  /* ── Fix 1: Prevent horizontal clipping in desktop mode on mobile browsers ── */
  html{
    scroll-behavior:smooth;
    overflow-x:hidden;    /* no horizontal scroll at root */
    width:100%;
  }
  body{
    background:#0a0a0f;color:#e2e8f0;font-family:'Inter',sans-serif;line-height:1.5;
    overflow-x:hidden;    /* no horizontal scroll on body */
    width:100%;
    min-width:0;          /* allow body to shrink below content width */
  }

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

  .page-enter{animation:fadeUp 0.25s ease both;}

  .card{transition:transform 0.2s ease,border-color 0.2s ease,box-shadow 0.2s ease !important;}
  .card:hover{border-color:rgba(167,139,250,0.25)!important;transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.5)!important;}
  .copy-btn:hover{background:rgba(109,40,217,1)!important;transform:scale(1.02);}
  .like-btn:hover{border-color:rgba(244,114,182,0.5)!important;}

  .skeleton{background:linear-gradient(90deg,#0f0f1a 25%,#1a1a2e 50%,#0f0f1a 75%);background-size:400px 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:8px;}

  .no-scroll{scrollbar-width:none;-ms-overflow-style:none;}
  .no-scroll::-webkit-scrollbar{display:none;}

  /* ── Responsive card grid ── */
  .prompt-grid{display:grid;grid-template-columns:1fr;gap:16px;width:100%;min-width:0;}
  @media(min-width:600px){.prompt-grid{grid-template-columns:1fr 1fr;gap:20px;}}
  @media(min-width:1000px){.prompt-grid{grid-template-columns:1fr 1fr 1fr;gap:24px;}}

  /* ── Page container: fluid width, no forced max causing clipping ── */
  .page-wrap{
    width:100%;
    max-width:1200px;
    margin:0 auto;
    padding:0 clamp(12px,3vw,24px);   /* fluid side padding */
    min-width:0;
  }

  /* ── Sidebar layout ── */
  .sidebar-layout{display:block;width:100%;min-width:0;}
  @media(min-width:900px){
    .sidebar-layout{
      display:grid;
      grid-template-columns:200px minmax(0,1fr);  /* minmax(0,1fr) prevents overflow */
      gap:28px;
      align-items:start;
    }
  }
  .sidebar{display:none;}
  @media(min-width:900px){.sidebar{display:flex;flex-direction:column;gap:6px;position:sticky;top:80px;}}

  /* Mobile category pills */
  .mobile-cats{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:16px;width:100%;}
  @media(min-width:900px){.mobile-cats{display:none;}}

  /* ── Fluid hero text ── */
  .hero-title{font-size:clamp(24px,4.5vw,52px);}
  .hero-sub{font-size:clamp(13px,1.4vw,16px);}

  /* ── Fix 2: Search — only ONE control visible at a time ──
     On mobile (≤640px):
       - nav inline search is always hidden
       - search icon button is shown
       - when open: mobile bar slides in, icon becomes ✕
     On desktop (>640px):
       - nav inline search is always shown
       - search icon button is always hidden
       - mobile bar is never shown
  ── */
  .nav-search-wrap{flex:1;max-width:440px;position:relative;min-width:0;}
  @media(max-width:640px){.nav-search-wrap{display:none !important;}}  /* never show inline on mobile */

  .mobile-search-bar{
    display:none;
    padding:8px 16px 10px;
    background:rgba(10,10,15,0.97);
    border-bottom:1px solid rgba(255,255,255,0.05);
  }
  @media(max-width:640px){.mobile-search-bar.open{display:block;}}     /* only on mobile */

  .search-icon-btn{display:none;}
  @media(max-width:640px){.search-icon-btn{display:flex;}}             /* only on mobile */

  /* Nav */
  .nav-inner{
    display:flex;
    align-items:center;
    gap:12px;
    height:60px;
    width:100%;
    min-width:0;
  }
  .nav-logo{flex-shrink:0;display:flex;align-items:center;gap:8px;}
  .nav-actions{display:flex;gap:8px;margin-left:auto;flex-shrink:0;align-items:center;}

  @media(min-width:768px){.desktop-nav-links{display:flex !important;}}

  img{transition:opacity 0.3s ease;max-width:100%;}
  button:active{transform:scale(0.97);}
  .follow-btn{transition:all 0.2s ease;}
  .follow-btn:hover{transform:scale(1.03);}
`;

export const inp = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: "11px 14px",
  color: "#e2e8f0",
  fontSize: 14,
  width: "100%",
  outline: "none",
};
