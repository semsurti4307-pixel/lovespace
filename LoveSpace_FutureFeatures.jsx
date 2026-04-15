import { useState, useEffect, useRef } from "react";

/* ─── GLOBAL STYLES ─────────────────────────────────────── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Nunito:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { background:#0a0812; }
    ::-webkit-scrollbar { width:3px; }
    ::-webkit-scrollbar-thumb { background:rgba(255,107,157,0.3); border-radius:2px; }
    input, textarea { caret-color:#ff6b9d; }
    input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.18); }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes heartBeat{ 0%,100%{transform:scale(1)} 14%{transform:scale(1.22)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} 70%{transform:scale(1)} }
    @keyframes pulse    { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.06);opacity:0.85} }
    @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(255,107,157,0.3)} 50%{box-shadow:0 0 50px rgba(255,107,157,0.65),0 0 100px rgba(196,77,255,0.25)} }
    @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes ripple   { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.5);opacity:0} }
    @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    @keyframes countUp  { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
    @keyframes waveBar  { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
    @keyframes orbitDot { from{transform:rotate(0deg) translateX(44px) rotate(0deg)} to{transform:rotate(360deg) translateX(44px) rotate(-360deg)} }
    @keyframes typeIn   { from{width:0} to{width:100%} }
    @keyframes starPop  { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.3) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
    @keyframes capsuleOpen { 0%{transform:scaleY(0);opacity:0;transform-origin:top} 100%{transform:scaleY(1);opacity:1} }

    .screen { animation: fadeUp 0.4s ease both; }
    .tab-content { animation: fadeUp 0.3s ease both; }
  `}</style>
);

/* ─── TOKENS ─────────────────────────────────────────────── */
const C = {
  bg:      "#0a0812",
  s:       "rgba(255,255,255,0.045)",
  b:       "rgba(255,255,255,0.08)",
  pink:    "#ff6b9d",
  purple:  "#c44dff",
  blue:    "#6b9dff",
  gold:    "#ffd166",
  mint:    "#4dffb3",
  grad:    "linear-gradient(135deg,#ff6b9d,#c44dff)",
  gradB:   "linear-gradient(135deg,#6b9dff,#c44dff)",
  gradG:   "linear-gradient(135deg,#4dffb3,#6b9dff)",
  gradGold:"linear-gradient(135deg,#ffd166,#ff9d6b)",
  soft:    "rgba(255,107,157,0.12)",
  text:    "rgba(255,255,255,0.88)",
  muted:   "rgba(255,255,255,0.38)",
  dim:     "rgba(255,255,255,0.15)",
};

/* ─── PHONE FRAME ─────────────────────────────────────────── */
const Phone = ({ children, label }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
    <div style={{
      width:320, height:660,
      background:"#100d18", borderRadius:46,
      border:"2px solid rgba(255,255,255,0.12)",
      boxShadow:"0 40px 100px rgba(0,0,0,0.75),inset 0 1px 0 rgba(255,255,255,0.07),0 0 0 6px rgba(255,255,255,0.025)",
      overflow:"hidden", position:"relative", flexShrink:0,
    }}>
      {/* notch */}
      <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:110, height:28, background:"#100d18", borderBottomLeftRadius:16, borderBottomRightRadius:16, zIndex:20, borderBottom:"1.5px solid rgba(255,255,255,0.05)" }}/>
      {/* status */}
      <div style={{ position:"absolute", top:8, left:20, right:20, display:"flex", justifyContent:"space-between", zIndex:21, fontSize:9, color:C.muted, fontWeight:700 }}>
        <span>9:41</span><span>●●● ▲ 🔋</span>
      </div>
      <div style={{ width:"100%", height:"100%", overflowY:"auto", overflowX:"hidden" }}>
        {children}
      </div>
    </div>
    <div style={{
      padding:"6px 20px", borderRadius:50,
      background:"rgba(255,255,255,0.04)", border:`1px solid ${C.b}`,
      fontSize:11, color:C.muted, letterSpacing:"1.4px", textTransform:"uppercase", fontWeight:700,
    }}>{label}</div>
  </div>
);

/* ─── BG MESH ─────────────────────────────────────────────── */
const Bg = ({ c1 = C.pink, c2 = C.purple }) => (
  <>
    <div style={{ position:"absolute", inset:0, background:`linear-gradient(160deg,#0a0812,#130d1e 60%,#0a0812)`, zIndex:0 }}/>
    <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:`radial-gradient(circle,${c1}18 0%,transparent 70%)`, top:-80, right:-60, zIndex:0 }}/>
    <div style={{ position:"absolute", width:220, height:220, borderRadius:"50%", background:`radial-gradient(circle,${c2}14 0%,transparent 70%)`, bottom:-50, left:-50, zIndex:0 }}/>
  </>
);

/* ─── BOTTOM NAV ──────────────────────────────────────────── */
const Nav = ({ active }) => {
  const tabs = [
    { id:"score",    icon:"💎", l:"Score" },
    { id:"capsule",  icon:"💌", l:"Capsule" },
    { id:"date",     icon:"🌙", l:"Date" },
    { id:"ai",       icon:"🤖", l:"AI Diary" },
  ];
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(10,8,18,0.96)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.b}`, display:"flex", padding:"10px 0 14px", zIndex:10 }}>
      {tabs.map(t=>(
        <div key={t.id} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer" }}>
          <span style={{ fontSize:19 }}>{t.icon}</span>
          <span style={{ fontSize:9, color: active===t.id ? C.pink : C.dim, fontWeight: active===t.id?700:400, letterSpacing:"0.4px" }}>{t.l}</span>
          {active===t.id && <div style={{ width:18, height:2.5, borderRadius:2, background:C.grad }}/>}
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCREEN 1 — LOVE SCORE + GAMES
════════════════════════════════════════════════════════════ */
const LoveScoreScreen = () => {
  const [gameTab, setGameTab] = useState("score");
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [quizAns, setQuizAns] = useState(null);
  const [spinDeg, setSpinDeg] = useState(0);

  const dares = ["Voice note bhejo 🎤","Good morning text 💌","3 things jo tujhe love karti hoon 🌸","Date plan karo aaj 🌙","1 min dance video 💃","Apni fav photo send karo 📸"];

  const spin = () => {
    if (spinning) return;
    setSpinning(true); setSpinResult(null);
    const extra = 1440 + Math.random() * 720;
    setSpinDeg(prev => prev + extra);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * dares.length);
      setSpinResult(dares[idx]);
      setSpinning(false);
    }, 2200);
  };

  const badges = [
    { icon:"🌟", label:"First Date", earned:true },
    { icon:"💌", label:"100 Messages", earned:true },
    { icon:"📸", label:"Memory Maker", earned:true },
    { icon:"🔥", label:"7 Day Streak", earned:true },
    { icon:"🎯", label:"Quiz Master", earned:false },
    { icon:"🌙", label:"Virtual Date", earned:false },
  ];

  return (
    <div style={{ height:660, position:"relative", overflowY:"auto" }} className="screen">
      <Bg c1={C.gold} c2={C.pink}/>

      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 14px" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>Love Score</h2>
        <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Your relationship achievements</p>
      </div>

      {/* tabs */}
      <div style={{ position:"relative", zIndex:2, display:"flex", gap:6, padding:"0 20px 14px" }}>
        {["score","spin","quiz"].map(t=>(
          <button key={t} onClick={()=>setGameTab(t)} style={{
            padding:"7px 16px", borderRadius:50, border:"none", cursor:"pointer",
            fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700,
            background: gameTab===t ? C.grad : C.s,
            color: gameTab===t ? "#fff" : C.muted,
            boxShadow: gameTab===t ? "0 4px 14px rgba(255,107,157,0.35)" : "none",
            textTransform:"capitalize",
          }}>{t==="spin"?"Dare Wheel":t==="quiz"?"Love Quiz":t==="score"?"Score & Badges":t}</button>
        ))}
      </div>

      {/* SCORE TAB */}
      {gameTab==="score" && (
        <div className="tab-content" style={{ position:"relative", zIndex:2, padding:"0 20px 90px" }}>
          {/* big score ring */}
          <div style={{ display:"flex", justifyContent:"center", margin:"8px 0 20px" }}>
            <div style={{ position:"relative", width:150, height:150 }}>
              <svg width="150" height="150" style={{ position:"absolute", top:0, left:0 }}>
                <circle cx="75" cy="75" r="64" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10"/>
                <circle cx="75" cy="75" r="64" fill="none"
                  stroke="url(#scoreGrad)" strokeWidth="10"
                  strokeDasharray="402" strokeDashoffset={402*(1-0.87)}
                  strokeLinecap="round"
                  transform="rotate(-90 75 75)"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#ff6b9d"/><stop offset="1" stopColor="#c44dff"/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:34, fontWeight:800, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"countUp 0.6s ease both" }}>87</span>
                <span style={{ fontSize:10, color:C.muted, letterSpacing:"0.8px" }}>LOVE SCORE</span>
              </div>
            </div>
          </div>

          {/* score bars */}
          {[
            { label:"Communication", val:92, color:C.grad },
            { label:"Quality Time",  val:78, color:C.gradB },
            { label:"Affection",     val:95, color:"linear-gradient(135deg,#ff9d6b,#ff6b9d)" },
            { label:"Support",       val:83, color:C.gradG },
          ].map(b=>(
            <div key={b.label} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>{b.label}</span>
                <span style={{ fontSize:11, fontWeight:700, background:b.color, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{b.val}%</span>
              </div>
              <div style={{ height:6, borderRadius:10, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${b.val}%`, borderRadius:10, background:b.color, transition:"width 1s ease" }}/>
              </div>
            </div>
          ))}

          {/* badges */}
          <div style={{ marginTop:20 }}>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Badges Earned</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {badges.map((b,i)=>(
                <div key={i} style={{
                  padding:"14px 8px", borderRadius:18, textAlign:"center",
                  background: b.earned ? "rgba(255,107,157,0.1)" : C.s,
                  border: b.earned ? "1px solid rgba(255,107,157,0.25)" : `1px solid ${C.b}`,
                  opacity: b.earned ? 1 : 0.4,
                }}>
                  <div style={{ fontSize:24, marginBottom:4, animation: b.earned?"starPop 0.5s ease both":"none", animationDelay:`${i*0.08}s` }}>{b.icon}</div>
                  <div style={{ fontSize:9, color: b.earned ? C.text : C.muted, fontWeight:600, lineHeight:1.3 }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SPIN TAB */}
      {gameTab==="spin" && (
        <div className="tab-content" style={{ position:"relative", zIndex:2, padding:"0 20px 90px", display:"flex", flexDirection:"column", alignItems:"center" }}>
          <p style={{ fontSize:12, color:C.muted, marginBottom:20, textAlign:"center" }}>Spin the wheel for a love dare! 💕</p>

          {/* wheel */}
          <div style={{ position:"relative", width:220, height:220, marginBottom:20 }}>
            {/* pointer */}
            <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", zIndex:3, fontSize:20 }}>▼</div>
            <div style={{
              width:220, height:220, borderRadius:"50%",
              background:`conic-gradient(
                #ff6b9d 0deg 60deg, #c44dff 60deg 120deg,
                #6b9dff 120deg 180deg, #ffd166 180deg 240deg,
                #4dffb3 240deg 300deg, #ff9d6b 300deg 360deg
              )`,
              border:"3px solid rgba(255,255,255,0.12)",
              boxShadow:"0 8px 40px rgba(255,107,157,0.3)",
              transform:`rotate(${spinDeg}deg)`,
              transition: spinning ? "transform 2.2s cubic-bezier(0.17,0.67,0.12,0.99)" : "none",
              display:"flex", alignItems:"center", justifyContent:"center",
              position:"relative",
            }}>
              <div style={{
                width:50, height:50, borderRadius:"50%",
                background:"rgba(10,8,18,0.9)", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:22, zIndex:2, border:"2px solid rgba(255,255,255,0.15)",
              }}>💕</div>
              {/* segment labels */}
              {["🎤","💌","🌸","🌙","💃","📸"].map((e,i)=>(
                <div key={i} style={{
                  position:"absolute", fontSize:16,
                  transform:`rotate(${i*60+30}deg) translateY(-72px)`,
                }}>{e}</div>
              ))}
            </div>
          </div>

          <button onClick={spin} disabled={spinning} style={{
            padding:"14px 40px", borderRadius:50,
            background: spinning ? "rgba(255,255,255,0.05)" : C.grad,
            border:"none", color: spinning?"rgba(255,255,255,0.3)":"#fff",
            fontSize:14, fontWeight:700, cursor: spinning?"not-allowed":"pointer",
            boxShadow: spinning ? "none" : "0 6px 24px rgba(255,107,157,0.4)",
            fontFamily:"'Nunito',sans-serif", transition:"all 0.3s",
          }}>
            {spinning ? "🌀 Spinning..." : "Spin! ✨"}
          </button>

          {spinResult && (
            <div style={{
              marginTop:20, padding:"16px 20px", borderRadius:18,
              background:"rgba(255,107,157,0.1)", border:"1px solid rgba(255,107,157,0.3)",
              textAlign:"center", animation:"fadeUp 0.4s ease both",
              maxWidth:240,
            }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>YOUR DARE</div>
              <div style={{ fontSize:14, color:C.text, fontWeight:600 }}>{spinResult}</div>
            </div>
          )}

          {/* recent dares */}
          <div style={{ marginTop:24, width:"100%" }}>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Recent Dares</div>
            {["Voice note bheja 🎤 ✓","3 things shared 🌸 ✓","Date planned 🌙 ✓"].map((d,i)=>(
              <div key={i} style={{ padding:"10px 14px", borderRadius:12, background:C.s, border:`1px solid ${C.b}`, marginBottom:6, fontSize:12, color:C.muted }}>
                {d}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUIZ TAB */}
      {gameTab==="quiz" && (
        <div className="tab-content" style={{ position:"relative", zIndex:2, padding:"0 20px 90px" }}>
          <div style={{ padding:"16px", borderRadius:20, background:"rgba(196,77,255,0.1)", border:"1px solid rgba(196,77,255,0.25)", marginBottom:16 }}>
            <div style={{ fontSize:10, color:C.purple, letterSpacing:"1px", fontWeight:700, marginBottom:6 }}>QUESTION 3 OF 10</div>
            <div style={{ height:4, borderRadius:10, background:"rgba(255,255,255,0.07)", marginBottom:12, overflow:"hidden" }}>
              <div style={{ height:"100%", width:"30%", background:C.gradB }}/>
            </div>
            <div style={{ fontSize:15, color:C.text, fontWeight:600, lineHeight:1.5, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
              "What is my partner's favourite comfort food?"
            </div>
          </div>

          {["Biryani 🍚","Pizza 🍕","Momos 🥟","Maggi 🍜"].map((opt,i)=>(
            <button key={i} onClick={()=>setQuizAns(i)} style={{
              width:"100%", padding:"14px 18px", borderRadius:14, marginBottom:8,
              border: quizAns===i
                ? i===1 ? "1.5px solid #4dffb3" : "1.5px solid #ff6b6b"
                : `1px solid ${C.b}`,
              background: quizAns===i
                ? i===1 ? "rgba(77,255,179,0.1)" : "rgba(255,107,107,0.1)"
                : C.s,
              color: quizAns===i
                ? i===1 ? "#4dffb3" : "#ff6b6b"
                : C.text,
              fontSize:13, fontWeight:600, cursor:"pointer",
              fontFamily:"'Nunito',sans-serif", textAlign:"left",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              {opt}
              {quizAns===i && <span>{i===1?"✓":"✗"}</span>}
            </button>
          ))}

          {quizAns!==null && (
            <div style={{ padding:"12px 16px", borderRadius:14, background:"rgba(77,255,179,0.08)", border:"1px solid rgba(77,255,179,0.2)", fontSize:12, color:"#4dffb3", marginTop:4, animation:"fadeUp 0.3s ease both" }}>
              {quizAns===1 ? "🎉 Sahi jawab! +10 points!" : "😅 Oops! Arjun ko Pizza bahut pasand hai 🍕"}
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
            <div style={{ padding:"12px 16px", borderRadius:14, background:C.s, border:`1px solid ${C.b}`, textAlign:"center", flex:1, marginRight:8 }}>
              <div style={{ fontSize:18, fontWeight:800, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>60</div>
              <div style={{ fontSize:9, color:C.muted }}>Your Score</div>
            </div>
            <div style={{ padding:"12px 16px", borderRadius:14, background:C.s, border:`1px solid ${C.b}`, textAlign:"center", flex:1 }}>
              <div style={{ fontSize:18, fontWeight:800, background:C.gradB, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>80</div>
              <div style={{ fontSize:9, color:C.muted }}>Partner Score</div>
            </div>
          </div>

          <button style={{
            width:"100%", marginTop:14, padding:"14px", borderRadius:14,
            background:C.grad, border:"none", color:"#fff", fontSize:13,
            fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif",
            boxShadow:"0 6px 24px rgba(255,107,157,0.35)",
          }}>Next Question →</button>
        </div>
      )}

      <Nav active="score"/>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCREEN 2 — TIME CAPSULE
════════════════════════════════════════════════════════════ */
const TimeCapsuleScreen = () => {
  const [tab, setTab] = useState("vault");
  const [opened, setOpened] = useState(null);
  const [msg, setMsg] = useState("");
  const [date, setDate] = useState("");

  const capsules = [
    { id:1, title:"Our 6-Month Anniversary", from:"Priya", openDate:"Jun 14, 2025", locked:true,  emoji:"💍", color:"linear-gradient(135deg,#ff6b9d,#c44dff)", days:62 },
    { id:2, title:"Things I Love About You", from:"Arjun", openDate:"May 1, 2025",  locked:true,  emoji:"💌", color:"linear-gradient(135deg,#6b9dff,#4dffb3)", days:18 },
    { id:3, title:"Our First Memory",         from:"Priya", openDate:"Apr 5, 2025",  locked:false, emoji:"🌅", color:"linear-gradient(135deg,#ffd166,#ff9d6b)", days:0 },
  ];

  return (
    <div style={{ height:660, position:"relative", overflowY:"auto" }} className="screen">
      <Bg c1={C.blue} c2={C.purple}/>

      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>Time Capsule</h2>
          <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Messages from the past</p>
        </div>
        <div style={{ width:36, height:36, borderRadius:12, background:C.s, border:`1px solid ${C.b}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, cursor:"pointer" }}>⏰</div>
      </div>

      {/* tabs */}
      <div style={{ position:"relative", zIndex:2, display:"flex", gap:6, padding:"0 20px 16px" }}>
        {["vault","create"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"8px 20px", borderRadius:50, border:"none", cursor:"pointer",
            fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700,
            background: tab===t ? C.gradB : C.s,
            color: tab===t ? "#fff" : C.muted,
            boxShadow: tab===t ? "0 4px 16px rgba(107,157,255,0.3)" : "none",
            textTransform:"capitalize",
          }}>{t==="vault"?"📦 The Vault":"✍️ Create New"}</button>
        ))}
      </div>

      {/* VAULT */}
      {tab==="vault" && (
        <div className="tab-content" style={{ position:"relative", zIndex:2, padding:"0 20px 90px" }}>
          {capsules.map((cap,i)=>(
            <div key={cap.id}>
              <div
                onClick={()=> !cap.locked && setOpened(opened===cap.id ? null : cap.id)}
                style={{
                  borderRadius:20, marginBottom:12, overflow:"hidden", cursor: cap.locked?"not-allowed":"pointer",
                  border: cap.locked ? `1px solid ${C.b}` : "1px solid rgba(77,255,179,0.3)",
                  boxShadow: cap.locked ? "none" : "0 4px 20px rgba(77,255,179,0.1)",
                  transition:"all 0.3s",
                }}
              >
                {/* capsule top */}
                <div style={{ padding:"16px", background: cap.locked ? C.s : "rgba(77,255,179,0.07)", display:"flex", alignItems:"center", gap:14 }}>
                  {/* icon */}
                  <div style={{
                    width:52, height:52, borderRadius:16, background: cap.locked ? "rgba(255,255,255,0.05)" : cap.color,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0,
                    boxShadow: cap.locked ? "none" : "0 4px 16px rgba(255,107,157,0.3)",
                    filter: cap.locked ? "grayscale(0.6)" : "none",
                  }}>{cap.locked ? "🔒" : cap.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color: cap.locked ? C.muted : C.text, fontWeight:700, marginBottom:3 }}>{cap.title}</div>
                    <div style={{ fontSize:10, color:C.dim }}>From {cap.from} · {cap.openDate}</div>
                    {cap.locked && (
                      <div style={{
                        display:"inline-flex", alignItems:"center", gap:4, marginTop:5,
                        padding:"3px 10px", borderRadius:50,
                        background:"rgba(107,157,255,0.12)", border:"1px solid rgba(107,157,255,0.2)",
                      }}>
                        <span style={{ fontSize:9, color:C.blue, fontWeight:700 }}>Opens in {cap.days} days</span>
                      </div>
                    )}
                    {!cap.locked && (
                      <div style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:5, padding:"3px 10px", borderRadius:50, background:"rgba(77,255,179,0.1)", border:"1px solid rgba(77,255,179,0.25)" }}>
                        <span style={{ fontSize:9, color:C.mint, fontWeight:700 }}>✨ Ready to open!</span>
                      </div>
                    )}
                  </div>
                  {!cap.locked && <span style={{ fontSize:16, color:C.mint }}>{opened===cap.id?"↑":"↓"}</span>}
                </div>

                {/* opened content */}
                {opened===cap.id && !cap.locked && (
                  <div style={{
                    padding:"16px", borderTop:`1px solid rgba(77,255,179,0.15)`,
                    background:"rgba(77,255,179,0.04)",
                    animation:"capsuleOpen 0.3s ease both",
                  }}>
                    <div style={{ fontSize:11, color:C.mint, fontWeight:700, marginBottom:8, letterSpacing:"0.8px" }}>💌 MESSAGE UNLOCKED</div>
                    <p style={{ fontSize:13, color:C.text, lineHeight:1.7, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
                      "Jab tune pehli baar meri taraf dekha tha, main samajh gaya tha ki tum hi ho. Ye pehli memory hamesha mere dil mein rahegi. Tujhse pyaar hai. 🌅"
                    </p>
                    <div style={{ marginTop:10, fontSize:10, color:C.dim }}>Written on Apr 5, 2024 · 1 year ago</div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* timeline preview */}
          <div style={{ padding:"14px 16px", borderRadius:18, background:C.s, border:`1px solid ${C.b}`, marginTop:4 }}>
            <div style={{ fontSize:11, color:C.muted, fontWeight:700, marginBottom:10, letterSpacing:"0.8px" }}>UPCOMING UNLOCKS</div>
            {[
              { d:"May 1",  e:"💌", l:"Things I Love About You" },
              { d:"Jun 14", e:"💍", l:"6-Month Anniversary" },
            ].map((u,i)=>(
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"center" }}>
                <div style={{ width:38, height:38, borderRadius:12, background:"rgba(107,157,255,0.1)", border:"1px solid rgba(107,157,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{u.e}</div>
                <div>
                  <div style={{ fontSize:12, color:C.text, fontWeight:600 }}>{u.l}</div>
                  <div style={{ fontSize:10, color:C.muted }}>Opens {u.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE */}
      {tab==="create" && (
        <div className="tab-content" style={{ position:"relative", zIndex:2, padding:"0 20px 90px" }}>
          <div style={{ padding:"16px", borderRadius:20, background:"rgba(107,157,255,0.08)", border:"1px solid rgba(107,157,255,0.2)", marginBottom:16 }}>
            <div style={{ fontSize:12, color:C.blue, fontWeight:700, marginBottom:4 }}>✦ Create a Time Capsule</div>
            <div style={{ fontSize:11, color:C.muted }}>Write a message that unlocks on a special date</div>
          </div>

          {[
            { label:"Title", ph:"e.g. Our Anniversary Message", icon:"✦" },
          ].map(f=>(
            <div key={f.label} style={{ marginBottom:14 }}>
              <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:6, display:"flex", gap:5 }}>
                <span style={{ background:C.gradB, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{f.icon}</span>{f.label}
              </label>
              <input placeholder={f.ph} style={{
                width:"100%", padding:"13px 16px",
                background:"rgba(255,255,255,0.04)", border:`1px solid ${C.b}`,
                borderRadius:13, color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif",
              }}/>
            </div>
          ))}

          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:6, display:"block" }}>🔓 UNLOCK DATE</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{
              width:"100%", padding:"13px 16px",
              background:"rgba(255,255,255,0.04)", border:`1px solid ${C.b}`,
              borderRadius:13, color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif",
            }}/>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:6, display:"block" }}>💌 YOUR MESSAGE</label>
            <textarea
              rows={5} value={msg} onChange={e=>setMsg(e.target.value)}
              placeholder="Write something beautiful for future..."
              style={{
                width:"100%", padding:"13px 16px",
                background:"rgba(255,255,255,0.04)", border:`1px solid ${C.b}`,
                borderRadius:13, color:C.text, fontSize:13, outline:"none",
                fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                resize:"none", lineHeight:1.6,
              }}/>
            <div style={{ textAlign:"right", fontSize:10, color:C.dim, marginTop:4 }}>{msg.length}/500</div>
          </div>

          {/* extras */}
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {["📎 Attach photo","🎵 Add song","📍 Add location"].map((b,i)=>(
              <button key={i} style={{
                flex:1, padding:"9px 4px", borderRadius:12, border:`1px solid ${C.b}`,
                background:C.s, color:C.muted, fontSize:9, fontWeight:600,
                cursor:"pointer", fontFamily:"'Nunito',sans-serif",
              }}>{b}</button>
            ))}
          </div>

          <button style={{
            width:"100%", padding:"15px", borderRadius:14,
            background:C.gradB, border:"none", color:"#fff",
            fontSize:14, fontWeight:700, cursor:"pointer",
            fontFamily:"'Nunito',sans-serif",
            boxShadow:"0 8px 28px rgba(107,157,255,0.35)",
          }}>🔒 Seal the Capsule</button>
        </div>
      )}

      <Nav active="capsule"/>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCREEN 3 — VIRTUAL DATE MODE
════════════════════════════════════════════════════════════ */
const VirtualDateScreen = () => {
  const [scene, setScene] = useState(null);
  const [activity, setActivity] = useState(null);
  const [dateActive, setDateActive] = useState(false);

  const scenes = [
    { id:"beach",  emoji:"🏖️", label:"Beach Sunset",    color:"linear-gradient(135deg,#ff9d6b,#ffd166,#ff6b9d)" },
    { id:"cafe",   emoji:"☕",  label:"Cozy Café",       color:"linear-gradient(135deg,#c44dff,#6b9dff)" },
    { id:"stars",  emoji:"🌌", label:"Stargazing",      color:"linear-gradient(135deg,#1a0a2e,#6b9dff)" },
    { id:"garden", emoji:"🌸", label:"Cherry Garden",   color:"linear-gradient(135deg,#ff6b9d,#ffb3c6)" },
    { id:"snow",   emoji:"❄️",  label:"Winter Cabin",   color:"linear-gradient(135deg,#6b9dff,#b3d4ff)" },
    { id:"city",   emoji:"🌃", label:"City Rooftop",    color:"linear-gradient(135deg,#ffd166,#ff6b9d)" },
  ];

  const activities = [
    { icon:"🎬", label:"Watch Together", desc:"Sync a movie" },
    { icon:"🎵", label:"Share Music",    desc:"Create a playlist" },
    { icon:"🍽️", label:"Dinner Date",   desc:"Order same food" },
    { icon:"🎮", label:"Play Game",      desc:"2-player games" },
    { icon:"📖", label:"Read Together",  desc:"Same book, same page" },
    { icon:"🎨", label:"Art Date",       desc:"Draw for each other" },
  ];

  return (
    <div style={{ height:660, position:"relative", overflowY:"auto" }} className="screen">
      {/* dynamic background based on scene */}
      <div style={{
        position:"absolute", inset:0, zIndex:0,
        background: scene
          ? scenes.find(s=>s.id===scene)?.color
          : "linear-gradient(160deg,#0a0812,#130d1e)",
        opacity: scene ? 0.25 : 1,
        transition:"background 0.8s ease",
      }}/>
      <Bg c1={C.mint} c2={C.blue}/>

      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>Virtual Date</h2>
          <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Create a date from anywhere 🌍</p>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background: dateActive ? "#4dffb3" : "rgba(255,255,255,0.2)", animation: dateActive ? "pulse 1.2s ease infinite" : "none" }}/>
          <span style={{ fontSize:10, color: dateActive ? C.mint : C.muted, fontWeight:700 }}>{dateActive ? "Date Active" : "Offline"}</span>
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, padding:"0 20px 90px" }}>
        {/* partner status */}
        <div style={{ padding:"14px 16px", borderRadius:20, background: dateActive ? "rgba(77,255,179,0.07)" : C.s, border: dateActive ? "1px solid rgba(77,255,179,0.2)" : `1px solid ${C.b}`, marginBottom:18, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:16, background:"linear-gradient(135deg,#6b9dff,#4daaff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>👦</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:C.text, fontWeight:600 }}>Arjun</div>
            <div style={{ fontSize:10, color: dateActive ? C.mint : C.muted }}>{dateActive ? "✓ Joined the date!" : "Waiting for partner..."}</div>
          </div>
          <button onClick={()=>setDateActive(!dateActive)} style={{
            padding:"8px 16px", borderRadius:50, border:"none", cursor:"pointer",
            background: dateActive ? "rgba(255,107,107,0.15)" : C.gradG,
            color: dateActive ? "#ff6b6b" : "#0a1a12",
            fontSize:11, fontWeight:700, fontFamily:"'Nunito',sans-serif",
          }}>{dateActive ? "End Date" : "Start Date ✨"}</button>
        </div>

        {/* scene picker */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Choose Your Scene</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {scenes.map(s=>(
              <button key={s.id} onClick={()=>setScene(s.id===scene?null:s.id)} style={{
                padding:"14px 8px", borderRadius:16, border:"none", cursor:"pointer",
                background: scene===s.id
                  ? s.color
                  : C.s,
                border: scene===s.id ? "1.5px solid rgba(255,255,255,0.3)" : `1px solid ${C.b}`,
                transition:"all 0.3s",
                boxShadow: scene===s.id ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
              }}>
                <div style={{ fontSize:24, marginBottom:4 }}>{s.emoji}</div>
                <div style={{ fontSize:9, color: scene===s.id ? "rgba(255,255,255,0.9)" : C.muted, fontWeight:700, lineHeight:1.3 }}>{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* active scene banner */}
        {scene && (
          <div style={{
            padding:"16px", borderRadius:18, marginBottom:18,
            background: scenes.find(s=>s.id===scene)?.color,
            display:"flex", alignItems:"center", gap:12,
            boxShadow:"0 8px 32px rgba(0,0,0,0.3)",
            animation:"fadeUp 0.3s ease both",
          }}>
            <span style={{ fontSize:32 }}>{scenes.find(s=>s.id===scene)?.emoji}</span>
            <div>
              <div style={{ fontSize:14, color:"#fff", fontWeight:700 }}>
                {scenes.find(s=>s.id===scene)?.label}
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>Your virtual scene is set ✨</div>
            </div>
          </div>
        )}

        {/* activities */}
        <div>
          <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Date Activities</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {activities.map((a,i)=>(
              <div key={i} onClick={()=>setActivity(activity===i?null:i)} style={{
                padding:"14px", borderRadius:18, cursor:"pointer",
                background: activity===i ? "rgba(77,255,179,0.08)" : C.s,
                border: activity===i ? "1.5px solid rgba(77,255,179,0.3)" : `1px solid ${C.b}`,
                transition:"all 0.2s",
              }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{a.icon}</div>
                <div style={{ fontSize:12, color: activity===i ? C.mint : C.text, fontWeight:700 }}>{a.label}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{a.desc}</div>
                {activity===i && <div style={{ marginTop:6, fontSize:10, color:C.mint }}>✓ Selected</div>}
              </div>
            ))}
          </div>
        </div>

        {/* start button */}
        {(scene || activity!==null) && (
          <button style={{
            width:"100%", marginTop:16, padding:"15px", borderRadius:14,
            background:C.gradG, border:"none", color:"#0a1a12",
            fontSize:14, fontWeight:800, cursor:"pointer",
            fontFamily:"'Nunito',sans-serif",
            boxShadow:"0 8px 28px rgba(77,255,179,0.3)",
            animation:"fadeUp 0.3s ease both",
          }}>🌙 Begin Virtual Date</button>
        )}
      </div>

      <Nav active="date"/>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCREEN 4 — AI EMOTION DETECTION + LOVE DIARY
════════════════════════════════════════════════════════════ */
const AIDiaryScreen = () => {
  const [tab, setTab] = useState("detect");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [diaryText, setDiaryText] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [generating, setGenerating] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const moods = [
    { emoji:"😊", label:"Happy",    score:92, color:"#ffd166" },
    { emoji:"🥰", label:"Loved",    score:87, color:"#ff6b9d" },
    { emoji:"😌", label:"Calm",     score:74, color:"#4dffb3" },
    { emoji:"😔", label:"Missing",  score:45, color:"#6b9dff" },
  ];

  const diaryEntries = [
    { date:"Apr 12", mood:"🥰", preview:"Arjun ne surprise message diya...", highlight:true },
    { date:"Apr 10", mood:"😊", preview:"Video call pe 2 ghante baat ki...", highlight:false },
    { date:"Apr 8",  mood:"😔", preview:"Bahut miss kar rahi thi aaj...", highlight:false },
    { date:"Apr 6",  mood:"😌", preview:"Uski photo dekh ke neend aayi...", highlight:false },
  ];

  const analyze = () => {
    setAnalyzing(true); setAnalyzed(false);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 2000);
  };

  const generateAI = () => {
    if (!diaryText.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setAiReply("Teri feelings bilkul samajh aati hain 💕 Jab dono ek doosre se door hote hain, toh ye emptiness natural hai. Lekin yaad rakh — teri love story ka har chapter beautiful hai. Aaj Arjun ko ek chhota sa message bhej — shayad wo bhi tujhe yaad kar raha ho 🌙");
      setGenerating(false);
    }, 1800);
  };

  return (
    <div style={{ height:660, position:"relative", overflowY:"auto" }} className="screen">
      <Bg c1={C.purple} c2={C.pink}/>

      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 14px" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>AI Love Companion</h2>
        <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Your emotional intelligence assistant</p>
      </div>

      {/* tabs */}
      <div style={{ position:"relative", zIndex:2, display:"flex", gap:6, padding:"0 20px 16px" }}>
        {["detect","diary","chat"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"7px 14px", borderRadius:50, border:"none", cursor:"pointer",
            fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700,
            background: tab===t ? C.grad : C.s,
            color: tab===t ? "#fff" : C.muted,
            boxShadow: tab===t ? "0 4px 14px rgba(255,107,157,0.35)" : "none",
          }}>{t==="detect"?"🧠 Detect":t==="diary"?"📔 Diary":"🤖 AI Chat"}</button>
        ))}
      </div>

      {/* EMOTION DETECT */}
      {tab==="detect" && (
        <div className="tab-content" style={{ position:"relative", zIndex:2, padding:"0 20px 90px" }}>
          {/* scan card */}
          <div style={{ padding:"24px", borderRadius:24, background:"rgba(196,77,255,0.08)", border:"1px solid rgba(196,77,255,0.2)", marginBottom:18, textAlign:"center" }}>
            {/* face scan visual */}
            <div style={{ position:"relative", width:110, height:110, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {analyzing && [0,1,2].map(i=>(
                <div key={i} style={{ position:"absolute", width:110+i*30, height:110+i*30, borderRadius:"50%", border:"1px solid rgba(196,77,255,0.3)", animation:`ripple 1.5s ease ${i*0.4}s infinite` }}/>
              ))}
              <div style={{
                width:90, height:90, borderRadius:"50%",
                background:C.gradSoft || "rgba(196,77,255,0.15)", border:"2px solid rgba(196,77,255,0.4)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:42,
                animation: analyzed ? "heartBeat 1s ease" : analyzing ? "pulse 0.6s ease infinite" : "none",
              }}>
                {analyzed ? "🥰" : analyzing ? "🔍" : "😶"}
              </div>
            </div>

            {analyzed ? (
              <div style={{ animation:"fadeUp 0.4s ease both" }}>
                <div style={{ fontSize:16, color:C.text, fontWeight:700, marginBottom:4 }}>Emotion Detected!</div>
                <div style={{ fontSize:13, color:C.muted, marginBottom:16 }}>You're feeling: <span style={{ color:C.pink, fontWeight:700 }}>Loved & Happy ❤️</span></div>
                {/* emotion bars */}
                {moods.map((m,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <span style={{ fontSize:16, width:24 }}>{m.emoji}</span>
                    <div style={{ flex:1, height:6, borderRadius:10, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${m.score}%`, borderRadius:10, background:`linear-gradient(90deg,${m.color}88,${m.color})`, transition:"width 0.8s ease", transitionDelay:`${i*0.1}s` }}/>
                    </div>
                    <span style={{ fontSize:10, color:C.muted, width:28, textAlign:"right", fontWeight:700 }}>{m.score}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div style={{ fontSize:13, color:C.muted, marginBottom:4 }}>
                  {analyzing ? "Analyzing your emotions..." : "Let AI read your emotional state"}
                </div>
                {analyzing && <div style={{ fontSize:11, color:C.purple, marginTop:4 }}>Processing facial patterns... 🧠</div>}
              </div>
            )}
          </div>

          <button onClick={analyze} disabled={analyzing} style={{
            width:"100%", padding:"15px", borderRadius:14,
            background: analyzing ? C.s : C.grad,
            border: analyzing ? `1px solid ${C.b}` : "none",
            color: analyzing ? C.muted : "#fff",
            fontSize:14, fontWeight:700, cursor: analyzing?"not-allowed":"pointer",
            fontFamily:"'Nunito',sans-serif",
            boxShadow: analyzing ? "none" : "0 8px 28px rgba(255,107,157,0.35)",
            marginBottom:14,
          }}>
            {analyzing ? "🧠 Analyzing..." : analyzed ? "🔄 Scan Again" : "🧠 Detect My Emotion"}
          </button>

          {analyzed && (
            <div style={{ padding:"14px 16px", borderRadius:16, background:"rgba(255,107,157,0.07)", border:"1px solid rgba(255,107,157,0.2)", animation:"fadeUp 0.4s ease both" }}>
              <div style={{ fontSize:11, color:C.pink, fontWeight:700, marginBottom:6 }}>💡 AI INSIGHT</div>
              <p style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>
                Teri emotional energy aaj bahut positive hai! Arjun ko ek surprise bhej — ye perfect time hai connection deepen karne ka 💕
              </p>
            </div>
          )}
        </div>
      )}

      {/* DIARY */}
      {tab==="diary" && (
        <div className="tab-content" style={{ position:"relative", zIndex:2, padding:"0 20px 90px" }}>
          {/* write section */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Today's Entry</div>
            <textarea
              rows={4} value={diaryText} onChange={e=>setDiaryText(e.target.value)}
              placeholder="Aaj kaisa feel hua? Dil ki baat likh do... 💕"
              style={{
                width:"100%", padding:"14px 16px",
                background:"rgba(255,255,255,0.04)", border:`1px solid ${C.b}`,
                borderRadius:16, color:C.text, fontSize:13, outline:"none",
                fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                resize:"none", lineHeight:1.7,
              }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ fontSize:10, color:C.dim }}>{diaryText.length}/1000</span>
              <div style={{ display:"flex", gap:6 }}>
                {["😊","🥰","😔","😌","🔥","💭"].map(e=>(
                  <button key={e} onClick={()=>setDiaryText(d=>d+e)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14 }}>{e}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={generateAI} disabled={generating||!diaryText.trim()} style={{
            width:"100%", padding:"14px", borderRadius:14, marginBottom:16,
            background: (!diaryText.trim()||generating) ? C.s : C.grad,
            border: (!diaryText.trim()||generating) ? `1px solid ${C.b}` : "none",
            color: (!diaryText.trim()||generating) ? C.muted : "#fff",
            fontSize:13, fontWeight:700, cursor: (!diaryText.trim()||generating)?"not-allowed":"pointer",
            fontFamily:"'Nunito',sans-serif",
          }}>
            {generating ? "🤖 AI is reading..." : "✨ Get AI Reflection"}
          </button>

          {aiReply && (
            <div style={{ padding:"16px", borderRadius:18, background:"rgba(196,77,255,0.08)", border:"1px solid rgba(196,77,255,0.25)", marginBottom:18, animation:"fadeUp 0.4s ease both" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:28, height:28, borderRadius:10, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
                <span style={{ fontSize:11, color:C.purple, fontWeight:700 }}>AI COMPANION</span>
              </div>
              <p style={{ fontSize:12, color:C.muted, lineHeight:1.7, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>{aiReply}</p>
            </div>
          )}

          {/* past entries */}
          <div>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Past Entries</div>
            {diaryEntries.map((e,i)=>(
              <div key={i} style={{
                padding:"12px 14px", borderRadius:16, marginBottom:8, cursor:"pointer",
                background: e.highlight ? "rgba(255,107,157,0.08)" : C.s,
                border: e.highlight ? "1px solid rgba(255,107,157,0.2)" : `1px solid ${C.b}`,
                display:"flex", gap:10, alignItems:"center",
              }}>
                <span style={{ fontSize:22 }}>{e.mood}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:C.text, fontWeight:600 }}>{e.preview}</div>
                  <div style={{ fontSize:10, color:C.dim, marginTop:2 }}>{e.date}</div>
                </div>
                {e.highlight && <span style={{ fontSize:10, color:C.pink }}>★</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI CHAT */}
      {tab==="chat" && (
        <div className="tab-content" style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", height:520 }}>
          {/* messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px 20px", display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { ai:true,  text:"Namaste! Main tumhara AI Love Companion hoon 💕 Aaj kaisa mahsoos ho raha hai?" },
              { ai:false, text:"Bahut miss kar rahi hoon usse aaj 😔" },
              { ai:true,  text:"Ye feelings bilkul normal hain jab koi bahut khaas hota hai 🌙 Kuch hua kya aaj jo miss feeling trigger kiya?" },
              { ai:false, text:"Uski purani photo dekhi thi 📸" },
              { ai:true,  text:"Photos ke through yaadein bahut powerful hoti hain 💕 Unhe share karo usse — batao 'Ye dekh ke tujhe yaad kiya'. Chhote gestures bade connections banate hain ✨" },
            ].map((m,i)=>(
              <div key={i} style={{ display:"flex", justifyContent: m.ai?"flex-start":"flex-end" }}>
                {m.ai && (
                  <div style={{ width:28, height:28, borderRadius:10, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginRight:7, flexShrink:0, alignSelf:"flex-end" }}>🤖</div>
                )}
                <div style={{
                  maxWidth:"72%", padding:"10px 14px", borderRadius: m.ai?"16px 16px 16px 4px":"16px 16px 4px 16px",
                  background: m.ai ? "rgba(196,77,255,0.1)" : C.grad,
                  border: m.ai ? "1px solid rgba(196,77,255,0.2)" : "none",
                  fontSize:12, color:C.text, lineHeight:1.6,
                  boxShadow: m.ai ? "none" : "0 4px 14px rgba(255,107,157,0.25)",
                }}>{m.text}</div>
              </div>
            ))}
          </div>

          {/* input */}
          <div style={{ padding:"10px 20px 14px", borderTop:`1px solid ${C.b}`, display:"flex", gap:8 }}>
            <input
              value={chatInput} onChange={e=>setChatInput(e.target.value)}
              placeholder="Dil ki baat batao AI ko..."
              style={{
                flex:1, padding:"11px 16px", borderRadius:50,
                background:"rgba(255,255,255,0.05)", border:`1px solid ${C.b}`,
                color:C.text, fontSize:12, outline:"none", fontFamily:"'Nunito',sans-serif",
              }}/>
            <button style={{ width:38, height:38, borderRadius:"50%", background:C.grad, border:"none", fontSize:15, cursor:"pointer", boxShadow:"0 4px 14px rgba(255,107,157,0.35)" }}>↑</button>
          </div>
        </div>
      )}

      <Nav active="ai"/>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════ */
export default function App() {
  const [active, setActive] = useState(null);
  const screens = [
    { id:"score",   label:"💎 Love Score + Games",       Component:LoveScoreScreen },
    { id:"capsule", label:"💌 Time Capsule",              Component:TimeCapsuleScreen },
    { id:"date",    label:"🌙 Virtual Date Mode",         Component:VirtualDateScreen },
    { id:"ai",      label:"🤖 AI Emotion + Love Diary",  Component:AIDiaryScreen },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#0a0812", padding:"32px 20px 60px", fontFamily:"'Nunito',sans-serif" }}>
      <G/>

      {/* header */}
      <div style={{ maxWidth:1400, margin:"0 auto 12px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ width:44, height:44, borderRadius:15, background:"linear-gradient(135deg,#ff6b9d,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(255,107,157,0.4)", animation:"heartBeat 2.4s ease-in-out infinite" }}>
            <svg width="24" height="22" viewBox="0 0 24 22" fill="none">
              <path d="M12 20.5C12 20.5 1 13.5 1 6.5C1 3.46 3.46 1 6.5 1C9 1 11.1 2.56 12 4.78C12.9 2.56 15 1 17.5 1C20.54 1 23 3.46 23 6.5C23 13.5 12 20.5 12 20.5Z" fill="white" fillOpacity="0.95"/>
            </svg>
          </div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:500, background:"linear-gradient(135deg,#ff6b9d,#c44dff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LoveSpace</span>
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.25)", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:6 }}>Future Features UI Kit · Phase 2</div>
        <div style={{ display:"inline-flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
          {["💎 Love Score","🎮 Games","💌 Time Capsule","🌙 Virtual Date","🤖 AI Diary"].map(tag=>(
            <span key={tag} style={{ padding:"4px 12px", borderRadius:50, background:"rgba(255,107,157,0.08)", border:"1px solid rgba(255,107,157,0.15)", fontSize:10, color:"rgba(255,107,157,0.7)", fontWeight:700 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* screen nav */}
      <div style={{ maxWidth:1400, margin:"20px auto 28px", display:"flex", justifyContent:"center", flexWrap:"wrap", gap:8 }}>
        {screens.map(s=>(
          <button key={s.id} onClick={()=>setActive(active===s.id?null:s.id)} style={{
            padding:"10px 22px", borderRadius:50, cursor:"pointer", fontSize:12, fontWeight:700,
            fontFamily:"'Nunito',sans-serif",
            background: active===s.id ? "linear-gradient(135deg,#ff6b9d,#c44dff)" : "rgba(255,255,255,0.04)",
            border: active===s.id ? "none" : "1px solid rgba(255,255,255,0.08)",
            color: active===s.id ? "#fff" : "rgba(255,255,255,0.4)",
            boxShadow: active===s.id ? "0 4px 20px rgba(255,107,157,0.35)" : "none",
            transition:"all 0.25s",
          }}>{s.label}</button>
        ))}
        <button onClick={()=>setActive(null)} style={{
          padding:"10px 22px", borderRadius:50, cursor:"pointer", fontSize:12, fontWeight:700,
          fontFamily:"'Nunito',sans-serif",
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
            <Phone key={s.id} label={s.label}>
              <Comp/>
            </Phone>
          );
        })}
      </div>
    </div>
  );
}
