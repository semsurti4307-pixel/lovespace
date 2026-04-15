import { useState, useEffect, useRef } from "react";
import { subscribeToTogetherMode, updateTogetherState, subscribeToCallSignal, sendCallSignal, clearCallSignal, addIceCandidate, subscribeToIceCandidates } from "./services/syncService";

/* ─── TOKENS ─────────────────────────────────────────────── */
const C = {
  bg:     "#08060f",
  s:      "rgba(255,255,255,0.05)",
  b:      "rgba(255,255,255,0.08)",
  pink:   "#ff6b9d",
  purple: "#c44dff",
  blue:   "#6b9dff",
  teal:   "#4dffe0",
  gold:   "#ffd166",
  grad:   "linear-gradient(135deg,#ff6b9d,#c44dff)",
  gradB:  "linear-gradient(135deg,#6b9dff,#4dffe0)",
  gradG:  "linear-gradient(135deg,#4dffe0,#6b9dff)",
  text:   "rgba(255,255,255,0.9)",
  muted:  "rgba(255,255,255,0.38)",
  dim:    "rgba(255,255,255,0.14)",
};

/* ─── HELPERS ─────────────────────────────────────────────── */
const extractYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

/* ─── BG ──────────────────────────────────────────────────── */
const Bg = ({ c1 = C.pink, c2 = C.purple, c3 }) => (
  <>
    <div style={{ position:"absolute", inset:0, background:`linear-gradient(160deg,#08060f 0%,#110d1c 55%,#08060f 100%)`, zIndex:0 }}/>
    <div style={{ position:"absolute", width:340, height:340, borderRadius:"50%", background:`radial-gradient(circle,${c1}15 0%,transparent 70%)`, top:-100, right:-80, zIndex:0 }}/>
    <div style={{ position:"absolute", width:260, height:260, borderRadius:"50%", background:`radial-gradient(circle,${c2}12 0%,transparent 70%)`, bottom:-60, left:-60, zIndex:0 }}/>
    {c3 && <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:`radial-gradient(circle,${c3}10 0%,transparent 70%)`, top:"45%", left:"35%", zIndex:0 }}/>}
  </>
);

/* ═══════════════════════════════════════════════════════════════
   TOGETHER HUB
═══════════════════════════════════════════════════════════════ */
const TogetherHub = ({ onSelect, partnerData }) => {
  const modes = [
    { id:"watch", icon:"🎬", label:"Watch Together", sub:"Paste YouTube link & watch synced", color:"linear-gradient(135deg,#ff6b9d,#ff9d6b)", glow:"rgba(255,107,157,0.35)" },
    { id:"music", icon:"🎵", label:"Music Together", sub:"Listen to songs together", color:"linear-gradient(135deg,#c44dff,#6b9dff)", glow:"rgba(196,77,255,0.35)" },
    { id:"call",  icon:"📹", label:"Video Call",     sub:"See each other live",  color:"linear-gradient(135deg,#4dffe0,#6b9dff)", glow:"rgba(77,255,224,0.35)" },
  ];

  return (
    <div style={{ minHeight:"100%", position:"relative", overflowY:"auto" }} className="screen">
      <Bg c1={C.pink} c2={C.purple} c3={C.teal}/>
      <div style={{ position:"relative", zIndex:2, padding:"48px 22px 20px", textAlign:"center" }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:"2px", textTransform:"uppercase", marginBottom:8, fontWeight:700 }}>✦ Together Mode ✦</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:C.text, fontWeight:500, lineHeight:1.3, marginBottom:6 }}>
          Distance is just<br/><span style={{ fontStyle:"italic", background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>a number</span>
        </h2>
        <p style={{ fontSize:12, color:C.muted }}>Choose how to be together right now 💕</p>
      </div>

      {/* Partner Status */}
      <div style={{ position:"relative", zIndex:2, margin:"0 22px 24px", padding:"14px 18px", borderRadius:20, background: partnerData?.isOnline ? "rgba(77,255,224,0.07)" : "rgba(255,255,255,0.04)", border: partnerData?.isOnline ? "1px solid rgba(77,255,224,0.2)" : `1px solid ${C.b}`, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ position:"relative" }}>
          <div style={{ width:46, height:46, borderRadius:16, background:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
            {partnerData?.gender === "female" ? "👧" : "👦"}
          </div>
          <div style={{ position:"absolute", bottom:-2, right:-2, width:12, height:12, borderRadius:"50%", background: partnerData?.isOnline ? "#4dffe0" : "#888", border:"2px solid #0e0b18" }}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, color:C.text, fontWeight:700 }}>{partnerData?.name || "Partner"}</div>
          <div style={{ fontSize:10, color: partnerData?.isOnline ? C.teal : C.muted }}>
            {partnerData?.isOnline ? "● Online · Ready" : "● Offline"}
          </div>
        </div>
      </div>

      {/* Mode Cards */}
      <div style={{ position:"relative", zIndex:2, padding:"0 22px 30px", display:"flex", flexDirection:"column", gap:14 }}>
        {modes.map((m,i)=>(
          <button key={m.id} onClick={()=>onSelect(m.id)} style={{
            padding:"20px", borderRadius:22, border:`1px solid rgba(255,255,255,0.08)`, cursor:"pointer",
            background:"rgba(255,255,255,0.04)",
            display:"flex", alignItems:"center", gap:16, textAlign:"left",
            animation:`fadeIn 0.4s ease ${i*0.1}s both`, transition:"all 0.25s",
          }}>
            <div style={{ width:58, height:58, borderRadius:20, background:m.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0, boxShadow:`0 6px 24px ${m.glow}` }}>{m.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, color:C.text, fontWeight:800, marginBottom:3 }}>{m.label}</div>
              <div style={{ fontSize:11, color:C.muted }}>{m.sub}</div>
            </div>
            <div style={{ fontSize:20, color:C.muted }}>›</div>
          </button>
        ))}
      </div>

      {/* How It Works */}
      <div style={{ position:"relative", zIndex:2, margin:"0 22px 30px", padding:"16px", borderRadius:18, background:C.s, border:`1px solid ${C.b}` }}>
        <div style={{ fontSize:11, color:C.muted, fontWeight:700, letterSpacing:"0.8px", marginBottom:10 }}>HOW IT WORKS</div>
        {["1️⃣ Choose Watch or Music mode","2️⃣ Paste a YouTube link","3️⃣ Both see the same video/song","4️⃣ Play/Pause syncs between you two!"].map((t,i)=>(
          <div key={i} style={{ fontSize:11, color:C.muted, marginBottom:5, display:"flex", gap:8 }}>{t}</div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   WATCH TOGETHER — REAL YOUTUBE EMBED
═══════════════════════════════════════════════════════════════ */
const WatchTogetherScreen = ({ onBack, partnerData, syncState, coupleId }) => {
  const [urlInput, setUrlInput] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [tab, setTab] = useState("player");
  const [chatMsg, setChatMsg] = useState("");
  const [watchChats, setWatchChats] = useState([]);
  const [watchlist, setWatchlist] = useState([
    { title:"Tamasha", url:"https://youtube.com/watch?v=PkljRKFOFME", thumb:"🎭" },
    { title:"Ae Dil Hai Mushkil", url:"https://youtube.com/watch?v=Z_PODraXg4E", thumb:"💕" },
  ]);
  const [addUrl, setAddUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");

  // Sync: when partner sets a video, load it
  useEffect(() => {
    if (syncState?.watch?.videoId && syncState.watch.videoId !== videoId) {
      setVideoId(syncState.watch.videoId);
    }
  }, [syncState?.watch?.videoId]);

  const loadVideo = async (url) => {
    const id = extractYouTubeId(url);
    if (!id) { alert("Invalid YouTube URL! Paste a valid YouTube link."); return; }
    setVideoId(id);
    setUrlInput("");
    await updateTogetherState(coupleId, { watch: { videoId: id, url } });
  };

  const playFromWatchlist = async (item) => {
    const id = extractYouTubeId(item.url);
    if (id) {
      setVideoId(id);
      setTab("player");
      await updateTogetherState(coupleId, { watch: { videoId: id, url: item.url } });
    }
  };

  const addToWatchlist = () => {
    if (!addUrl.trim()) return;
    const id = extractYouTubeId(addUrl);
    if (!id) { alert("Invalid YouTube URL!"); return; }
    setWatchlist(prev => [...prev, { title: addTitle || `Video ${prev.length+1}`, url: addUrl, thumb:"🎬" }]);
    setAddUrl(""); setAddTitle("");
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setWatchChats(prev => [...prev, { me:true, text:chatMsg, time: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) }]);
    setChatMsg("");
  };

  return (
    <div style={{ height:"100%", position:"relative", display:"flex", flexDirection:"column" }} className="screen">
      <Bg c1="#ff6b9d" c2="#ff9d6b"/>

      {/* Video Area */}
      <div style={{ position:"relative", zIndex:2, margin:"36px 0 0", background:"#000", aspectRatio:"16/9", flexShrink:0, overflow:"hidden" }}>
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            style={{ width:"100%", height:"100%", border:"none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Watch Together"
          />
        ) : (
          <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#1a0a0f,#2d1020,#0f0a1a)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:20 }}>
            <div style={{ fontSize:48 }}>🎬</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:"rgba(255,255,255,0.6)", textAlign:"center" }}>Paste a YouTube link below<br/>to start watching together!</div>
          </div>
        )}

        {/* Sync Badge */}
        {videoId && (
          <div style={{ position:"absolute", top:8, right:8, zIndex:3, padding:"4px 10px", borderRadius:50, background:"rgba(77,255,224,0.15)", border:"1px solid rgba(77,255,224,0.35)", display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:C.teal, animation:"pulse 1s ease infinite" }}/>
            <span style={{ fontSize:9, color:C.teal, fontWeight:800 }}>SYNCED</span>
          </div>
        )}
      </div>

      {/* URL Input Bar */}
      <div style={{ position:"relative", zIndex:2, padding:"10px 14px", background:"rgba(0,0,0,0.4)", display:"flex", gap:8 }}>
        <input 
          value={urlInput} 
          onChange={e=>setUrlInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&loadVideo(urlInput)}
          placeholder="🔗 Paste YouTube URL here..." 
          style={{ flex:1, padding:"10px 14px", borderRadius:50, background:"rgba(255,255,255,0.06)", border:`1px solid ${C.b}`, color:C.text, fontSize:12, outline:"none", fontFamily:"'Nunito',sans-serif" }}
        />
        <button onClick={()=>loadVideo(urlInput)} style={{ padding:"10px 16px", borderRadius:50, background:C.grad, border:"none", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>▶ Play</button>
      </div>

      {/* Tabs */}
      <div style={{ position:"relative", zIndex:2, display:"flex", borderBottom:`1px solid ${C.b}`, background:"rgba(0,0,0,0.2)" }}>
        {["player","watchlist","chat"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:"10px 0", border:"none", background:"transparent", color: tab===t ? C.pink : C.muted, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif", borderBottom: tab===t ? `2px solid ${C.pink}` : "2px solid transparent" }}>
            {t==="player"?"▶ Now Playing":t==="watchlist"?"📋 Watchlist":"💬 Chat"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex:1, overflowY:"auto", position:"relative", zIndex:2 }}>
        {tab==="player" && (
          <div style={{ padding:"14px 18px", animation:"fadeIn 0.3s ease" }}>
            {videoId ? (
              <>
                <div style={{ padding:"14px", borderRadius:16, background:"rgba(77,255,224,0.06)", border:"1px solid rgba(77,255,224,0.18)", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:C.teal, animation:"pulse 1s ease infinite" }}/>
                    <span style={{ fontSize:11, color:C.teal, fontWeight:700 }}>LIVE · Both watching</span>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {["👧","👦"].map((a,i)=>(<div key={i} style={{ width:28, height:28, borderRadius:10, background: i===0?C.grad:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{a}</div>))}
                    <span style={{ fontSize:11, color:C.muted, alignSelf:"center", marginLeft:4 }}>You & {partnerData?.name || "Partner"}</span>
                  </div>
                </div>
                <div style={{ padding:"12px 14px", borderRadius:14, background:C.s, border:`1px solid ${C.b}`, marginBottom:10 }}>
                  <div style={{ fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.8px", marginBottom:8 }}>HOW SYNC WORKS</div>
                  {["Both of you see the same YouTube video","Use YouTube's built-in play/pause controls","Share the link with partner, they auto-join","Chat while watching in the Chat tab 💬"].map((t,i)=>(<div key={i} style={{ fontSize:11, color:C.muted, marginBottom:4, display:"flex", gap:6 }}><span style={{ color:C.pink }}>✦</span>{t}</div>))}
                </div>
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"30px 16px" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📺</div>
                <div style={{ fontSize:14, color:C.text, fontWeight:700, marginBottom:6 }}>No Video Playing</div>
                <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>Paste a YouTube URL above to start watching!<br/>Your partner will see the same video 🎬</div>
                <div style={{ marginTop:16, padding:"12px", borderRadius:14, background:"rgba(255,107,157,0.08)", border:"1px solid rgba(255,107,157,0.2)" }}>
                  <div style={{ fontSize:10, color:C.pink, fontWeight:700, marginBottom:6 }}>💡 TIP</div>
                  <div style={{ fontSize:11, color:C.muted }}>Go to YouTube → Copy video link → Paste it above → Both watch together!</div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="watchlist" && (
          <div style={{ padding:"14px 18px", animation:"fadeIn 0.3s ease" }}>
            <div style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Couple's Watchlist</div>
            {watchlist.map((p,i)=>(
              <div key={i} onClick={()=>playFromWatchlist(p)} style={{ padding:"12px 14px", borderRadius:18, marginBottom:10, background:C.s, border:`1px solid ${C.b}`, display:"flex", gap:12, alignItems:"center", cursor:"pointer" }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,107,157,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{p.thumb}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:C.text, fontWeight:700 }}>{p.title}</div>
                  <div style={{ fontSize:10, color:C.dim, marginTop:2 }}>Tap to play together</div>
                </div>
                <div style={{ fontSize:14, color:C.pink }}>▶</div>
              </div>
            ))}

            {/* Add to Watchlist */}
            <div style={{ padding:"14px", borderRadius:18, background:"rgba(255,107,157,0.06)", border:"1px dashed rgba(255,107,157,0.3)", marginTop:8 }}>
              <div style={{ fontSize:11, color:C.pink, fontWeight:700, marginBottom:8 }}>+ Add to Watchlist</div>
              <input value={addTitle} onChange={e=>setAddTitle(e.target.value)} placeholder="Movie/Video name" style={{ width:"100%", padding:"9px 12px", borderRadius:10, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.b}`, color:C.text, fontSize:12, outline:"none", fontFamily:"'Nunito',sans-serif", marginBottom:6 }}/>
              <input value={addUrl} onChange={e=>setAddUrl(e.target.value)} placeholder="YouTube URL" style={{ width:"100%", padding:"9px 12px", borderRadius:10, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.b}`, color:C.text, fontSize:12, outline:"none", fontFamily:"'Nunito',sans-serif", marginBottom:8 }}/>
              <button onClick={addToWatchlist} style={{ width:"100%", padding:"10px", borderRadius:10, background:C.grad, border:"none", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>Add Video ✨</button>
            </div>
          </div>
        )}

        {tab==="chat" && (
          <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
            <div style={{ flex:1, padding:"12px 18px", display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>
              {watchChats.length === 0 && (
                <div style={{ textAlign:"center", padding:"30px 0", color:C.muted, fontSize:12 }}>
                  No messages yet. Chat while watching! 💬
                </div>
              )}
              {watchChats.map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent: m.me?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"75%", padding:"9px 13px", borderRadius: m.me?"16px 16px 4px 16px":"16px 16px 16px 4px", background: m.me ? C.grad : C.s, border: m.me ? "none" : `1px solid ${C.b}`, fontSize:12, color:C.text, lineHeight:1.5 }}>
                    <div>{m.text}</div>
                    <div style={{ fontSize:8, color: m.me?"rgba(255,255,255,0.5)":C.dim, marginTop:3, textAlign:"right" }}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:"8px 14px 12px", borderTop:`1px solid ${C.b}`, display:"flex", gap:8 }}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="React to the scene..." style={{ flex:1, padding:"10px 14px", borderRadius:50, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.b}`, color:C.text, fontSize:12, outline:"none", fontFamily:"'Nunito',sans-serif" }}/>
              <button onClick={sendChat} style={{ width:36, height:36, borderRadius:"50%", background:C.grad, border:"none", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>↑</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MUSIC TOGETHER — REAL YOUTUBE MUSIC EMBED
═══════════════════════════════════════════════════════════════ */
const MusicTogetherScreen = ({ onBack, partnerData, syncState, coupleId }) => {
  const [urlInput, setUrlInput] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [songTitle, setSongTitle] = useState("");
  const [tab, setTab] = useState("player");
  const [liked, setLiked] = useState(false);
  const [queue, setQueue] = useState([
    { title:"Tum Hi Ho - Arijit Singh", url:"https://youtube.com/watch?v=Umqb9KENgmk", thumb:"💕" },
    { title:"Kesariya - Brahmastra", url:"https://youtube.com/watch?v=BddP6PYo2gs", thumb:"🌸" },
    { title:"Raataan Lambiyaan", url:"https://youtube.com/watch?v=Ys3FGjoWmHs", thumb:"🌙" },
    { title:"Pehle Bhi Main", url:"https://youtube.com/watch?v=sJTpMRnDDkc", thumb:"🎶" },
    { title:"Chaleya - Jawan", url:"https://youtube.com/watch?v=yDXjRl2LuJk", thumb:"🌟" },
  ]);
  const [addUrl, setAddUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");

  // Sync: when partner sets a song, load it
  useEffect(() => {
    if (syncState?.music?.videoId && syncState.music.videoId !== videoId) {
      setVideoId(syncState.music.videoId);
      if (syncState.music.title) setSongTitle(syncState.music.title);
    }
  }, [syncState?.music?.videoId]);

  const loadSong = async (url, title = "") => {
    const id = extractYouTubeId(url);
    if (!id) { alert("Invalid YouTube URL! Paste a song link from YouTube."); return; }
    setVideoId(id);
    setSongTitle(title);
    setUrlInput("");
    await updateTogetherState(coupleId, { music: { videoId: id, url, title } });
  };

  const playFromQueue = async (item) => {
    const id = extractYouTubeId(item.url);
    if (id) {
      setVideoId(id);
      setSongTitle(item.title);
      setTab("player");
      await updateTogetherState(coupleId, { music: { videoId: id, url: item.url, title: item.title } });
    }
  };

  const addToQueue = () => {
    if (!addUrl.trim()) return;
    const id = extractYouTubeId(addUrl);
    if (!id) { alert("Invalid YouTube URL!"); return; }
    setQueue(prev => [...prev, { title: addTitle || `Song ${prev.length+1}`, url: addUrl, thumb:"🎵" }]);
    setAddUrl(""); setAddTitle("");
  };

  return (
    <div style={{ minHeight:"100%", position:"relative", overflowY:"auto" }} className="screen">
      <Bg c1={C.purple} c2={C.blue} c3={C.pink}/>

      {/* Header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:C.text, fontWeight:500 }}>Music Together</h2>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.teal, animation:"pulse 1.2s ease infinite" }}/>
            <span style={{ fontSize:10, color:C.teal, fontWeight:700 }}>{partnerData?.name || "Partner"} listening</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["👧","👦"].map((a,i)=>(<div key={i} style={{ width:32, height:32, borderRadius:11, background: i===0?C.grad:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, border:"1.5px solid rgba(255,255,255,0.2)" }}>{a}</div>))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ position:"relative", zIndex:2, display:"flex", gap:6, padding:"8px 20px 12px" }}>
        {["player","queue","add"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"7px 14px", borderRadius:50, border:"none", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700, background: tab===t?C.gradB:C.s, color: tab===t?"#fff":C.muted, boxShadow: tab===t ? "0 4px 14px rgba(107,157,255,0.3)" : "none" }}>
            {t==="player"?"▶ Playing":t==="queue"?"📋 Queue":"+ Add Song"}
          </button>
        ))}
      </div>

      {tab==="player" && (
        <div style={{ position:"relative", zIndex:2, padding:"0 20px 20px" }}>
          {/* Music Player */}
          {videoId ? (
            <>
              {/* YouTube embed for music (small) */}
              <div style={{ borderRadius:18, overflow:"hidden", marginBottom:16, boxShadow:"0 8px 32px rgba(196,77,255,0.2)", border:"2px solid rgba(196,77,255,0.2)" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                  style={{ width:"100%", height:200, border:"none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  title="Music Together"
                />
              </div>

              {/* Song Info */}
              <div style={{ textAlign:"center", marginBottom:16 }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:C.text, fontWeight:500, marginBottom:4 }}>{songTitle || "Now Playing"}</h3>
                <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:8 }}>
                  <div style={{ padding:"4px 12px", borderRadius:50, background:"rgba(196,77,255,0.1)", border:"1px solid rgba(196,77,255,0.2)", fontSize:10, color:C.purple, fontWeight:700 }}>💕 Together</div>
                  <div style={{ padding:"4px 12px", borderRadius:50, background:"rgba(77,255,224,0.08)", border:"1px solid rgba(77,255,224,0.2)", fontSize:10, color:C.teal, fontWeight:700 }}>● Synced</div>
                </div>
              </div>

              {/* Like */}
              <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
                <button onClick={()=>setLiked(!liked)} style={{ background:"none", border:"none", fontSize:28, cursor:"pointer", animation: liked?"heartBeat 0.5s ease":"none" }}>{liked?"❤️":"🤍"}</button>
              </div>

              {/* Both Listening */}
              <div style={{ padding:"12px 14px", borderRadius:16, background:"rgba(107,157,255,0.07)", border:"1px solid rgba(107,157,255,0.2)", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ display:"flex", gap:4 }}>
                  {["👧","👦"].map((a,i)=>(<div key={i} style={{ width:28, height:28, borderRadius:10, background: i===0?C.grad:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{a}</div>))}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:C.text, fontWeight:700 }}>Both listening together</div>
                  <div style={{ fontSize:10, color:C.muted }}>Same song · Same moment 🎵</div>
                </div>
              </div>
            </>
          ) : (
            /* No song playing */
            <div style={{ textAlign:"center", padding:"30px 16px" }}>
              <div style={{ fontSize:56, marginBottom:12 }}>🎵</div>
              <div style={{ fontSize:14, color:C.text, fontWeight:700, marginBottom:6 }}>No Song Playing</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.6, marginBottom:16 }}>Choose a song from Queue<br/>or add a new one!</div>
              
              {/* Quick URL input */}
              <div style={{ display:"flex", gap:8 }}>
                <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadSong(urlInput)} placeholder="🔗 Paste YouTube song URL..." style={{ flex:1, padding:"11px 14px", borderRadius:50, background:"rgba(255,255,255,0.06)", border:`1px solid ${C.b}`, color:C.text, fontSize:12, outline:"none", fontFamily:"'Nunito',sans-serif" }}/>
                <button onClick={()=>loadSong(urlInput)} style={{ padding:"11px 16px", borderRadius:50, background:C.gradB, border:"none", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>▶</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab==="queue" && (
        <div style={{ position:"relative", zIndex:2, padding:"0 20px 20px" }}>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Song Queue · Tap to Play</div>
          {queue.map((s,i)=>{
            const isActive = videoId && extractYouTubeId(s.url) === videoId;
            return (
              <div key={i} onClick={()=>playFromQueue(s)} style={{ padding:"11px 14px", borderRadius:16, marginBottom:8, background: isActive?"rgba(107,157,255,0.08)":C.s, border: isActive?"1.5px solid rgba(107,157,255,0.3)":`1px solid ${C.b}`, display:"flex", gap:10, alignItems:"center", cursor:"pointer" }}>
                <div style={{ width:38, height:38, borderRadius:12, background: isActive?C.gradB:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{s.thumb}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color: isActive?C.text:C.muted, fontWeight:700 }}>{s.title}</div>
                  <div style={{ fontSize:10, color:C.dim }}>Tap to play</div>
                </div>
                {isActive
                  ? <div style={{ display:"flex", gap:2, alignItems:"flex-end", height:16 }}>{[0,1,2].map(j=>(<div key={j} style={{ width:2.5, background:C.blue, borderRadius:1, animation:`waveBar 0.5s ease ${j*0.15}s infinite`, transformOrigin:"bottom", minHeight:3 }}/>))}</div>
                  : <div style={{ fontSize:14, color:C.dim }}>▶</div>
                }
              </div>
            );
          })}
        </div>
      )}

      {tab==="add" && (
        <div style={{ position:"relative", zIndex:2, padding:"0 20px 20px" }}>
          <div style={{ padding:"18px", borderRadius:20, background:"rgba(196,77,255,0.07)", border:"1px solid rgba(196,77,255,0.2)" }}>
            <div style={{ fontSize:13, color:C.purple, fontWeight:700, marginBottom:12 }}>🎵 Add a Song</div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:10, color:C.muted, marginBottom:4, textTransform:"uppercase", fontWeight:700 }}>Song Name</div>
              <input value={addTitle} onChange={e=>setAddTitle(e.target.value)} placeholder="e.g. Tum Hi Ho" style={{ width:"100%", padding:"11px 14px", borderRadius:12, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.b}`, color:C.text, fontSize:12, outline:"none", fontFamily:"'Nunito',sans-serif" }}/>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, color:C.muted, marginBottom:4, textTransform:"uppercase", fontWeight:700 }}>YouTube URL</div>
              <input value={addUrl} onChange={e=>setAddUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={{ width:"100%", padding:"11px 14px", borderRadius:12, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.b}`, color:C.text, fontSize:12, outline:"none", fontFamily:"'Nunito',sans-serif" }}/>
            </div>
            <button onClick={addToQueue} style={{ width:"100%", padding:"13px", borderRadius:14, background:C.gradB, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif", boxShadow:"0 6px 22px rgba(107,157,255,0.35)" }}>Add to Queue ✨</button>
          </div>

          <div style={{ marginTop:16, padding:"14px", borderRadius:16, background:C.s, border:`1px solid ${C.b}` }}>
            <div style={{ fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.8px", marginBottom:8 }}>💡 HOW TO ADD SONGS</div>
            {["Open YouTube app or website","Search for your song","Copy the video link/URL","Paste it above and add!"].map((t,i)=>(<div key={i} style={{ fontSize:11, color:C.muted, marginBottom:4, display:"flex", gap:8 }}><span style={{ color:C.purple }}>{i+1}.</span>{t}</div>))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   VIDEO CALL — FULL VERSION (WITH REAL WEBRTC)
═══════════════════════════════════════════════════════════════ */
const VideoCallScreen = ({ onBack, partnerData, syncState, coupleId, user }) => {
  const [callState, setCallState] = useState("ringing");
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [duration, setDuration] = useState(0);
  const [showEffects, setShowEffects] = useState(false);
  const [filter, setFilter] = useState(null);
  const [reaction, setReaction] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  useEffect(() => {
    if (syncState?.call) {
      setCallState(syncState.call.state);
      if (syncState.call.duration) setDuration(syncState.call.duration);
    }
  }, [syncState?.call]);

  const updateCall = async (state, dur = 0) => {
    setCallState(state);
    await updateTogetherState(coupleId, { call: { state, duration: dur } });
  };

  useEffect(() => {
    if (callState === "ringing" && !syncState?.call) {
      // Don't auto-answer. User must click to answer.
    }
  }, [callState]);

  useEffect(() => {
    if (callState === "active") {
      const t = setInterval(() => setDuration(d => d+1), 1000);
      setupWebRTC();
      return () => { clearInterval(t); endWebRTC(); };
    }
    if (callState === "ended") endWebRTC();
  }, [callState]);

  const setupWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }] });
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setHasRemoteVideo(true);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) addIceCandidate(coupleId, user.uid, event.candidate);
      };

      subscribeToCallSignal(coupleId, async (data) => {
        if (!pcRef.current) return;
        if (data?.offer && data.sender !== user.uid && !pcRef.current.currentRemoteDescription) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          await sendCallSignal(coupleId, { answer: { type: answer.type, sdp: answer.sdp }, sender: user.uid });
        }
        if (data?.answer && data.sender !== user.uid && !pcRef.current.currentRemoteDescription) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      });

      subscribeToIceCandidates(coupleId, partnerData.uid, (candidate) => {
        if (pcRef.current && candidate) pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e=>{});
      });

      // Caller is the one who initiates WebRTC first (or based on UID for simplicity)
      if (user.uid < partnerData.uid) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendCallSignal(coupleId, { offer: { type: offer.type, sdp: offer.sdp }, sender: user.uid });
      }
    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("Please allow camera and microphone access for the video call.");
    }
  };

  const endWebRTC = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    clearCallSignal(coupleId);
    setHasRemoteVideo(false);
  };

  // Toggle user audio/video tracks
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = mic);
      localStream.getVideoTracks().forEach(t => t.enabled = cam);
    }
  }, [mic, cam, localStream]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const filters = [{ id:"heart", icon:"💕", label:"Love" },{ id:"stars", icon:"✨", label:"Stars" },{ id:"blur",  icon:"🌸", label:"Soft" },{ id:"warm",  icon:"🌅", label:"Warm" }];
  const callReactions = ["❤️","😘","🥰","💋","✨","😂"];

  return (
    <div style={{ height:"100%", position:"relative", background:"#000", overflow:"hidden" }} className="screen">
      
      {/* RINGING */}
      {callState === "ringing" && (
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#0a0812,#1a0d28)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, zIndex:10 }}>
          <Bg c1={C.pink} c2={C.purple}/>
          {[0,0.5,1].map((d,i)=>(<div key={i} style={{ position:"absolute", width:160+i*50, height:160+i*50, borderRadius:"50%", border:"1.5px solid rgba(255,107,157,0.2)", animation:`callRing 2s ease ${d}s infinite`, zIndex:1 }}/>))}
          <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
            <div style={{ width:100, height:100, borderRadius:32, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52, margin:"0 auto 16px", boxShadow:"0 12px 48px rgba(255,107,157,0.5)", animation:"glow 2s ease infinite" }}>
              {partnerData?.gender === "female" ? "👧" : "👦"}
            </div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:C.text, fontWeight:500, marginBottom:6 }}>{partnerData?.name || "Partner"}</h3>
            <p style={{ fontSize:12, color:C.muted, animation:"blink 1s ease infinite" }}>Calling...</p>
          </div>
          <div style={{ position:"relative", zIndex:2, display:"flex", gap:24, marginTop:20 }}>
            <button onClick={onBack} style={{ width:64, height:64, borderRadius:"50%", background:"#ff4444", border:"none", fontSize:26, cursor:"pointer", boxShadow:"0 6px 24px rgba(255,68,68,0.4)" }}>📵</button>
            <button onClick={()=>updateCall("active")} style={{ width:64, height:64, borderRadius:"50%", background:"#22cc44", border:"none", fontSize:26, cursor:"pointer", boxShadow:"0 6px 24px rgba(34,204,68,0.4)" }}>📞</button>
          </div>
        </div>
      )}

      {/* ACTIVE CALL */}
      {callState === "active" && (
        <>
          <div style={{ position:"absolute", inset:0, background: filter==="warm" ? "linear-gradient(135deg,#2d1a00,#4d2000)" : "linear-gradient(135deg,#0d0a18,#1a1030)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width:"100%", height:"100%", objectFit:"cover", filter: filter==="blur" ? "blur(4px)" : filter==="warm" ? "sepia(0.5) contrast(1.1)" : "none", display: hasRemoteVideo ? "block" : "none" }} />
            {!hasRemoteVideo && <div style={{ fontSize:90, opacity:0.15 }}>{partnerData?.gender === "female" ? "👧" : "👦"}</div>}
            {filter === "heart" && (<div style={{ position:"absolute", inset:0, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:20, opacity:0.15, fontSize:24, pointerEvents:"none" }}>{[...Array(20)].map((_,i)=><span key={i}>❤️</span>)}</div>)}
            {filter === "stars" && (<div style={{ position:"absolute", inset:0, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:16, opacity:0.2, fontSize:18, pointerEvents:"none" }}>{[...Array(25)].map((_,i)=><span key={i}>✨</span>)}</div>)}
          </div>
          {reaction && (<div style={{ position:"absolute", top:"30%", left:"45%", fontSize:52, zIndex:20, animation:"ripple 0.8s ease forwards" }}>{reaction}</div>)}
          <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:10, padding:"36px 16px 12px", background:"linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:14, color:"#fff", fontWeight:700 }}>{partnerData?.name || "Partner"}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#4dff9d", animation:"pulse 1s ease infinite" }}/>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>{fmt(duration)}</span>
              </div>
            </div>
            <button onClick={()=>setShowEffects(!showEffects)} style={{ padding:"6px 12px", borderRadius:50, background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>✨ Effects</button>
          </div>
          <div style={{ position:"absolute", bottom:130, right:12, zIndex:10, width:100, height:130, borderRadius:14, background: cam ? "linear-gradient(135deg,#ff6b9d44,#c44dff44)" : "rgba(0,0,0,0.8)", border:"2px solid rgba(255,107,157,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", display: cam ? "block" : "none" }} />
            {!cam && <div style={{ textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.4)" }}>📷<br/>OFF</div>}
          </div>
          {showEffects && (
            <div style={{ position:"absolute", bottom:170, left:0, right:0, zIndex:15, padding:"14px", background:"rgba(10,8,18,0.92)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.b}` }}>
              <div style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Filters</div>
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                {filters.map(f=>(<button key={f.id} onClick={()=>setFilter(filter===f.id?null:f.id)} style={{ flex:1, padding:"10px 4px", borderRadius:12, border: filter===f.id ? "1.5px solid rgba(255,107,157,0.4)" : `1px solid ${C.b}`, cursor:"pointer", background: filter===f.id ? "rgba(255,107,157,0.15)" : C.s }}><div style={{ fontSize:20, marginBottom:2 }}>{f.icon}</div><div style={{ fontSize:9, color: filter===f.id ? C.pink : C.muted, fontWeight:700 }}>{f.label}</div></button>))}
              </div>
              <div style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Reactions</div>
              <div style={{ display:"flex", gap:8 }}>
                {callReactions.map(r=>(<button key={r} onClick={()=>{ setReaction(r); setTimeout(()=>setReaction(null),900); }} style={{ flex:1, padding:"8px 0", borderRadius:10, background:C.s, border:`1px solid ${C.b}`, fontSize:18, cursor:"pointer" }}>{r}</button>))}
              </div>
            </div>
          )}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:10, padding:"12px 16px 24px", background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-around" }}>
              <button onClick={()=>setMic(!mic)} style={{ width:52, height:52, borderRadius:"50%", cursor:"pointer", background: mic?"rgba(255,255,255,0.15)":"rgba(255,68,68,0.25)", border:"1.5px solid rgba(255,255,255,0.2)", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>{mic ? "🎙️" : "🔇"}</button>
              <button onClick={()=>updateCall("ended", duration)} style={{ width:64, height:64, borderRadius:"50%", background:"#ff3b30", border:"none", fontSize:26, cursor:"pointer", boxShadow:"0 6px 28px rgba(255,59,48,0.5)", display:"flex", alignItems:"center", justifyContent:"center" }}>📵</button>
              <button onClick={()=>setCam(!cam)} style={{ width:52, height:52, borderRadius:"50%", cursor:"pointer", background: cam?"rgba(255,255,255,0.15)":"rgba(255,68,68,0.25)", border:"1.5px solid rgba(255,255,255,0.2)", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>{cam?"📹":"🚫"}</button>
            </div>
          </div>
        </>
      )}

      {/* ENDED */}
      {callState === "ended" && (
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#0a0812,#1a0d28)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, zIndex:10 }}>
          <Bg c1={C.purple} c2={C.blue}/>
          <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:12, animation:"heartBeat 1s ease" }}>💕</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500, marginBottom:6 }}>Call Ended</h3>
            <p style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Duration: {fmt(duration)}</p>
            <p style={{ fontSize:11, color:C.muted }}>with {partnerData?.name || "Partner"}</p>
          </div>
          <div style={{ position:"relative", zIndex:2, display:"flex", gap:10 }}>
            <button onClick={()=>{setCallState("ringing");setDuration(0);}} style={{ padding:"13px 24px", borderRadius:50, background:C.grad, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 6px 24px rgba(255,107,157,0.4)" }}>📞 Call Again</button>
            <button onClick={onBack} style={{ padding:"13px 24px", borderRadius:50, background:C.s, border:`1px solid ${C.b}`, color:C.muted, fontSize:13, fontWeight:700, cursor:"pointer" }}>💬 Message</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════ */
export default function TogetherModeScreen({ user, userData, partnerData, setScreen }) {
  const [activeTab, setActiveTab] = useState("hub");
  const [syncState, setSyncState] = useState(null);
  const coupleId = [user.uid, partnerData?.uid].sort().join("_");

  useEffect(() => {
    if (!partnerData) return;
    const unsub = subscribeToTogetherMode(coupleId, (data) => {
      setSyncState(data);
      if (data.mode && data.mode !== activeTab) {
        setActiveTab(data.mode);
      }
    });
    return () => unsub();
  }, [partnerData, activeTab]);

  const handleSelectMode = async (m) => {
    setActiveTab(m);
    await updateTogetherState(coupleId, { mode: m });
  };

  const handleBack = async () => {
    setActiveTab("hub");
    await updateTogetherState(coupleId, { mode: "hub" });
  };

  return (
    <div style={{ height:"100%", position:"relative", background:"#0e0b18" }}>
      <div onClick={() => activeTab === "hub" ? setScreen("home") : handleBack()}
        style={{ position:"absolute", zIndex:1000, top:44, left:16, width:34, height:34, borderRadius:"50%", background:"rgba(0,0,0,0.5)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.1)", fontSize:16 }}>‹</div>

      {activeTab === "hub" && <TogetherHub onSelect={handleSelectMode} partnerData={partnerData} />}
      {activeTab === "watch" && <WatchTogetherScreen onBack={handleBack} partnerData={partnerData} syncState={syncState} coupleId={coupleId} />}
      {activeTab === "music" && <MusicTogetherScreen onBack={handleBack} partnerData={partnerData} syncState={syncState} coupleId={coupleId} />}
      {activeTab === "call" && <VideoCallScreen onBack={handleBack} partnerData={partnerData} syncState={syncState} coupleId={coupleId} user={user} />}
    </div>
  );
}
