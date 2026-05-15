export const G = `
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

  .page-enter{animation:fadeUp 0.25s ease both;}

  .card{transition:transform 0.2s ease,border-color 0.2s ease,box-shadow 0.2s ease !important;}
  .card:hover{border-color:rgba(167,139,250,0.25)!important;transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.5)!important;}
  .copy-btn:hover{background:rgba(109,40,217,1)!important;transform:scale(1.02);}
  .like-btn:hover{border-color:rgba(244,114,182,0.5)!important;}

  .skeleton{background:linear-gradient(90deg,#0f0f1a 25%,#1a1a2e 50%,#0f0f1a 75%);background-size:400px 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:8px;}

  .no-scroll{scrollbar-width:none;-ms-overflow-style:none;}
  .no-scroll::-webkit-scrollbar{display:none;}

  .prompt-grid{display:grid;grid-template-columns:1fr;gap:16px;}
  @media(min-width:700px){.prompt-grid{grid-template-columns:1fr 1fr;gap:20px;}}
  @media(min-width:1100px){.prompt-grid{grid-template-columns:1fr 1fr 1fr;gap:24px;}}

  .page-wrap{max-width:1200px;margin:0 auto;padding:0 20px;}
  .sidebar-layout{display:block;}
  @media(min-width:960px){.sidebar-layout{display:grid;grid-template-columns:220px 1fr;gap:32px;align-items:start;}}
  .sidebar{display:none;}
  @media(min-width:960px){.sidebar{display:flex;flex-direction:column;gap:6px;position:sticky;top:80px;}}
  .mobile-cats{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:16px;}
  @media(min-width:960px){.mobile-cats{display:none;}}

  .hero-title{font-size:clamp(28px,5vw,52px);}
  .hero-sub{font-size:clamp(13px,1.5vw,16px);}

  .nav-search-wrap{flex:1;max-width:440px;position:relative;}
  @media(max-width:640px){.nav-search-wrap{display:none;}}
  .nav-search-wrap.open{display:block !important;}
  .mobile-search-bar{display:none;padding:8px 16px 10px;background:rgba(10,10,15,0.97);border-bottom:1px solid rgba(255,255,255,0.05);}
  @media(max-width:640px){.mobile-search-bar.open{display:block;}}
  .search-icon-btn{display:none;}
  @media(max-width:640px){.search-icon-btn{display:flex;}}

  @media(min-width:768px){.desktop-nav-links{display:flex !important;}}

  img{transition:opacity 0.3s ease;}
  button:active{transform:scale(0.97);}
  .faq-item{border-bottom:1px solid rgba(255,255,255,0.05);}
  .faq-item:last-child{border-bottom:none;}
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
