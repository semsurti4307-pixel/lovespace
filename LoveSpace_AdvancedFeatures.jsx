import { useState, useEffect, useRef, useCallback } from "react";

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Nunito:wght@300;400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { background:#07050e; font-family:'Nunito',sans-serif; }
    ::-webkit-scrollbar { width:3px; }
    ::-webkit-scrollbar-thumb { background:rgba(255,107,157,0.3); border-radius:2px; }
    canvas { touch-action:none; }

    @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes heartBeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.25)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} }
    @keyframes pulse     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:0.7} }
    @keyframes glow      { 0%,100%{box-shadow:0 0 20px rgba(255,107,157,0.3)} 50%{box-shadow:0 0 55px rgba(255,107,157,0.65),0 0 90px rgba(196,77,255,0.2)} }
    @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes ripple    { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(3);opacity:0} }
    @keyframes slideUp   { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes firework  { 0%{transform:scale(0) rotate(0deg);opacity:1} 100%{transform:scale(1.8) rotate(180deg);opacity:0} }
    @keyframes confetti  { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(80px) rotate(360deg);opacity:0} }
    @keyframes waveBar   { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
    @keyframes recordPulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,68,68,0.4)} 50%{box-shadow:0 0 0 10px rgba(255,68,68,0)} }
    @keyframes breathe   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
    @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes float     { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
    @keyframes progressFill { from{width:0} to{width:var(--target)} }

    .screen { animation: fadeUp 0.4s ease both; }
    .tab-in { animation: fadeUp 0.3s ease both; }
  `}</style>
);

const C = {
  bg:"#07050e", s:"rgba(255,255,255,0.05)", b:"rgba(255,255,255,0.08)",
  pink:"#ff6b9d", purple:"#c44dff", blue:"#6b9dff", teal:"#4dffe0",
  gold:"#ffd166", mint:"#4dffb3", orange:"#ff9d6b",
  grad:"linear-gradient(135deg,#ff6b9d,#c44dff)",
  gradB:"linear-gradient(135deg,#6b9dff,#4dffe0)",
  gradG:"linear-gradient(135deg,#4dffb3,#ffd166)",
  gradO:"linear-gradient(135deg,#ff9d6b,#ffd166)",
  text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.38)", dim:"rgba(255,255,255,0.14)",
};

/* ── PHONE FRAME ─────────────────────────────────────────── */
const Phone = ({ children, label, accent=C.pink, vibe=null }) => {
  const vibeColors = {
    happy:    { bg:"#07050e", tint:"rgba(255,209,102,0.04)" },
    stressed: { bg:"#050812", tint:"rgba(107,157,255,0.06)" },
    sleepy:   { bg:"#060510", tint:"rgba(196,77,255,0.05)"  },
    working:  { bg:"#050e08", tint:"rgba(77,255,179,0.05)"  },
  };
  const v = vibe ? vibeColors[vibe] : null;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
      <div style={{
        width:320, height:680, borderRadius:46,
        background: v ? v.bg : "#0d0b18",
        border:"2px solid rgba(255,255,255,0.1)",
        boxShadow:`0 40px 100px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.06),0 0 60px ${accent}18`,
        overflow:"hidden", position:"relative", flexShrink:0, transition:"background 1s ease",
      }}>
        {v && <div style={{ position:"absolute", inset:0, background:v.tint, zIndex:1, pointerEvents:"none" }}/>}
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:110, height:28, background: v?v.bg:"#0d0b18", borderBottomLeftRadius:16, borderBottomRightRadius:16, zIndex:30, borderBottom:"1px solid rgba(255,255,255,0.05)" }}/>
        <div style={{ position:"absolute", top:8, left:20, right:20, display:"flex", justifyContent:"space-between", zIndex:31, fontSize:9, color:C.muted, fontWeight:700 }}>
          <span>9:41</span><span>●●● ▲ 🔋</span>
        </div>
        <div style={{ width:"100%", height:"100%", overflowY:"auto", overflowX:"hidden", position:"relative", zIndex:2 }}>
          {children}
        </div>
      </div>
      <div style={{ padding:"6px 22px", borderRadius:50, background:"rgba(255,255,255,0.03)", border:`1px solid ${C.b}`, fontSize:11, color:C.muted, letterSpacing:"1.5px", textTransform:"uppercase", fontWeight:700 }}>{label}</div>
    </div>
  );
};

const Bg = ({ c1=C.pink, c2=C.purple }) => (<>
  <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#07050e,#110d1e 55%,#07050e)", zIndex:0 }}/>
  <div style={{ position:"absolute", width:340, height:340, borderRadius:"50%", background:`radial-gradient(circle,${c1}14 0%,transparent 70%)`, top:-100, right:-80, zIndex:0 }}/>
  <div style={{ position:"absolute", width:260, height:260, borderRadius:"50%", background:`radial-gradient(circle,${c2}11 0%,transparent 70%)`, bottom:-60, left:-60, zIndex:0 }}/>
</>);

/* ════════════════════════════════════════════════════════════
   1. LOVE CANVAS — Real-Time Drawing Board
════════════════════════════════════════════════════════════ */
const LoveCanvas = () => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#ff6b9d");
  const [size, setSize] = useState(4);
  const [partnerLines] = useState([
    { from:{x:60,y:180}, to:{x:180,y:120}, color:"#6b9dff", size:3 },
    { from:{x:180,y:120}, to:{x:240,y:200}, color:"#6b9dff", size:3 },
    { from:{x:120,y:240}, to:{x:200,y:260}, color:"#c44dff", size:5 },
  ]);
  const [syncDot, setSyncDot] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [showStickers, setShowStickers] = useState(false);

  const colors = ["#ff6b9d","#c44dff","#6b9dff","#4dffe0","#ffd166","#ff9d6b","#4dffb3","#fff"];
  const stickers = ["❤️","💕","🌸","✨","🌙","💫","🔥","😘","🥰","💌","🌈","⭐"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // draw grid dots
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let x = 16; x < canvas.width; x += 20) {
      for (let y = 16; y < canvas.height; y += 20) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fill();
      }
    }
    // draw partner lines
    partnerLines.forEach(l => {
      ctx.beginPath();
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.size;
      ctx.lineCap = "round";
      ctx.moveTo(l.from.x, l.from.y);
      ctx.lineTo(l.to.x, l.to.y);
      ctx.stroke();
    });
    // draw a partner heart
    ctx.font = "32px serif";
    ctx.fillText("💕", 200, 150);
    ctx.font = "14px serif";
    ctx.fillStyle = "rgba(107,157,255,0.5)";
    ctx.fillText("Arjun ✏️", 195, 175);
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x:(src.clientX-rect.left)*scaleX, y:(src.clientY-rect.top)*scaleY };
  };

  const startDraw = (e) => {
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
    setSyncDot(true);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.strokeStyle = tool === "eraser" ? "rgba(13,11,24,1)" : color;
    ctx.lineWidth = tool === "eraser" ? size*4 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => { drawing.current = false; setSyncDot(false); };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const addSticker = (s) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.font = "36px serif";
    ctx.fillText(s, 100 + Math.random()*100, 150 + Math.random()*100);
    setShowStickers(false);
  };

  return (
    <div style={{ height:680, position:"relative", display:"flex", flexDirection:"column" }} className="screen">
      <Bg c1={C.pink} c2={C.purple}/>

      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 16px 8px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:19, color:C.text, fontWeight:500 }}>Love Canvas</h2>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background: syncDot?"#4dffe0":C.teal, animation: syncDot?"pulse 0.5s ease infinite":"none" }}/>
            <span style={{ fontSize:9, color:C.teal, fontWeight:700 }}>{syncDot ? "Syncing to Arjun..." : "Arjun connected ✓"}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={()=>setShowStickers(!showStickers)} style={{ padding:"6px 12px", borderRadius:50, background: showStickers?C.gradSoft||"rgba(255,107,157,0.15)":"rgba(255,255,255,0.05)", border:`1px solid ${C.b}`, color:C.muted, fontSize:11, fontWeight:700, cursor:"pointer" }}>😊 Stickers</button>
          <button onClick={clearCanvas} style={{ padding:"6px 12px", borderRadius:50, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.b}`, color:C.muted, fontSize:11, fontWeight:700, cursor:"pointer" }}>🗑️</button>
        </div>
      </div>

      {/* sticker picker */}
      {showStickers && (
        <div style={{ position:"relative", zIndex:5, margin:"0 12px", padding:"10px", borderRadius:16, background:"rgba(10,8,20,0.95)", border:`1px solid ${C.b}`, display:"flex", flexWrap:"wrap", gap:6, animation:"slideUp 0.2s ease both" }}>
          {stickers.map(s=>(
            <button key={s} onClick={()=>addSticker(s)} style={{ width:36, height:36, borderRadius:10, background:C.s, border:`1px solid ${C.b}`, fontSize:18, cursor:"pointer" }}>{s}</button>
          ))}
        </div>
      )}

      {/* canvas */}
      <div style={{ position:"relative", zIndex:2, flex:1, margin:"8px 12px 0", borderRadius:20, overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"inset 0 0 40px rgba(0,0,0,0.3)" }}>
        <canvas
          ref={canvasRef} width={296} height={370}
          style={{ width:"100%", height:"100%", cursor: tool==="eraser"?"cell":"crosshair", display:"block", background:"rgba(255,255,255,0.02)" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
        {/* partner cursor */}
        <div style={{ position:"absolute", top:"35%", left:"62%", zIndex:3, pointerEvents:"none" }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:C.blue, boxShadow:`0 0 8px ${C.blue}` }}/>
          <div style={{ fontSize:8, color:C.blue, fontWeight:700, marginTop:2, whiteSpace:"nowrap" }}>Arjun</div>
        </div>
      </div>

      {/* toolbar */}
      <div style={{ position:"relative", zIndex:2, padding:"10px 12px 8px" }}>
        {/* tools */}
        <div style={{ display:"flex", gap:6, marginBottom:8, justifyContent:"center" }}>
          {[["pen","✏️","Pen"],["brush","🖌️","Brush"],["eraser","⬜","Eraser"]].map(([t,ic,lb])=>(
            <button key={t} onClick={()=>setTool(t)} style={{
              padding:"8px 14px", borderRadius:12, border:"none", cursor:"pointer",
              background: tool===t ? C.grad : C.s,
              border: tool===t ? "none" : `1px solid ${C.b}`,
              color: tool===t?"#fff":C.muted, fontSize:11, fontWeight:700, fontFamily:"'Nunito',sans-serif",
            }}>{ic} {lb}</button>
          ))}
          {/* size */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:4 }}>
            {[2,4,8,14].map(s=>(
              <button key={s} onClick={()=>setSize(s)} style={{
                width:s+14, height:s+14, borderRadius:"50%", border:"none", cursor:"pointer",
                background: size===s ? C.pink : "rgba(255,255,255,0.15)",
                transition:"all 0.2s",
              }}/>
            ))}
          </div>
        </div>
        {/* colors */}
        <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
          {colors.map(col=>(
            <button key={col} onClick={()=>setColor(col)} style={{
              width:24, height:24, borderRadius:"50%", border: color===col?"2.5px solid #fff":"2px solid transparent",
              background:col, cursor:"pointer", transition:"transform 0.15s",
              transform: color===col ? "scale(1.2)" : "scale(1)",
              boxShadow: color===col ? `0 0 8px ${col}` : "none",
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   2. LIVE STATUS & VIBE CHECK
════════════════════════════════════════════════════════════ */
const VibeCheck = () => {
  const [myVibe, setMyVibe] = useState("happy");
  const [battery, setBattery] = useState(72);
  const [partnerBattery] = useState(38);
  const [tab, setTab] = useState("vibe");

  const vibes = [
    { id:"happy",    emoji:"😊", label:"Happy",    color:C.gold,   bg:"rgba(255,209,102,0.12)", border:"rgba(255,209,102,0.3)",  desc:"Feeling bright & joyful!" },
    { id:"stressed", emoji:"😰", label:"Stressed", color:C.blue,   bg:"rgba(107,157,255,0.10)", border:"rgba(107,157,255,0.3)",  desc:"Need some calm..." },
    { id:"sleepy",   emoji:"😴", label:"Sleepy",   color:C.purple, bg:"rgba(196,77,255,0.10)",  border:"rgba(196,77,255,0.3)",   desc:"ZZZ mode activated" },
    { id:"working",  emoji:"💼", label:"Working",  color:C.mint,   bg:"rgba(77,255,179,0.10)",  border:"rgba(77,255,179,0.3)",   desc:"Heads down, busy!" },
    { id:"romantic", emoji:"🥰", label:"Romantic", color:C.pink,   bg:"rgba(255,107,157,0.10)", border:"rgba(255,107,157,0.3)",  desc:"Missing you so much" },
    { id:"playful",  emoji:"🎉", label:"Playful",  color:C.orange, bg:"rgba(255,157,107,0.10)", border:"rgba(255,157,107,0.3)",  desc:"Let's do something fun!" },
  ];

  const currentVibe = vibes.find(v=>v.id===myVibe);
  const partnerVibe = vibes.find(v=>v.id==="romantic");

  const vibeThemeColors = {
    happy:    ["#ffd166","#ff9d6b"],
    stressed: ["#6b9dff","#4dffe0"],
    sleepy:   ["#c44dff","#6b9dff"],
    working:  ["#4dffb3","#6b9dff"],
    romantic: ["#ff6b9d","#c44dff"],
    playful:  ["#ff9d6b","#ffd166"],
  };
  const [c1,c2] = vibeThemeColors[myVibe] || [C.pink, C.purple];

  return (
    <div style={{ height:680, position:"relative", overflowY:"auto" }} className="screen">
      <Bg c1={c1} c2={c2}/>

      {/* ambient vibe overlay */}
      <div style={{
        position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
        background:`radial-gradient(ellipse at 50% 0%,${c1}0a 0%,transparent 60%)`,
        transition:"background 1s ease",
      }}/>

      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 20px" }}>
        {/* tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:18 }}>
          {["vibe","battery","widget"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"8px 16px", borderRadius:50, border:"none", cursor:"pointer",
              fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700,
              background: tab===t ? C.grad : C.s,
              color: tab===t?"#fff":C.muted,
              boxShadow: tab===t?"0 4px 14px rgba(255,107,157,0.3)":"none",
            }}>{t==="vibe"?"✨ Vibe":t==="battery"?"🔋 Battery":"📱 Widget"}</button>
          ))}
        </div>

        {tab==="vibe" && (
          <div className="tab-in">
            {/* partner vibe */}
            <div style={{
              padding:"16px", borderRadius:22, marginBottom:16,
              background: partnerVibe.bg, border:`1.5px solid ${partnerVibe.border}`,
              display:"flex", gap:14, alignItems:"center",
              boxShadow:`0 8px 32px ${partnerVibe.color}20`,
            }}>
              <div style={{ width:52, height:52, borderRadius:18, background:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>👦</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:C.muted, marginBottom:2 }}>Arjun is feeling</div>
                <div style={{ fontSize:18, fontWeight:800, color:partnerVibe.color }}>
                  {partnerVibe.emoji} {partnerVibe.label}
                </div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2, fontStyle:"italic" }}>"{partnerVibe.desc}"</div>
              </div>
              <div style={{ fontSize:8, color:C.muted }}>2m ago</div>
            </div>

            {/* my vibe picker */}
            <div style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Set Your Vibe</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {vibes.map(v=>(
                <button key={v.id} onClick={()=>setMyVibe(v.id)} style={{
                  padding:"14px 10px", borderRadius:18, border:"none", cursor:"pointer",
                  background: myVibe===v.id ? v.bg : C.s,
                  border: myVibe===v.id ? `1.5px solid ${v.border}` : `1px solid ${C.b}`,
                  boxShadow: myVibe===v.id ? `0 4px 20px ${v.color}25` : "none",
                  transition:"all 0.25s", textAlign:"left",
                }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>{v.emoji}</div>
                  <div style={{ fontSize:12, color: myVibe===v.id ? v.color : C.muted, fontWeight:700 }}>{v.label}</div>
                  {myVibe===v.id && <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{v.desc}</div>}
                </button>
              ))}
            </div>

            {/* app theme change notice */}
            <div style={{
              padding:"12px 14px", borderRadius:16,
              background: currentVibe.bg, border:`1px solid ${currentVibe.border}`,
            }}>
              <div style={{ fontSize:10, color:currentVibe.color, fontWeight:700, marginBottom:4 }}>✦ APP THEME CHANGED</div>
              <div style={{ fontSize:11, color:C.muted }}>
                Your vibe is <span style={{ color:currentVibe.color, fontWeight:700 }}>{currentVibe.label}</span> — app lighting has shifted to match your mood 🎨
              </div>
            </div>
          </div>
        )}

        {tab==="battery" && (
          <div className="tab-in">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              {[
                { name:"You", emoji:"👧", battery, color:battery>50?C.mint:battery>20?C.gold:"#ff4444" },
                { name:"Arjun", emoji:"👦", battery:partnerBattery, color:partnerBattery>50?C.mint:partnerBattery>20?C.gold:"#ff4444" },
              ].map((p,i)=>(
                <div key={i} style={{ padding:"16px", borderRadius:20, background:C.s, border:`1px solid ${C.b}`, textAlign:"center" }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{p.emoji}</div>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>{p.name}'s Phone</div>
                  {/* battery visual */}
                  <div style={{ position:"relative", margin:"0 auto 8px", width:40, height:72, border:`2px solid ${p.color}`, borderRadius:6 }}>
                    <div style={{ position:"absolute", top:-7, left:"50%", transform:"translateX(-50%)", width:14, height:6, background:p.color, borderRadius:"2px 2px 0 0" }}/>
                    <div style={{
                      position:"absolute", bottom:2, left:2, right:2,
                      height:`${p.battery}%`, background:p.color,
                      borderRadius:3, transition:"height 1s ease",
                      opacity:0.8,
                    }}/>
                  </div>
                  <div style={{ fontSize:20, fontWeight:800, color:p.color }}>{p.battery}%</div>
                  <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>
                    {p.battery > 80 ? "Fully charged ✓" : p.battery > 20 ? "Moderate" : "⚠️ Low battery!"}
                  </div>
                </div>
              ))}
            </div>

            {partnerBattery < 40 && (
              <div style={{ padding:"12px 14px", borderRadius:16, background:"rgba(255,209,102,0.08)", border:"1px solid rgba(255,209,102,0.25)", marginBottom:12 }}>
                <div style={{ fontSize:11, color:C.gold, fontWeight:700, marginBottom:4 }}>⚡ Arjun's battery is low!</div>
                <div style={{ fontSize:11, color:C.muted }}>Send a reminder to charge their phone 😊</div>
                <button style={{ marginTop:8, padding:"7px 14px", borderRadius:50, background:C.gradO||"linear-gradient(135deg,#ff9d6b,#ffd166)", border:"none", color:"#1a0a00", fontSize:11, fontWeight:700, cursor:"pointer" }}>Send Charge Reminder ⚡</button>
              </div>
            )}

            {/* battery slider */}
            <div style={{ padding:"14px", borderRadius:18, background:C.s, border:`1px solid ${C.b}` }}>
              <div style={{ fontSize:10, color:C.muted, fontWeight:700, marginBottom:8 }}>Simulate Your Battery</div>
              <input type="range" min="0" max="100" value={battery} onChange={e=>setBattery(Number(e.target.value))}
                style={{ width:"100%", accentColor:C.pink }}/>
              <div style={{ fontSize:10, color:C.muted, marginTop:4, textAlign:"right" }}>{battery}%</div>
            </div>
          </div>
        )}

        {tab==="widget" && (
          <div className="tab-in">
            <div style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Home Screen Widget Preview</div>

            {/* small widget */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:9, color:C.dim, marginBottom:6 }}>2×2 Small</div>
              <div style={{
                width:150, height:150, borderRadius:24, padding:"14px",
                background:"linear-gradient(135deg,rgba(255,107,157,0.15),rgba(196,77,255,0.15))",
                border:"1px solid rgba(255,107,157,0.2)",
                boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
              }}>
                <div style={{ fontSize:9, color:C.muted, letterSpacing:"0.8px", marginBottom:6 }}>LOVESPACE</div>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                  <div style={{ width:30, height:30, borderRadius:10, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👦</div>
                  <div>
                    <div style={{ fontSize:12, color:C.text, fontWeight:700 }}>Arjun</div>
                    <div style={{ fontSize:10 }}>{partnerVibe.emoji} {partnerVibe.label}</div>
                  </div>
                </div>
                <div style={{ fontSize:8, color:C.muted }}>🔋 {partnerBattery}% · 2m ago</div>
              </div>
            </div>

            {/* wide widget */}
            <div>
              <div style={{ fontSize:9, color:C.dim, marginBottom:6 }}>4×2 Wide</div>
              <div style={{
                width:"100%", borderRadius:24, padding:"16px",
                background:"linear-gradient(135deg,rgba(107,157,255,0.1),rgba(77,255,224,0.08))",
                border:"1px solid rgba(107,157,255,0.2)",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ width:36, height:36, borderRadius:12, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>👧</div>
                    <div>
                      <div style={{ fontSize:11, color:C.text, fontWeight:700 }}>You · {currentVibe.emoji}</div>
                      <div style={{ fontSize:9, color:C.muted }}>🔋 {battery}%</div>
                    </div>
                  </div>
                  <div style={{ fontSize:20, animation:"heartBeat 2s ease infinite" }}>💕</div>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:11, color:C.text, fontWeight:700 }}>{partnerVibe.emoji} · Arjun</div>
                      <div style={{ fontSize:9, color:C.muted }}>🔋 {partnerBattery}%</div>
                    </div>
                    <div style={{ width:36, height:36, borderRadius:12, background:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>👦</div>
                  </div>
                </div>
                <div style={{ marginTop:10, height:2, borderRadius:1, background:`linear-gradient(90deg,${c1},${c2})`, opacity:0.5 }}/>
                <div style={{ marginTop:6, fontSize:9, color:C.dim, textAlign:"center" }}>Together 142 days ❤️</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   3. BUCKET LIST & PROGRESS TRACKER
════════════════════════════════════════════════════════════ */
const BucketList = () => {
  const [goals, setGoals] = useState([
    { id:1, title:"Trip to Paris 🗼",          cat:"Travel",  progress:65, both:true,  date:"Dec 2025", emoji:"✈️" },
    { id:2, title:"Adopt a pet together 🐾",    cat:"Life",    progress:30, both:false, date:"2025",     emoji:"🐶" },
    { id:3, title:"Watch 100 movies 🎬",         cat:"Fun",     progress:82, both:true,  date:"Oct 2025", emoji:"🍿" },
    { id:4, title:"Cook a 5-course dinner 🍽️",  cat:"Food",    progress:100,both:true,  date:"Done!",    emoji:"👨‍🍳" },
    { id:5, title:"Learn to dance together 💃",  cat:"Skills",  progress:20, both:false, date:"2026",     emoji:"💃" },
    { id:6, title:"Sunrise hike 🌄",             cat:"Travel",  progress:0,  both:false, date:"2025",     emoji:"⛰️" },
  ]);
  const [fireworks, setFireworks] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [filter, setFilter] = useState("All");

  const cats = ["All","Travel","Fun","Life","Food","Skills"];

  const complete = (id) => {
    setGoals(gs => gs.map(g => g.id===id ? {...g, progress:100, both:true} : g));
    const fw = Array.from({length:12},(_,i) => ({
      id:Date.now()+i,
      x: 20+Math.random()*80, y: 20+Math.random()*60,
      color:[C.pink,C.purple,C.gold,C.mint,C.blue,C.orange][Math.floor(Math.random()*6)],
      size: 12+Math.random()*20,
    }));
    setFireworks(fw);
    setTimeout(()=>setFireworks([]),1400);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(gs => [...gs, { id:Date.now(), title:newGoal, cat:"Life", progress:0, both:false, date:"2025", emoji:"⭐" }]);
    setNewGoal(""); setAdding(false);
  };

  const filtered = filter==="All" ? goals : goals.filter(g=>g.cat===filter);
  const done = goals.filter(g=>g.progress===100).length;
  const total = goals.length;

  return (
    <div style={{ height:680, position:"relative", overflowY:"auto" }} className="screen">
      <Bg c1={C.gold} c2={C.mint}/>

      {/* fireworks overlay */}
      {fireworks.map(fw=>(
        <div key={fw.id} style={{
          position:"absolute", left:`${fw.x}%`, top:`${fw.y}%`,
          width:fw.size, height:fw.size, zIndex:50, pointerEvents:"none",
          fontSize:fw.size, animation:"firework 1.2s ease forwards",
        }}>🎆</div>
      ))}
      {fireworks.length>0 && (
        <div style={{ position:"absolute", inset:0, zIndex:49, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:C.gold, fontWeight:700, textShadow:`0 0 30px ${C.gold}`, animation:"heartBeat 0.5s ease" }}>Goal Complete! 🎉</div>
        </div>
      )}

      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>Bucket List</h2>
            <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Our couple goals 💫</p>
          </div>
          <button onClick={()=>setAdding(!adding)} style={{
            padding:"9px 16px", borderRadius:50,
            background: adding ? "rgba(255,255,255,0.05)" : C.grad,
            border: adding ? `1px solid ${C.b}` : "none",
            color: adding ? C.muted : "#fff",
            fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif",
            boxShadow: adding ? "none" : "0 4px 16px rgba(255,107,157,0.35)",
          }}>{adding ? "✕ Cancel" : "+ Add Goal"}</button>
        </div>

        {/* overall progress */}
        <div style={{ marginTop:14, padding:"14px", borderRadius:18, background:"rgba(255,209,102,0.08)", border:"1px solid rgba(255,209,102,0.2)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:11, color:C.muted, fontWeight:700 }}>Overall Progress</span>
            <span style={{ fontSize:13, color:C.gold, fontWeight:800 }}>{done}/{total} Done</span>
          </div>
          <div style={{ height:8, borderRadius:10, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(done/total)*100}%`, borderRadius:10, background:C.gradG||"linear-gradient(135deg,#4dffb3,#ffd166)", transition:"width 0.8s ease" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10, color:C.dim }}>
            <span>{Math.round((done/total)*100)}% complete</span>
            <span>{total-done} remaining</span>
          </div>
        </div>
      </div>

      {/* add form */}
      {adding && (
        <div style={{ position:"relative", zIndex:2, margin:"0 20px 12px", padding:"14px", borderRadius:18, background:C.s, border:`1px solid ${C.b}`, animation:"slideUp 0.2s ease both" }}>
          <input value={newGoal} onChange={e=>setNewGoal(e.target.value)}
            placeholder="e.g. Go skydiving together 🪂"
            style={{ width:"100%", padding:"11px 14px", borderRadius:12, background:"rgba(255,255,255,0.06)", border:`1px solid ${C.b}`, color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif", marginBottom:8 }}/>
          <button onClick={addGoal} style={{ width:"100%", padding:"11px", borderRadius:12, background:C.grad, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>Add to Bucket List ✨</button>
        </div>
      )}

      {/* filters */}
      <div style={{ position:"relative", zIndex:2, padding:"0 20px 12px", display:"flex", gap:6, flexWrap:"nowrap", overflowX:"auto" }}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{
            padding:"6px 14px", borderRadius:50, border:"none", cursor:"pointer", whiteSpace:"nowrap",
            background: filter===c ? C.grad : C.s,
            border: filter===c ? "none" : `1px solid ${C.b}`,
            color: filter===c?"#fff":C.muted, fontSize:11, fontWeight:700,
            fontFamily:"'Nunito',sans-serif",
            boxShadow: filter===c?"0 3px 12px rgba(255,107,157,0.3)":"none",
          }}>{c}</button>
        ))}
      </div>

      {/* goal cards */}
      <div style={{ position:"relative", zIndex:2, padding:"0 20px 24px" }}>
        {filtered.map((g,i)=>(
          <div key={g.id} style={{
            padding:"14px", borderRadius:20, marginBottom:10,
            background: g.progress===100 ? "rgba(77,255,179,0.07)" : C.s,
            border: g.progress===100 ? "1.5px solid rgba(77,255,179,0.25)" : `1px solid ${C.b}`,
            animation:`fadeUp 0.3s ease ${i*0.06}s both`,
          }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{
                width:44, height:44, borderRadius:14, flexShrink:0,
                background: g.progress===100 ? "rgba(77,255,179,0.15)" : "rgba(255,255,255,0.06)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
              }}>{g.progress===100?"✅":g.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ fontSize:13, color: g.progress===100?C.mint:C.text, fontWeight:700, textDecoration: g.progress===100?"line-through":"none", textDecorationColor:"rgba(77,255,179,0.5)" }}>{g.title}</div>
                  <span style={{ fontSize:9, color:C.dim, padding:"2px 8px", borderRadius:50, background:C.s, border:`1px solid ${C.b}` }}>{g.cat}</span>
                </div>
                {/* progress bar */}
                <div style={{ height:5, borderRadius:10, background:"rgba(255,255,255,0.07)", overflow:"hidden", marginBottom:4 }}>
                  <div style={{ height:"100%", width:`${g.progress}%`, borderRadius:10, background: g.progress===100?C.gradG:C.grad, transition:"width 0.8s ease" }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <span style={{ fontSize:9, color:C.dim }}>{g.progress}%</span>
                    {g.both && <span style={{ fontSize:9, color:C.mint }}>✓ Both agreed</span>}
                    <span style={{ fontSize:9, color:C.dim }}>· {g.date}</span>
                  </div>
                  {g.progress < 100 && (
                    <button onClick={()=>complete(g.id)} style={{
                      padding:"4px 10px", borderRadius:50,
                      background:"rgba(77,255,179,0.1)", border:"1px solid rgba(77,255,179,0.25)",
                      color:C.mint, fontSize:9, fontWeight:700, cursor:"pointer",
                    }}>Mark Done ✓</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   4. VOICE MEMOS / AUDIO WALKIE-TALKIE
════════════════════════════════════════════════════════════ */
const VoiceMemos = () => {
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [playing, setPlaying] = useState(null);
  const [playProgress, setPlayProgress] = useState({});
  const timerRef = useRef(null);
  const playTimers = useRef({});

  const memos = [
    { id:1, from:"arjun", duration:14, time:"9:42 AM", waveform:[3,7,12,8,15,10,6,18,14,9,11,7,4,16,8,12,5,9,13,7], text:"Good morning! ☀️" },
    { id:2, from:"me",    duration:8,  time:"9:45 AM", waveform:[5,10,8,14,6,11,9,7,12,15,8,10,6,13,9,11,7,8,10,6], text:"Sent" },
    { id:3, from:"arjun", duration:22, time:"10:01 AM",waveform:[4,8,12,16,10,7,14,9,18,12,8,15,6,11,9,14,8,12,7,10], text:"Miss you so much 😭" },
    { id:4, from:"me",    duration:6,  time:"10:03 AM",waveform:[8,12,9,15,7,11,8,13,10,6,14,9,11,7,12,8,10,13,6,9], text:"Sent" },
  ];

  useEffect(()=>{
    if (recording) {
      timerRef.current = setInterval(()=>setRecTime(t=>t+1),1000);
    } else {
      clearInterval(timerRef.current); setRecTime(0);
    }
    return ()=>clearInterval(timerRef.current);
  },[recording]);

  const togglePlay = (id, dur) => {
    if (playing===id) {
      setPlaying(null); clearInterval(playTimers.current[id]);
      setPlayProgress(p=>({...p,[id]:0}));
    } else {
      setPlaying(id);
      let p=0;
      playTimers.current[id] = setInterval(()=>{
        p += 100/dur;
        if (p>=100) { clearInterval(playTimers.current[id]); setPlaying(null); setPlayProgress(pp=>({...pp,[id]:0})); }
        else setPlayProgress(pp=>({...pp,[id]:p}));
      },1000);
    }
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{ height:680, position:"relative", display:"flex", flexDirection:"column" }} className="screen">
      <Bg c1={C.teal} c2={C.blue}/>

      {/* header */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 18px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:14, background:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👦</div>
          <div>
            <div style={{ fontSize:14, color:C.text, fontWeight:700 }}>Arjun</div>
            <div style={{ display:"flex", gap:4, alignItems:"center" }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:C.teal, animation:"pulse 1.2s ease infinite" }}/>
              <span style={{ fontSize:10, color:C.teal }}>Online</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize:12, color:C.muted }}>Voice Chat 🎙️</div>
      </div>

      {/* messages */}
      <div style={{ flex:1, overflowY:"auto", position:"relative", zIndex:2, padding:"8px 16px" }}>
        {memos.map((m,i)=>(
          <div key={m.id} style={{ display:"flex", justifyContent:m.from==="me"?"flex-end":"flex-start", marginBottom:12 }}>
            {m.from==="arjun" && (
              <div style={{ width:30, height:30, borderRadius:11, background:"linear-gradient(135deg,#6b9dff,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, marginRight:7, alignSelf:"flex-end" }}>👦</div>
            )}
            <div style={{ maxWidth:"72%" }}>
              {/* audio bubble */}
              <div style={{
                padding:"12px 14px", borderRadius: m.from==="me"?"18px 18px 4px 18px":"18px 18px 18px 4px",
                background: m.from==="me" ? C.grad : "rgba(107,157,255,0.12)",
                border: m.from==="me" ? "none" : "1px solid rgba(107,157,255,0.25)",
                boxShadow: m.from==="me" ? "0 4px 16px rgba(255,107,157,0.3)" : "none",
                display:"flex", gap:10, alignItems:"center", minWidth:200,
              }}>
                {/* play button */}
                <button onClick={()=>togglePlay(m.id, m.duration)} style={{
                  width:34, height:34, borderRadius:"50%", flexShrink:0, border:"none", cursor:"pointer",
                  background: m.from==="me" ? "rgba(255,255,255,0.25)" : "rgba(107,157,255,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                  color:"#fff",
                }}>{playing===m.id ? "⏸" : "▶"}</button>

                <div style={{ flex:1 }}>
                  {/* waveform */}
                  <div style={{ display:"flex", alignItems:"center", gap:1.5, height:28, marginBottom:4 }}>
                    {m.waveform.map((h,j)=>(
                      <div key={j} style={{
                        flex:1, borderRadius:2,
                        background: playing===m.id && (j/m.waveform.length*100) <= (playProgress[m.id]||0)
                          ? (m.from==="me"?"rgba(255,255,255,0.9)":"rgba(77,255,224,0.9)")
                          : (m.from==="me"?"rgba(255,255,255,0.35)":"rgba(107,157,255,0.35)"),
                        height: h,
                        transition:"background 0.1s",
                      }}/>
                    ))}
                  </div>
                  {/* progress */}
                  {playing===m.id && (
                    <div style={{ height:2, borderRadius:1, background:"rgba(255,255,255,0.15)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${playProgress[m.id]||0}%`, background:"rgba(255,255,255,0.6)", transition:"width 0.9s linear" }}/>
                    </div>
                  )}
                  <div style={{ fontSize:9, color: m.from==="me"?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.3)", marginTop:3 }}>{fmt(m.duration)}</div>
                </div>
              </div>
              <div style={{ fontSize:9, color:C.dim, marginTop:3, textAlign: m.from==="me"?"right":"left" }}>
                {m.time} {m.from==="me"&&"✓✓"}
              </div>
            </div>
          </div>
        ))}

        {/* walkie talkie hint */}
        <div style={{ textAlign:"center", margin:"8px 0" }}>
          <span style={{ fontSize:10, color:C.dim, background:C.s, padding:"4px 12px", borderRadius:50, border:`1px solid ${C.b}` }}>Hold mic to talk like walkie-talkie 🎙️</span>
        </div>
      </div>

      {/* recording waveform visualizer */}
      {recording && (
        <div style={{
          position:"relative", zIndex:2, margin:"0 16px 8px", padding:"12px",
          borderRadius:18, background:"rgba(255,68,68,0.08)", border:"1.5px solid rgba(255,68,68,0.3)",
          display:"flex", alignItems:"center", gap:10,
          animation:"slideUp 0.2s ease both",
        }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#ff4444", animation:"recordPulse 0.8s ease infinite" }}/>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:2, height:28 }}>
            {[...Array(24)].map((_,i)=>(
              <div key={i} style={{
                flex:1, borderRadius:2, background:"#ff6b6b",
                animation:`waveBar ${0.3+Math.random()*0.4}s ease ${Math.random()*0.2}s infinite`,
                transformOrigin:"center", minHeight:3,
              }}/>
            ))}
          </div>
          <span style={{ fontSize:12, color:"#ff6b6b", fontWeight:800, minWidth:36 }}>{fmt(recTime)}</span>
        </div>
      )}

      {/* bottom bar */}
      <div style={{ position:"relative", zIndex:2, padding:"8px 14px 20px", borderTop:`1px solid ${C.b}`, background:"rgba(7,5,14,0.95)", backdropFilter:"blur(20px)" }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button style={{ width:38, height:38, borderRadius:12, background:C.s, border:`1px solid ${C.b}`, fontSize:17, cursor:"pointer" }}>😊</button>
          <input placeholder="Type or hold mic..." style={{ flex:1, padding:"11px 14px", borderRadius:50, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.b}`, color:C.text, fontSize:12, outline:"none", fontFamily:"'Nunito',sans-serif" }}/>
          <button style={{ width:38, height:38, borderRadius:12, background:C.s, border:`1px solid ${C.b}`, fontSize:17, cursor:"pointer" }}>📎</button>

          {/* MIC BUTTON */}
          <button
            onMouseDown={()=>setRecording(true)}
            onMouseUp={()=>setRecording(false)}
            onTouchStart={()=>setRecording(true)}
            onTouchEnd={()=>setRecording(false)}
            style={{
              width:44, height:44, borderRadius:"50%", border:"none", cursor:"pointer",
              background: recording ? "#ff4444" : C.gradB,
              boxShadow: recording ? "0 0 0 8px rgba(255,68,68,0.2), 0 6px 20px rgba(255,68,68,0.4)" : "0 4px 16px rgba(107,157,255,0.4)",
              fontSize:20, display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.2s",
              animation: recording ? "recordPulse 0.8s ease infinite" : "none",
            }}>🎙️</button>
        </div>
        <div style={{ textAlign:"center", marginTop:6, fontSize:9, color:C.dim }}>
          {recording ? "🔴 Recording... Release to send" : "Hold 🎙️ to record voice memo"}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════════ */
export default function App() {
  const [active, setActive] = useState(null);

  const screens = [
    { id:"canvas",  label:"🎨 Love Canvas",     accent:C.pink,   Component: LoveCanvas  },
    { id:"vibe",    label:"🔋 Vibe Check",       accent:C.gold,   Component: VibeCheck   },
    { id:"bucket",  label:"🎯 Bucket List",      accent:C.mint,   Component: BucketList  },
    { id:"voice",   label:"🎙️ Voice Memos",     accent:C.teal,   Component: VoiceMemos  },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 20px 60px", fontFamily:"'Nunito',sans-serif" }}>
      <G/>

      {/* header */}
      <div style={{ maxWidth:1400, margin:"0 auto 12px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:12, marginBottom:8 }}>
          <div style={{ width:46, height:46, borderRadius:16, background:"linear-gradient(135deg,#ff6b9d,#c44dff)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(255,107,157,0.4)", animation:"heartBeat 2.4s ease-in-out infinite" }}>
            <svg width="26" height="24" viewBox="0 0 24 22" fill="none">
              <path d="M12 20.5C12 20.5 1 13.5 1 6.5C1 3.46 3.46 1 6.5 1C9 1 11.1 2.56 12 4.78C12.9 2.56 15 1 17.5 1C20.54 1 23 3.46 23 6.5C23 13.5 12 20.5 12 20.5Z" fill="white" fillOpacity="0.95"/>
            </svg>
          </div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:500, background:"linear-gradient(135deg,#ff6b9d,#c44dff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LoveSpace</span>
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:8 }}>Advanced Features · Phase 3</div>
        <div style={{ display:"inline-flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
          {["🎨 Live Drawing","🔋 Vibe Sync","🎯 Goals + Fireworks","🎙️ Walkie-Talkie","📱 Home Widget"].map(t=>(
            <span key={t} style={{ padding:"4px 12px", borderRadius:50, background:"rgba(255,107,157,0.07)", border:"1px solid rgba(255,107,157,0.14)", fontSize:10, color:"rgba(255,107,157,0.65)", fontWeight:700 }}>{t}</span>
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
          color: !active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
          transition:"all 0.25s",
        }}>Show All</button>
      </div>

      {/* phones */}
      <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:36 }}>
        {screens.filter(s=>!active||active===s.id).map(s=>{
          const Comp = s.Component;
          return (
            <Phone key={s.id} label={s.label} accent={s.accent} vibe={s.id==="vibe"?"romantic":null}>
              <Comp/>
            </Phone>
          );
        })}
      </div>
    </div>
  );
}
