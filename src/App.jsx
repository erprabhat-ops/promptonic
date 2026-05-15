import { useState, useEffect } from "react";

/* ─── LIB ─── */
import { fsGet, fsSet }                              from "./lib/firebase.js";
import { lsGet, lsSet }                              from "./lib/storage.js";
import { sha256, checkLockout, recordAttempt,
         setAdminSession, clearAdminSession,
         MAX_ATTEMPTS }                              from "./lib/security.js";

/* ─── CONSTANTS ─── */
import { CATS, IMG_MODELS, ASPECT_RATIOS,
         WRITING_PACKS }                             from "./constants/index.js";
import { SEED }                                      from "./constants/seed.js";
import { G, inp }                                    from "./constants/styles.js";

/* ─── COMPONENTS ─── */
import Toast            from "./components/Toast.jsx";
import SideBtn          from "./components/SideBtn.jsx";
import SkeletonCard     from "./components/SkeletonCard.jsx";
import ScrollTop        from "./components/ScrollTop.jsx";
import TrendingSection  from "./components/TrendingSection.jsx";
import PromptCard       from "./components/PromptCard.jsx";
import Footer           from "./components/Footer.jsx";

/* ─── PAGES ─── */
import AuthModal        from "./pages/AuthModal.jsx";
import SubmitForm       from "./pages/SubmitForm.jsx";
import ProfilePage      from "./pages/ProfilePage.jsx";
import AdminPanel       from "./pages/AdminPanel.jsx";
import LeaderboardPage  from "./pages/LeaderboardPage.jsx";
import CreatorPage      from "./pages/CreatorPage.jsx";
import AboutPage        from "./pages/AboutPage.jsx";
import HelpPage         from "./pages/HelpPage.jsx";

/* ─── MAIN APP ─── */
export default function App() {
  /* ── Shared data ── */
  const [allPrompts,   setAllPrompts]   = useState([]);
  const [likesMap,     setLikesMap]     = useState({});
  const [usersMap,     setUsersMap]     = useState({});

  /* ── Per-user private ── */
  const [currentUser,  setCurrentUser]  = useState(null);
  const [userLikedIds, setUserLikedIds] = useState([]);

  /* ── Navigation ── */
  const [page,         setPage]         = useState("home");
  const [creatorId,    setCreatorId]    = useState(null);

  /* ── UI overlays ── */
  const [showAuth,     setShowAuth]     = useState(false);
  const [showSubmit,   setShowSubmit]   = useState(false);
  const [showSearch,   setShowSearch]   = useState(false);
  const [showAdminPw,  setShowAdminPw]  = useState(false);
  const [adminPw,      setAdminPw]      = useState("");
  const [adminPwErr,   setAdminPwErr]   = useState("");
  const [adminBusy,    setAdminBusy]    = useState(false);

  /* ── Filters ── */
  const [activeCat,    setActiveCat]    = useState("all");
  const [sort,         setSort]         = useState("recent");
  const [search,       setSearch]       = useState("");
  const [imgFilter,    setImgFilter]    = useState("All");
  const [arFilter,     setArFilter]     = useState("All");
  const [packFilter,   setPackFilter]   = useState("All");

  /* ── State ── */
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState("");

  const showToast = m => { setToast(m); setTimeout(() => setToast(""), 2400); };

  /* ── Secure admin login ── */
  const handleAdminLogin = async () => {
    if (!adminPw) { setAdminPwErr("Password daalo"); return; }
    setAdminBusy(true); setAdminPwErr("");
    const lock = checkLockout("ptn_admin_lk");
    if (lock.locked) { setAdminPwErr(`${lock.mins} min baad try karo.`); setAdminBusy(false); return; }
    const inputHash  = await sha256(adminPw);
    const storedHash = await fsGet("adminHash");
    if (!storedHash) {
      setAdminPwErr("Admin setup nahi hua. Firebase console mein adminHash set karo.");
      setAdminBusy(false); return;
    }
    if (inputHash === storedHash) {
      recordAttempt("ptn_admin_lk", true);
      setAdminSession();
      setPage("admin"); setShowAdminPw(false); setAdminPw(""); setAdminBusy(false);
    } else {
      recordAttempt("ptn_admin_lk", false);
      const lock2 = checkLockout("ptn_admin_lk");
      setAdminPwErr(lock2.locked
        ? `Bahut zyada attempts! ${lock2.mins} min ke liye locked.`
        : `Galat password. ${MAX_ATTEMPTS - lock2.attempts} tries bachi hain.`);
      setAdminBusy(false);
    }
  };

  /* ── Bootstrap ── */
  useEffect(() => {
    (async () => {
      try {
        let prompts = await fsGet("prompts");
        if (!prompts || !prompts.length) { prompts = SEED; await fsSet("prompts", prompts); }
        setAllPrompts(prompts);
        setLikesMap(await fsGet("likes") || {});
        const um = await fsGet("users") || {};
        setUsersMap(um);
        /* Merge custom categories */
        const cc2 = await fsGet("customCats") || [];
        if (cc2.length > 0) {
          const existIds = new Set(CATS.map(c => c.id));
          cc2.filter(c => !existIds.has(c.id)).forEach(c => CATS.push(c));
        }
        /* Restore session */
        const sess = lsGet("ptn_session");
        if (sess?.userId && um[sess.userId]) {
          setCurrentUser(um[sess.userId]);
          setUserLikedIds(lsGet(`ptn_ul_${sess.userId}`) || []);
        }
      } catch (err) {
        console.error("Promptonic load error:", err);
        setAllPrompts(SEED);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Handlers ── */
  const handleLike = async (promptId) => {
    if (!currentUser) { setShowAuth(true); return; }
    const already = userLikedIds.includes(promptId);
    const newUL   = already ? userLikedIds.filter(x => x !== promptId) : [...userLikedIds, promptId];
    const newLM   = { ...likesMap, [promptId]: Math.max(0, (likesMap[promptId] || 0) + (already ? -1 : 1)) };
    setUserLikedIds(newUL); setLikesMap(newLM);
    lsSet(`ptn_ul_${currentUser.id}`, newUL);
    await fsSet("likes", newLM);
    if (!already) showToast("❤️ Saved!");
  };

  const handleAuthSuccess = async (user) => {
    setCurrentUser(user); setShowAuth(false);
    setUserLikedIds(lsGet(`ptn_ul_${user.id}`) || []);
    setUsersMap(await fsGet("users") || {});
    showToast(`✓ Welcome, ${user.name}!`);
  };

  const handleLogout = () => {
    lsSet("ptn_session", null);
    setCurrentUser(null); setUserLikedIds([]); setPage("home");
    showToast("Signed out.");
  };

  const handleSubmit = async (fd) => {
    const entry = { id:`u_${Date.now()}`, ...fd, approved:false,
      submittedBy:currentUser.id, submitterName:currentUser.name, createdAt:Date.now() };
    const up = [...allPrompts, entry];
    setAllPrompts(up); await fsSet("prompts", up);
    setShowSubmit(false); showToast("✓ Submitted for review!");
  };

  const handleApprove = async (id) => {
    const up = allPrompts.map(p => p.id === id ? { ...p, approved:true } : p);
    setAllPrompts(up); await fsSet("prompts", up); showToast("✓ Approved!");
  };

  const handleDelete = async (id) => {
    const up = allPrompts.filter(p => p.id !== id);
    setAllPrompts(up); await fsSet("prompts", up); showToast("🗑 Deleted.");
  };

  const goToCreator = (id) => { setCreatorId(id); setPage("creator"); };
  const resetCats   = () => { setImgFilter("All"); setArFilter("All"); setPackFilter("All"); };

  /* ── Derived lists ── */
  const pub      = allPrompts.filter(p => p.approved);
  const catCount = id => id === "all" ? pub.length : pub.filter(p => p.category === id).length;

  let list = pub.filter(p => activeCat === "all" || p.category === activeCat);
  if (imgFilter  !== "All" && activeCat === "image") list = list.filter(p => p.aiModel     === imgFilter);
  if (arFilter   !== "All" && activeCat === "image") list = list.filter(p => p.aspectRatio === arFilter);
  if (packFilter !== "All" && activeCat === "text")  list = list.filter(p => p.subPack     === packFilter);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.includes(q)));
  }
  if (sort === "likes")  list = [...list].sort((a, b) => (likesMap[b.id]||0) - (likesMap[a.id]||0));
  if (sort === "recent") list = [...list].sort((a, b) => (b.createdAt||0) - (a.createdAt||0));

  /* ── Footer navigate ── */
  const handleFooterNav = (p) => {
    if (p === "leaderboard") setPage("leaderboard");
    else if (p === "about")  setPage("about");
    else if (p === "help")   setPage("help");
    else if (p === "cat-image") { setActiveCat("image"); window.scrollTo({top:400,behavior:"smooth"}); }
    else if (p === "cat-video") { setActiveCat("video"); window.scrollTo({top:400,behavior:"smooth"}); }
    else if (p === "cat-text")  { setActiveCat("text");  window.scrollTo({top:400,behavior:"smooth"}); }
  };

  /* ── Loading screen ── */
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
      <style>{G}</style>
      <div style={{ width:40, height:40, border:"3px solid rgba(167,139,250,0.15)",
        borderTop:"3px solid #a78bfa", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ color:"#3a3a5a", fontSize:14, letterSpacing:"0.06em" }}>Loading Promptonic...</p>
    </div>
  );

  return (
    <>
      <style>{G}</style>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Grotesk:wght@600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── GLOBAL MODALS ── */}
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} showToast={showToast} />
      )}

      {/* ── NON-HOME PAGES ── */}
      {page === "about" && <AboutPage onBack={() => setPage("home")} />}
      {page === "help"  && <HelpPage  onBack={() => setPage("home")} />}

      {page === "admin" && (
        <AdminPanel allPrompts={allPrompts} usersMap={usersMap} likesMap={likesMap}
          onApprove={handleApprove} onDelete={handleDelete}
          onLogout={() => { clearAdminSession(); setPage("home"); setAdminPw(""); }} />
      )}

      {page === "leaderboard" && (
        <LeaderboardPage allPrompts={allPrompts} usersMap={usersMap} likesMap={likesMap}
          onBack={() => setPage("home")} onViewCreator={goToCreator} />
      )}

      {page === "creator" && creatorId && (
        <CreatorPage creatorId={creatorId} allPrompts={allPrompts}
          likesMap={likesMap} usersMap={usersMap} currentUser={currentUser}
          onBack={() => setPage("home")}
          onLoginRequired={() => setShowAuth(true)} showToast={showToast} />
      )}

      {page === "profile" && currentUser && (
        <ProfilePage user={currentUser} allPrompts={allPrompts}
          userLikedIds={userLikedIds} onLogout={handleLogout}
          onBack={() => setPage("home")} onViewCreator={goToCreator} />
      )}

      {/* ── Footer on static pages ── */}
      {(page === "about" || page === "help") && <Footer onNavigate={handleFooterNav} />}

      {/* ── HOME ── */}
      {page === "home" && (
        <div style={{ minHeight:"100vh", background:"#0a0a0f" }}>

          {/* NAV */}
          <nav style={{ position:"sticky", top:0, zIndex:100,
            background:"rgba(10,10,15,0.92)", backdropFilter:"blur(20px)",
            borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <div className="page-wrap" style={{ display:"flex", alignItems:"center", gap:12, height:60, minWidth:0 }}>
              {/* Logo */}
              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                <div style={{ width:28, height:28, background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
                  borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800,
                  background:"linear-gradient(135deg,#fff 30%,#a78bfa)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Promptonic</span>
              </div>

              {/* Search — desktop always visible, mobile always hidden */}
              <div className="nav-search-wrap">
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                  fontSize:14, color:"#3a3a5a", pointerEvents:"none" }}>🔍</span>
                <input placeholder="Search prompts..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ ...inp, paddingLeft:36, borderRadius:24, height:38, fontSize:13 }} />
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:8, marginLeft:"auto", flexShrink:0, alignItems:"center" }}>
                {/* Desktop nav links */}
                <div style={{ display:"none" }} className="desktop-nav-links">
                  <button onClick={() => setPage("about")} style={{ background:"none", border:"none",
                    color:"#6b7280", fontSize:13, cursor:"pointer", padding:"0 8px" }}>About</button>
                  <button onClick={() => setPage("help")}  style={{ background:"none", border:"none",
                    color:"#6b7280", fontSize:13, cursor:"pointer", padding:"0 8px" }}>Help</button>
                </div>
                {/* Search icon — mobile only. Shows 🔍 when closed, ✕ when open */}
                <button className="search-icon-btn"
                  onClick={() => { setShowSearch(s => !s); if (showSearch) setSearch(""); }}
                  style={{ width:36, height:36,
                    background: showSearch ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${showSearch ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius:10, alignItems:"center", justifyContent:"center",
                    color: showSearch ? "#a78bfa" : "#94a3b8",
                    fontSize: showSearch ? 16 : 17, cursor:"pointer",
                    fontWeight: showSearch ? 700 : 400,
                  }}>
                  {showSearch ? "✕" : "🔍"}
                </button>

                {currentUser ? (
                  <>
                    <button onClick={() => setPage("leaderboard")}
                      style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)",
                        borderRadius:10, padding:"7px 12px", color:"#6b7280", fontSize:13, cursor:"pointer",
                        display:"flex", alignItems:"center", gap:5 }}>🏆</button>
                    <button onClick={() => setShowSubmit(s => !s)}
                      style={{ background:showSubmit?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#6d28d9,#a78bfa)",
                        border:showSubmit?"1px solid rgba(255,255,255,0.07)":"none",
                        borderRadius:10, padding:"7px 16px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                      {showSubmit ? "✕" : "+ Submit"}
                    </button>
                    <button onClick={() => setPage("profile")}
                      style={{ width:34, height:34, borderRadius:10, flexShrink:0,
                        background:"linear-gradient(135deg,#6d28d9,#a78bfa)", border:"none",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer" }}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setShowAuth(true)}
                    style={{ background:"rgba(109,40,217,0.15)", border:"1px solid rgba(167,139,250,0.3)",
                      borderRadius:10, padding:"7px 18px", color:"#a78bfa", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                    Sign In →
                  </button>
                )}
                <button onClick={() => setShowAdminPw(s => !s)}
                  style={{ background:"transparent", border:"none",
                    color:"rgba(255,255,255,0.06)", fontSize:14, cursor:"pointer", padding:"4px" }}>🔐</button>
              </div>
            </div>
          </nav>

          {/* Mobile search bar */}
          <div className={`mobile-search-bar${showSearch ? " open" : ""}`}>
            <div style={{ position:"relative", maxWidth:"100%" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                fontSize:14, color:"#4a4a6a", pointerEvents:"none" }}>🔍</span>
              <input autoFocus={showSearch} placeholder="Search prompts..."
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Escape" && setShowSearch(false)}
                style={{ ...inp, paddingLeft:38, paddingRight:40, borderRadius:24, height:42, fontSize:14, width:"100%" }} />
              {search && (
                <button onClick={() => setSearch("")}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", color:"#6b7280", cursor:"pointer", fontSize:16 }}>✕</button>
              )}
            </div>
          </div>

          {/* HERO */}
          <div style={{ textAlign:"center", padding:"48px 20px 40px",
            background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(109,40,217,0.12),transparent)" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8,
              background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.15)",
              borderRadius:20, padding:"5px 14px", marginBottom:20 }}>
              <span style={{ fontSize:13 }}>⚡</span>
              <span style={{ fontSize:12, color:"#a78bfa", fontWeight:600 }}>Curated AI prompts for every use case</span>
            </div>
            <h1 className="hero-title" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
              color:"#f1f5f9", lineHeight:1.35, marginBottom:12, letterSpacing:"0.06em" }}>
              The best prompts,{" "}
              <span style={{ background:"linear-gradient(135deg,#a78bfa,#818cf8)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                all in one place
              </span>
            </h1>
            <p className="hero-sub" style={{ color:"#64748b", maxWidth:480, margin:"0 auto 28px", lineHeight:1.7 }}>
              Discover, copy, and share powerful AI prompts for image generation, video, writing, and more.
            </p>
            {!currentUser && (
              <button onClick={() => setShowAuth(true)}
                style={{ background:"linear-gradient(135deg,#6d28d9,#a78bfa)", border:"none",
                  borderRadius:12, padding:"12px 28px", color:"#fff", fontWeight:700, fontSize:14,
                  cursor:"pointer", boxShadow:"0 8px 24px rgba(109,40,217,0.35)" }}>
                Sign In to save &amp; submit prompts
              </button>
            )}
          </div>

          {/* MAIN */}
          <div className="page-wrap" style={{ paddingBottom:80 }}>

            {/* Admin login box */}
            {showAdminPw && (
              <div style={{ background:"#0f0f1a", border:"1px solid rgba(167,139,250,0.12)",
                borderRadius:14, padding:16, marginBottom:20, maxWidth:380,
                display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:16 }}>🔐</span>
                  <p style={{ fontSize:12, color:"#a78bfa", fontWeight:700, letterSpacing:"0.05em" }}>ADMIN LOGIN</p>
                  <span style={{ marginLeft:"auto", fontSize:10, color:"#2a2a3a",
                    background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"2px 8px" }}>
                    {MAX_ATTEMPTS} attempts max
                  </span>
                </div>
                <input type="password" placeholder="Admin password" value={adminPw}
                  onChange={e => { setAdminPw(e.target.value); setAdminPwErr(""); }}
                  onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                  disabled={adminBusy}
                  style={{ ...inp, border:adminPwErr?"1px solid rgba(239,68,68,0.4)":inp.border }} />
                {adminPwErr && <p style={{ fontSize:12, color:"#f87171" }}>⚠️ {adminPwErr}</p>}
                <button onClick={handleAdminLogin} disabled={adminBusy || !adminPw}
                  style={{ background:"linear-gradient(135deg,#6d28d9,#a78bfa)", border:"none",
                    borderRadius:10, padding:"11px", color:"#fff", fontWeight:700, fontSize:13,
                    cursor:"pointer", opacity:(adminBusy||!adminPw)?0.6:1 }}>
                  {adminBusy ? "Verifying..." : "Enter Admin Panel →"}
                </button>
              </div>
            )}

            {/* Submit form */}
            {showSubmit && currentUser && (
              <SubmitForm user={currentUser} onSubmit={handleSubmit} onClose={() => setShowSubmit(false)} />
            )}

            {/* Sidebar layout */}
            <div className="sidebar-layout">

              {/* DESKTOP SIDEBAR */}
              <div className="sidebar">
                <p style={{ fontSize:10, fontWeight:700, color:"#3a3a5a", letterSpacing:"0.1em",
                  marginBottom:8, paddingLeft:4 }}>CATEGORIES</p>
                {CATS.map(cat => (
                  <SideBtn key={cat.id} cat={cat} active={activeCat === cat.id}
                    count={catCount(cat.id)}
                    onClick={() => { setActiveCat(cat.id); resetCats(); }} />
                ))}
                <div style={{ height:1, background:"rgba(255,255,255,0.04)", margin:"12px 0" }} />
                <p style={{ fontSize:10, fontWeight:700, color:"#3a3a5a", letterSpacing:"0.1em",
                  marginBottom:8, paddingLeft:4 }}>SORT</p>
                {[["recent","🆕 Recent"],["likes","❤️ Most Liked"]].map(([k, l]) => (
                  <button key={k} onClick={() => setSort(k)} style={{
                    display:"flex", alignItems:"center", gap:10, width:"100%",
                    background:sort===k?"rgba(167,139,250,0.08)":"transparent",
                    border:`1px solid ${sort===k?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.04)"}`,
                    borderRadius:10, padding:"10px 14px",
                    color:sort===k?"#c4b5fd":"#6b7280", fontSize:13, fontWeight:sort===k?700:400,
                    cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                    {l}
                  </button>
                ))}
                {!currentUser && (
                  <>
                    <div style={{ height:1, background:"rgba(255,255,255,0.04)", margin:"12px 0" }} />
                    <div onClick={() => setShowAuth(true)}
                      style={{ background:"rgba(109,40,217,0.06)", border:"1px solid rgba(167,139,250,0.12)",
                        borderRadius:14, padding:16, cursor:"pointer" }}>
                      <p style={{ fontSize:13, color:"#c4b5fd", fontWeight:700, marginBottom:6 }}>Join Promptonic</p>
                      <p style={{ fontSize:12, color:"#4a4a6a", lineHeight:1.6, marginBottom:12 }}>
                        Like, comment &amp; submit your own prompts
                      </p>
                      <button style={{ background:"linear-gradient(135deg,#6d28d9,#a78bfa)", border:"none",
                        borderRadius:8, padding:"8px 14px", color:"#fff", fontWeight:700, fontSize:12,
                        cursor:"pointer", width:"100%" }}>Sign In →</button>
                    </div>
                  </>
                )}
              </div>

              {/* MAIN CONTENT */}
              <div>
                {/* Mobile cats */}
                <div className="mobile-cats no-scroll">
                  {CATS.map(cat => {
                    const active = activeCat === cat.id;
                    return (
                      <button key={cat.id} onClick={() => { setActiveCat(cat.id); resetCats(); }}
                        style={{ background:active?`${cat.color}15`:"rgba(255,255,255,0.03)",
                          border:`1px solid ${active?cat.color+"40":"rgba(255,255,255,0.06)"}`,
                          color:active?cat.color:"#6b7280", borderRadius:20,
                          padding:"7px 14px", fontSize:12, fontWeight:active?700:400,
                          whiteSpace:"nowrap", cursor:"pointer", flexShrink:0 }}>
                        {cat.emoji} {cat.label} <span style={{ opacity:0.5 }}>({catCount(cat.id)})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile sort */}
                <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                  {[["recent","🆕 Recent"],["likes","❤️ Most Liked"]].map(([k, l]) => (
                    <button key={k} onClick={() => setSort(k)} style={{
                      background:sort===k?"rgba(167,139,250,0.1)":"transparent",
                      border:`1px solid ${sort===k?"rgba(167,139,250,0.3)":"rgba(255,255,255,0.06)"}`,
                      color:sort===k?"#c4b5fd":"#6b7280", borderRadius:20,
                      padding:"6px 14px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                      {l}
                    </button>
                  ))}
                </div>

                {/* Image sub-filters */}
                {activeCat === "image" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                    <div className="no-scroll" style={{ display:"flex", gap:6, overflowX:"auto" }}>
                      <span style={{ fontSize:10, fontWeight:700, color:"#3a3a5a", alignSelf:"center",
                        marginRight:4, whiteSpace:"nowrap", letterSpacing:"0.06em" }}>MODEL</span>
                      {IMG_MODELS.map(m => (
                        <button key={m} onClick={() => setImgFilter(m)} style={{
                          background:imgFilter===m?"rgba(129,140,248,0.1)":"transparent",
                          border:`1px solid ${imgFilter===m?"rgba(129,140,248,0.35)":"rgba(255,255,255,0.06)"}`,
                          color:imgFilter===m?"#818cf8":"#6b7280", borderRadius:20,
                          padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer",
                          whiteSpace:"nowrap", flexShrink:0 }}>{m}</button>
                      ))}
                    </div>
                    <div className="no-scroll" style={{ display:"flex", gap:6, overflowX:"auto" }}>
                      <span style={{ fontSize:10, fontWeight:700, color:"#3a3a5a", alignSelf:"center",
                        marginRight:4, whiteSpace:"nowrap", letterSpacing:"0.06em" }}>RATIO</span>
                      {ASPECT_RATIOS.map(r => (
                        <button key={r} onClick={() => setArFilter(r)} style={{
                          background:arFilter===r?"rgba(52,211,153,0.1)":"transparent",
                          border:`1px solid ${arFilter===r?"rgba(52,211,153,0.35)":"rgba(255,255,255,0.06)"}`,
                          color:arFilter===r?"#34d399":"#6b7280", borderRadius:20,
                          padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer",
                          whiteSpace:"nowrap", flexShrink:0 }}>{r}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Writing sub-filters */}
                {activeCat === "text" && (
                  <div className="no-scroll" style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:16 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:"#3a3a5a", alignSelf:"center",
                      marginRight:4, whiteSpace:"nowrap", letterSpacing:"0.06em" }}>PACK</span>
                    {WRITING_PACKS.map(pk => (
                      <button key={pk} onClick={() => setPackFilter(pk)} style={{
                        background:packFilter===pk?"rgba(52,211,153,0.1)":"transparent",
                        border:`1px solid ${packFilter===pk?"rgba(52,211,153,0.35)":"rgba(255,255,255,0.06)"}`,
                        color:packFilter===pk?"#34d399":"#6b7280", borderRadius:20,
                        padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer",
                        whiteSpace:"nowrap", flexShrink:0 }}>{pk}</button>
                    ))}
                  </div>
                )}

                {/* Trending */}
                {!search && activeCat === "all" && sort === "recent" && (
                  <TrendingSection allPrompts={pub} likesMap={likesMap}
                    userLikedIds={userLikedIds} onLike={handleLike} showToast={showToast} />
                )}

                {/* Count */}
                <p style={{ fontSize:13, color:"#3a3a5a", fontWeight:500, marginBottom:16 }}>
                  <span style={{ color:"#6b7280", fontWeight:700 }}>{list.length}</span> prompt{list.length!==1?"s":""}
                  {search && <span style={{ color:"#4a4a6a" }}> for "<span style={{ color:"#94a3b8" }}>{search}</span>"</span>}
                </p>

                {/* Cards */}
                {list.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"80px 20px", color:"#2a2a3a" }}>
                    <div style={{ fontSize:52, marginBottom:16 }}>🔮</div>
                    <p style={{ fontSize:14, color:"#3a3a5a" }}>
                      {search ? `No results for "${search}"` : "No prompts here yet."}
                    </p>
                  </div>
                ) : (
                  <div className="prompt-grid">
                    {list.map(p => (
                      <PromptCard key={p.id} p={p}
                        likes={likesMap[p.id] || 0}
                        userLiked={userLikedIds.includes(p.id)}
                        onLike={handleLike}
                        currentUser={currentUser}
                        onLoginRequired={() => setShowAuth(true)}
                        showToast={showToast}
                        onViewCreator={goToCreator} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Footer onNavigate={handleFooterNav} />
        </div>
      )}

      <ScrollTop />
      <Toast msg={toast} />
    </>
  );
}
