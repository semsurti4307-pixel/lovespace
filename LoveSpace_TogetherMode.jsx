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

/* ─── PHONE FRAME ─────────────────────────────────────────── */
const Phone = ({ children, label, accent = C.pink }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
    <div style={{
      width:320, height:680,
      background:"#0e0b18",
      borderRadius:46,
      border:`2px solid rgba(255,255,255,0.1)`,
      boxShadow:`0 40px 100px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.06),0 0 0 6px rgba(255,255,255,0.02),0 0 60px ${accent}18`,
      overflow:"hidden", position:"relative", flexShrink:0,
    }}>
      <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:110, height:28, background:"#0e0b18", borderBottomLeftRadius:16, borderBottomRightRadius:16, zIndex:30, borderBottom:"1px solid rgba(255,255,255,0.05)" }}/>
      <div style={{ position:"absolute", top:8, left:20, right:20, display:"flex", justifyContent:"space-between", zIndex:31, fontSize:9, color:C.muted, fontWeight:700 }}>
        <span>9:41</span><span>●●● ▲ 🔋</span>
      </div>
      <div style={{ width:"100%", height:"100%", overflowY:"auto", overflowX:"hidden" }}>
        {children}
      </div>
    </div>
    <div style={{
      padding:"6px 22px", borderRadius:50,
      background:"rgba(255,255,255,0.03)", border:`1px solid ${C.b}`,
      fontSize:11, color:C.muted, letterSpacing:"1.5px", textTransform:"uppercase", fontWeight:700,
    }}>{label}</div>
  </div>
);

/* ─── BG ──────────────────────────────────────────────────── */
const Bg = ({ c1 = C.pink, c2 = C.purple, c3 }) => (
  <>
    <div style={{ position:"absolute", inset:0, background:`linear-gradient(160deg,#08060f 0%,#110d1c 55%,#08060f 100%)`, zIndex:0 }}/>
    <div style={{ position:"absolute", width:340, height:340, borderRadius:"50%", background:`radial-gradient(circle,${c1}15 0%,transparent 70%)`, top:-100, right:-80, zIndex:0 }}/>
    <div style={{ position:"absolute", width:260, height:260, borderRadius:"50%", background:`radial-gradient(circle,${c2}12 0%,transparent 70%)`, bottom:-60, left:-60, zIndex:0 }}/>
    {c3 && <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:`radial-gradient(circle,${c3}10 0%,transparent 70%)`, top:"45%", left:"35%", zIndex:0 }}/>}
  </>
);

/* ─── TOGETHER HUB — ENTRY SCREEN ──────────────────────────── */
const TogetherHub = ({ onSelect }) => {
  const modes = [
    { id:"watch",  icon:"🎬", label:"Watch Together",  sub:"Sync movies & videos",  color:"linear-gradient(135deg,#ff6b9d,#ff9d6b)", glow:"rgba(255,107,157,0.35)" },
    { id:"music",  icon:"🎵", label:"Music Together",  sub:"Same beat, same heart",  color:"linear-gradient(135deg,#c44dff,#6b9dff)", glow:"rgba(196,77,255,0.35)" },
    { id:"call",   icon:"📹", label:"Video Call",       sub:"See each other live",    color:"linear-gradient(135deg,#4dffe0,#6b9dff)", glow:"rgba(77,255,224,0.35)" },
  ];

  return (
    <div style={{ height:680, position:"relative", overflowY:"auto" }} className="screen">
      <Bg c1={C.pink} c2={C.purple} c3={C.teal}/>

      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"48px 22px 20px", textAlign:"center" }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:"2px", textTransform:"uppercase", marginBottom:8, fontWeight:700 }}>✦ Together Mode ✦</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:C.text, fontWeight:500, lineHeight:1.3, marginBottom:6 }}>
          Distance is just<br/><span style={{ fontStyle:"italic", background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>a number</span>
        </h2>
        <p style={{ fontSize:12, color:C.muted }}>Choose how to be together right now 💕</p>
      </div>

      {/* partner status */}
      <div style={{ position:"relative", zIndex:2, margin:"0 22px 24px", padding:"14px 18px", borderRadius:20, background:"rgba(77,255,224,0.07)", border:"1px solid rgba(77,255,224,0.2)", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ position:"relative" }}>
          <div style={{ width:46, height:46, borderRadius:16, background:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>👦</div>
          <div style={{ position:"absolute", bottom:-2, right:-2, width:12, height:12, borderRadius:"50%", background:"#4dffe0", border:"2px solid #0e0b18", animation:"pulse 1.5s ease infinite" }}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, color:C.text, fontWeight:700 }}>Arjun</div>
          <div style={{ fontSize:10, color:C.teal }}>● Online · Ready to connect</div>
        </div>
        <div style={{ padding:"6px 14px", borderRadius:50, background:"rgba(77,255,224,0.12)", border:"1px solid rgba(77,255,224,0.25)", fontSize:10, color:C.teal, fontWeight:700 }}>AVAILABLE</div>
      </div>

      {/* mode cards */}
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
            <div style={{
              width:58, height:58, borderRadius:20, background:m.color,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:28, flexShrink:0,
              boxShadow:`0 6px 24px ${m.glow}`,
            }}>{m.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, color:C.text, fontWeight:800, marginBottom:3, fontFamily:"'Nunito',sans-serif" }}>{m.label}</div>
              <div style={{ fontSize:11, color:C.muted }}>{m.sub}</div>
            </div>
            <div style={{ fontSize:20, color:C.muted }}>›</div>
          </button>
        ))}
      </div>

      {/* recent activity */}
      <div style={{ position:"relative", zIndex:2, margin:"0 22px 20px" }}>
        <div style={{ fontSize:10, color:C.muted, letterSpacing:"1.2px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Recent Together</div>
        {[
          { icon:"🎬", text:"Watched 'Tamasha'", time:"Yesterday", color:C.pink },
          { icon:"🎵", text:"Played 'Tum Hi Ho'", time:"2 days ago", color:C.purple },
          { icon:"📹", text:"Video call · 1h 24m", time:"Apr 11", color:C.teal },
        ].map((a,i)=>(
          <div key={i} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"center" }}>
            <div style={{ width:34, height:34, borderRadius:12, background:C.s, border:`1px solid ${C.b}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{a.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:C.text, fontWeight:600 }}>{a.text}</div>
              <div style={{ fontSize:10, color:C.muted }}>{a.time}</div>
            </div>
            <div style={{ width:6, height:6, borderRadius:"50%", background:a.color }}/>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   WATCH TOGETHER SCREEN
════════════════════════════════════════════════════════════ */
const WatchTogetherScreen = ({ onBack }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(34);
  const [tab, setTab] = useState("now");
  const [reacted, setReacted] = useState(null);
  const [chatMsg, setChatMsg] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => setProgress(p => Math.min(p+0.3, 100)), 300);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [playing]);

  const reactions = ["❤️","😂","😍","😮","😭","🔥"];
  const playlist = [
    { title:"Tamasha",        genre:"Romance · Drama",   dur:"2h 21m", thumb:"🎭", active:true  },
    { title:"Ae Dil Hai Mushkil", genre:"Romance",       dur:"2h 38m", thumb:"💕", active:false },
    { title:"Yeh Jawaani Hai Deewani", genre:"Romance · Comedy", dur:"2h 40m", thumb:"🌄", active:false },
  ];

  const chats = [
    { me:false, text:"Ye scene bahut emotional hai 😭", time:"1:23:10" },
    { me:true,  text:"Haan yaar!! 💕 Ranbir best actor hai", time:"1:23:45" },
    { me:false, text:"Shh spoiler mat do 😂", time:"1:24:02" },
  ];

  return (
    <div style={{ height:680, position:"relative", display:"flex", flexDirection:"column" }} className="screen">
      <Bg c1="#ff6b9d" c2="#ff9d6b"/>

      {/* video player area */}
      <div style={{
        position:"relative", zIndex:2,
        margin:"36px 0 0",
        background:"#000",
        aspectRatio:"16/9",
        display:"flex", alignItems:"center", justifyContent:"center",
        overflow:"hidden",
        flexShrink:0,
      }}>
        {/* movie poster simulation */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(135deg,#1a0a0f 0%,#2d1020 40%,#0f0a1a 100%)",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexDirection:"column", gap:8,
        }}>
          <div style={{ fontSize:52 }}>🎭</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:"rgba(255,255,255,0.7)", fontStyle:"italic" }}>Tamasha</div>
          {playing && (
            <div style={{ position:"absolute", bottom:8, left:0, right:0, display:"flex", justifyContent:"center", gap:6 }}>
              {[0,1,2,3].map(i=>(
                <div key={i} style={{ width:3, background:C.pink, borderRadius:2, animation:`waveBar 0.6s ease ${i*0.15}s infinite`, transformOrigin:"bottom" }}/>
              ))}
            </div>
          )}
        </div>

        {/* overlay controls */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(transparent 40%,rgba(0,0,0,0.7))", zIndex:2 }}/>

        {/* sync badge */}
        <div style={{
          position:"absolute", top:8, right:8, zIndex:3,
          padding:"4px 10px", borderRadius:50,
          background:"rgba(77,255,224,0.15)", border:"1px solid rgba(77,255,224,0.35)",
          display:"flex", alignItems:"center", gap:5,
        }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:C.teal, animation:"pulse 1s ease infinite" }}/>
          <span style={{ fontSize:9, color:C.teal, fontWeight:800 }}>SYNCED</span>
        </div>

        {/* partner avatar overlay */}
        <div style={{ position:"absolute", top:8, left:8, zIndex:3, display:"flex", gap:4 }}>
          <div style={{ width:28, height:28, borderRadius:10, background:"linear-gradient(135deg,#ff6b9d,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, border:"1.5px solid rgba(255,255,255,0.3)" }}>👧</div>
          <div style={{ width:28, height:28, borderRadius:10, background:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, border:"1.5px solid rgba(255,255,255,0.3)" }}>👦</div>
        </div>

        {/* reaction that appeared */}
        {reacted && (
          <div style={{
            position:"absolute", zIndex:4, fontSize:36,
            animation:"ripple 0.8s ease forwards",
            top:"30%", left:"45%",
          }}>{reacted}</div>
        )}

        {/* bottom controls */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:3, padding:"8px 12px" }}>
          {/* progress bar */}
          <div style={{ marginBottom:6 }}>
            <div style={{ height:3, borderRadius:10, background:"rgba(255,255,255,0.15)", overflow:"hidden", marginBottom:4 }}>
              <div style={{ height:"100%", width:`${progress}%`, background:C.grad, borderRadius:10, transition:"width 0.3s linear" }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:8, color:"rgba(255,255,255,0.5)" }}>
              <span>49:12</span><span>2:21:00</span>
            </div>
          </div>
          {/* buttons */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", fontSize:14, cursor:"pointer" }}>⏮</button>
            <button onClick={()=>setPlaying(!playing)} style={{
              width:38, height:38, borderRadius:"50%",
              background:C.grad, border:"none", color:"#fff",
              fontSize:16, cursor:"pointer",
              boxShadow:"0 4px 16px rgba(255,107,157,0.5)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>{playing ? "⏸" : "▶"}</button>
            <button style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", fontSize:14, cursor:"pointer" }}>⏭</button>
            <div style={{ flex:1 }}/>
            <button style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", fontSize:12, cursor:"pointer" }}>🔊</button>
            <button style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", fontSize:12, cursor:"pointer" }}>⛶</button>
          </div>
        </div>
      </div>

      {/* reactions bar */}
      <div style={{ position:"relative", zIndex:2, padding:"10px 16px", background:"rgba(0,0,0,0.3)", display:"flex", gap:6, justifyContent:"center" }}>
        {reactions.map(r=>(
          <button key={r} onClick={()=>{ setReacted(r); setTimeout(()=>setReacted(null),900); }} style={{
            width:36, height:36, borderRadius:12, background:C.s, border:`1px solid ${C.b}`,
            fontSize:18, cursor:"pointer", transition:"transform 0.1s",
          }}>{r}</button>
        ))}
      </div>

      {/* tabs */}
      <div style={{ position:"relative", zIndex:2, display:"flex", borderBottom:`1px solid ${C.b}`, background:"rgba(0,0,0,0.2)" }}>
        {["now","playlist","chat"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1, padding:"10px 0", border:"none", background:"transparent",
            color: tab===t ? C.pink : C.muted,
            fontSize:11, fontWeight:700, cursor:"pointer",
            fontFamily:"'Nunito',sans-serif", letterSpacing:"0.5px",
            borderBottom: tab===t ? `2px solid ${C.pink}` : "2px solid transparent",
            textTransform:"capitalize",
          }}>{t==="now"?"Now Playing":t==="playlist"?"Playlist":"💬 Chat"}</button>
        ))}
      </div>

      {/* tab content */}
      <div style={{ flex:1, overflowY:"auto", position:"relative", zIndex:2 }}>
        {tab==="now" && (
          <div className="tab-active" style={{ padding:"14px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:C.text, fontWeight:500 }}>Tamasha</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>2014 · Romance · Drama · Imtiaz Ali</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:10, color:C.teal, fontWeight:700 }}>● LIVE SYNC</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Arjun watching too</div>
              </div>
            </div>
            {/* sync status */}
            <div style={{ padding:"12px 14px", borderRadius:16, background:"rgba(77,255,224,0.06)", border:"1px solid rgba(77,255,224,0.18)", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:11, color:C.muted }}>Your position</span>
                <span style={{ fontSize:11, color:C.teal, fontWeight:700 }}>49:12</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:C.muted }}>Arjun's position</span>
                <span style={{ fontSize:11, color:C.teal, fontWeight:700 }}>49:12 ✓</span>
              </div>
              <div style={{ marginTop:8, padding:"5px 10px", borderRadius:50, background:"rgba(77,255,224,0.1)", display:"inline-flex", gap:5, alignItems:"center" }}>
                <span style={{ fontSize:9, color:C.teal, fontWeight:800 }}>✦ PERFECTLY SYNCED</span>
              </div>
            </div>
            {/* how sync works */}
            <div style={{ padding:"12px 14px", borderRadius:16, background:C.s, border:`1px solid ${C.b}` }}>
              <div style={{ fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.8px", marginBottom:8 }}>HOW IT WORKS</div>
              {["Play/Pause — both screens sync instantly","Seek forward — partner jumps too","One person controls, other follows","Chat while watching together 💬"].map((t,i)=>(
                <div key={i} style={{ fontSize:11, color:C.muted, marginBottom:5, display:"flex", gap:8 }}>
                  <span style={{ color:C.pink }}>✦</span>{t}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="playlist" && (
          <div className="tab-active" style={{ padding:"14px 18px" }}>
            <div style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Couple's Watchlist</div>
            {playlist.map((p,i)=>(
              <div key={i} style={{
                padding:"12px 14px", borderRadius:18, marginBottom:10,
                background: p.active ? "rgba(255,107,157,0.08)" : C.s,
                border: p.active ? "1.5px solid rgba(255,107,157,0.3)" : `1px solid ${C.b}`,
                display:"flex", gap:12, alignItems:"center",
              }}>
                <div style={{ width:44, height:44, borderRadius:14, background: p.active ? C.grad : "rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{p.thumb}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color: p.active ? C.text : C.muted, fontWeight:700 }}>{p.title}</div>
                  <div style={{ fontSize:10, color:C.dim, marginTop:2 }}>{p.genre} · {p.dur}</div>
                </div>
                {p.active
                  ? <div style={{ fontSize:10, color:C.pink, fontWeight:800 }}>▶ NOW</div>
                  : <div style={{ fontSize:10, color:C.muted }}>▷ Play</div>
                }
              </div>
            ))}
            <button style={{
              width:"100%", padding:"13px", borderRadius:14, marginTop:4,
              background:C.grad, border:"none", color:"#fff",
              fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif",
              boxShadow:"0 6px 22px rgba(255,107,157,0.35)",
            }}>+ Add to Watchlist</button>
          </div>
        )}

        {tab==="chat" && (
          <div className="tab-active" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
            <div style={{ flex:1, padding:"12px 18px", display:"flex", flexDirection:"column", gap:8 }}>
              {chats.map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent: m.me?"flex-end":"flex-start" }}>
                  <div style={{
                    maxWidth:"72%", padding:"9px 13px",
                    borderRadius: m.me?"16px 16px 4px 16px":"16px 16px 16px 4px",
                    background: m.me ? C.grad : C.s,
                    border: m.me ? "none" : `1px solid ${C.b}`,
                    fontSize:12, color:C.text, lineHeight:1.5,
                  }}>
                    <div>{m.text}</div>
                    <div style={{ fontSize:9, color: m.me?"rgba(255,255,255,0.5)":C.dim, marginTop:3, textAlign:"right" }}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:"8px 14px 12px", borderTop:`1px solid ${C.b}`, display:"flex", gap:8 }}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} placeholder="React to the scene..." style={{
                flex:1, padding:"10px 14px", borderRadius:50,
                background:"rgba(255,255,255,0.05)", border:`1px solid ${C.b}`,
                color:C.text, fontSize:12, outline:"none", fontFamily:"'Nunito',sans-serif",
              }}/>
              <button style={{ width:36, height:36, borderRadius:"50%", background:C.grad, border:"none", fontSize:14, cursor:"pointer" }}>↑</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MUSIC TOGETHER SCREEN
════════════════════════════════════════════════════════════ */
const MusicTogetherScreen = ({ onBack }) => {
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const [tab, setTab] = useState("player");
  const [progress, setProgress] = useState(42);
  const vinylRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => playing && setProgress(p => p >= 100 ? 0 : p+0.2), 200);
    return () => clearInterval(t);
  }, [playing]);

  const queue = [
    { title:"Tum Hi Ho",        artist:"Arijit Singh",    dur:"4:22", thumb:"💕", active:true  },
    { title:"Kesariya",         artist:"Arijit Singh",    dur:"4:28", thumb:"🌸", active:false },
    { title:"Raataan Lambiyaan",artist:"Jubin Nautiyal",  dur:"3:54", thumb:"🌙", active:false },
    { title:"Teri Baaton Mein", artist:"Pritam",          dur:"3:41", thumb:"🌟", active:false },
    { title:"Pehle Bhi Main",   artist:"Vishal Mishra",   dur:"4:10", thumb:"🎶", active:false },
  ];

  return (
    <div style={{ height:680, position:"relative", overflowY:"auto" }} className="screen">
      <Bg c1={C.purple} c2={C.blue} c3={C.pink}/>

      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:C.text, fontWeight:500 }}>Music Together</h2>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.teal, animation:"pulse 1.2s ease infinite" }}/>
            <span style={{ fontSize:10, color:C.teal, fontWeight:700 }}>Arjun listening with you</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["👧","👦"].map((a,i)=>(
            <div key={i} style={{ width:32, height:32, borderRadius:11, background: i===0 ? C.grad : "linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, border:"1.5px solid rgba(255,255,255,0.2)" }}>{a}</div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div style={{ position:"relative", zIndex:2, display:"flex", gap:6, padding:"8px 20px 12px" }}>
        {["player","queue","shared"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"7px 14px", borderRadius:50, border:"none", cursor:"pointer",
            fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700,
            background: tab===t ? C.gradB : C.s,
            color: tab===t ? "#fff" : C.muted,
            boxShadow: tab===t ? "0 4px 14px rgba(107,157,255,0.3)" : "none",
          }}>{t==="player"?"Now Playing":t==="queue"?"Queue":"Shared Playlist"}</button>
        ))}
      </div>

      {tab==="player" && (
        <div className="tab-active" style={{ position:"relative", zIndex:2, padding:"0 22px 20px" }}>
          {/* vinyl record */}
          <div style={{ display:"flex", justifyContent:"center", margin:"8px 0 20px" }}>
            <div style={{ position:"relative", width:180, height:180 }}>
              {/* glow rings */}
              {[0,1].map(i=>(
                <div key={i} style={{
                  position:"absolute", inset:`${-8-i*12}px`,
                  borderRadius:"50%", border:`1px solid rgba(196,77,255,${0.2-i*0.08})`,
                  animation: playing ? `orbRing ${3+i}s linear infinite` : "none",
                }}/>
              ))}
              {/* vinyl */}
              <div style={{
                width:180, height:180, borderRadius:"50%",
                background:`conic-gradient(
                  #1a0a2e 0deg, #2d1050 40deg, #1a0a2e 80deg,
                  #2a0d45 120deg, #1a0a2e 160deg, #3d1560 200deg,
                  #1a0a2e 240deg, #2d1050 280deg, #1a0a2e 320deg, #2a0d45 360deg
                )`,
                border:"3px solid rgba(196,77,255,0.25)",
                boxShadow:"0 8px 40px rgba(196,77,255,0.35)",
                animation: playing ? "vinyl 3s linear infinite" : "none",
                display:"flex", alignItems:"center", justifyContent:"center",
                position:"relative", flexShrink:0,
              }}>
                {/* grooves */}
                {[50,70,90,110,130].map(r=>(
                  <div key={r} style={{ position:"absolute", width:r, height:r, borderRadius:"50%", border:"0.5px solid rgba(255,255,255,0.04)" }}/>
                ))}
                {/* center */}
                <div style={{ width:52, height:52, borderRadius:"50%", background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:"0 4px 20px rgba(255,107,157,0.5)", zIndex:1 }}>💕</div>
              </div>
            </div>
          </div>

          {/* song info */}
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500, marginBottom:4 }}>Tum Hi Ho</h3>
            <p style={{ fontSize:12, color:C.muted }}>Arijit Singh · Aashiqui 2</p>
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:8 }}>
              <div style={{ padding:"4px 12px", borderRadius:50, background:"rgba(196,77,255,0.1)", border:"1px solid rgba(196,77,255,0.2)", fontSize:10, color:C.purple, fontWeight:700 }}>💕 Couple's Fav</div>
              <div style={{ padding:"4px 12px", borderRadius:50, background:"rgba(77,255,224,0.08)", border:"1px solid rgba(77,255,224,0.2)", fontSize:10, color:C.teal, fontWeight:700 }}>● Synced</div>
            </div>
          </div>

          {/* eq visualizer */}
          {playing && (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"flex-end", gap:3, height:24, marginBottom:14 }}>
              {[...Array(18)].map((_,i)=>(
                <div key={i} style={{
                  width:3, background:`linear-gradient(to top,${C.purple},${C.pink})`,
                  borderRadius:2,
                  animation:`waveBar ${0.4+Math.random()*0.4}s ease ${Math.random()*0.3}s infinite`,
                  transformOrigin:"bottom",
                  minHeight:4,
                }}/>
              ))}
            </div>
          )}

          {/* progress */}
          <div style={{ marginBottom:16 }}>
            <div style={{ height:4, borderRadius:10, background:"rgba(255,255,255,0.08)", overflow:"hidden", marginBottom:6 }}>
              <div style={{ height:"100%", width:`${progress}%`, background:C.gradB, borderRadius:10, transition:"width 0.2s linear" }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.dim }}>
              <span>1:46</span><span>4:22</span>
            </div>
          </div>

          {/* controls */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <button style={{ background:"none", border:"none", color:C.muted, fontSize:18, cursor:"pointer" }}>🔀</button>
            <button style={{ background:"none", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>⏮</button>
            <button onClick={()=>setPlaying(!playing)} style={{
              width:56, height:56, borderRadius:"50%",
              background:C.gradB, border:"none", color:"#fff",
              fontSize:22, cursor:"pointer",
              boxShadow:"0 8px 28px rgba(107,157,255,0.45)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>{playing ? "⏸" : "▶"}</button>
            <button style={{ background:"none", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>⏭</button>
            <button onClick={()=>setLiked(!liked)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color: liked ? C.pink : C.muted, animation: liked ? "heartBeat 0.5s ease" : "none" }}>
              {liked ? "❤️" : "🤍"}
            </button>
          </div>

          {/* both listening */}
          <div style={{ padding:"12px 14px", borderRadius:16, background:"rgba(107,157,255,0.07)", border:"1px solid rgba(107,157,255,0.2)", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", gap:4 }}>
              {["👧","👦"].map((a,i)=>(
                <div key={i} style={{ width:28, height:28, borderRadius:10, background: i===0?C.grad:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{a}</div>
              ))}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:C.text, fontWeight:700 }}>Both listening together</div>
              <div style={{ fontSize:10, color:C.muted }}>Same song · Same moment 🎵</div>
            </div>
          </div>
        </div>
      )}

      {tab==="queue" && (
        <div className="tab-active" style={{ padding:"0 20px 20px" }}>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Up Next</div>
          {queue.map((s,i)=>(
            <div key={i} style={{
              padding:"11px 14px", borderRadius:16, marginBottom:8,
              background: s.active ? "rgba(107,157,255,0.08)" : C.s,
              border: s.active ? "1.5px solid rgba(107,157,255,0.3)" : `1px solid ${C.b}`,
              display:"flex", gap:10, alignItems:"center",
            }}>
              <div style={{ width:38, height:38, borderRadius:12, background: s.active ? C.gradB : "rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{s.thumb}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color: s.active?C.text:C.muted, fontWeight:700 }}>{s.title}</div>
                <div style={{ fontSize:10, color:C.dim }}>{s.artist} · {s.dur}</div>
              </div>
              {s.active
                ? <div style={{ display:"flex", gap:2, alignItems:"flex-end", height:16 }}>
                    {[0,1,2].map(j=>(<div key={j} style={{ width:2.5, background:C.blue, borderRadius:1, animation:`waveBar 0.5s ease ${j*0.15}s infinite`, transformOrigin:"bottom", minHeight:3 }}/>))}
                  </div>
                : <div style={{ fontSize:12, color:C.dim }}>⋮</div>
              }
            </div>
          ))}
        </div>
      )}

      {tab==="shared" && (
        <div className="tab-active" style={{ padding:"0 20px 20px" }}>
          <div style={{ padding:"14px", borderRadius:18, background:"rgba(196,77,255,0.07)", border:"1px solid rgba(196,77,255,0.2)", marginBottom:14 }}>
            <div style={{ fontSize:12, color:C.purple, fontWeight:700, marginBottom:2 }}>💜 Our Playlist</div>
            <div style={{ fontSize:10, color:C.muted }}>42 songs · 2h 48m · Made together</div>
          </div>
          {["Tum Hi Ho","Kesariya","Teri Baaton Mein","Pehle Bhi Main","Raataan Lambiyaan","Ae Dil Hai Mushkil"].map((s,i)=>(
            <div key={i} style={{ padding:"10px 12px", borderRadius:14, marginBottom:6, background:C.s, border:`1px solid ${C.b}`, display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:11, color:C.dim, width:18 }}>{i+1}</span>
              <div style={{ flex:1, fontSize:12, color:C.muted, fontWeight:600 }}>{s}</div>
              <span style={{ fontSize:14, color: i<2 ? C.pink : C.dim }}>{i<2?"❤️":"🤍"}</span>
            </div>
          ))}
          <button style={{
            width:"100%", padding:"13px", borderRadius:14, marginTop:8,
            background:C.gradB, border:"none", color:"#fff",
            fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif",
          }}>+ Add Song Together</button>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   VIDEO CALL SCREEN
════════════════════════════════════════════════════════════ */
const VideoCallScreen = ({ onBack }) => {
  const [callState, setCallState] = useState("ringing"); // ringing | active | ended
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [duration, setDuration] = useState(0);
  const [showEffects, setShowEffects] = useState(false);
  const [filter, setFilter] = useState(null);
  const [reaction, setReaction] = useState(null);

  useEffect(() => {
    if (callState === "ringing") {
      const t = setTimeout(() => setCallState("active"), 2500);
      return () => clearTimeout(t);
    }
  }, [callState]);

  useEffect(() => {
    if (callState === "active") {
      const t = setInterval(() => setDuration(d => d+1), 1000);
      return () => clearInterval(t);
    }
  }, [callState]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const filters = [
    { id:"heart",   icon:"💕", label:"Love" },
    { id:"stars",   icon:"✨", label:"Stars" },
    { id:"blur",    icon:"🌸", label:"Soft" },
    { id:"warm",    icon:"🌅", label:"Warm" },
  ];

  const reactions2 = ["❤️","😘","🥰","💋","✨","😂"];

  return (
    <div style={{ height:680, position:"relative", background:"#000", overflow:"hidden" }} className="screen">

      {/* RINGING STATE */}
      {callState === "ringing" && (
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#0a0812,#1a0d28)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, zIndex:10 }}>
          <Bg c1={C.pink} c2={C.purple}/>
          {/* ripple rings */}
          {[0,0.5,1].map((d,i)=>(
            <div key={i} style={{ position:"absolute", width:160+i*50, height:160+i*50, borderRadius:"50%", border:"1.5px solid rgba(255,107,157,0.2)", animation:`callRing 2s ease ${d}s infinite`, zIndex:1 }}/>
          ))}
          <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
            <div style={{
              width:100, height:100, borderRadius:32,
              background:"linear-gradient(135deg,#ff6b9d,#c44dff)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:52, margin:"0 auto 16px",
              boxShadow:"0 12px 48px rgba(255,107,157,0.5)",
              animation:"glow 2s ease infinite",
            }}>👦</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:C.text, fontWeight:500, marginBottom:6 }}>Arjun</h3>
            <p style={{ fontSize:12, color:C.muted, animation:"blink 1s ease infinite" }}>Calling...</p>
          </div>
          <div style={{ position:"relative", zIndex:2, display:"flex", gap:24, marginTop:20 }}>
            <button onClick={()=>setCallState("ended")} style={{ width:64, height:64, borderRadius:"50%", background:"#ff4444", border:"none", fontSize:26, cursor:"pointer", boxShadow:"0 6px 24px rgba(255,68,68,0.4)" }}>📵</button>
            <button onClick={()=>setCallState("active")} style={{ width:64, height:64, borderRadius:"50%", background:"#22cc44", border:"none", fontSize:26, cursor:"pointer", boxShadow:"0 6px 24px rgba(34,204,68,0.4)" }}>📞</button>
          </div>
        </div>
      )}

      {/* ACTIVE CALL */}
      {callState === "active" && (
        <>
          {/* partner video (full screen) */}
          <div style={{
            position:"absolute", inset:0,
            background: filter === "warm"
              ? "linear-gradient(135deg,#2d1a00,#4d2000,#1a0d00)"
              : "linear-gradient(135deg,#0d0a18,#1a1030,#0a0818)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <div style={{ fontSize:90, opacity:0.15, filter: filter==="blur"?"blur(3px)":"none" }}>👦</div>
            {/* filter overlays */}
            {filter === "heart" && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:20, opacity:0.15, fontSize:24 }}>
                {[...Array(20)].map((_,i)=><span key={i}>❤️</span>)}
              </div>
            )}
            {filter === "stars" && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:16, opacity:0.2, fontSize:18 }}>
                {[...Array(25)].map((_,i)=><span key={i}>✨</span>)}
              </div>
            )}
          </div>

          {/* floating reaction */}
          {reaction && (
            <div style={{ position:"absolute", top:"30%", left:"45%", fontSize:52, zIndex:20, animation:"ripple 0.8s ease forwards" }}>{reaction}</div>
          )}

          {/* top bar */}
          <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:10, padding:"36px 16px 12px", background:"linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:14, color:"#fff", fontWeight:700 }}>Arjun</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#4dff9d", animation:"pulse 1s ease infinite" }}/>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>{fmt(duration)}</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setShowEffects(!showEffects)} style={{
                padding:"6px 12px", borderRadius:50,
                background:"rgba(255,255,255,0.15)", border:"none",
                color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer",
              }}>✨ Effects</button>
            </div>
          </div>

          {/* my video (pip) */}
          <div style={{
            position:"absolute", bottom:120, right:12, zIndex:10,
            width:80, height:106, borderRadius:14,
            background:"linear-gradient(135deg,#ff6b9d44,#c44dff44)",
            border:"2px solid rgba(255,107,157,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:32, overflow:"hidden",
            boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
          }}>
            {cam ? "👧" : <span style={{ fontSize:14 }}>📷<br/><span style={{ fontSize:9, color:"rgba(255,255,255,0.5)" }}>OFF</span></span>}
            {!cam && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"rgba(255,255,255,0.4)" }}>Camera off</div>}
          </div>

          {/* effects panel */}
          {showEffects && (
            <div style={{
              position:"absolute", bottom:170, left:0, right:0, zIndex:15,
              padding:"14px", background:"rgba(10,8,18,0.92)", backdropFilter:"blur(20px)",
              borderTop:`1px solid ${C.b}`,
              animation:"slideUp 0.25s ease both",
            }}>
              <div style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Filters</div>
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                {filters.map(f=>(
                  <button key={f.id} onClick={()=>setFilter(filter===f.id?null:f.id)} style={{
                    flex:1, padding:"10px 4px", borderRadius:12, border:"none", cursor:"pointer",
                    background: filter===f.id ? C.gradSoft||"rgba(255,107,157,0.15)" : C.s,
                    border: filter===f.id ? "1.5px solid rgba(255,107,157,0.4)" : `1px solid ${C.b}`,
                  }}>
                    <div style={{ fontSize:20, marginBottom:2 }}>{f.icon}</div>
                    <div style={{ fontSize:9, color: filter===f.id ? C.pink : C.muted, fontWeight:700 }}>{f.label}</div>
                  </button>
                ))}
              </div>
              <div style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Send Reaction</div>
              <div style={{ display:"flex", gap:8 }}>
                {reactions2.map(r=>(
                  <button key={r} onClick={()=>{ setReaction(r); setTimeout(()=>setReaction(null),900); }} style={{
                    flex:1, padding:"8px 0", borderRadius:10, background:C.s, border:`1px solid ${C.b}`, fontSize:18, cursor:"pointer",
                  }}>{r}</button>
                ))}
              </div>
            </div>
          )}

          {/* bottom controls */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, zIndex:10,
            padding:"12px 16px 24px",
            background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-around" }}>
              {/* mic */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <button onClick={()=>setMic(!mic)} style={{
                  width:52, height:52, borderRadius:"50%", cursor:"pointer",
                  background: mic ? "rgba(255,255,255,0.15)" : "rgba(255,68,68,0.25)",
                  border: mic ? "1.5px solid rgba(255,255,255,0.2)" : "1.5px solid rgba(255,68,68,0.4)",
                  fontSize:22, display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {mic ? "🎙️" : "🔇"}
                </button>
                {mic && (
                  <div style={{ display:"flex", gap:1.5, alignItems:"flex-end", height:10 }}>
                    {[0,1,2].map(i=>(<div key={i} style={{ width:2.5, background:"rgba(255,255,255,0.5)", borderRadius:1, animation:`micWave 0.4s ease ${i*0.12}s infinite`, transformOrigin:"bottom", minHeight:2 }}/>))}
                  </div>
                )}
                <span style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>Mic</span>
              </div>

              {/* end call */}
              <button onClick={()=>setCallState("ended")} style={{
                width:64, height:64, borderRadius:"50%",
                background:"#ff3b30", border:"none", fontSize:26,
                cursor:"pointer", boxShadow:"0 6px 28px rgba(255,59,48,0.5)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>📵</button>

              {/* camera */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <button onClick={()=>setCam(!cam)} style={{
                  width:52, height:52, borderRadius:"50%", cursor:"pointer",
                  background: cam ? "rgba(255,255,255,0.15)" : "rgba(255,68,68,0.25)",
                  border: cam ? "1.5px solid rgba(255,255,255,0.2)" : "1.5px solid rgba(255,68,68,0.4)",
                  fontSize:22, display:"flex", alignItems:"center", justifyContent:"center",
                }}>{cam ? "📹" : "🚫"}</button>
                <span style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>Camera</span>
              </div>
            </div>

            {/* extra actions */}
            <div style={{ display:"flex", justifyContent:"center", gap:14, marginTop:10 }}>
              {[["💌","Note"],["🔀","Switch"],["⚙️","More"]].map(([ic,lb])=>(
                <button key={lb} style={{ background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer" }}>
                  <span style={{ fontSize:16 }}>{ic}</span>
                  <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>{lb}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ENDED STATE */}
      {callState === "ended" && (
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#0a0812,#1a0d28)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, zIndex:10 }}>
          <Bg c1={C.purple} c2={C.blue}/>
          <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:12, animation:"heartBeat 1s ease" }}>💕</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500, marginBottom:6 }}>Call Ended</h3>
            <p style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Duration: {fmt(duration)}</p>
            <p style={{ fontSize:11, color:C.muted }}>with Arjun</p>
          </div>
          <div style={{ position:"relative", zIndex:2, display:"flex", gap:10 }}>
            <button onClick={()=>setCallState("ringing")} style={{
              padding:"13px 24px", borderRadius:50,
              background:C.grad, border:"none", color:"#fff",
              fontSize:13, fontWeight:700, cursor:"pointer",
              fontFamily:"'Nunito',sans-serif",
              boxShadow:"0 6px 24px rgba(255,107,157,0.4)",
            }}>📞 Call Again</button>
            <button style={{
              padding:"13px 24px", borderRadius:50,
              background:C.s, border:`1px solid ${C.b}`, color:C.muted,
              fontSize:13, fontWeight:700, cursor:"pointer",
              fontFamily:"'Nunito',sans-serif",
            }}>💬 Message</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════════ */
export default function App() {
  const [active, setActive] = useState(null);

  const screens = [
    { id:"hub",   label:"🏠 Together Hub",     accent:C.pink,   Component: () => <TogetherHub onSelect={setActive}/> },
    { id:"watch", label:"🎬 Watch Together",    accent:C.pink,   Component: () => <WatchTogetherScreen onBack={()=>setActive("hub")}/> },
    { id:"music", label:"🎵 Music Together",    accent:C.purple, Component: () => <MusicTogetherScreen onBack={()=>setActive("hub")}/> },
    { id:"call",  label:"📹 Video Call",         accent:C.teal,   Component: () => <VideoCallScreen onBack={()=>setActive("hub")}/> },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 20px 60px", fontFamily:"'Nunito',sans-serif" }}>
      <G/>

      {/* header */}
      <div style={{ maxWidth:1400, margin:"0 auto 12px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:12, marginBottom:8 }}>
          <div style={{
            width:46, height:46, borderRadius:16,
            background:"linear-gradient(135deg,#ff6b9d,#c44dff)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 6px 24px rgba(255,107,157,0.4)",
            animation:"heartBeat 2.4s ease-in-out infinite",
          }}>
            <svg width="26" height="24" viewBox="0 0 24 22" fill="none">
              <path d="M12 20.5C12 20.5 1 13.5 1 6.5C1 3.46 3.46 1 6.5 1C9 1 11.1 2.56 12 4.78C12.9 2.56 15 1 17.5 1C20.54 1 23 3.46 23 6.5C23 13.5 12 20.5 12 20.5Z" fill="white" fillOpacity="0.95"/>
            </svg>
          </div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:500, background:"linear-gradient(135deg,#ff6b9d,#c44dff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LoveSpace</span>
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.22)", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:8 }}>Together Mode · UI Kit</div>
        <div style={{ display:"inline-flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
          {["🎬 Watch Sync","🎵 Music Sync","📹 Video Call","💬 Live Chat","✨ Filters & Effects"].map(tag=>(
            <span key={tag} style={{ padding:"4px 12px", borderRadius:50, background:"rgba(255,107,157,0.07)", border:"1px solid rgba(255,107,157,0.14)", fontSize:10, color:"rgba(255,107,157,0.65)", fontWeight:700 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* nav */}
      <div style={{ maxWidth:1400, margin:"20px auto 28px", display:"flex", justifyContent:"center", flexWrap:"wrap", gap:8 }}>
        {screens.map(s=>(
          <button key={s.id} onClick={()=>setActive(active===s.id?null:s.id)} style={{
            padding:"10px 22px", borderRadius:50, cursor:"pointer",
            fontSize:12, fontWeight:700, fontFamily:"'Nunito',sans-serif",
            background: active===s.id ? "linear-gradient(135deg,#ff6b9d,#c44dff)" : "rgba(255,255,255,0.04)",
            border: active===s.id ? "none" : "1px solid rgba(255,255,255,0.08)",
            color: active===s.id ? "#fff" : "rgba(255,255,255,0.4)",
            boxShadow: active===s.id ? "0 4px 20px rgba(255,107,157,0.35)" : "none",
            transition:"all 0.25s",
          }}>{s.label}</button>
        ))}
        <button onClick={()=>setActive(null)} style={{
          padding:"10px 22px", borderRadius:50, cursor:"pointer",
          fontSize:12, fontWeight:700, fontFamily:"'Nunito',sans-serif",
          background: !active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
          border:"1px solid rgba(255,255,255,0.08)",
          color: !active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
          transition:"all 0.25s",
        }}>Show All</button>
      </div>

      {/* phones */}
      <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:36 }}>
        {screens.filter(s => !active || active===s.id).map(s=>{
          const Comp = s.Component;
          return (
            <Phone key={s.id} label={s.label} accent={s.accent}>
              <Comp/>
            </Phone>
          );
        })}
      </div>
    </div>
  );
}
