import { useState, useEffect, useRef } from "react";

/* ─── GLOBAL STYLES ─────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Nunito:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0d0a14; font-family: 'Nunito', sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,107,157,0.3); border-radius: 2px; }
    input::placeholder { color: rgba(255,255,255,0.2); }
    input { caret-color: #ff6b9d; }

    @keyframes floatUp {
      0%   { transform: translateY(0) scale(1);   opacity: 0.6; }
      50%  { transform: translateY(-18px) scale(1.08); opacity: 1; }
      100% { transform: translateY(0) scale(1);   opacity: 0.6; }
    }
    @keyframes fadeIn  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse   { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
    @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }
    @keyframes heartBeat {
      0%,100% { transform:scale(1); }
      14%     { transform:scale(1.2); }
      28%     { transform:scale(1); }
      42%     { transform:scale(1.1); }
      70%     { transform:scale(1); }
    }
    @keyframes orbit {
      from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
    }
    @keyframes glow {
      0%,100% { box-shadow: 0 0 20px rgba(255,107,157,0.3); }
      50%      { box-shadow: 0 0 40px rgba(255,107,157,0.6), 0 0 80px rgba(196,77,255,0.3); }
    }
    @keyframes ripple {
      0%   { transform:scale(0.8); opacity:1; }
      100% { transform:scale(2.4); opacity:0; }
    }
    @keyframes slideRight {
      from { transform:translateX(-100%); opacity:0; }
      to   { transform:translateX(0);     opacity:1; }
    }
    @keyframes waveIn {
      0%   { clip-path: inset(0 100% 0 0); }
      100% { clip-path: inset(0 0% 0 0); }
    }
    .screen { animation: fadeIn 0.45s ease both; }
    .msg-in  { animation: slideRight 0.3s ease both; }
  `}</style>
);

/* ─── COLOR TOKENS ───────────────────────────────────────── */
const C = {
  bg:      "#0d0a14",
  surface: "rgba(255,255,255,0.045)",
  border:  "rgba(255,255,255,0.08)",
  pink:    "#ff6b9d",
  purple:  "#c44dff",
  grad:    "linear-gradient(135deg,#ff6b9d,#c44dff)",
  gradSoft:"linear-gradient(135deg,rgba(255,107,157,0.18),rgba(196,77,255,0.18))",
  text:    "rgba(255,255,255,0.88)",
  muted:   "rgba(255,255,255,0.35)",
  dim:     "rgba(255,255,255,0.15)",
};

/* ─── LOGO SVG ───────────────────────────────────────────── */
const Logo = ({ size = 40, showText = true }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: C.grad,
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow:`0 4px 20px rgba(255,107,157,0.4)`,
      animation:"heartBeat 2.4s ease-in-out infinite",
      flexShrink:0,
    }}>
      <svg width={size*0.58} height={size*0.52} viewBox="0 0 24 22" fill="none">
        <path d="M12 20.5C12 20.5 1 13.5 1 6.5C1 3.46 3.46 1 6.5 1C9 1 11.1 2.56 12 4.78C12.9 2.56 15 1 17.5 1C20.54 1 23 3.46 23 6.5C23 13.5 12 20.5 12 20.5Z"
          fill="white" fillOpacity="0.95"/>
        {/* inner shimmer dot */}
        <circle cx="8" cy="7" r="1.5" fill="rgba(255,100,140,0.5)"/>
      </svg>
    </div>
    {showText && (
      <span style={{
        fontFamily:"'Playfair Display',serif",
        fontSize: size * 0.55,
        fontWeight:500,
        background: C.grad,
        WebkitBackgroundClip:"text",
        WebkitTextFillColor:"transparent",
        letterSpacing:"0.4px",
      }}>LoveSpace</span>
    )}
  </div>
);

/* ─── PHONE FRAME ────────────────────────────────────────── */
const Phone = ({ children, label }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
    <div style={{
      width:320, height:640,
      background:"#111018",
      borderRadius:44,
      border:"2px solid rgba(255,255,255,0.12)",
      boxShadow:"0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 6px rgba(255,255,255,0.03)",
      overflow:"hidden",
      position:"relative",
      flexShrink:0,
    }}>
      {/* notch */}
      <div style={{
        position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
        width:110, height:28,
        background:"#111018",
        borderBottomLeftRadius:16, borderBottomRightRadius:16,
        zIndex:20,
        borderBottom:"1.5px solid rgba(255,255,255,0.06)",
      }}/>
      {/* status bar */}
      <div style={{
        position:"absolute", top:8, left:20, right:20,
        display:"flex", justifyContent:"space-between", alignItems:"center",
        zIndex:21, fontSize:10, color:C.muted, fontWeight:600,
      }}>
        <span>9:41</span>
        <span style={{ display:"flex", gap:4 }}>
          <span>●●●</span><span>WiFi</span><span>🔋</span>
        </span>
      </div>
      {/* content */}
      <div style={{ width:"100%", height:"100%", overflowY:"auto", overflowX:"hidden" }}>
        {children}
      </div>
    </div>
    <span style={{ fontSize:12, color:C.muted, letterSpacing:"1.2px", textTransform:"uppercase", fontWeight:600 }}>{label}</span>
  </div>
);

/* ─── SHARED COMPONENTS ──────────────────────────────────── */
const GlassBg = () => (
  <>
    <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#0d0a14 0%,#150d20 50%,#0d0a14 100%)", zIndex:0 }}/>
    <div style={{ position:"absolute", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,77,255,0.12) 0%,transparent 70%)", top:-60, right:-60, zIndex:0 }}/>
    <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,107,157,0.1) 0%,transparent 70%)", bottom:-40, left:-40, zIndex:0 }}/>
  </>
);

/* ════════════════════════════════════════════════════════════
   SCREEN 1 — SPLASH / ONBOARDING
════════════════════════════════════════════════════════════ */
const SplashScreen = () => (
  <div style={{ height:640, position:"relative", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:0, overflow:"hidden" }} className="screen">
    <GlassBg/>

    {/* orbiting dot */}
    <div style={{ position:"absolute", top:"50%", left:"50%", width:0, height:0, zIndex:2 }}>
      <div style={{
        width:8, height:8, borderRadius:"50%",
        background:"rgba(255,107,157,0.7)",
        boxShadow:"0 0 12px rgba(255,107,157,0.8)",
        animation:"orbit 4s linear infinite",
        position:"absolute",
      }}/>
    </div>

    {/* ripple rings */}
    {[0,0.6,1.2].map((d,i)=>(
      <div key={i} style={{
        position:"absolute", width:180+i*60, height:180+i*60,
        borderRadius:"50%",
        border:"1px solid rgba(255,107,157,0.15)",
        animation:`ripple 2.4s ease-out ${d}s infinite`,
        zIndex:1,
      }}/>
    ))}

    <div style={{ position:"relative", zIndex:3, display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
      {/* big logo */}
      <div style={{
        width:90, height:90, borderRadius:26,
        background: C.grad,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 12px 48px rgba(255,107,157,0.5)",
        animation:"glow 2.5s ease-in-out infinite",
        marginBottom:4,
      }}>
        <svg width="50" height="46" viewBox="0 0 24 22" fill="none">
          <path d="M12 20.5C12 20.5 1 13.5 1 6.5C1 3.46 3.46 1 6.5 1C9 1 11.1 2.56 12 4.78C12.9 2.56 15 1 17.5 1C20.54 1 23 3.46 23 6.5C23 13.5 12 20.5 12 20.5Z" fill="white" fillOpacity="0.95"/>
        </svg>
      </div>

      <div style={{ textAlign:"center" }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:500, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:6 }}>LoveSpace</h1>
        <p style={{ fontSize:12, color:C.muted, letterSpacing:"2px", textTransform:"uppercase" }}>your private world · just two</p>
      </div>

      {/* tagline cards */}
      {["💌  Private & secure", "📸  Shared memories", "💬  Just you two"].map((t,i)=>(
        <div key={i} style={{
          padding:"10px 22px", borderRadius:50,
          background:C.surface, border:`1px solid ${C.border}`,
          fontSize:12, color:C.muted,
          animation:`fadeIn 0.4s ease ${0.2+i*0.12}s both`,
        }}>{t}</div>
      ))}

      <button style={{
        marginTop:10, padding:"15px 48px", borderRadius:50,
        background:C.grad, border:"none", color:"#fff",
        fontSize:14, fontWeight:600, cursor:"pointer",
        boxShadow:"0 8px 32px rgba(255,107,157,0.4)",
        fontFamily:"'Nunito',sans-serif", letterSpacing:"0.5px",
      }}>Begin Together →</button>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════
   SCREEN 2 — LOGIN
════════════════════════════════════════════════════════════ */
const LoginScreen = () => {
  const [tab, setTab] = useState("login");
  return (
    <div style={{ height:640, position:"relative", overflowY:"auto", paddingTop:36 }} className="screen">
      <GlassBg/>
      <div style={{ position:"relative", zIndex:2, padding:"0 24px 32px" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
          <Logo size={36}/>
        </div>
        <p style={{ textAlign:"center", fontSize:11, color:C.muted, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:20 }}>your private couple space</p>

        {/* toggle */}
        <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:14, padding:4, marginBottom:22, border:`1px solid ${C.border}` }}>
          {["login","signup"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1, padding:"9px 0", border:"none", borderRadius:10, cursor:"pointer",
              fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:600,
              background: tab===t ? C.gradSoft : "transparent",
              color: tab===t ? "#fff" : C.muted,
              transition:"all 0.25s",
              boxShadow: tab===t ? "0 2px 12px rgba(255,107,157,0.2)" : "none",
            }}>{t==="login"?"Sign In":"Join Together"}</button>
          ))}
        </div>

        {/* fields */}
        {[
          ...(tab==="signup" ? [{ label:"Your Name", ph:"What should we call you?", icon:"✦" }] : []),
          { label:"Email", ph:"your@email.com", icon:"✉", type:"email" },
          { label:"Password", ph:"········", icon:"◈", type:"password" },
          ...(tab==="signup" ? [{ label:"Partner Code", ph:"Share with your love ♾", icon:"♾" }] : []),
        ].map((f,i)=>(
          <div key={i} style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:6, display:"flex", gap:5, alignItems:"center" }}>
              <span style={{ background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{f.icon}</span>{f.label}
            </label>
            <input type={f.type||"text"} placeholder={f.ph} style={{
              width:"100%", padding:"13px 16px",
              background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`,
              borderRadius:13, color:C.text, fontSize:13,
              outline:"none", fontFamily:"'Nunito',sans-serif",
            }}/>
          </div>
        ))}

        {tab==="login" && <div style={{ textAlign:"right", marginBottom:16 }}><span style={{ fontSize:11, color:C.muted, cursor:"pointer" }}>Forgot password?</span></div>}

        <button style={{
          width:"100%", padding:"15px", borderRadius:14,
          background:C.grad, border:"none", color:"#fff",
          fontSize:14, fontWeight:600, cursor:"pointer",
          boxShadow:"0 8px 32px rgba(255,107,157,0.35)",
          fontFamily:"'Nunito',sans-serif", marginBottom:16,
        }}>{tab==="login" ? "Enter Our Space →" : "Create Our Space ♥"}</button>

        <div style={{ display:"flex", gap:10 }}>
          {["G  Google","  Apple"].map((s,i)=>(
            <button key={i} style={{
              flex:1, padding:"11px 0", borderRadius:12, cursor:"pointer",
              border:`1px solid ${C.border}`, background:C.surface,
              color:C.muted, fontSize:12, fontFamily:"'Nunito',sans-serif",
            }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCREEN 3 — HOME DASHBOARD
════════════════════════════════════════════════════════════ */
const HomeScreen = () => {
  const moods = ["😊","😍","🥰","😌","🫂","💫"];
  const [myMood, setMyMood] = useState("🥰");
  return (
    <div style={{ height:640, position:"relative", overflowY:"auto" }} className="screen">
      <GlassBg/>
      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Logo size={28}/>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:12, background:C.surface, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🔔</div>
          <div style={{ width:36, height:36, borderRadius:12, background:C.gradSoft, border:`1px solid rgba(255,107,157,0.3)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👤</div>
        </div>
      </div>

      {/* couple card */}
      <div style={{ position:"relative", zIndex:2, margin:"0 20px 16px", padding:"20px", borderRadius:22, background:C.gradSoft, border:"1px solid rgba(255,107,157,0.2)", boxShadow:"0 8px 32px rgba(255,107,157,0.15)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          {/* me */}
          <div style={{ textAlign:"center" }}>
            <div style={{ width:52, height:52, borderRadius:18, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:4, boxShadow:"0 4px 16px rgba(255,107,157,0.4)" }}>👧</div>
            <div style={{ fontSize:11, color:C.text, fontWeight:600 }}>Priya</div>
            <div style={{ fontSize:10, color:C.muted }}>{myMood}</div>
          </div>
          {/* heart */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{ fontSize:28, animation:"heartBeat 2s ease-in-out infinite" }}>💖</div>
            <div style={{ fontSize:9, color:C.muted, textAlign:"center" }}>Together<br/>142 days</div>
          </div>
          {/* partner */}
          <div style={{ textAlign:"center" }}>
            <div style={{ width:52, height:52, borderRadius:18, background:"linear-gradient(135deg,#6b9dff,#4daaff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:4, boxShadow:"0 4px 16px rgba(107,157,255,0.4)" }}>👦</div>
            <div style={{ fontSize:11, color:C.text, fontWeight:600 }}>Arjun</div>
            <div style={{ fontSize:10, color:C.muted }}>😊</div>
          </div>
        </div>
        {/* love score bar */}
        <div style={{ marginTop:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:10, color:C.muted }}>Love Score</span>
            <span style={{ fontSize:10, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontWeight:700 }}>87%</span>
          </div>
          <div style={{ height:5, borderRadius:10, background:"rgba(255,255,255,0.1)", overflow:"hidden" }}>
            <div style={{ height:"100%", width:"87%", borderRadius:10, background:C.grad }}/>
          </div>
        </div>
      </div>

      {/* mood picker */}
      <div style={{ position:"relative", zIndex:2, margin:"0 20px 16px" }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>How are you feeling?</div>
        <div style={{ display:"flex", gap:8 }}>
          {moods.map(m=>(
            <button key={m} onClick={()=>setMyMood(m)} style={{
              flex:1, padding:"9px 0", borderRadius:12, fontSize:18, cursor:"pointer",
              border: myMood===m ? "1.5px solid rgba(255,107,157,0.5)" : `1px solid ${C.border}`,
              background: myMood===m ? C.gradSoft : C.surface,
              transition:"all 0.2s",
            }}>{m}</button>
          ))}
        </div>
      </div>

      {/* quick access */}
      <div style={{ position:"relative", zIndex:2, margin:"0 20px 16px" }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:10, fontWeight:600 }}>Quick Access</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { icon:"💬", label:"Chat", sub:"3 new messages", color:"#ff6b9d" },
            { icon:"📸", label:"Memories", sub:"24 photos", color:"#c44dff" },
            { icon:"📅", label:"Dates", sub:"Next: Friday", color:"#ff9d6b" },
            { icon:"💌", label:"Time Capsule", sub:"2 waiting", color:"#6b9dff" },
          ].map((q,i)=>(
            <div key={i} style={{ padding:"14px", borderRadius:18, background:C.surface, border:`1px solid ${C.border}`, cursor:"pointer" }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{q.icon}</div>
              <div style={{ fontSize:13, color:C.text, fontWeight:600 }}>{q.label}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{q.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* bottom nav */}
      <BottomNav active="home"/>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCREEN 4 — CHAT
════════════════════════════════════════════════════════════ */
const msgs = [
  { id:1, me:false, text:"Good morning love! ☀️", time:"9:01" },
  { id:2, me:true,  text:"Morning! 😍 Aaj kuch special plan hai?", time:"9:03" },
  { id:3, me:false, text:"Movie night tonight? I miss you 🥺", time:"9:04" },
  { id:4, me:true,  text:"Absolutely yes! 🎬❤️", time:"9:05" },
  { id:5, me:false, img:"📷", text:"Look at this sunset", time:"9:10" },
  { id:6, me:true,  text:"Wow beautiful 😍 just like you hehe", time:"9:11" },
];

const ChatScreen = () => {
  const [input, setInput] = useState("");
  return (
    <div style={{ height:640, display:"flex", flexDirection:"column", position:"relative" }} className="screen">
      <GlassBg/>
      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 16px 12px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:18, color:C.muted }}>‹</div>
        <div style={{ width:38, height:38, borderRadius:14, background:"linear-gradient(135deg,#6b9dff,#4daaff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👦</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, color:C.text, fontWeight:600 }}>Arjun</div>
          <div style={{ fontSize:10, color:"#4dff9d", display:"flex", alignItems:"center", gap:4 }}><span style={{ width:5, height:5, borderRadius:"50%", background:"#4dff9d", display:"inline-block" }}/>Online</div>
        </div>
        <div style={{ fontSize:18 }}>📞</div>
        <div style={{ fontSize:18 }}>📹</div>
      </div>

      {/* messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:10, position:"relative", zIndex:2 }}>
        <div style={{ textAlign:"center", fontSize:10, color:C.dim, marginBottom:4, letterSpacing:"0.8px" }}>TODAY</div>
        {msgs.map(m=>(
          <div key={m.id} className="msg-in" style={{ display:"flex", justifyContent: m.me?"flex-end":"flex-start" }}>
            {!m.me && <div style={{ width:28, height:28, borderRadius:10, background:"linear-gradient(135deg,#6b9dff,#4daaff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, marginRight:6, flexShrink:0, alignSelf:"flex-end" }}>👦</div>}
            <div style={{ maxWidth:"70%" }}>
              {m.img && (
                <div style={{ width:140, height:90, borderRadius:14, background:"linear-gradient(135deg,rgba(255,107,157,0.2),rgba(196,77,255,0.2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, marginBottom:4, border:`1px solid ${C.border}` }}>{m.img}</div>
              )}
              <div style={{
                padding:"10px 14px", borderRadius: m.me?"18px 18px 4px 18px":"18px 18px 18px 4px",
                background: m.me ? C.grad : C.surface,
                border: m.me ? "none" : `1px solid ${C.border}`,
                fontSize:13, color: m.me ? "#fff" : C.text, lineHeight:1.5,
                boxShadow: m.me ? "0 4px 16px rgba(255,107,157,0.3)" : "none",
              }}>{m.text}</div>
              <div style={{ fontSize:9, color:C.dim, marginTop:3, textAlign: m.me?"right":"left" }}>{m.time} {m.me&&"✓✓"}</div>
            </div>
          </div>
        ))}
      </div>

      {/* input */}
      <div style={{ position:"relative", zIndex:2, padding:"10px 16px 20px", borderTop:`1px solid ${C.border}`, display:"flex", gap:8, alignItems:"center" }}>
        <button style={{ width:38, height:38, borderRadius:12, background:C.surface, border:`1px solid ${C.border}`, fontSize:18, cursor:"pointer" }}>😊</button>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Send love…" style={{
          flex:1, padding:"11px 16px", borderRadius:50,
          background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`,
          color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif",
        }}/>
        <button style={{ width:38, height:38, borderRadius:12, background:C.surface, border:`1px solid ${C.border}`, fontSize:18, cursor:"pointer" }}>📎</button>
        <button style={{ width:38, height:38, borderRadius:50, background:C.grad, border:"none", fontSize:16, cursor:"pointer", boxShadow:"0 4px 16px rgba(255,107,157,0.4)" }}>↑</button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCREEN 5 — MEMORIES / TIMELINE
════════════════════════════════════════════════════════════ */
const MemoryScreen = () => {
  const photos = [
    { emoji:"🌅", label:"Sunset walk", date:"Apr 8", color:"linear-gradient(135deg,#ff9d6b,#ff6b9d)" },
    { emoji:"🎂", label:"Your Birthday", date:"Mar 22", color:"linear-gradient(135deg,#c44dff,#6b9dff)" },
    { emoji:"🍕", label:"Pizza date", date:"Mar 15", color:"linear-gradient(135deg,#ff6b9d,#ffb36b)" },
    { emoji:"🌸", label:"Garden stroll", date:"Mar 5", color:"linear-gradient(135deg,#6bffb3,#6b9dff)" },
    { emoji:"🎬", label:"Movie night", date:"Feb 28", color:"linear-gradient(135deg,#ff6b6b,#c44dff)" },
    { emoji:"☕", label:"Morning coffee", date:"Feb 20", color:"linear-gradient(135deg,#ffb36b,#ff9d6b)" },
  ];
  return (
    <div style={{ height:640, position:"relative", overflowY:"auto" }} className="screen">
      <GlassBg/>
      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>Our Memories</h2>
          <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>24 beautiful moments</p>
        </div>
        <button style={{ padding:"8px 16px", borderRadius:50, background:C.grad, border:"none", fontSize:11, color:"#fff", fontWeight:600, cursor:"pointer" }}>+ Add</button>
      </div>

      {/* filters */}
      <div style={{ position:"relative", zIndex:2, padding:"0 20px 16px", display:"flex", gap:8 }}>
        {["All","Photos","Dates","Notes"].map((f,i)=>(
          <button key={f} style={{
            padding:"7px 14px", borderRadius:50, fontSize:11, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:600,
            background: i===0 ? C.grad : C.surface,
            border: i===0 ? "none" : `1px solid ${C.border}`,
            color: i===0 ? "#fff" : C.muted,
            boxShadow: i===0 ? "0 4px 12px rgba(255,107,157,0.3)" : "none",
          }}>{f}</button>
        ))}
      </div>

      {/* grid */}
      <div style={{ position:"relative", zIndex:2, padding:"0 20px 80px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {photos.map((p,i)=>(
          <div key={i} style={{
            borderRadius:20, overflow:"hidden", cursor:"pointer",
            aspectRatio: i===0 ? "2/1" : "1",
            gridColumn: i===0 ? "span 2" : "span 1",
          }}>
            <div style={{ width:"100%", height:"100%", background:p.color, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <span style={{ fontSize: i===0?52:36 }}>{p.emoji}</span>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 14px", background:"linear-gradient(transparent,rgba(0,0,0,0.5))" }}>
                <div style={{ fontSize:12, color:"#fff", fontWeight:600 }}>{p.label}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)" }}>{p.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="memories"/>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCREEN 6 — PROFILE / SETTINGS
════════════════════════════════════════════════════════════ */
const ProfileScreen = () => (
  <div style={{ height:640, position:"relative", overflowY:"auto" }} className="screen">
    <GlassBg/>
    {/* hero */}
    <div style={{ position:"relative", zIndex:2, padding:"44px 20px 20px", textAlign:"center" }}>
      <div style={{ width:72, height:72, borderRadius:24, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 10px", boxShadow:"0 8px 32px rgba(255,107,157,0.4)", animation:"glow 2.5s ease-in-out infinite" }}>👧</div>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:C.text, fontWeight:500, marginBottom:2 }}>Priya Sharma</h2>
      <p style={{ fontSize:11, color:C.muted }}>priya@email.com</p>
      <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:10 }}>
        <div style={{ padding:"5px 14px", borderRadius:50, background:C.gradSoft, border:"1px solid rgba(255,107,157,0.3)", fontSize:11, color:C.pink }}>💑 Coupled with Arjun</div>
      </div>
    </div>

    {/* stats */}
    <div style={{ position:"relative", zIndex:2, margin:"0 20px 16px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
      {[["142","Days Together"],["24","Memories"],["87%","Love Score"]].map(([v,l])=>(
        <div key={l} style={{ padding:"14px 0", borderRadius:18, background:C.surface, border:`1px solid ${C.border}`, textAlign:"center" }}>
          <div style={{ fontSize:18, fontWeight:700, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{v}</div>
          <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{l}</div>
        </div>
      ))}
    </div>

    {/* settings list */}
    <div style={{ position:"relative", zIndex:2, margin:"0 20px 80px" }}>
      {[
        { icon:"🔔", label:"Notifications", right:"On" },
        { icon:"🔒", label:"Privacy", right:"High" },
        { icon:"💾", label:"Backup", right:"Auto" },
        { icon:"🎨", label:"Theme", right:"Dark" },
        { icon:"🔗", label:"Partner Code", right:"Share" },
        { icon:"🚪", label:"Sign Out", right:"", danger:true },
      ].map((s,i)=>(
        <div key={i} style={{
          display:"flex", alignItems:"center", padding:"14px 16px",
          borderRadius:16, marginBottom:8, cursor:"pointer",
          background:C.surface, border:`1px solid ${C.border}`,
        }}>
          <span style={{ fontSize:18, marginRight:12 }}>{s.icon}</span>
          <span style={{ flex:1, fontSize:13, color: s.danger?"#ff6b6b":C.text, fontWeight:500 }}>{s.label}</span>
          <span style={{ fontSize:11, color:C.muted }}>{s.right} {!s.danger && "›"}</span>
        </div>
      ))}
    </div>

    <BottomNav active="profile"/>
  </div>
);

/* ─── BOTTOM NAV ─────────────────────────────────────────── */
const BottomNav = ({ active }) => {
  const tabs = [
    { id:"home",    icon:"🏠", label:"Home" },
    { id:"chat",    icon:"💬", label:"Chat" },
    { id:"memories",icon:"📸", label:"Memories" },
    { id:"profile", icon:"👤", label:"Profile" },
  ];
  return (
    <div style={{
      position:"absolute", bottom:0, left:0, right:0,
      background:"rgba(13,10,20,0.95)", backdropFilter:"blur(16px)",
      borderTop:`1px solid ${C.border}`,
      display:"flex", padding:"10px 0 16px",
      zIndex:10,
    }}>
      {tabs.map(t=>(
        <div key={t.id} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer" }}>
          <span style={{ fontSize:20 }}>{t.icon}</span>
          <span style={{ fontSize:9, color: active===t.id ? C.pink : C.dim, fontWeight: active===t.id ? 700:400, letterSpacing:"0.5px" }}>{t.label}</span>
          {active===t.id && <div style={{ width:16, height:2, borderRadius:1, background:C.grad }}/>}
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   LOGO SHOWCASE
════════════════════════════════════════════════════════════ */
const LogoShowcase = () => (
  <div style={{ padding:"32px 20px", background:"rgba(255,255,255,0.02)", borderRadius:24, border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:24 }}>
    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:C.text, textAlign:"center" }}>LoveSpace Logo Variants</h3>
    {/* large */}
    <div style={{ display:"flex", justifyContent:"center", padding:"20px", background:"rgba(255,255,255,0.02)", borderRadius:18 }}>
      <Logo size={64} showText={true}/>
    </div>
    {/* medium */}
    <div style={{ display:"flex", justifyContent:"center", gap:32, flexWrap:"wrap" }}>
      <Logo size={48}/>
      <Logo size={36}/>
      <Logo size={28}/>
    </div>
    {/* icon only */}
    <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
      {[64,48,36,24].map(s=>(
        <div key={s} style={{ width:s, height:s, borderRadius:s*0.28, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(255,107,157,0.35)", animation:"heartBeat 2.4s ease-in-out infinite" }}>
          <svg width={s*0.58} height={s*0.52} viewBox="0 0 24 22" fill="none">
            <path d="M12 20.5C12 20.5 1 13.5 1 6.5C1 3.46 3.46 1 6.5 1C9 1 11.1 2.56 12 4.78C12.9 2.56 15 1 17.5 1C20.54 1 23 3.46 23 6.5C23 13.5 12 20.5 12 20.5Z" fill="white" fillOpacity="0.95"/>
          </svg>
        </div>
      ))}
    </div>
    {/* light bg variant */}
    <div style={{ padding:"16px 20px", background:"#fff", borderRadius:16, display:"flex", justifyContent:"center", gap:24, flexWrap:"wrap" }}>
      {[48,36].map(s=>(
        <div key={s} style={{ width:s, height:s, borderRadius:s*0.28, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(255,107,157,0.4)" }}>
          <svg width={s*0.58} height={s*0.52} viewBox="0 0 24 22" fill="none">
            <path d="M12 20.5C12 20.5 1 13.5 1 6.5C1 3.46 3.46 1 6.5 1C9 1 11.1 2.56 12 4.78C12.9 2.56 15 1 17.5 1C20.54 1 23 3.46 23 6.5C23 13.5 12 20.5 12 20.5Z" fill="white" fillOpacity="0.95"/>
          </svg>
        </div>
      ))}
      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", alignSelf:"center" }}>LoveSpace</span>
    </div>
    <p style={{ fontSize:10, color:C.muted, textAlign:"center", letterSpacing:"0.8px" }}>Pink #FF6B9D · Purple #C44DFF · Font: Playfair Display</p>
  </div>
);

/* ════════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════════ */
export default function App() {
  const screens = [
    { id:"splash",  label:"Splash",   Component: SplashScreen },
    { id:"login",   label:"Login",    Component: LoginScreen },
    { id:"home",    label:"Home",     Component: HomeScreen },
    { id:"chat",    label:"Chat",     Component: ChatScreen },
    { id:"memory",  label:"Memories", Component: MemoryScreen },
    { id:"profile", label:"Profile",  Component: ProfileScreen },
  ];
  const [active, setActive] = useState("splash");

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 20px 60px", fontFamily:"'Nunito',sans-serif" }}>
      <GlobalStyles/>

      {/* page header */}
      <div style={{ maxWidth:1300, margin:"0 auto 40px", textAlign:"center" }}>
        <Logo size={52}/>
        <p style={{ marginTop:10, fontSize:12, color:C.muted, letterSpacing:"2px", textTransform:"uppercase" }}>Complete UI Kit · All Screens + Logo</p>
      </div>

      {/* screen nav */}
      <div style={{ maxWidth:1300, margin:"0 auto 32px", display:"flex", justifyContent:"center", flexWrap:"wrap", gap:8 }}>
        {screens.map(s=>(
          <button key={s.id} onClick={()=>setActive(s.id)} style={{
            padding:"9px 20px", borderRadius:50, cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"'Nunito',sans-serif",
            background: active===s.id ? C.grad : C.surface,
            border: active===s.id ? "none" : `1px solid ${C.border}`,
            color: active===s.id ? "#fff" : C.muted,
            boxShadow: active===s.id ? "0 4px 16px rgba(255,107,157,0.3)" : "none",
            transition:"all 0.2s",
          }}>{s.label}</button>
        ))}
      </div>

      {/* phones grid */}
      <div style={{ maxWidth:1300, margin:"0 auto 48px", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:32 }}>
        {screens.map(s => {
          const Comp = s.Component;
          return (
            <Phone key={s.id} label={s.label}>
              <Comp/>
            </Phone>
          );
        })}
      </div>

      {/* logo showcase */}
      <div style={{ maxWidth:480, margin:"0 auto" }}>
        <LogoShowcase/>
      </div>
    </div>
  );
}
