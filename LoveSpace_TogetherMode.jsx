import { useState, useEffect, useRef } from "react";

/* ─── GLOBAL STYLES ─────────────────────────────────────── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Nunito:wght@300;400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { background:#08060f; font-family:'Nunito',sans-serif; }
    ::-webkit-scrollbar { width:3px; }
    ::-webkit-scrollbar-thumb { background:rgba(255,107,157,0.3); border-radius:2px; }
    input::placeholder { color:rgba(255,255,255,0.18); }

    @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes pulse     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:0.8} }
    @keyframes heartBeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.25)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} }
    @keyframes glow      { 0%,100%{box-shadow:0 0 20px rgba(255,107,157,0.25)} 50%{box-shadow:0 0 50px rgba(255,107,157,0.6),0 0 80px rgba(196,77,255,0.2)} }
    @keyframes ripple    { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.8);opacity:0} }
    @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes waveBar   { 0%,100%{transform:scaleY(0.35)} 50%{transform:scaleY(1)} }
    @keyframes slideUp   { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes orbRing   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes progressBar { from{width:0%} to{width:var(--w)} }
    @keyframes vinyl     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes eq1 { 0%,100%{height:6px} 50%{height:18px} }
    @keyframes eq2 { 0%,100%{height:12px} 50%{height:6px} }
    @keyframes eq3 { 0%,100%{height:8px} 50%{height:20px} }
    @keyframes eq4 { 0%,100%{height:16px} 50%{height:8px} }
    @keyframes callRing  { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.8);opacity:0} }
    @keyframes micWave   { 0%,100%{height:3px;opacity:0.4} 50%{height:12px;opacity:1} }
    .screen { animation: fadeUp 0.4s ease both; }
    .tab-active { animation: fadeUp 0.3s ease both; }
  `}</style>
);

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

/* ─── BG ──────────────────────────────────────────────────── */
const Bg = ({ c1 = C.pink, c2 = C.purple, c3 }) => (
  <>
    <div style={{ position:"absolute", inset:0, background:`linear-gradient(160deg,#08060f 0%,#110d1c 55%,#08060f 100%)`, zIndex:0 }}/>
    <div style={{ position:"absolute", width:340, height:340, borderRadius:"50%", background:`radial-gradient(circle,${c1}15 0%,transparent 70%)`, top:-100, right:-80, zIndex:0 }}/>
    <div style={{ position:"absolute", width:260, height:260, borderRadius:"50%", background:`radial-gradient(circle,${c2}12 0%,transparent 70%)`, bottom:-60, left:-60, zIndex:0 }}/>
    {c3 && <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:`radial-gradient(circle,${c3}10 0%,transparent 70%)`, top:"45%", left:"35%", zIndex:0 }}/>}
  </>
);

/* ─── TOGETHER HUB ─── */
const TogetherHub = ({ onSelect }) => {
  const modes = [
    { id:"watch",  icon:"🎬", label:"Watch Together",  sub:"Sync movies & videos",  color:"linear-gradient(135deg,#ff6b9d,#ff9d6b)", glow:"rgba(255,107,157,0.35)" },
    { id:"music",  icon:"🎵", label:"Music Together",  sub:"Same beat, same heart",  color:"linear-gradient(135deg,#c44dff,#6b9dff)", glow:"rgba(196,77,255,0.35)" },
    { id:"call",   icon:"📹", label:"Video Call",       sub:"See each other live",    color:"linear-gradient(135deg,#4dffe0,#6b9dff)", glow:"rgba(77,255,224,0.35)" },
  ];

  return (
    <div style={{ height:"100%", position:"relative", overflowY:"auto" }} className="screen">
      <Bg c1={C.pink} c2={C.purple} c3={C.teal}/>
      <div style={{ position:"relative", zIndex:2, padding:"48px 22px 20px", textAlign:"center" }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:"2px", textTransform:"uppercase", marginBottom:8, fontWeight:700 }}>✦ Together Mode ✦</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:C.text, fontWeight:500, lineHeight:1.3, marginBottom:6 }}>
          Distance is just<br/><span style={{ fontStyle:"italic", background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>a number</span>
        </h2>
        <p style={{ fontSize:12, color:C.muted }}>Choose how to be together right now 💕</p>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"0 22px 30px", display:"flex", flexDirection:"column", gap:14 }}>
        {modes.map((m,i)=>(
          <button key={m.id} onClick={()=>onSelect(m.id)} style={{
            padding:"20px", borderRadius:22, border:"none", cursor:"pointer",
            background:"rgba(255,255,255,0.04)",
            border:`1px solid rgba(255,255,255,0.08)`,
            display:"flex", alignItems:"center", gap:16,
            animation:`fadeUp 0.4s ease ${i*0.1}s both`,
            transition:"all 0.25s",
            textAlign:"left",
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
    </div>
  );
};

/* ─── WATCH TOGETHER ── */
const WatchTogetherScreen = ({ onBack }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(34);
  const [tab, setTab] = useState("now");
  const [reacted, setReacted] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing) { timerRef.current = setInterval(() => setProgress(p => Math.min(p+0.3, 100)), 300); }
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [playing]);

  const reactions = ["❤️","😂","😍","😮","😭","🔥"];

  return (
    <div style={{ height:"100%", position:"relative", display:"flex", flexDirection:"column" }} className="screen">
      <div onClick={onBack} style={{ position:"absolute", top:10, left:20, zIndex:100, fontSize:20, color:"#fff", cursor:"pointer", background:"rgba(0,0,0,0.5)", width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>‹</div>
      <Bg c1="#ff6b9d" c2="#ff9d6b"/>
      <div style={{ position:"relative", zIndex:2, margin:"36px 0 0", background:"#000", aspectRatio:"16/9", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#1a0a0f 0%,#2d1020 40%,#0f0a1a 100%)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
          <div style={{ fontSize:52 }}>🎭</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:"rgba(255,255,255,0.7)", fontStyle:"italic" }}>Tamasha</div>
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:3, padding:"8px 12px" }}>
            <div style={{ height:3, borderRadius:10, background:"rgba(255,255,255,0.15)", overflow:"hidden", marginBottom:4 }}>
              <div style={{ height:"100%", width:`${progress}%`, background:C.grad, borderRadius:10, transition:"width 0.3s linear" }}/>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button onClick={()=>setPlaying(!playing)} style={{ width:38, height:38, borderRadius:"50%", background:C.grad, border:"none", color:"#fff", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{playing ? "⏸" : "▶"}</button>
            </div>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"10px 16px", background:"rgba(0,0,0,0.3)", display:"flex", gap:6, justifyContent:"center" }}>
        {reactions.map(r=>(
          <button key={r} onClick={()=>{ setReacted(r); setTimeout(()=>setReacted(null),900); }} style={{ width:36, height:36, borderRadius:12, background:C.s, border:`1px solid ${C.b}`, fontSize:18, cursor:"pointer" }}>{r}</button>
        ))}
      </div>
      {reacted && <div style={{ position:"absolute", zIndex:20, fontSize:40, top:"40%", left:"45%", animation:"ripple 0.8s ease forwards" }}>{reacted}</div>}
    </div>
  );
};

/* ─── MUSIC TOGETHER ── */
const MusicTogetherScreen = ({ onBack }) => {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(42);

  useEffect(() => {
    const t = setInterval(() => playing && setProgress(p => p >= 100 ? 0 : p+0.2), 200);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div style={{ height:"100%", position:"relative", overflowY:"auto" }} className="screen">
      <div onClick={onBack} style={{ position:"absolute", top:44, left:20, zIndex:100, fontSize:22, color:C.muted, cursor:"pointer" }}>✕</div>
      <Bg c1={C.purple} c2={C.blue} c3={C.pink}/>
      <div style={{ position:"relative", zIndex:2, padding:"80px 20px 20px", textAlign:"center" }}>
         <div style={{ width:180, height:180, borderRadius:"50%", background:C.grad, margin:"0 auto 30px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:60, boxShadow:"0 12px 48px rgba(196,77,255,0.4)", animation: playing ? "vinyl 3s linear infinite" : "none" }}>🎵</div>
         <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:C.text, marginBottom:4 }}>Tum Hi Ho</h3>
         <p style={{ fontSize:14, color:C.muted, marginBottom:30 }}>Arijit Singh</p>
         <div style={{ marginBottom:30 }}>
            <div style={{ height:4, borderRadius:10, background:"rgba(255,255,255,0.1)", overflow:"hidden", marginBottom:10 }}>
                <div style={{ height:"100%", width:`${progress}%`, background:C.gradB, borderRadius:10 }}/>
            </div>
            <button onClick={()=>setPlaying(!playing)} style={{ width:64, height:64, borderRadius:"50%", background:C.gradB, border:"none", color:"#fff", fontSize:24, cursor:"pointer" }}>{playing ? "⏸" : "▶"}</button>
         </div>
      </div>
    </div>
  );
};

/* ─── VIDEO CALL ─── */
const VideoCallScreen = ({ onBack }) => {
  return (
    <div style={{ height:"100%", position:"relative", background:"#000", display:"flex", alignItems:"center", justifyContent:"center" }} className="screen">
        <div onClick={onBack} style={{ position:"absolute", top:44, left:20, zIndex:100, fontSize:22, color:"#fff", cursor:"pointer" }}>✕</div>
        <div style={{ textAlign:"center" }}>
            <div style={{ width:120, height:120, borderRadius:"50%", background:C.grad, margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:50 }}>👦</div>
            <h2 style={{ color:"#fff", fontFamily:"'Playfair Display',serif" }}>Arjun</h2>
            <p style={{ color:C.muted, marginTop:10 }}>Video Call Syncing...</p>
        </div>
    </div>
  );
};

/* ─── MAIN EXPORT ─── */
export default function TogetherModeScreen({ setScreen }) {
  const [mode, setMode] = useState(null);

  const renderContent = () => {
    switch (mode) {
      case "watch": return <WatchTogetherScreen onBack={() => setMode(null)} />;
      case "music": return <MusicTogetherScreen onBack={() => setMode(null)} />;
      case "call":  return <VideoCallScreen onBack={() => setMode(null)} />;
      default:      return <TogetherHub onSelect={setMode} />;
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", height: "100svh", background: "#08060f", position: "relative", overflow:"hidden" }}>
      <G />
      <div onClick={() => !mode ? setScreen("home") : null} style={{ position: "absolute", top: 44, left: 20, zIndex: 100, color: "#fff", cursor: "pointer", display: !mode ? "block" : "none", fontSize: 18 }}>‹ Home</div>
      {renderContent()}
    </div>
  );
}
