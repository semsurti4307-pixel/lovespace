import { useState, useEffect, useRef, useCallback } from "react";
import { subscribeToAuthChanges, signUp, login, logout, linkPartner, unlinkPartner, setUserStatus, resetPassword } from "./services/authService";
import { doc, getDoc, onSnapshot, updateDoc, collection } from "firebase/firestore";
import { db } from "./services/firebaseConfig";
import { sendMessage, subscribeToMessages, deleteMessage } from "./services/chatService";
import { addMemory, subscribeToMemories, uploadToCloudinary, deleteMemory } from "./services/memoryService";
import { addDateIdea, subscribeToDates, toggleDateStatus, addCapsule, subscribeToCapsules, syncGameAction, subscribeToGameState } from "./services/extraService";
import { subscribeToNotifications, clearNotifications, addNotification } from "./services/notificationService";
import { subscribeToHeartSync, updateHeartTouch } from "./services/syncService";
import { addMapMemory, subscribeToMapMemories } from "./services/mapService";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import TogetherModeScreen from "./TogetherMode";

/* ─── GLOBAL STYLES ─────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Nunito:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { 
      background: #050408; 
      font-family: 'Nunito', sans-serif; 
      overflow: hidden; 
      height: 100vh; 
      width: 100vw;
      overscroll-behavior: none; /* Prevent browser bounce */
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    #root {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
      background: #050408;
    }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,107,157,0.3); border-radius: 2px; }
    input::placeholder { color: rgba(255,255,255,0.2); }
    input { caret-color: #ff6b9d; outline: none; }

    @keyframes fadeIn  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
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
    @keyframes slideUp {
      from { transform:translateY(100%); }
      to   { transform:translateY(0); }
    }
    .screen { animation: fadeIn 0.45s ease both; }
    .msg-in  { animation: slideRight 0.3s ease both; }
    @keyframes progressBar { from{width:0%} to{width:var(--w)} }
    @keyframes heartBeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.25)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} }
    @keyframes glow      { 0%,100%{box-shadow:0 0 20px rgba(255,107,157,0.25)} 50%{box-shadow:0 0 50px rgba(255,107,157,0.6),0 0 80px rgba(196,77,255,0.2)} }
    @keyframes ripple    { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.8);opacity:0} }
    @keyframes transitionFade { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes waveBar   { 0%,100%{transform:scaleY(0.35)} 50%{transform:scaleY(1)} }
    @keyframes orbRing   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes vinyl     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes callRing  { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.8);opacity:0} }
    @keyframes micWave   { 0%,100%{height:3px;opacity:0.4} 50%{height:12px;opacity:1} }
    @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .tab-active { animation: fadeIn 0.3s ease both; }
    @keyframes heartbeatPulse {
      0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255,107,157,0.5)); }
      20% { transform: scale(1.15); filter: drop-shadow(0 0 20px rgba(255,107,157,0.8)); }
      40% { transform: scale(1.05); }
      60% { transform: scale(1.2); filter: drop-shadow(0 0 30px rgba(255,107,157,1)); }
      100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255,107,157,0.5)); }
    }
    @keyframes floating {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes angryShaking {
      0% { transform: translate(1px, 1px) rotate(0deg); }
      10% { transform: translate(-1px, -2px) rotate(-1deg); }
      20% { transform: translate(-3px, 0px) rotate(1deg); }
      30% { transform: translate(3px, 2px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(1deg); }
      50% { transform: translate(-1px, 2px) rotate(-1deg); }
      60% { transform: translate(-3px, 1px) rotate(0deg); }
      70% { transform: translate(3px, 1px) rotate(-1deg); }
      80% { transform: translate(-1px, -1px) rotate(1deg); }
      90% { transform: translate(1px, 2px) rotate(0deg); }
      100% { transform: translate(1px, -2px) rotate(-1deg); }
    }
    @keyframes dreamBlur {
      0% { filter: blur(0px); }
      100% { filter: blur(2px); }
    }
    @keyframes starTwinkle {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    .leaflet-control-zoom-in, .leaflet-control-zoom-out {
      background: rgba(13,10,20,0.8) !important;
      color: #fff !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
    }
    .leaflet-container { background: #0d0a14 !important; }
    .leaflet-bar { border: none !important; }
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

/* ─── APP CONTAINER ──────────────────────────────────────── */
const AppContainer = ({ children }) => (
  <div style={{ 
    width: "100%", 
    maxWidth: "430px",
    height: "100vh", 
    height: "100svh",
    background: "#0d0a14",
    overflow: "hidden",
    position: "relative",
    display: "flex", // Stack content and nav
    flexDirection: "column",
    boxShadow: "0 0 100px rgba(196,77,255,0.15)",
    borderLeft: "1px solid rgba(255,255,255,0.05)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    margin: "0 auto", // Center on desktop
  }}>
    {children}
  </div>
);

/* ─── SHARED COMPONENTS ──────────────────────────────────── */
const MoodAvatar = ({ mood, gender, size = 52, isPartner = false }) => {
  const moodEffects = {
    "😊": { bg: "linear-gradient(135deg, #FFD93D, #FF8400)", anim: "floating 3s ease-in-out infinite" },
    "😍": { bg: "linear-gradient(135deg, #FF0060, #FF6B9D)", anim: "heartBeat 1.5s ease-in-out infinite" },
    "🥰": { bg: "linear-gradient(135deg, #FF6B9D, #C44DFF)", anim: "heartBeat 2s ease-in-out infinite" },
    "😌": { bg: "linear-gradient(135deg, #6B9DFF, #4DAAFF)", anim: "floating 4s ease-in-out infinite" },
    "🫂": { bg: "linear-gradient(135deg, #9D6BFF, #6B9DFF)", anim: "floating 3.5s ease-in-out infinite" },
    "💫": { bg: "linear-gradient(135deg, #FFD93D, #FFFFFF)", anim: "orbit 5s linear infinite" },
    "😡": { bg: "linear-gradient(135deg, #FF4B2B, #FF416C)", anim: "angryShaking 0.2s infinite" },
    "😢": { bg: "linear-gradient(135deg, #2C3E50, #000000)", anim: "fadeIn 2s infinite alternate" },
  };

  const effect = moodEffects[mood] || moodEffects["🥰"];

  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.35,
      background: effect.bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize: size * 0.5,
      boxShadow: `0 8px 24px ${isPartner ? "rgba(107,157,255,0.3)" : "rgba(255,107,157,0.3)"}`,
      animation: effect.anim,
      border: `2px solid rgba(255,255,255,0.2)`,
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ position:"absolute", inset:0, background: "rgba(255,255,255,0.1)", backdropFilter:"blur(1px)" }} />
      <span style={{ position:"relative", zIndex:1 }}>{mood}</span>
    </div>
  );
};
const GlassBg = () => (
  <>
    <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#0d0a14 0%,#150d20 50%,#0d0a14 100%)", zIndex:0, minHeight:"100vh" }}/>
    <div style={{ position:"absolute", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,77,255,0.12) 0%,transparent 70%)", top:-60, right:-60, zIndex:0 }}/>
    <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,107,157,0.1) 0%,transparent 70%)", bottom:-40, left:-40, zIndex:0 }}/>
  </>
);

const BottomNav = ({ active, setScreen }) => {
  const tabs = [
    { id:"home",    icon:"🏠", label:"Home" },
    { id:"chat",    icon:"💬", label:"Chat" },
    { id:"memory",  icon:"📸", label:"Memories" },
    { id:"profile", icon:"👤", label:"Profile" },
  ];
  return (
    <div style={{
      position:"absolute", bottom:0, width:"100%", height:"70px",
      background:"rgba(13,10,20,0.96)", backdropFilter:"blur(20px)",
      borderTop:`1px solid ${C.border}`,
      display:"flex", alignItems:"center",
      zIndex:110,
    }}>
      {tabs.map(t=>(
        <div key={t.id} onClick={() => setScreen(t.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer" }}>
          <span style={{ fontSize:20 }}>{t.icon}</span>
          <span style={{ fontSize:9, color: active===t.id ? C.pink : C.dim, fontWeight: active===t.id ? 700:400, letterSpacing:"0.5px" }}>{t.label}</span>
          {active===t.id && <div style={{ width:16, height:2, borderRadius:1, background:C.grad }}/>}
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCREENS
════════════════════════════════════════════════════════════ */
const SplashScreen = () => (
  <div style={{ minHeight:"100vh", position:"relative", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:0 }} className="screen">
    <GlassBg/>
    <div style={{ position:"absolute", top:"50%", left:"50%", width:0, height:0, zIndex:2 }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:"rgba(255,107,157,0.7)", boxShadow:"0 0 12px rgba(255,107,157,0.8)", animation:"orbit 4s linear infinite", position:"absolute" }}/>
    </div>
    {[0,0.6,1.2].map((d,i)=>(
      <div key={i} style={{ position:"absolute", width:180+i*60, height:180+i*60, borderRadius:"50%", border:"1px solid rgba(255,107,157,0.15)", animation:`ripple 2.4s ease-out ${d}s infinite`, zIndex:1 }}/>
    ))}

    <div style={{ position:"relative", zIndex:3, display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
      <div style={{ width:90, height:90, borderRadius:26, background: C.grad, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 12px 48px rgba(255,107,157,0.5)", animation:"glow 2.5s ease-in-out infinite", marginBottom:4 }}>
        <svg width="50" height="46" viewBox="0 0 24 22" fill="none">
          <path d="M12 20.5C12 20.5 1 13.5 1 6.5C1 3.46 3.46 1 6.5 1C9 1 11.1 2.56 12 4.78C12.9 2.56 15 1 17.5 1C20.54 1 23 3.46 23 6.5C23 13.5 12 20.5 12 20.5Z" fill="white" fillOpacity="0.95"/>
        </svg>
      </div>
      <div style={{ textAlign:"center" }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:500, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:6 }}>LoveSpace</h1>
        <p style={{ fontSize:12, color:C.muted, letterSpacing:"2px", textTransform:"uppercase" }}>Loading...</p>
      </div>
    </div>
  </div>
);

const LoginScreen = () => {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [gender, setGender] = useState("male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Input validation
  const validate = () => {
    if (!email.trim()) { setError("Email is required"); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email"); return false; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return false; }
    if (tab === "signup" && !name.trim()) { setError("Name is required"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!validate()) return;
    setLoading(true);
    if (tab === "signup") {
      const res = await signUp(email, password, name, partnerCode, gender);
      if (!res.success) setError(res.error);
    } else {
      const res = await login(email, password);
      if (!res.success) setError(res.error);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) { setError("Enter your email first"); return; }
    setLoading(true); setError("");
    const res = await resetPassword(forgotEmail);
    setLoading(false);
    if (res.success) {
      setSuccess("Password reset email sent! Check your inbox 📧");
      setShowForgot(false); setForgotEmail("");
    } else setError(res.error);
  };

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflowY:"auto", paddingTop:36 }} className="screen">
      <GlassBg/>
      <div style={{ position:"relative", zIndex:2, padding:"0 24px 32px" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
          <Logo size={36}/>
        </div>
        <p style={{ textAlign:"center", fontSize:11, color:C.muted, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:10 }}>your private couple space</p>
        
        {error && <div style={{ background:"rgba(255,107,157,0.1)", border:"1px solid #ff6b9d", padding:10, borderRadius:8, color:"#ff6b9d", fontSize:12, textAlign:"center", marginBottom:16, animation:"fadeIn 0.3s ease" }}>{error}</div>}
        {success && <div style={{ background:"rgba(77,255,179,0.1)", border:"1px solid #4dffb3", padding:10, borderRadius:8, color:"#4dffb3", fontSize:12, textAlign:"center", marginBottom:16, animation:"fadeIn 0.3s ease" }}>{success}</div>}

        {/* Forgot Password Modal */}
        {showForgot && (
          <div style={{ padding:20, borderRadius:20, background:"rgba(107,157,255,0.08)", border:"1px solid rgba(107,157,255,0.2)", marginBottom:20, animation:"fadeIn 0.3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontSize:13, color:C.text, fontWeight:700 }}>🔑 Reset Password</span>
              <span onClick={()=>setShowForgot(false)} style={{ color:C.muted, cursor:"pointer", fontSize:18 }}>✕</span>
            </div>
            <p style={{ fontSize:11, color:C.muted, marginBottom:12, lineHeight:1.5 }}>Enter your email and we'll send a reset link</p>
            <input type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} placeholder="your@email.com" style={{ width:"100%", padding:"12px 16px", background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif", marginBottom:12 }}/>
            <button onClick={handleForgotPassword} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:12, background:"linear-gradient(135deg,#6b9dff,#c44dff)", border:"none", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", opacity: loading ? 0.7 : 1, fontFamily:"'Nunito',sans-serif" }}>{loading ? "Sending..." : "Send Reset Link 📧"}</button>
          </div>
        )}

        <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:14, padding:4, marginBottom:22, border:`1px solid ${C.border}` }}>
          {["login","signup"].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setError("");setSuccess("");}} style={{
              flex:1, padding:"9px 0", border:"none", borderRadius:10, cursor:"pointer",
              fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:600,
              background: tab===t ? C.gradSoft : "transparent",
              color: tab===t ? "#fff" : C.muted,
              transition:"all 0.25s",
              boxShadow: tab===t ? "0 2px 12px rgba(255,107,157,0.2)" : "none",
            }}>{t==="login"?"Sign In":"Join Together"}</button>
          ))}
        </div>

        {tab==="signup" && (
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:6, display:"flex", gap:5, alignItems:"center" }}>
              <span style={{ background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>✦</span>Your Name
            </label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="What should we call you?" style={{ width:"100%", padding:"13px 16px", background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:13, color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif" }}/>
          </div>
        )}
        
        {tab==="signup" && (
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:8, display:"flex", gap:5, alignItems:"center" }}>
              <span style={{ background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>🚻</span>Select Gender
            </label>
            <div style={{ display:"flex", gap:10 }}>
              {[{id:"male", icon:"👦", label:"Male"}, {id:"female", icon:"👧", label:"Female"}].map(g => (
                <div key={g.id} onClick={() => setGender(g.id)} style={{
                  flex:1, padding:"12px", borderRadius:14, cursor:"pointer",
                  background: gender===g.id ? C.gradSoft : "rgba(255,255,255,0.03)",
                  border: `1px solid ${gender===g.id ? C.pink : C.border}`,
                  textAlign:"center", transition:"all 0.25s"
                }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{g.icon}</div>
                  <div style={{ fontSize:10, color: gender===g.id ? "#fff" : C.muted, fontWeight:600 }}>{g.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:6, display:"flex", gap:5, alignItems:"center" }}>
            <span style={{ background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>✉</span>Email
          </label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{ width:"100%", padding:"13px 16px", background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:13, color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif" }}/>
        </div>
        
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:6, display:"flex", gap:5, alignItems:"center" }}>
            <span style={{ background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>◈</span>Password
          </label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="········" style={{ width:"100%", padding:"13px 16px", background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:13, color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif" }}/>
        </div>
        
        {tab==="login" && (
          <div onClick={()=>{setShowForgot(true);setForgotEmail(email);}} style={{ textAlign:"right", marginBottom:12, cursor:"pointer" }}>
            <span style={{ fontSize:11, color:C.pink, fontWeight:600 }}>Forgot Password? 🔑</span>
          </div>
        )}

        {tab==="signup" && (
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:6, display:"flex", gap:5, alignItems:"center" }}>
              <span style={{ background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>♾</span>Partner Code (Optional)
            </label>
            <input value={partnerCode} onChange={e=>setPartnerCode(e.target.value)} placeholder="Share with your love ♾" style={{ width:"100%", padding:"13px 16px", background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:13, color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif" }}/>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width:"100%", padding:"15px", borderRadius:14,
          background:C.grad, border:"none", color:"#fff",
          fontSize:14, fontWeight:600, cursor: loading ? "wait" : "pointer",
          boxShadow:"0 8px 32px rgba(255,107,157,0.35)", opacity: loading ? 0.7 : 1,
          fontFamily:"'Nunito',sans-serif", marginBottom:16, marginTop:8
        }}>{loading ? "Loading..." : (tab==="login" ? "Enter Our Space →" : "Create Our Space ♥")}</button>
      </div>
    </div>
  );
};

const DAILY_CHALLENGES = [
  "📸 Take a selfie right now and send it to your love!",
  "💬 Tell your partner 3 things you love about them today",
  "🎵 Share a song that reminds you of your partner",
  "🤗 Send a surprise voice note saying 'I miss you'",
  "🌹 Write one thing that made you smile today",
  "💌 Send a long heartfelt message — no shortcuts!",
  "🎯 Plan your next date together right now",
  "✨ Compliment something specific about your partner",
  "🌙 Share your dream from last night with each other",
  "📍 Pin a special place on your Love Map together",
];

const DREAM_STORIES = {
  "😊": "You were both laughing in a sunlit meadow, chasing butterflies while the golden hour painted everything rose gold... ✨",
  "😍": "I saw you two slow dancing under a sky full of stars, your foreheads touching, the universe holding its breath... ❤️",
  "🥰": "You were in a cozy cabin in the clouds, wrapped in each other's arms while snow fell softly outside... 💕",
  "😌": "A quiet evening on a rooftop — you both watching the city lights, sharing secrets and silences equally... 🌙",
  "🫂": "You ran to each other across an airport arrival hall. Time slowed. Nothing else existed... 💫",
  "💫": "Flying together through galaxies, each star a memory, each constellation a promise... ✨",
  "😡": "Even in the storm, you found each other's hand. Rain turned to rainbow. Always... 🌈",
  "😢": "In the dream, you held each other close and the sadness melted into warmth. You are not alone... 💙",
};

const HomeScreen = ({ user, userData, partnerData, memoryCount, dateCount, capsuleCount, newMsgCount, setScreen, handleNotifications }) => {
  const moods = ["😊","😍","🥰","😌","🫂","💫","😡","😢"];

  const handleMoodSelect = async (mood) => {
    await updateDoc(doc(db, "users", user.uid), { mood });
  };

  const daysTogether = userData?.togetherSince
    ? Math.floor((new Date() - new Date(userData.togetherSince)) / (1000 * 60 * 60 * 24))
    : 0;

  // Anniversary countdown
  const getNextAnniversary = () => {
    if (!userData?.togetherSince) return null;
    const start = new Date(userData.togetherSince);
    const now = new Date();
    const nextAnniv = new Date(start);
    nextAnniv.setFullYear(now.getFullYear());
    if (nextAnniv < now) nextAnniv.setFullYear(now.getFullYear() + 1);
    const daysLeft = Math.ceil((nextAnniv - now) / (1000*60*60*24));
    const years = nextAnniv.getFullYear() - start.getFullYear();
    return { daysLeft, years, date: nextAnniv };
  };
  const anniversary = getNextAnniversary();

  const challengeIndex = (new Date().getDay() + memoryCount) % DAILY_CHALLENGES.length;
  const dreamText = DREAM_STORIES[userData?.mood] || DREAM_STORIES["🥰"];

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflowY:"auto", paddingBottom:90 }} className="screen">
      <GlassBg/>
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Logo size={28}/>
        <div style={{ display:"flex", gap:10 }}>
          <div onClick={handleNotifications} style={{ width:36, height:36, borderRadius:12, background:C.surface, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, cursor:"pointer", position:"relative" }}>
            🔔
            {newMsgCount > 0 && <span style={{ position:"absolute", top:-4, right:-4, width:14, height:14, borderRadius:"50%", background:C.pink, fontSize:8, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{newMsgCount}</span>}
          </div>
          <div onClick={()=>setScreen("profile")} style={{ width:36, height:36, borderRadius:12, background:C.gradSoft, border:`1px solid rgba(255,107,157,0.3)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, cursor:"pointer" }}>👤</div>
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, margin:"0 20px 16px", padding:"20px", borderRadius:26, background:C.gradSoft, border:"1px solid rgba(255,107,157,0.2)", boxShadow:"0 8px 48px rgba(0,0,0,0.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ textAlign:"center" }}>
            <MoodAvatar mood={userData?.mood || "🥰"} gender={userData?.gender} size={60} />
            <div style={{ fontSize:11, color:C.text, fontWeight:700, marginTop:8 }}>{user?.displayName || "You"}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{ fontSize:32, animation:"heartBeat 2s ease-in-out infinite", filter:"drop-shadow(0 0 10px #ff6b9d)" }}>💖</div>
            <div style={{ fontSize:9, color:C.muted, textAlign:"center", textTransform:"uppercase", letterSpacing:"1px" }}>{daysTogether}<br/>Days</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <MoodAvatar mood={partnerData?.mood || "❓"} gender={partnerData?.gender} size={60} isPartner={true} />
            <div style={{ fontSize:11, color:C.text, fontWeight:700, marginTop:8 }}>{partnerData?.name || "Waiting..."}</div>
            <div style={{ fontSize:10, color:partnerData?.isOnline ? "#4dff9d" : C.muted, display:"flex", alignItems:"center", gap:4, justifyContent:"center", marginTop:2 }}>
              {partnerData?.isOnline && <span style={{ width:4, height:4, borderRadius:"50%", background:"#4dff9d" }}/>}
              {partnerData ? (partnerData.isOnline ? "Online ❤️" : "Offline") : "Offline"}
            </div>
          </div>
        </div>

        {/* Daily Challenge */}
        <div style={{ marginTop:20, padding:"14px 16px", borderRadius:16, background:"rgba(255,255,255,0.05)", border:`1.5px dashed ${C.border}`, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-8, right:-8, fontSize:36, opacity:0.1 }}>🎯</div>
          <div style={{ fontSize:10, color:C.pink, fontWeight:800, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6 }}>Today's Challenge</div>
          <div style={{ fontSize:13, color:"#fff", fontWeight:500, lineHeight:1.5 }}>{DAILY_CHALLENGES[challengeIndex]}</div>
        </div>

        {/* Dream Share */}
        <div style={{ marginTop:14, padding:"14px 16px", borderRadius:16, background:"rgba(107,157,255,0.1)", border:"1px solid rgba(107,157,255,0.15)", position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={{ fontSize:16 }}>🌌</span>
            <span style={{ fontSize:10, color:"#4daaff", fontWeight:800, textTransform:"uppercase" }}>Dream Share</span>
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.85)", lineHeight:1.6, fontStyle:"italic" }}>"{dreamText}"</p>
          <div style={{ fontSize:9, color:"rgba(107,157,255,0.5)", marginTop:6 }}>Based on your mood: {userData?.mood || "🥰"}</div>
        </div>

        {/* Anniversary Countdown */}
        {anniversary && anniversary.daysLeft <= 30 && (
          <div style={{ marginTop:14, padding:"14px 16px", borderRadius:16, background:"linear-gradient(135deg,rgba(255,209,102,0.12),rgba(255,107,157,0.12))", border:"1px solid rgba(255,209,102,0.25)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-6, right:-6, fontSize:30, opacity:0.15 }}>🎉</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:16 }}>💍</span>
              <span style={{ fontSize:10, color:"#ffd166", fontWeight:800, textTransform:"uppercase", letterSpacing:"1px" }}>Anniversary Coming!</span>
            </div>
            <div style={{ fontSize:13, color:"#fff", fontWeight:600 }}>
              {anniversary.daysLeft === 0 ? (
                <span style={{ background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontSize:16, fontWeight:800 }}>🎉 Happy {anniversary.years} Year Anniversary! 🎉</span>
              ) : (
                <>{anniversary.daysLeft} days until your {anniversary.years} Year Anniversary! 💫</>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mood Selector */}
      <div style={{ position:"relative", zIndex:2, margin:"0 20px 16px" }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>How are you feeling?</div>
        <div style={{ display:"flex", gap:6 }}>
          {moods.map(m => (
            <button key={m} onClick={()=>handleMoodSelect(m)} style={{
              flex:1, padding:"9px 0", borderRadius:12, fontSize:16, cursor:"pointer",
              border: userData?.mood===m ? "1.5px solid rgba(255,107,157,0.6)" : `1px solid ${C.border}`,
              background: userData?.mood===m ? C.gradSoft : C.surface,
              transform: userData?.mood===m ? "scale(1.1)" : "scale(1)",
              transition:"all 0.2s",
              boxShadow: userData?.mood===m ? "0 4px 12px rgba(255,107,157,0.2)" : "none",
            }}>{m}</button>
          ))}
        </div>
      </div>

      {/* Quick Access - 8 tiles (even grid) */}
      <div style={{ position:"relative", zIndex:2, margin:"0 20px 16px" }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:10, fontWeight:600 }}>Quick Access</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { id:"chat",    icon:"💬", label:"Chat",        sub: newMsgCount > 0 ? `${newMsgCount} new` : "No new messages",             color:"#ff6b9d" },
            { id:"memory",  icon:"📸", label:"Memories",    sub:`${memoryCount} photos`,                                                  color:"#c44dff" },
            { id:"dates",   icon:"📅", label:"Dates",       sub: dateCount > 0 ? `${dateCount} ideas` : "Add dream dates",               color:"#ff9d6b" },
            { id:"sync",    icon:"💓", label:"Heart Sync",  sub:"Beat together",                                                          color:"#ff2d55" },
            { id:"map",     icon:"📍", label:"Love Map",    sub:"Our locations",                                                          color:"#4daaff" },
            { id:"capsule", icon:"💌", label:"Time Capsule",sub: capsuleCount > 0 ? `${capsuleCount} sealed` : "Write a letter",          color:"#6b9dff" },
            { id:"aidiary", icon:"🤖", label:"AI Diary",    sub:"Emotions & Chat",                                                        color:"#c44dff" },
            { id:"games",   icon:"🎲", label:"Games & Score", sub:"Play together",                                                       color:"#4dffb3" },
            { id:"together",icon:"🔥", label:"Together Mode", sub:"Watch & Music",                                                 color:"#ff6b9d" },
          ].map((q,i) => (
            <div key={i} onClick={() => q.action ? q.action() : setScreen(q.id)}
              style={{
                padding:"14px", borderRadius:18, background:C.surface, border:`1px solid ${C.border}`,
                cursor:"pointer", transition:"all 0.2s", position:"relative", overflow:"hidden"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="scale(1.03)"; e.currentTarget.style.borderColor=`${q.color}40`; }}
              onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.borderColor=C.border; }}
            >
              <div style={{ position:"absolute", top:-8, right:-8, fontSize:40, opacity:0.06 }}>{q.icon}</div>
              <div style={{ fontSize:24, marginBottom:6 }}>{q.icon}</div>
              <div style={{ fontSize:13, color:C.text, fontWeight:600 }}>{q.label}</div>
              <div style={{ fontSize:10, color: (q.id === "chat" && newMsgCount > 0) ? C.pink : q.color || C.muted, marginTop:2, fontWeight: (q.id === "chat" && newMsgCount > 0) ? 700 : 400, opacity:0.8 }}>{q.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GamesScreen = ({ user, userData, partnerData, setScreen }) => {
  const [gameTab, setGameTab] = useState("score");
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [quizAns, setQuizAns] = useState(null);
  const [spinDeg, setSpinDeg] = useState(0);
  const [gameState, setGameState] = useState({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [dareHistory, setDareHistory] = useState([]);

  const allQuizQuestions = [
    { q: "What is my partner's absolute favourite comfort food?", opts: ["Biryani 🍚", "Pizza 🍕", "Momos 🥟", "Maggi 🍜"], correct: 1 },
    { q: "What's my partner's dream travel destination?", opts: ["Paris 🗼", "Maldives 🏝️", "Japan 🗾", "Switzerland 🏔️"], correct: 2 },
    { q: "What does my partner do when they're stressed?", opts: ["Music sunta hai 🎵", "Walk pe jaata hai 🚶", "Mujhse baat karta hai 💬", "So jaata hai 😴"], correct: 0 },
    { q: "My partner's favourite movie genre?", opts: ["Romance 💕", "Thriller 🔥", "Comedy 😂", "Sci-Fi 🚀"], correct: 0 },
    { q: "What time does my partner usually wake up?", opts: ["Before 7 AM ☀️", "7-9 AM 🌅", "9-11 AM 😴", "After 11 AM 💤"], correct: 1 },
    { q: "My partner's go-to midnight snack?", opts: ["Chips 🍟", "Ice cream 🍦", "Maggi 🍜", "Biscuits 🍪"], correct: 2 },
    { q: "What's my partner's love language?", opts: ["Words of love 💌", "Quality time ⏰", "Physical touch 🤗", "Gifts 🎁"], correct: 1 },
    { q: "My partner's favourite season?", opts: ["Summer ☀️", "Monsoon 🌧️", "Winter ❄️", "Spring 🌸"], correct: 2 },
    { q: "What makes my partner laugh the most?", opts: ["Memes 😂", "My jokes 🤣", "Funny videos 📱", "Tickling 🤭"], correct: 1 },
    { q: "My partner's biggest fear?", opts: ["Darkness 🌑", "Heights 🏔️", "Losing me 💔", "Cockroach 🪳"], correct: 2 },
  ];

  useEffect(() => {
    if (!partnerData) return;
    return subscribeToGameState(user.uid, partnerData.uid, setGameState);
  }, [partnerData, user.uid]);

  const dares = ["Voice note bhejo 🎤", "Good morning text 💌", "3 things jo tujhe love karti hoon 🌸", "Date plan karo aaj 🌙", "1 min dance video 💃", "Apni fav photo send karo 📸"];

  const spin = () => {
    if (spinning) return;
    setSpinning(true); setSpinResult(null);
    const extra = 1440 + Math.random() * 720;
    setSpinDeg(prev => prev + extra);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * dares.length);
      const res = dares[idx];
      setSpinResult(res);
      setSpinning(false);
      setDareHistory(prev => [res, ...prev].slice(0, 5));
      if (partnerData) {
        syncGameAction(user.uid, partnerData.uid, "dareSpin", { result: res, by: user.displayName });
      }
    }, 2200);
  };

  const handleQuiz = (ans) => {
    setQuizAns(ans);
    if (ans === allQuizQuestions[quizIndex].correct) setQuizScore(s => s + 10);
    if (partnerData) {
      syncGameAction(user.uid, partnerData.uid, `quiz_${user.uid}`, { answer: ans, qIndex: quizIndex });
    }
  };

  const nextQuestion = () => {
    setQuizAns(null);
    setQuizIndex(i => Math.min(i + 1, allQuizQuestions.length - 1));
  };

  const currentQ = allQuizQuestions[quizIndex];

  // REAL Love Score calculation
  const gameDaysTogether = userData?.togetherSince ? Math.floor((new Date() - new Date(userData.togetherSince)) / (1000*60*60*24)) : 0;
  const scoreComm = Math.min(100, 50 + Math.floor(gameDaysTogether * 0.05));
  const scoreQuality = Math.min(100, 40 + (gameState?.dareSpin ? 15 : 0) + Math.floor(gameDaysTogether * 0.03));
  const scoreAffection = Math.min(100, 60 + (userData?.mood === "😍" || userData?.mood === "🥰" ? 20 : 5));
  const scoreSupport = Math.min(100, 55 + Math.floor(gameDaysTogether * 0.04));
  const totalLoveScore = Math.round((scoreComm + scoreQuality + scoreAffection + scoreSupport) / 4);
  const loveScoreVal = totalLoveScore / 100;

  const badges = [
    { icon:"🌟", label:"First Date", earned:true },
    { icon:"💌", label:"100 Messages", earned:true },
    { icon:"📸", label:"Memory Maker", earned:true },
    { icon:"🔥", label:"7 Day Streak", earned:true },
    { icon:"🎯", label:"Quiz Master", earned: gameState[`quiz_${user.uid}`] !== undefined },
    { icon:"🌙", label:"Virtual Date", earned: gameState[`date_${user.uid}`] && gameState[`date_${user.uid}`].active },
  ];

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflowY:"auto", paddingBottom:90 }} className="screen">
      <GlassBg/>

      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 14px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div onClick={() => setScreen("home")} style={{ fontSize:12, color:C.muted, marginBottom:4, cursor:"pointer" }}>‹ Home</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>Love Score & Games</h2>
          <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Play together & unlock achievements</p>
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, display:"flex", gap:6, padding:"0 20px 14px" }}>
        {["score", "spin", "quiz"].map(t => (
          <button key={t} onClick={() => setGameTab(t)} style={{
            padding:"8px 16px", borderRadius:50, border: gameTab === t ? `1px solid ${C.border}` : "none", cursor:"pointer",
            fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700,
            background: gameTab === t ? "linear-gradient(135deg,#6b9dff,#c44dff)" : C.surface,
            color: gameTab === t ? "#fff" : C.muted,
            boxShadow: gameTab === t ? "0 4px 14px rgba(107,157,255,0.35)" : "none",
            textTransform:"capitalize",
          }}>{t === "spin" ? "Dare Wheel" : t === "quiz" ? "Love Quiz" : "Score & Badges"}</button>
        ))}
      </div>

      {gameTab === "score" && (
        <div style={{ position:"relative", zIndex:2, padding:"0 20px", animation:"fadeIn 0.3s ease" }}>
          <div style={{ display:"flex", justifyContent:"center", margin:"8px 0 20px" }}>
            <div style={{ position:"relative", width:150, height:150 }}>
              <svg width="150" height="150" style={{ position:"absolute", top:0, left:0 }}>
                <circle cx="75" cy="75" r="64" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10"/>
                <circle cx="75" cy="75" r="64" fill="none"
                  stroke="url(#scoreGrad)" strokeWidth="10"
                  strokeDasharray="402" strokeDashoffset={402*(1-loveScoreVal)}
                  strokeLinecap="round" transform="rotate(-90 75 75)"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#ff6b9d"/><stop offset="1" stopColor="#c44dff"/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:34, fontWeight:800, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{totalLoveScore}</span>
                <span style={{ fontSize:10, color:C.text, letterSpacing:"0.8px" }}>LOVE SCORE</span>
              </div>
            </div>
          </div>
          

          {[
            { label:"Communication", val:92, color:C.grad },
            { label:"Quality Time",  val:78, color:"linear-gradient(135deg,#6b9dff,#c44dff)" },
            { label:"Affection",     val:95, color:"linear-gradient(135deg,#ff9d6b,#ff6b9d)" },
            { label:"Support",       val:83, color:"linear-gradient(135deg,#4dffb3,#6b9dff)" },
          ].map(b => (
            <div key={b.label} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:11, color:C.text, fontWeight:600 }}>{b.label}</span>
                <span style={{ fontSize:11, fontWeight:700, background:b.color, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{b.val}%</span>
              </div>
              <div style={{ height:6, borderRadius:10, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${b.val}%`, borderRadius:10, background:b.color, transition:"width 1s ease" }}/>
              </div>
            </div>
          ))}

          <div style={{ marginTop:24 }}>
            <div style={{ fontSize:11, color:C.text, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Badges Earned</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {badges.map((b,i) => (
                <div key={i} style={{
                  padding:"14px 8px", borderRadius:18, textAlign:"center",
                  background: b.earned ? "rgba(107,157,255,0.1)" : C.surface,
                  border: b.earned ? "1px solid rgba(107,157,255,0.25)" : `1px solid ${C.border}`,
                  opacity: b.earned ? 1 : 0.4,
                }}>
                  <div style={{ fontSize:24, marginBottom:4 }}>{b.icon}</div>
                  <div style={{ fontSize:9, color: b.earned ? C.text : C.muted, fontWeight:600, lineHeight:1.3 }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameTab === "spin" && (
        <div style={{ position:"relative", zIndex:2, padding:"20px", display:"flex", flexDirection:"column", alignItems:"center", animation:"fadeIn 0.3s ease" }}>
          <p style={{ fontSize:13, color:C.text, marginBottom:24, textAlign:"center" }}>Spin the wheel for a love dare! 💕</p>

          <div style={{ position:"relative", width:240, height:240, marginBottom:30 }}>
            <div style={{ position:"absolute", top:-15, left:"50%", transform:"translateX(-50%)", zIndex:3, fontSize:24, filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}>▼</div>
            <div style={{
              width:240, height:240, borderRadius:"50%",
              background:`conic-gradient(
                #ff6b9d 0deg 60deg, #c44dff 60deg 120deg,
                #6b9dff 120deg 180deg, #ffd166 180deg 240deg,
                #4dffb3 240deg 300deg, #ff9d6b 300deg 360deg
              )`,
              border:"4px solid rgba(255,255,255,0.15)",
              boxShadow:"0 8px 40px rgba(107,157,255,0.2)",
              transform:`rotate(${spinDeg}deg)`,
              transition: spinning ? "transform 2.5s cubic-bezier(0.17,0.67,0.12,0.99)" : "none",
              display:"flex", alignItems:"center", justifyContent:"center", position:"relative",
            }}>
              <div style={{
                width:56, height:56, borderRadius:"50%", background:"rgba(10,8,18,0.95)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, zIndex:2, border:"2px solid rgba(255,255,255,0.2)",
              }}>💕</div>
              {["🎤","💌","🌸","🌙","💃","📸"].map((e,i) => (
                <div key={i} style={{ position:"absolute", fontSize:18, transform:`rotate(${i*60+30}deg) translateY(-80px)` }}>{e}</div>
              ))}
            </div>
          </div>

          <button onClick={spin} disabled={spinning} style={{
            padding:"14px 40px", borderRadius:50,
            background: spinning ? "transparent" : "linear-gradient(135deg,#6b9dff,#c44dff)",
            border: spinning ? `1px solid ${C.border}` : "none", color: spinning ? C.muted : "#fff",
            fontSize:14, fontWeight:800, cursor: spinning ? "not-allowed" : "pointer",
            boxShadow: spinning ? "none" : "0 8px 30px rgba(107,157,255,0.4)",
            fontFamily:"'Nunito',sans-serif", transition:"all 0.3s",
          }}>
            {spinning ? "🌀 Spinning..." : "Spin the Wheel! ✨"}
          </button>

          {gameState?.dareSpin && !spinning && !spinResult && (
            <div style={{ marginTop:20, padding:"16px", borderRadius:20, background:"rgba(255,107,157,0.15)", border:"1px solid rgba(255,107,157,0.3)", textAlign:"center", animation:"fadeIn 0.4s ease", width:"100%" }}>
              <div style={{ fontSize:10, color:C.pink, marginBottom:6, fontWeight:800, letterSpacing:"1px" }}>PARTNER'S DARE ({gameState.dareSpin.by})</div>
              <div style={{ fontSize:14, color:"#fff", fontWeight:700 }}>{gameState.dareSpin.result}</div>
            </div>
          )}

          {spinResult && (
            <div style={{
              marginTop:30, padding:"20px", borderRadius:20,
              background:"rgba(107,157,255,0.15)", border:"1px solid rgba(107,157,255,0.3)",
              textAlign:"center", animation:"fadeIn 0.4s ease", width:"100%"
            }}>
              <div style={{ fontSize:11, color:C.text, marginBottom:6, fontWeight:700, letterSpacing:"1px" }}>YOUR DARE</div>
              <div style={{ fontSize:16, color:"#fff", fontWeight:700 }}>{spinResult}</div>
            </div>
          )}

          {/* Recent Dares History */}
          {dareHistory.length > 0 && (
            <div style={{ marginTop:24, width:"100%" }}>
              <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Recent Dares</div>
              {dareHistory.map((d,i)=>(
                <div key={i} style={{ padding:"10px 14px", borderRadius:12, background:C.surface, border:`1px solid ${C.border}`, marginBottom:6, fontSize:12, color:C.muted, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:"#4dffb3" }}>✓</span> {d}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {gameTab === "quiz" && (
        <div style={{ position:"relative", zIndex:2, padding:"0 20px", animation:"fadeIn 0.3s ease" }}>
          <div style={{ padding:"20px", borderRadius:24, background:"rgba(196,77,255,0.12)", border:"1px solid rgba(196,77,255,0.25)", marginBottom:20 }}>
            <div style={{ fontSize:10, color:"#c44dff", letterSpacing:"1px", fontWeight:800, marginBottom:8 }}>QUESTION {quizIndex + 1} OF {allQuizQuestions.length}</div>
            <div style={{ height:4, borderRadius:10, background:"rgba(255,255,255,0.07)", marginBottom:14, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${((quizIndex + 1) / allQuizQuestions.length) * 100}%`, background:"linear-gradient(90deg,#c44dff,#6b9dff)", borderRadius:10, transition:"width 0.4s ease" }}/>
            </div>
            <div style={{ fontSize:16, color:"#fff", fontWeight:600, lineHeight:1.6, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
              "{currentQ.q}"
            </div>
          </div>

          {currentQ.opts.map((opt,i) => {
            const partnerAns = gameState[`quiz_${partnerData?.uid}`];
            const isCorrect = i === currentQ.correct;
            return (
              <button key={`${quizIndex}-${i}`} onClick={() => quizAns === null && handleQuiz(i)} style={{
                width:"100%", padding:"16px 20px", borderRadius:16, marginBottom:10,
                border: quizAns === i ? (isCorrect ? "2px solid #4dffb3" : "2px solid #ff6b6b") : `1px solid ${C.border}`,
                background: quizAns === i ? (isCorrect ? "rgba(77,255,179,0.1)" : "rgba(255,107,107,0.1)") : quizAns !== null && isCorrect ? "rgba(77,255,179,0.06)" : "rgba(255,255,255,0.03)",
                color: quizAns === i ? (isCorrect ? "#4dffb3" : "#ff6b6b") : quizAns !== null && isCorrect ? "#4dffb3" : C.text,
                fontSize:14, fontWeight:700, cursor: quizAns === null ? "pointer" : "default", fontFamily:"'Nunito',sans-serif", textAlign:"left",
                display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.2s",
                opacity: quizAns !== null && quizAns !== i && !isCorrect ? 0.4 : 1,
              }}>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  {opt}
                  {partnerAns?.qIndex === quizIndex && partnerAns?.answer === i && <span style={{fontSize:10, padding:"2px 8px", background:"#4daaff30", borderRadius:20, color:"#4daaff", fontWeight:700}}>Partner</span>}
                </div>
                {quizAns !== null && isCorrect && <span style={{ fontSize:18 }}>✓</span>}
                {quizAns === i && !isCorrect && <span style={{ fontSize:18 }}>✗</span>}
              </button>
            )
          })}

          {quizAns !== null && (
            <>
              <div style={{ padding:"14px 18px", borderRadius:16, background: quizAns===currentQ.correct ? "rgba(77,255,179,0.1)" : "rgba(255,107,107,0.1)", border: quizAns===currentQ.correct ? "1px solid rgba(77,255,179,0.25)" :"1px solid rgba(255,107,107,0.25)", fontSize:13, color: quizAns===currentQ.correct ? "#4dffb3" : "#ff6b6b", marginTop:8, animation:"fadeIn 0.3s ease", fontWeight:600 }}>
                {quizAns === currentQ.correct ? "🎉 Sahi jawab! +10 points!" : `😅 Correct answer: ${currentQ.opts[currentQ.correct]}`}
              </div>
              {quizIndex < allQuizQuestions.length - 1 && (
                <button onClick={nextQuestion} style={{
                  width:"100%", marginTop:14, padding:"15px", borderRadius:14,
                  background:"linear-gradient(135deg,#c44dff,#6b9dff)", border:"none", color:"#fff", fontSize:14,
                  fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif",
                  boxShadow:"0 6px 24px rgba(196,77,255,0.35)",
                }}>Next Question →</button>
              )}
              {quizIndex === allQuizQuestions.length - 1 && (
                <div style={{ marginTop:14, padding:"16px", borderRadius:16, background:"rgba(255,107,157,0.1)", border:"1px solid rgba(255,107,157,0.25)", textAlign:"center", animation:"fadeIn 0.3s ease" }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>🏆</div>
                  <div style={{ fontSize:14, color:C.text, fontWeight:700 }}>Quiz Complete!</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>You scored {quizScore + (quizAns === currentQ.correct ? 10 : 0)}/{allQuizQuestions.length * 10} points</div>
                </div>
              )}
            </>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
            <div style={{ padding:"14px", borderRadius:16, background:C.surface, border:`1px solid ${C.border}`, textAlign:"center", flex:1, marginRight:10 }}>
              <div style={{ fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#6b9dff,#c44dff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{quizScore}</div>
              <div style={{ fontSize:10, color:C.text, fontWeight:600, marginTop:2 }}>Your Score</div>
            </div>
            <div style={{ padding:"14px", borderRadius:16, background:C.surface, border:`1px solid ${C.border}`, textAlign:"center", flex:1 }}>
              <div style={{ fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#ff6b9d,#ff9d6b)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{gameState[`quiz_${partnerData?.uid}`]?.answer === gameState[`quiz_${partnerData?.uid}`]?.correct ? (gameState[`quiz_${partnerData?.uid}`]?.qIndex || 0) * 10 + 10 : (gameState[`quiz_${partnerData?.uid}`]?.qIndex || 0) * 10}</div>
              <div style={{ fontSize:10, color:C.text, fontWeight:600, marginTop:2 }}>{partnerData?.name || "Partner"}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const ChatScreen = ({ user, partnerData, setScreen }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const scrollRef = useRef();
  const longPressRef = useRef(null);
  const QUICK_EMOJIS = ["❤️","😘","🥰","😍","💕","🫂","✨","😂"];

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  };

  useEffect(() => {
    if (!partnerData) { setChatLoading(false); return; }
    const unsub = subscribeToMessages(user.uid, partnerData.uid, (msgs) => {
      setMessages(msgs);
      setChatLoading(false);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });
    return unsub;
  }, [partnerData]);

  // Long-press to delete
  const handleMsgHold = (msgId, senderId) => {
    if (senderId !== user.uid) return;
    longPressRef.current = setTimeout(() => {
      setSelectedMsg(msgId);
    }, 600);
  };
  const handleMsgRelease = () => clearTimeout(longPressRef.current);
  const handleDeleteMsg = async () => {
    if (!selectedMsg || !partnerData) return;
    await deleteMessage(user.uid, partnerData.uid, selectedMsg);
    setSelectedMsg(null);
  };

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim() || !partnerData) return;
    setInput("");
    await sendMessage(user.uid, partnerData.uid, msg, user.displayName);
  };

  return (
    <div style={{ height:"100%", width:"100%", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden", background:"#0d0a14" }} className="screen">
      <GlassBg/>
      
      {/* FIXED HEADER (Strict Top) */}
      <div style={{ 
        position:"absolute", top:0, left:0, right:0, zIndex:20,
        padding:"12px 16px", background:"rgba(13,10,20,0.9)", backdropFilter:"blur(15px)",
        display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${C.border}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
      }}>
        <div onClick={()=>setScreen("home")} style={{ fontSize:22, color:C.muted, cursor:"pointer", padding:"0 8px" }}>‹</div>
        <div style={{ width:40, height:40, borderRadius:15, background:C.gradB, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
          {partnerData ? (partnerData.gender === "female" ? "👧" : "👦") : "👦"}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, color:C.text, fontWeight:700 }}>{partnerData?.name || "Partner"}</div>
          <div style={{ fontSize:10, color: partnerData?.isOnline ? "#4dff9d" : C.muted, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background: partnerData?.isOnline ? "#4dff9d" : C.muted }}/>
            {partnerData?.isOnline ? "Online now" : "Offline"}
          </div>
        </div>
        <div style={{ fontSize:18 }}>💕</div>
      </div>

      {/* SCROLLABLE CONTENT */}
      {!partnerData ? (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, textAlign:"center", padding:40 }}>
          Connect with a partner to start chatting! ❤️
        </div>
      ) : (
        <div ref={scrollRef} style={{ 
          flex:1, overflowY:"auto", 
          paddingTop: "75px", // Height of header
          paddingBottom: "140px", // Height of input area 
          paddingLeft: "16px", paddingRight: "16px",
          display:"flex", flexDirection:"column", gap:10, position:"relative", zIndex:2,
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch"
        }}>
          <div style={{ textAlign:"center", fontSize:10, color:C.dim, margin:"10px 0", letterSpacing:"1.5px", textTransform:"uppercase" }}>— Securely Synced —</div>
          {chatLoading ? (
            <div style={{ textAlign:"center", padding:60 }}>
              <div style={{ width:40, height:40, borderRadius:"50%", border:`3px solid ${C.border}`, borderTopColor:C.pink, animation:"spin 0.8s linear infinite", margin:"0 auto" }}/>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign:"center", padding:40, animation:"fadeIn 0.8s ease" }}>
              <div style={{ fontSize:40, marginBottom:16 }}>💌</div>
              <p style={{ fontSize:12, color:C.muted }}>Your love story starts here. Send a message!</p>
            </div>
          ) : messages.map((m, idx) => {
            const isMine = m.senderId === user.uid;
            return (
              <div key={m.id} style={{ display:"flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth:"85%" }}>
                  <div style={{
                    padding:"11px 16px", borderRadius: isMine ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    background: isMine ? C.grad : "rgba(255,255,255,0.06)",
                    border: isMine ? "none" : `1px solid ${C.border}`,
                    fontSize:13, color: "#fff", lineHeight:1.5,
                    boxShadow: isMine ? "0 4px 12px rgba(255,107,157,0.2)" : "none"
                  }}>{m.text}</div>
                  <div style={{ fontSize:9, color:C.dim, marginTop:4, textAlign: isMine ? "right" : "left" }}>
                    {formatTime(m.timestamp)} {isMine && "✓"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FIXED BOTTOM BAR (Strictly above nav) */}
      <div style={{ 
        position:"absolute", bottom:"70px", left:0, right:0, zIndex:20, 
        background:"rgba(13,10,20,0.98)", backdropFilter:"blur(15px)",
        borderTop:`1px solid ${C.border}` 
      }}>
        {selectedMsg && (
          <div style={{ padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,68,68,0.1)" }}>
            <span style={{ fontSize:12, color:"#ff4444" }}>Delete message?</span>
            <div style={{ display:"flex", gap:10 }}>
              <span onClick={()=>setSelectedMsg(null)} style={{ color:C.muted, fontSize:12, cursor:"pointer" }}>Cancel</span>
              <span onClick={handleDeleteMsg} style={{ color:"#ff4444", fontSize:12, fontWeight:700, cursor:"pointer" }}>Delete</span>
            </div>
          </div>
        )}
        
        <div style={{ display:"flex", gap:8, padding:"12px 16px", alignItems:"center" }}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            style={{ 
              flex:1, padding:"12px 20px", borderRadius:25, 
              background:"rgba(255,255,255,0.07)", border:`1px solid ${C.border}`, 
              color:"#fff", fontSize:14, outline:"none" 
            }}
          />
          <button onClick={() => handleSend()} style={{ 
            width:46, height:46, borderRadius:"50%", background:C.grad, border:"none", 
            color:"#fff", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow: "0 4px 15px rgba(255,107,157,0.4)"
          }}>↑</button>
        </div>
      </div>
    </div>
  );
};

const MemoryScreen = ({ user, partnerData, setScreen }) => {
  const [memories, setMemories] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [fullscreen, setFullscreen] = useState(null);

  useEffect(() => {
    if (!partnerData) return;
    return subscribeToMemories(user.uid, partnerData.uid, setMemories);
  }, [partnerData]);

  const handleUpload = async () => {
    if (!image || !caption) return alert("Pehle photo aur caption daalein!");
    setLoading(true);
    try {
      if (!partnerData) throw new Error("Pehle kisi partner ke saath link karein!");
      const imageUrl = await uploadToCloudinary(image);
      if (imageUrl) {
        await addMemory(user.uid, partnerData.uid, { url: imageUrl, caption, authorName: user.displayName, authorUid: user.uid });
        setShowAdd(false); setCaption(""); setImage(null);
      }
    } catch (err) {
      alert("Galti hui: " + err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflowY:"auto", paddingBottom:90 }} className="screen">
      <GlassBg/>
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>Our Memories</h2>
          <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>{memories.length} shared moments 💞</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding:"10px 18px", borderRadius:50, background:C.grad, border:"none", fontSize:11, color:"#fff", fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(255,107,157,0.3)" }}>+ Add</button>
      </div>

      {!partnerData ? (
        <div style={{ position:"relative", zIndex:2, padding:40, textAlign:"center", color:C.muted }}>Connect with a partner to share memories! ♾️</div>
      ) : memories.length === 0 ? (
        <div style={{ position:"relative", zIndex:2, padding:"80px 40px", textAlign:"center", color:C.muted, animation:"fadeIn 0.8s ease" }}>
          <div style={{ width:100, height:100, borderRadius:30, background:C.surface, display:"flex", alignItems:"center", justifyContent:"center", fontSize:50, margin:"0 auto 24px", border:`1px solid ${C.border}`, transform:"rotate(-5deg)" }}>📸</div>
          <h3 style={{ color:"#fff", marginBottom:10, fontFamily:"'Playfair Display',serif" }}>Capture Your Love</h3>
          <p style={{ fontSize:12, lineHeight:1.6, marginBottom:24 }}>Upload your first photo together!</p>
          <button onClick={() => setShowAdd(true)} style={{ padding:"12px 24px", borderRadius:14, background:C.grad, border:"none", color:"#fff", fontWeight:700, cursor:"pointer", boxShadow:"0 8px 24px rgba(255,107,157,0.3)" }}>+ Share First Photo</button>
        </div>
      ) : (
        <div style={{ position:"relative", zIndex:2, padding:"0 20px 80px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {memories.map((m,i) => (
            <div key={m.id} onClick={() => setFullscreen(m)}
              style={{ borderRadius:20, overflow:"hidden", cursor:"pointer", aspectRatio: i===0?"2/1":"1", gridColumn: i===0?"span 2":"span 1", border:`1px solid ${C.border}`, position:"relative", transition:"transform 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <img src={m.url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={m.caption}/>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"14px 12px", background:"linear-gradient(transparent,rgba(0,0,0,0.85))" }}>
                <div style={{ fontSize:12, color:"#fff", fontWeight:600, marginBottom:2 }}>{m.caption}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)" }}>by {m.authorName}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Viewer */}
      {fullscreen && (
        <div onClick={() => setFullscreen(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", animation:"fadeIn 0.25s ease" }}>
          <div style={{ position:"absolute", top:50, right:20, width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18, cursor:"pointer" }}>✕</div>
          <img src={fullscreen.url} style={{ maxWidth:"95%", maxHeight:"70vh", borderRadius:20, objectFit:"contain", boxShadow:"0 20px 80px rgba(0,0,0,0.8)" }} alt={fullscreen.caption}/>
          <div style={{ marginTop:20, textAlign:"center", padding:"0 20px" }}>
            <div style={{ fontSize:16, color:"#fff", fontWeight:600, fontFamily:"'Playfair Display',serif" }}>{fullscreen.caption}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:6 }}>by {fullscreen.authorName}</div>
          </div>
          <div style={{ marginTop:16, display:"flex", gap:10 }}>
            {["❤️","😍","✨"].map(e => (
              <div key={e} style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, cursor:"pointer" }}>{e}</div>
            ))}
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", zIndex:100, display:"flex", alignItems:"flex-end" }}>
          <div style={{ width:"100%", background:"#150d20", borderRadius:"30px 30px 0 0", padding:"30px 20px 40px", animation:"slideUp 0.3s ease-out" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ color:"#fff", fontFamily:"'Playfair Display',serif" }}>New Memory ✨</h3>
              <button onClick={() => setShowAdd(false)} style={{ background:"transparent", border:"none", color:C.muted, fontSize:20, cursor:"pointer" }}>✕</button>
            </div>
            <label style={{ display:"block", padding:"16px", borderRadius:16, border:`1px dashed ${C.border}`, textAlign:"center", cursor:"pointer", marginBottom:16, color:C.muted, fontSize:13 }}>
              {image ? `✅ ${image.name}` : "📷 Tap to choose photo"}
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} style={{ display:"none" }}/>
            </label>
            <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write a magical caption..."
              style={{ width:"100%", padding:"13px 16px", background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:14, color:C.text, fontSize:13, outline:"none", marginBottom:16, fontFamily:"'Nunito',sans-serif" }}
            />
            <button onClick={handleUpload} disabled={loading} style={{ width:"100%", padding:16, borderRadius:14, background:C.grad, border:"none", color:"#fff", fontWeight:700, boxShadow:"0 8px 32px rgba(255,107,157,0.3)", opacity: loading ? 0.7 : 1, cursor:"pointer", fontSize:14 }}>
              {loading ? "Uploading to Space... ✨" : "Share Memory 💞"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileScreen = ({ user, userData, partnerData, memoryCount, setScreen, isInstallable }) => {
  const [loading, setLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const handlePrivacy = () => {
    alert("🔒 Privacy Settings\nYour data is end-to-end encrypted in our private space. Only you and your partner can access your chats and memories.");
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleLink = async () => {
    const code = prompt("Enter your partner's code:");
    if (code) {
      const res = await linkPartner(user.uid, code);
      if (!res.success) alert(res.error);
    }
  };

  const setStartDate = async () => {
    const date = prompt("Together since? (YYYY-MM-DD):", userData?.togetherSince || "2024-01-01");
    if (date) {
      await updateDoc(doc(db, "users", user.uid), { togetherSince: date });
      if (partnerData) {
        await updateDoc(doc(db, "users", partnerData.uid), { togetherSince: date });
      }
    }
  };

  const daysTogether = userData?.togetherSince 
    ? Math.floor((new Date() - new Date(userData.togetherSince)) / (1000 * 60 * 60 * 24))
    : 0;

  const handleUnlink = async () => {
    if (window.confirm("Are you sure you want to unlink from your partner?")) {
      await unlinkPartner(user.uid, partnerData.uid);
      setScreen("home");
    }
  };

  const handleNotifications = () => {
    // Moved to App level for real notifications
  };

  const settings = [
    { 
      icon:"💑", 
      label: partnerData ? `Coupled with ${partnerData.name}` : "Not Coupled", 
      sub: partnerData ? "Relationship active" : "Tap to enter code",
      action: !partnerData ? handleLink : null
    },
    { icon:"♾", label: "My Partner Code", sub: userData?.myCode || "Click to copy", copy: true },
    { icon:"📅", label: "Start Date", sub: userData?.togetherSince || "Not set", action: setStartDate },
    { icon:"🔒", label:"Privacy & Security", right:"High", action: handlePrivacy },
    { icon:"💔", label:"Unlink Partner", sub: "End this session", action: partnerData ? handleUnlink : null },
  ];

  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const url = await uploadToCloudinary(file);
        if (url) {
          await updateDoc(doc(db, "users", user.uid), { profilePic: url });
        }
      } catch (err) {
        alert("Upload failed: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const loveScore = Math.min(100, 70 + Math.floor(daysTogether * 0.1) + (memoryCount * 2));

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflowY:"auto", paddingBottom:90 }} className="screen">
      <GlassBg/>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        accept="image/*" 
        style={{ display: "none" }} 
      />
      {/* hero */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 20px", textAlign:"center" }}>
        <div onClick={handleAvatarClick} style={{ 
          width:82, height:82, borderRadius:28, background:C.grad, 
          display:"flex", alignItems:"center", justifyContent:"center", 
          margin:"0 auto 10px", cursor:"pointer", overflow:"hidden",
          boxShadow:"0 8px 32px rgba(255,107,157,0.4)", border:`2px solid ${C.border}`
        }}>
          {userData?.profilePic ? (
            <img src={userData.profilePic} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          ) : (
            <span style={{ fontSize:40 }}>{userData?.gender === "female" ? "👧" : "👦"}</span>
          )}
        </div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:C.text, fontWeight:500, marginBottom:2 }}>{userData?.name || user?.displayName || "You"}</h2>
        <p style={{ fontSize:11, color:C.muted }}>{user?.email}</p>
        <div onClick={()=>{setEditName(userData?.name || user?.displayName || ""); setShowEditProfile(true);}} style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:6, padding:"4px 12px", borderRadius:50, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, cursor:"pointer" }}>
          <span style={{ fontSize:10, color:C.pink }}>✏️ Edit Profile</span>
        </div>
        {partnerData && <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:10 }}>
          <div style={{ padding:"5px 14px", borderRadius:50, background:C.gradSoft, border:"1px solid rgba(255,107,157,0.3)", fontSize:11, color:C.pink }}>💑 Coupled with {partnerData.name}</div>
        </div>}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", zIndex:100, display:"flex", alignItems:"flex-end" }}>
          <div style={{ width:"100%", background:"#150d20", borderRadius:"30px 30px 0 0", padding:"30px 20px 40px", animation:"slideUp 0.3s ease-out" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ color:"#fff", fontFamily:"'Playfair Display',serif" }}>Edit Profile ✏️</h3>
              <button onClick={() => setShowEditProfile(false)} style={{ background:"transparent", border:"none", color:C.muted, fontSize:20, cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:6, display:"block" }}>Display Name</label>
              <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Your name..."
                style={{ width:"100%", padding:"13px 16px", background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:14, color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif" }}
              />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:10, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:6, display:"block" }}>Gender</label>
              <div style={{ display:"flex", gap:10 }}>
                {[{id:"male", icon:"👦", label:"Male"}, {id:"female", icon:"👧", label:"Female"}].map(g => (
                  <div key={g.id} onClick={async () => await updateDoc(doc(db, "users", user.uid), { gender: g.id })} style={{
                    flex:1, padding:"10px", borderRadius:14, cursor:"pointer",
                    background: userData?.gender===g.id ? C.gradSoft : "rgba(255,255,255,0.03)",
                    border: `1px solid ${userData?.gender===g.id ? C.pink : C.border}`,
                    textAlign:"center", transition:"all 0.25s"
                  }}>
                    <div style={{ fontSize:18, marginBottom:2 }}>{g.icon}</div>
                    <div style={{ fontSize:10, color: userData?.gender===g.id ? "#fff" : C.muted, fontWeight:600 }}>{g.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={async () => {
              if(!editName.trim()) return;
              setEditSaving(true);
              await updateDoc(doc(db, "users", user.uid), { name: editName.trim() });
              setEditSaving(false);
              setShowEditProfile(false);
            }} disabled={editSaving} style={{ width:"100%", padding:16, borderRadius:14, background:C.grad, border:"none", color:"#fff", fontWeight:700, boxShadow:"0 8px 32px rgba(255,107,157,0.3)", opacity: editSaving ? 0.7 : 1, cursor:"pointer", fontSize:14 }}>
              {editSaving ? "Saving..." : "Save Changes ✨"}
            </button>
          </div>
        </div>
      )}

      {/* stats */}
      <div style={{ position:"relative", zIndex:2, margin:"0 20px 16px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {[[daysTogether,"Days"],[memoryCount,"Memories"],[`${loveScore}%`,"Score"]].map(([v,l])=>(
          <div key={l} style={{ padding:"14px 0", borderRadius:18, background:C.surface, border:`1px solid ${C.border}`, textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:700, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{v}</div>
            <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* settings list */}
      <div style={{ position:"relative", zIndex:2, margin:"0 20px 20px" }}>
        {settings.map((s,i)=>(
          <div key={i} onClick={() => {
            if (s.copy) navigator.clipboard.writeText(s.sub);
            if (s.action) s.action();
          }} style={{
            display:"flex", alignItems:"center", padding:"14px 16px",
            borderRadius:16, marginBottom:8, cursor:"pointer",
            background:C.surface, border:`1px solid ${C.border}`,
          }}>
            <span style={{ fontSize:18, marginRight:12 }}>{s.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{s.label}</div>
              {s.sub && <div style={{ fontSize:10, color:s.copy ? C.pink : C.muted, fontWeight: s.copy?700:400 }}>{s.sub} {s.copy && "📋"}</div>}
            </div>
            {!s.copy && <span style={{ fontSize:11, color:C.muted }}>{s.right} ›</span>}
          </div>
        ))}
        
        {/* IN-APP INSTALL BUTTON */}
        <div id="install-btn" onClick={async () => {
          if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
              window.deferredPrompt = null;
            }
          } else {
            alert("Open Browser Menu > Add to Home Screen to install! 📱");
          }
        }} style={{
          display: isInstallable ? "flex" : "none", alignItems:"center", padding:"14px 16px",
          borderRadius:16, marginBottom:8, cursor:"pointer",
          background: C.grad, border:"none", color:"#fff", 
          boxShadow: "0 6px 20px rgba(255,107,157,0.35)", animation: "pulse 2s infinite"
        }}>
          <span style={{ fontSize:18, marginRight:12 }}>📥</span>
          <span style={{ flex:1, fontSize:13, fontWeight:700 }}>Install LoveSpace App</span>
        </div>

        <div onClick={handleLogout} style={{
          display:"flex", alignItems:"center", padding:"14px 16px",
          borderRadius:16, marginBottom:8, cursor:"pointer",
          background:C.surface, border:`1px solid ${C.border}`,
        }}>
          <span style={{ fontSize:18, marginRight:12 }}>🚪</span>
          <span style={{ flex:1, fontSize:13, color: "#ff6b6b", fontWeight:500 }}>Sign Out</span>
        </div>
      </div>
    </div>
  );
};

const DATE_CATEGORIES = [
  { icon:"🍽️", label:"Dinner", color:"#ff9d6b" },
  { icon:"🎬", label:"Movie", color:"#c44dff" },
  { icon:"🌿", label:"Nature", color:"#4dffb3" },
  { icon:"🎮", label:"Games", color:"#6b9dff" },
  { icon:"🌆", label:"Travel", color:"#ffd93d" },
  { icon:"💃", label:"Special", color:"#ff6b9d" },
];

const DatesScreen = ({ user, partnerData, setScreen }) => {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [selectedCat, setSelectedCat] = useState(DATE_CATEGORIES[0]);
  const [showInput, setShowInput] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!partnerData) return;
    return subscribeToDates(user.uid, partnerData.uid, setItems);
  }, [partnerData]);

  const handleAdd = () => {
    if (!input.trim() || !partnerData) return;
    addDateIdea(user.uid, partnerData.uid, { text: input, icon: selectedCat.icon, color: selectedCat.color, category: selectedCat.label });
    setInput("");
    setShowInput(false);
  };

  const pending = items.filter(i => !i.completed);
  const done = items.filter(i => i.completed);
  const displayed = filter === "done" ? done : filter === "pending" ? pending : items;

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflowY:"auto", paddingBottom:90 }} className="screen">
      <GlassBg/>
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div onClick={() => setScreen("home")} style={{ fontSize:12, color:C.muted, marginBottom:4, cursor:"pointer" }}>‹ Home</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>Date Bucket List</h2>
          <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>{pending.length} dreams · {done.length} done ✓</p>
        </div>
        <button onClick={() => setShowInput(!showInput)} style={{
          padding:"10px 18px", borderRadius:50, background: showInput ? "transparent" : C.grad,
          border: showInput ? `1px solid ${C.border}` : "none", color:"#fff",
          fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0
        }}>{showInput ? "Cancel" : "+ Add"}</button>
      </div>

      {showInput && (
        <div style={{ position:"relative", zIndex:2, margin:"0 20px 20px", padding:20, borderRadius:22, background:C.gradSoft, border:`1px solid rgba(255,107,157,0.2)`, animation:"fadeIn 0.3s ease" }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:10, textTransform:"uppercase", letterSpacing:"1px" }}>Choose Category</div>
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {DATE_CATEGORIES.map(cat => (
              <div key={cat.label} onClick={() => setSelectedCat(cat)} style={{
                padding:"6px 12px", borderRadius:50, cursor:"pointer", fontSize:11, fontWeight:700,
                background: selectedCat.label === cat.label ? `${cat.color}30` : "rgba(255,255,255,0.05)",
                border: `1px solid ${selectedCat.label === cat.label ? cat.color : C.border}`,
                color: selectedCat.label === cat.label ? cat.color : C.muted, transition:"all 0.2s"
              }}>{cat.icon} {cat.label}</div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder={`Add a ${selectedCat.label} idea...`}
              style={{ flex:1, padding:"12px 16px", borderRadius:14, background:"rgba(255,255,255,0.07)", border:`1px solid ${C.border}`, color:"#fff", fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif" }}
            />
            <button onClick={handleAdd} style={{ width:44, height:44, borderRadius:14, background:C.grad, border:"none", color:"#fff", fontSize:20, cursor:"pointer", flexShrink:0 }}>+</button>
          </div>
        </div>
      )}

      <div style={{ position:"relative", zIndex:2, display:"flex", gap:6, padding:"0 20px 16px" }}>
        {[{id:"all",l:"All ✨"},{id:"pending",l:"Pending ⏳"},{id:"done",l:"Done ✅"}].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding:"7px 16px", borderRadius:50, border:"none", cursor:"pointer",
            background: filter === f.id ? C.grad : C.surface, color: filter === f.id ? "#fff" : C.muted,
            fontSize:11, fontWeight:700, fontFamily:"'Nunito',sans-serif",
            boxShadow: filter === f.id ? "0 4px 14px rgba(255,107,157,0.3)" : "none"
          }}>{f.l}</button>
        ))}
      </div>

      <div style={{ position:"relative", zIndex:2, padding:"0 20px" }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}>
            <div style={{ fontSize:50, marginBottom:16 }}>{filter === "done" ? "🎉" : "📅"}</div>
            <p style={{ fontSize:13 }}>{filter === "done" ? "No completed dates yet!" : "No date ideas yet. Add some magic!"}</p>
          </div>
        ) : displayed.map((it, i) => (
          <div key={it.id} onClick={() => toggleDateStatus(user.uid, partnerData.uid, it.id, it.completed)}
            style={{
              padding:"16px", borderRadius:20, marginBottom:10, cursor:"pointer",
              background: it.completed ? "rgba(77,255,179,0.06)" : C.surface,
              border: `1px solid ${it.completed ? "rgba(77,255,179,0.25)" : (it.color ? `${it.color}30` : C.border)}`,
              display:"flex", alignItems:"center", gap:14, transition:"all 0.2s",
              animation:`fadeIn 0.3s ease ${i*0.04}s both`
            }}
          >
            <div style={{
              width:44, height:44, borderRadius:14, flexShrink:0,
              background: it.completed ? "rgba(77,255,179,0.15)" : (it.color ? `${it.color}20` : C.gradSoft),
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:22
            }}>{it.completed ? "✅" : (it.icon || "📅")}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color: it.completed ? C.muted : C.text, fontWeight:600, textDecoration: it.completed ? "line-through" : "none" }}>{it.text || it}</div>
              {it.category && <div style={{ fontSize:10, color: it.completed ? "rgba(77,255,179,0.7)" : (it.color || C.muted), marginTop:3, fontWeight:700 }}>{it.category}</div>}
            </div>
            <div style={{ width:24, height:24, borderRadius:8, border:`2px solid ${it.completed ? "rgba(77,255,179,0.5)" : C.border}`, background: it.completed ? "rgba(77,255,179,0.2)" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#4dffb3", flexShrink:0 }}>
              {it.completed && "✓"}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding:"0 20px", marginTop:20, position:"relative", zIndex:2 }}>
        <button onClick={() => setScreen("virtualDate")} style={{
          width:"100%", padding:"16px", borderRadius:16, border:"none", cursor:"pointer",
          background:"linear-gradient(135deg,#6b9dff,#4daaff)", color:"#0d0a14",
          fontSize:14, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          boxShadow:"0 8px 24px rgba(107,157,255,0.4)"
        }}>
          🌙 Start Virtual Date Together
        </button>
      </div>

    </div>
  );
};

const VirtualDateScreen = ({ user, partnerData, setScreen }) => {
  const [scene, setScene] = useState(null);
  const [activity, setActivity] = useState(null);
  const [dateActive, setDateActive] = useState(false);
  const [gameState, setGameState] = useState({});

  useEffect(() => {
    if (!partnerData) return;
    return subscribeToGameState(user.uid, partnerData.uid, setGameState);
  }, [partnerData, user.uid]);

  const partnerState = partnerData ? gameState[`date_${partnerData.uid}`] : null;
  const partnerActive = partnerState?.active;
  const sharedScene = scene || partnerState?.scene;
  const sharedActivity = activity !== null ? activity : partnerState?.activity;

  const handleToggle = () => {
    const next = !dateActive;
    setDateActive(next);
    if(partnerData) syncGameAction(user.uid, partnerData.uid, `date_${user.uid}`, { active: next, scene, activity });
  };

  const handleSetScene = (s) => {
    const val = s === scene ? null : s;
    setScene(val);
    if(partnerData) syncGameAction(user.uid, partnerData.uid, `date_${user.uid}`, { active: dateActive, scene: val, activity });
  };

  const handleSetActivity = (a) => {
    const val = a === activity ? null : a;
    setActivity(val);
    if(partnerData) syncGameAction(user.uid, partnerData.uid, `date_${user.uid}`, { active: dateActive, scene, activity: val });
  };

  const scenes = [
    { id:"beach",  emoji:"🏖️", label:"Beach Sunset",   color:"linear-gradient(135deg,#ff9d6b,#ffd166,#ff6b9d)" },
    { id:"cafe",   emoji:"☕", label:"Cozy Café",      color:"linear-gradient(135deg,#c44dff,#6b9dff)" },
    { id:"stars",  emoji:"🌌", label:"Stargazing",     color:"linear-gradient(135deg,#1a0a2e,#6b9dff)" },
    { id:"garden", emoji:"🌸", label:"Cherry Garden",  color:"linear-gradient(135deg,#ff6b9d,#ffb3c6)" },
    { id:"snow",   emoji:"❄️", label:"Winter Cabin",   color:"linear-gradient(135deg,#6b9dff,#b3d4ff)" },
    { id:"city",   emoji:"🌃", label:"City Rooftop",   color:"linear-gradient(135deg,#ffd166,#ff6b9d)" },
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
    <div style={{ height:"100vh", position:"relative", overflowY:"auto", paddingBottom:90 }} className="screen">
      <div style={{
        position:"absolute", inset:0, zIndex:0,
        background: sharedScene ? scenes.find(s=>s.id===sharedScene)?.color : "linear-gradient(160deg,#0a0812,#130d1e)",
        opacity: sharedScene ? 0.25 : 1, transition:"background 0.8s ease",
      }}/>
      <GlassBg />

      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div onClick={() => setScreen("dates")} style={{ fontSize:12, color:C.muted, marginBottom:4, cursor:"pointer" }}>‹ Back to Dates</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>Virtual Date</h2>
          <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Create a date from anywhere 🌍</p>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", background:C.surface, padding:"6px 12px", borderRadius:50, border:`1px solid ${C.border}` }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background: dateActive ? "#4dffb3" : "rgba(255,255,255,0.2)", animation: dateActive ? "heartBeat 1.5s infinite" : "none" }}/>
          <span style={{ fontSize:10, color: dateActive ? "#4dffb3" : C.muted, fontWeight:700 }}>{dateActive ? "Active" : "Offline"}</span>
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, padding:"0 20px" }}>
        <div style={{ padding:"16px", borderRadius:20, background: partnerActive ? "rgba(77,255,179,0.08)" : C.surface, border: partnerActive ? "1px solid rgba(77,255,179,0.25)" : `1px solid ${C.border}`, marginBottom:20, display:"flex", alignItems:"center", gap:14, transition:"all 0.3s" }}>
          <div style={{ width:48, height:48, borderRadius:16, background:"linear-gradient(135deg,#6b9dff,#4daaff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:"0 4px 16px rgba(107,157,255,0.3)" }}>👦</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, color:C.text, fontWeight:700 }}>{partnerData?.name || "Partner"}</div>
            <div style={{ fontSize:11, color: partnerActive ? "#4dffb3" : C.muted, marginTop:2, fontWeight: partnerActive ? 600 : 400 }}>{partnerActive ? "✓ Joined the date!" : "Waiting for partner..."}</div>
          </div>
          <button onClick={handleToggle} style={{
            padding:"10px 18px", borderRadius:50, border:"none", cursor:"pointer",
            background: dateActive ? "rgba(255,107,107,0.15)" : "linear-gradient(135deg,#4dffb3,#6b9dff)",
            color: dateActive ? "#ff6b6b" : "#0a1a12", fontSize:12, fontWeight:800, fontFamily:"'Nunito',sans-serif",
            transition:"all 0.3s"
          }}>{dateActive ? "Leave" : "Join Date ✨"}</button>
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:C.text, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Choose Your Scene</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {scenes.map(s=>(
              <button key={s.id} onClick={()=>handleSetScene(s.id)} style={{
                padding:"16px 8px", borderRadius:18, border:"none", cursor:"pointer",
                background: sharedScene===s.id ? s.color : C.surface,
                border: sharedScene===s.id ? "2px solid rgba(255,255,255,0.4)" : `1px solid ${C.border}`,
                transition:"all 0.3s", boxShadow: sharedScene===s.id ? "0 8px 24px rgba(0,0,0,0.5)" : "none",
              }}>
                <div style={{ fontSize:28, marginBottom:6, filter:sharedScene===s.id ? "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" : "none" }}>{s.emoji}</div>
                <div style={{ fontSize:10, color: sharedScene===s.id ? "#fff" : C.muted, fontWeight:800, lineHeight:1.3 }}>{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        {sharedScene && (
          <div style={{
            padding:"18px", borderRadius:20, marginBottom:20,
            background: scenes.find(s=>s.id===sharedScene)?.color, display:"flex", alignItems:"center", gap:14,
            boxShadow:"0 8px 32px rgba(0,0,0,0.4)", animation:"fadeIn 0.3s ease",
          }}>
            <span style={{ fontSize:36, filter:"drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }}>{scenes.find(s=>s.id===sharedScene)?.emoji}</span>
            <div>
              <div style={{ fontSize:16, color:"#fff", fontWeight:800 }}>{scenes.find(s=>s.id===sharedScene)?.label}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.85)", marginTop:2 }}>Your virtual scene is set ✨</div>
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize:11, color:C.text, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Date Activities</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {activities.map((a,i)=>(
              <div key={i} onClick={()=>handleSetActivity(i)} style={{
                padding:"16px", borderRadius:20, cursor:"pointer",
                background: sharedActivity===i ? "rgba(77,255,179,0.08)" : C.surface,
                border: sharedActivity===i ? "2px solid rgba(77,255,179,0.4)" : `1px solid ${C.border}`,
                transition:"all 0.2s", position:"relative"
              }}>
                <div style={{ fontSize:26, marginBottom:8 }}>{a.icon}</div>
                <div style={{ fontSize:13, color: sharedActivity===i ? "#4dffb3" : C.text, fontWeight:800 }}>{a.label}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>{a.desc}</div>
                {sharedActivity===i && <div style={{ position:"absolute", top:12, right:12, fontSize:14, color:"#4dffb3" }}>✓</div>}
              </div>
            ))}
          </div>
        </div>

        <button disabled={!sharedScene && sharedActivity===null} style={{
          width:"100%", marginTop:24, padding:"18px", borderRadius:16,
          background: (sharedScene || sharedActivity!==null) ? "linear-gradient(135deg,#4dffb3,#6b9dff)" : C.surface,
          border: (sharedScene || sharedActivity!==null) ? "none" : `1px solid ${C.border}`,
          color: (sharedScene || sharedActivity!==null) ? "#0a1a12" : C.muted,
          fontSize:15, fontWeight:800, cursor: (sharedScene || sharedActivity!==null) ? "pointer" : "not-allowed",
          boxShadow: (sharedScene || sharedActivity!==null) ? "0 8px 30px rgba(77,255,179,0.4)" : "none",
          transition:"all 0.3s"
        }}>
          🌙 Begin Virtual Date Together
        </button>
      </div>
    </div>
  );
};

const AIDiaryScreen = ({ user, userData, partnerData, setScreen }) => {
  const [tab, setTab] = useState("detect");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [diaryText, setDiaryText] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [generating, setGenerating] = useState(false);
  const [chatInput, setChatInput] = useState("");
  
  const [chatMessages, setChatMessages] = useState([
    { ai:true,  text:"Namaste! Main tumhara AI Love Companion hoon 💕 Aaj kaisa mahsoos ho raha hai?" }
  ]);
  const [isAITyping, setIsAITyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (tab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, tab, isAITyping]);

  const generateNvidiaResponse = async (userMessage, isDiary = false) => {
    const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
    if (!apiKey) return "API key missing! Please add VITE_NVIDIA_API_KEY to .env";

    const basePrompt = isDiary 
      ? `You are an empathetic, loving AI companion named "LoveSpace AI". Your user is in a relationship. Here is their diary entry: "${userMessage}". Give a short, heartwarming 2-sentence response comforting them and giving cute relationship advice. Use a mix of Hindi and English (Hinglish).` 
      : `You are an empathetic, loving AI companion named "LoveSpace AI". You are chatting with a user who is in a relationship. Their partner's name is ${partnerData?.name || "unknown"}. Respond in a mix of Hindi and English (Hinglish). Be highly affectionate, comforting, and supportive. Use emojis. Keep responses short (1-3 sentences).\nUser says: ${userMessage}`;

    try {
      const response = await fetch("/nvapi/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "meta/llama-3.1-70b-instruct",
          messages: [{ role: "user", content: basePrompt }],
          temperature: 0.7,
          max_tokens: 150
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      console.error(e);
      return "Network issue... main abhi properly soch nahi pa raha hoon 😔 Please try again!";
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { ai: false, text: msg }]);
    setChatInput("");
    setIsAITyping(true);

    const aiReplyText = await generateNvidiaResponse(msg, false);
    
    setChatMessages(prev => [...prev, { ai: true, text: aiReplyText }]);
    setIsAITyping(false);
  };

  const moods = [
    { emoji:"😊", label:"Happy",    score:92, color:"#ffd166" },
    { emoji:"🥰", label:"Loved",    score:87, color:"#ff6b9d" },
    { emoji:"😌", label:"Calm",     score:74, color:"#4dffb3" },
    { emoji:"😔", label:"Missing",  score:45, color:"#6b9dff" },
  ];

  const diaryEntries = [
    { date:"Apr 14", mood:"🥰", preview:"Partner ne surprise message diya...", highlight:true },
    { date:"Apr 13", mood:"😊", preview:"Video call pe 2 ghante baat ki...", highlight:false },
    { date:"Apr 12",  mood:"😔", preview:"Bahut miss kar rahi thi aaj...", highlight:false },
    { date:"Apr 11",  mood:"😌", preview:"Uski photo dekh ke neend aayi...", highlight:false },
  ];

  const analyze = () => {
    setAnalyzing(true); setAnalyzed(false);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 2000);
  };

  const generateAI = async () => {
    if (!diaryText.trim()) return;
    setGenerating(true);
    const reply = await generateNvidiaResponse(diaryText, true);
    setAiReply(reply);
    setGenerating(false);
  };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }} className="screen">
      <GlassBg/>

      {/* HEADER (Non-scrollable) */}
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 14px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div onClick={() => setScreen("home")} style={{ fontSize:12, color:C.muted, marginBottom:4, cursor:"pointer" }}>‹ Home</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>AI Love Companion</h2>
          <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Your emotional intelligence assistant</p>
        </div>
      </div>

      {/* TABS (Non-scrollable) */}
      <div style={{ position:"relative", zIndex:2, display:"flex", gap:6, padding:"0 20px 16px" }}>
        {["detect","diary","chat"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"7px 14px", borderRadius:50, border:"none", cursor:"pointer",
            fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700,
            background: tab===t ? "linear-gradient(135deg,#c44dff,#6b9dff)" : C.surface,
            color: tab===t ? "#fff" : C.muted, border: tab===t ? `1px solid ${C.border}` : "none",
            boxShadow: tab===t ? "0 4px 14px rgba(196,77,255,0.35)" : "none",
          }}>{t==="detect"?"🧠 Detect" : t==="diary"?"📔 Diary" : "🤖 Chat"}</button>
        ))}
      </div>

      {/* SCROLLABLE MAIN CONTENT AREA */}
      <div style={{ flex:1, overflowY:"auto", position:"relative", zIndex:2, paddingBottom:"150px" }}>

      {tab==="detect" && (
        <div style={{ position:"relative", zIndex:2, padding:"0 20px", animation:"fadeIn 0.3s ease" }}>
          <div style={{ padding:"24px", borderRadius:24, background:"rgba(196,77,255,0.08)", border:"1px solid rgba(196,77,255,0.2)", marginBottom:18, textAlign:"center" }}>
            <div style={{ position:"relative", width:110, height:110, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {analyzing && [0,1,2].map(i=>(
                <div key={i} style={{ position:"absolute", width:110+i*30, height:110+i*30, borderRadius:"50%", border:"1px solid rgba(196,77,255,0.3)", animation:`ripple 1.5s ease ${i*0.4}s infinite` }}/>
              ))}
              <div style={{
                width:90, height:90, borderRadius:"50%",
                background:C.gradSoft, border:"2px solid rgba(196,77,255,0.4)",
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
            background: analyzing ? C.surface : "linear-gradient(135deg,#c44dff,#6b9dff)",
            border: analyzing ? `1px solid ${C.border}` : "none",
            color: analyzing ? C.muted : "#fff",
            fontSize:14, fontWeight:700, cursor: analyzing?"not-allowed":"pointer",
            fontFamily:"'Nunito',sans-serif",
            boxShadow: analyzing ? "none" : "0 8px 28px rgba(196,77,255,0.35)",
            marginBottom:14,
          }}>
            {analyzing ? "🧠 Analyzing..." : analyzed ? "🔄 Scan Again" : "🧠 Detect My Emotion"}
          </button>

          {analyzed && (
            <div style={{ padding:"14px 16px", borderRadius:16, background:"rgba(255,107,157,0.07)", border:"1px solid rgba(255,107,157,0.2)", animation:"fadeUp 0.4s ease both" }}>
              <div style={{ fontSize:11, color:C.pink, fontWeight:700, marginBottom:6 }}>💡 AI INSIGHT</div>
              <p style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>
                Teri emotional energy aaj bahut positive hai! {partnerData?.name || "Partner"} ko ek surprise bhej — ye perfect time hai connection deepen karne ka 💕
              </p>
            </div>
          )}
        </div>
      )}

      {tab==="diary" && (
        <div style={{ position:"relative", zIndex:2, padding:"0 20px", animation:"fadeIn 0.3s ease" }}>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, color:C.text, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Today's Entry</div>
            <textarea
              rows={4} value={diaryText} onChange={e=>setDiaryText(e.target.value)}
              placeholder="Aaj kaisa feel hua? Dil ki baat likh do... 💕"
              style={{
                width:"100%", padding:"14px 16px",
                background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`,
                borderRadius:16, color:C.text, fontSize:13, outline:"none",
                fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                resize:"none", lineHeight:1.7,
              }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ fontSize:10, color:C.dim }}>{diaryText.length}/1000</span>
              <div style={{ display:"flex", gap:6 }}>
                {["😊","🥰","😔","😌","🔥","💭"].map(e=>(
                  <button key={e} onClick={()=>setDiaryText(d=>d+e)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16 }}>{e}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={generateAI} disabled={generating||!diaryText.trim()} style={{
            width:"100%", padding:"14px", borderRadius:14, marginBottom:16,
            background: (!diaryText.trim()||generating) ? C.surface : "linear-gradient(135deg,#c44dff,#6b9dff)",
            border: (!diaryText.trim()||generating) ? `1px solid ${C.border}` : "none",
            color: (!diaryText.trim()||generating) ? C.muted : "#fff",
            fontSize:13, fontWeight:700, cursor: (!diaryText.trim()||generating)?"not-allowed":"pointer",
            fontFamily:"'Nunito',sans-serif",
          }}>
            {generating ? "🤖 AI is reading..." : "✨ Get AI Reflection"}
          </button>

          {aiReply && (
            <div style={{ padding:"16px", borderRadius:18, background:"rgba(196,77,255,0.08)", border:"1px solid rgba(196,77,255,0.25)", marginBottom:18, animation:"fadeIn 0.4s ease" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:28, height:28, borderRadius:10, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
                <span style={{ fontSize:11, color:"#c44dff", fontWeight:700 }}>AI COMPANION</span>
              </div>
              <p style={{ fontSize:12, color:C.text, lineHeight:1.7, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>{aiReply}</p>
            </div>
          )}

          <div>
            <div style={{ fontSize:11, color:C.text, letterSpacing:"1px", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Past Entries</div>
            {diaryEntries.map((e,i)=>(
              <div key={i} style={{
                padding:"12px 14px", borderRadius:16, marginBottom:8, cursor:"pointer",
                background: e.highlight ? "rgba(255,107,157,0.08)" : C.surface,
                border: e.highlight ? "1px solid rgba(255,107,157,0.2)" : `1px solid ${C.border}`,
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

      </div>

      {tab==="chat" && (
        <div style={{ position:"absolute", inset:0, zIndex:2, display:"flex", flexDirection:"column", animation:"fadeIn 0.3s ease", background: "#0d0a14", paddingTop: 160 }}>
          <div style={{ flex:1, overflowY:"auto", padding:"12px 20px 100px", display:"flex", flexDirection:"column", gap:12 }}>
            {chatMessages.map((m,i)=>(
              <div key={i} style={{ display:"flex", justifyContent: m.ai?"flex-start":"flex-end", animation: "slideUp 0.3s ease" }}>
                {m.ai && (
                  <div style={{ width:28, height:28, borderRadius:10, background:"linear-gradient(135deg,#c44dff,#6b9dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginRight:7, flexShrink:0, alignSelf:"flex-end" }}>🤖</div>
                )}
                <div style={{
                  maxWidth:"78%", padding:"10px 15px", borderRadius: m.ai?"16px 16px 16px 4px":"16px 16px 4px 16px",
                  background: m.ai ? "rgba(196,77,255,0.08)" : C.grad,
                  border: m.ai ? "1px solid rgba(196,77,255,0.2)" : "none",
                  fontSize:13, color:C.text, lineHeight:1.6,
                  boxShadow: m.ai ? "none" : "0 4px 14px rgba(255,107,157,0.25)",
                }}>{m.text}</div>
              </div>
            ))}
            {isAITyping && (
              <div style={{ display:"flex", justifyContent: "flex-start", animation: "slideUp 0.3s ease" }}>
                <div style={{ width:28, height:28, borderRadius:10, background:"linear-gradient(135deg,#c44dff,#6b9dff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginRight:7, flexShrink:0, alignSelf:"flex-end" }}>🤖</div>
                <div style={{ padding:"10px 14px", borderRadius: "16px 16px 16px 4px", background: "rgba(196,77,255,0.1)", fontSize:12, color:C.muted, display:"flex", gap:4, alignItems:"center" }}>
                  <span style={{width:6, height:6, background:"#c44dff", borderRadius:"50%", animation:"pulse 1s infinite"}}/>
                  <span style={{width:6, height:6, background:"#c44dff", borderRadius:"50%", animation:"pulse 1s infinite 0.2s"}}/>
                  <span style={{width:6, height:6, background:"#c44dff", borderRadius:"50%", animation:"pulse 1s infinite 0.4s"}}/>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* AI CHAT INPUT FIXED ABOVE NAV */}
          <div style={{ position:"absolute", bottom:"70px", left:0, right:0, padding:"10px 20px 14px", borderTop:`1px solid ${C.border}`, display:"flex", gap:8, background:"rgba(13,10,20,0.98)", zIndex:10 }}>
            <input
              value={chatInput} 
              onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              placeholder="Dil ki baat batao AI ko..."
              style={{
                flex:1, padding:"12px 18px", borderRadius:50,
                background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`,
                color:C.text, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif",
              }}/>
            <button onClick={handleSendChat} style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#c44dff,#6b9dff)", border:"none", color:"#fff", fontSize:17, cursor:"pointer", boxShadow:"0 4px 14px rgba(107,157,255,0.35)", opacity: chatInput.trim() ? 1 : 0.5 }}>↑</button>
          </div>
        </div>
      )}

    </div>
  );
};



const CapsuleScreen = ({ user, userData, partnerData, setScreen }) => {
  const [letters, setLetters] = useState([]);
  const [text, setText] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [openedId, setOpenedId] = useState(null);
  const [sealing, setSealing] = useState(false);

  useEffect(() => {
    if (!partnerData) return;
    return subscribeToCapsules(user.uid, partnerData.uid, setLetters);
  }, [partnerData]);

  const handleAdd = async () => {
    if (!text.trim() || !unlockDate || !partnerData) return;
    setSealing(true);
    await addCapsule(user.uid, partnerData.uid, { text, unlockDate, authorName: user.displayName });
    setText(""); setUnlockDate(""); setShowCreate(false); setSealing(false);
  };

  const getDaysLeft = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflowY:"auto", paddingBottom:90 }} className="screen">
      <GlassBg/>
      <div style={{ position:"relative", zIndex:2, padding:"44px 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div onClick={() => setScreen("home")} style={{ fontSize:12, color:C.muted, marginBottom:4, cursor:"pointer" }}>‹ Home</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.text, fontWeight:500 }}>Time Capsule</h2>
          <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>{letters.length} letters locked in time 🔒</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{
          padding:"10px 18px", borderRadius:50,
          background: showCreate ? "transparent" : "linear-gradient(135deg,#6b9dff,#c44dff)",
          border: showCreate ? `1px solid ${C.border}` : "none",
          color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer"
        }}>{showCreate ? "Cancel" : "✍️ Write"}</button>
      </div>

      {showCreate && (
        <div style={{ position:"relative", zIndex:2, margin:"0 20px 20px", padding:20, borderRadius:24, background:"rgba(107,157,255,0.08)", border:"1px solid rgba(107,157,255,0.2)", animation:"fadeIn 0.3s ease" }}>
          <div style={{ fontSize:12, color:"#6b9dff", fontWeight:700, marginBottom:14 }}>✦ Write a letter to the future</div>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={5} placeholder="Dear future us... 💕"
            style={{ width:"100%", padding:"14px", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:16, color:C.text, fontSize:13, outline:"none", fontFamily:"'Playfair Display',serif", fontStyle:"italic", resize:"none", lineHeight:1.7 }}
          />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:12, flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontSize:10, color:C.muted, marginBottom:4, textTransform:"uppercase" }}>🔓 Unlock On</div>
              <input type="date" value={unlockDate} onChange={e => setUnlockDate(e.target.value)}
                style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 12px", color:C.text, fontSize:12, outline:"none" }}
              />
            </div>
            <button onClick={handleAdd} disabled={sealing || !text || !unlockDate} style={{
              padding:"12px 22px", borderRadius:14, background:"linear-gradient(135deg,#6b9dff,#c44dff)",
              border:"none", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
              opacity: (sealing || !text || !unlockDate) ? 0.5 : 1,
              boxShadow:"0 6px 20px rgba(107,157,255,0.3)"
            }}>{sealing ? "Sealing..." : "🔒 Seal It"}</button>
          </div>
        </div>
      )}

      <div style={{ position:"relative", zIndex:2, padding:"0 20px" }}>
        {letters.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:C.muted }}>
            <div style={{ fontSize:70, marginBottom:20, animation:"floating 3s ease-in-out infinite" }}>💌</div>
            <h3 style={{ color:"#fff", fontFamily:"'Playfair Display',serif", marginBottom:8 }}>Empty Vault</h3>
            <p style={{ fontSize:12, lineHeight:1.6 }}>Seal a message for a special future date.<br/>It will unlock only on that day!</p>
          </div>
        ) : letters.map((l, i) => {
          const daysLeft = getDaysLeft(l.unlockDate);
          const isLocked = daysLeft > 0;
          const isOpen = openedId === l.id;
          return (
            <div key={l.id} style={{ marginBottom:14, animation:`fadeIn 0.3s ease ${i*0.06}s both` }}>
              <div onClick={() => !isLocked && setOpenedId(isOpen ? null : l.id)} style={{
                borderRadius:22, overflow:"hidden",
                border: isLocked ? `1px solid ${C.border}` : "1px solid rgba(77,255,179,0.35)",
                cursor: isLocked ? "default" : "pointer",
                boxShadow: isLocked ? "none" : "0 4px 24px rgba(77,255,179,0.1)",
              }}>
                <div style={{ padding:"18px", background: isLocked ? C.surface : "rgba(77,255,179,0.06)", display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{
                    width:54, height:54, borderRadius:18, flexShrink:0,
                    background: isLocked ? "linear-gradient(135deg,rgba(107,157,255,0.2),rgba(196,77,255,0.2))" : "linear-gradient(135deg,#4dffb3,#6b9dff)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:26,
                    boxShadow: isLocked ? "none" : "0 4px 16px rgba(77,255,179,0.3)"
                  }}>{isLocked ? "🔒" : "💌"}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, color: isLocked ? C.muted : C.text, fontWeight:700, marginBottom:5 }}>
                      From {l.authorName || user.displayName}
                    </div>
                    {isLocked ? (
                      <>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:50, background:"rgba(107,157,255,0.12)", border:"1px solid rgba(107,157,255,0.2)" }}>
                          <span style={{ fontSize:10, color:"#6b9dff", fontWeight:700 }}>⏳ Opens in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</span>
                        </div>
                        <div style={{ fontSize:10, color:C.dim, marginTop:5 }}>Unlock: {l.unlockDate}</div>
                      </>
                    ) : (
                      <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:50, background:"rgba(77,255,179,0.1)", border:"1px solid rgba(77,255,179,0.25)" }}>
                        <span style={{ fontSize:10, color:"#4dffb3", fontWeight:700 }}>✨ Tap to read!</span>
                      </div>
                    )}
                  </div>
                  {!isLocked && <span style={{ color:"#4dffb3", fontSize:18, flexShrink:0 }}>{isOpen ? "↑" : "↓"}</span>}
                </div>
                {isOpen && !isLocked && (
                  <div style={{ padding:"18px", borderTop:"1px solid rgba(77,255,179,0.15)", background:"rgba(77,255,179,0.04)", animation:"fadeIn 0.3s ease" }}>
                    <div style={{ fontSize:10, color:"#4dffb3", fontWeight:700, marginBottom:10, letterSpacing:"1px" }}>💌 MESSAGE UNLOCKED</div>
                    <p style={{ fontSize:14, color:C.text, lineHeight:1.8, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>"{l.text}"</p>
                    <div style={{ fontSize:10, color:C.dim, marginTop:10 }}>Sealed on {l.unlockDate}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Upcoming Unlocks Timeline */}
        {letters.filter(l => getDaysLeft(l.unlockDate) > 0).length > 0 && (
          <div style={{ padding:"14px 16px", borderRadius:18, background:C.surface, border:`1px solid ${C.border}`, marginTop:20 }}>
            <div style={{ fontSize:11, color:C.muted, fontWeight:700, marginBottom:10, letterSpacing:"0.8px" }}>⏰ UPCOMING UNLOCKS</div>
            {letters.filter(l => getDaysLeft(l.unlockDate) > 0).sort((a,b) => getDaysLeft(a.unlockDate) - getDaysLeft(b.unlockDate)).slice(0,3).map((l,i)=>(
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"center" }}>
                <div style={{ width:38, height:38, borderRadius:12, background:"rgba(107,157,255,0.1)", border:"1px solid rgba(107,157,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💌</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:C.text, fontWeight:600 }}>From {l.authorName || "Partner"}</div>
                  <div style={{ fontSize:10, color:C.muted }}>Opens in {getDaysLeft(l.unlockDate)} days · {l.unlockDate}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HeartSyncScreen = ({ user, userData, partnerData, setScreen }) => {
  const [syncState, setSyncState] = useState({ idle: true });
  const [active, setActive] = useState(false);
  const coupleId = [user.uid, partnerData?.uid].sort().join("_");

  useEffect(() => {
    if (!partnerData) return;
    return subscribeToHeartSync(coupleId, setSyncState);
  }, [partnerData]);

  const bothTouching = partnerData && syncState[user.uid] && syncState[partnerData.uid];

  useEffect(() => {
    if (bothTouching) {
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    }
  }, [bothTouching]);

  const handleTouch = (isTouching) => {
    setActive(isTouching);
    if (!partnerData) return;
    updateHeartTouch(coupleId, user.uid, isTouching);
  };

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }} className="screen">
      <GlassBg/>
      <div onClick={() => setScreen("home")} style={{ position:"absolute", top:44, left:20, fontSize:20, color:C.muted, cursor:"pointer", zIndex:10 }}>✕</div>
      
      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:20 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:"#fff", marginBottom:10 }}>Heart Sync</h2>
        <p style={{ fontSize:14, color:C.muted, marginBottom:60 }}>{bothTouching ? "Your hearts are beating together ❤️" : "Touch and hold the heart together..."}</p>
        
        <div 
          onMouseDown={() => handleTouch(true)}
          onMouseUp={() => handleTouch(false)}
          onTouchStart={() => handleTouch(true)}
          onTouchEnd={() => handleTouch(false)}
          style={{
            width:200, height:200, borderRadius:"50%",
            background: bothTouching ? "radial-gradient(circle, #ff2d55 0%, transparent 70%)" : "rgba(255,255,255,0.03)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", position:"relative",
            transition:"all 0.5s ease"
          }}
        >
          {/* Waves */}
          {bothTouching && [0,1,2].map(i => (
            <div key={i} style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid #ff2d55", animation:`ripple 2s linear ${i*0.6}s infinite` }}/>
          ))}

          <div style={{
            width:120, height:120, borderRadius:"50%",
            background: active ? C.grad : "rgba(255,255,255,0.05)",
            border: `2px solid ${active ? "#fff" : C.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:60,
            animation: bothTouching ? "heartbeatPulse 0.8s infinite" : active ? "heartBeat 1s infinite" : "none",
            boxShadow: active ? "0 0 40px rgba(255,45,85,0.5)" : "none",
            transition:"all 0.3s ease",
            zIndex:5
          }}>
            ❤️
          </div>
        </div>

        <div style={{ marginTop:60, display:"flex", gap:20, justifyContent:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background: active ? C.pink : C.surface, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4, border:`1px solid ${C.border}` }}>
              {userData?.gender === "female" ? "👧" : "👦"}
            </div>
            <div style={{ fontSize:10, color:C.muted }}>You</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background: (partnerData && syncState[partnerData.uid]) ? "#4daaff" : C.surface, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4, border:`1px solid ${C.border}` }}>
              {partnerData ? (partnerData.gender === "female" ? "👧" : "👦") : "❓"}
            </div>
            <div style={{ fontSize:10, color:C.muted }}>Partner</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix for leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LoveMapScreen = ({ user, userData, partnerData, setScreen }) => {
  const [locations, setLocations] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLoc, setNewLoc] = useState({ title: "", type: "date" });
  const [clickCoords, setClickCoords] = useState(null);
  const [search, setSearch] = useState("");
  const [map, setMap] = useState(null);
  const [searching, setSearching] = useState(false);
  const [mapType, setMapType] = useState("dark"); // dark or satellite
  const [userLoc, setUserLoc] = useState(null);
  const [settingHome, setSettingHome] = useState(false);

  useEffect(() => {
    if (!partnerData) return;
    // Initial jump to home if exists
    if (userData?.homeLocation) {
      setTimeout(() => {
        if (map) map.flyTo([userData.homeLocation.lat, userData.homeLocation.lng], 19);
      }, 500);
    }
    return subscribeToMapMemories(user.uid, partnerData.uid, setLocations);
  }, [partnerData, userData?.homeLocation, !!map]);

  const handleSearch = async () => {
    if (!search.trim() || !map || searching) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        map.flyTo([lat, lon], 18); // Zoom in very close
      } else {
        alert("📍 Location not found!\nTry searching with a city name nearby or check the spelling.");
      }
    } catch (err) {
      alert("Search failed. Please check your connection.");
    } finally {
      setSearching(false);
    }
  };

  const locateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLoc({ lat, lng });
          map.flyTo([lat, lng], 19);
        },
        (err) => {
          alert("📍 Location Access Denied!\nPlease enable location permissions in your browser settings to see where you are.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (settingHome) {
          handleSetHome(e.latlng);
        } else {
          setClickCoords(e.latlng);
          setShowAdd(true);
        }
      },
    });
    return null;
  };

  const handleSetHome = async (latlng) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        homeLocation: { lat: latlng.lat, lng: latlng.lng }
      });
      setSettingHome(false);
      alert("🏠 Home pinned successfully!\nFrom now on, Love Map will always find your home first.");
    } catch (err) {
      alert("Failed to save home location.");
    }
  };

  const handleSave = async () => {
    if (!newLoc.title || !clickCoords) return;
    await addMapMemory(user.uid, partnerData.uid, {
      ...newLoc,
      lat: clickCoords.lat,
      lng: clickCoords.lng,
      author: user.displayName
    });
    setShowAdd(false);
    setNewLoc({ title: "", type: "date" });
  };

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflowY:"hidden" }} className="screen">
      <div onClick={() => setScreen("home")} style={{ position:"absolute", top:44, left:20, width:36, height:36, borderRadius:12, background:"rgba(0,0,0,0.5)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, cursor:"pointer", backdropFilter:"blur(5px)" }}>‹</div>
      
      {/* Search Bar */}
      <div style={{ position:"absolute", top:44, left:66, right:20, zIndex:1000, display:"flex", gap:8 }}>
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search for a special place..." 
          style={{ flex:1, padding:"10px 16px", borderRadius:12, background:"rgba(13,10,20,0.7)", border:`1px solid ${C.border}`, color:"#fff", fontSize:12, outline:"none", backdropFilter:"blur(5px)" }}
        />
        <button onClick={handleSearch} disabled={searching} style={{ padding:"0 12px", borderRadius:12, background:C.grad, border:"none", color:"#fff", fontSize:12, cursor:"pointer", opacity: searching ? 0.7 : 1 }}>
          {searching ? "..." : "🔍"}
        </button>
      </div>

      <MapContainer 
        center={[20, 78]} 
        zoom={4} 
        maxZoom={22}
        style={{ height: "100vh", width: "100%" }} 
        ref={setMap}
        attributionControl={false}
        zoomControl={false}
      >
        {mapType === "dark" ? (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={22} />
        ) : (
          <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" maxZoom={22} />
        )}
        <ZoomControl position="bottomright" />
        <MapClickHandler />
        
        {userLoc && (
          <Marker 
            position={[userLoc.lat, userLoc.lng]} 
            icon={L.divIcon({
              className: "user-dot",
              html: `<div style="width:16px; height:16px; background:#4daaff; border:3px solid #fff; border-radius:50%; box-shadow: 0 0 15px rgba(77,170,255,0.8); animation: heartbeatPulse 1.5s infinite"></div>`
            })}
          >
            <Popup>You are currently here! 📍</Popup>
          </Marker>
        )}

        {userData?.homeLocation && (
          <Marker 
            position={[userData.homeLocation.lat, userData.homeLocation.lng]} 
            icon={L.divIcon({
              className: "home-marker",
              html: `<div style="font-size:30px; filter: drop-shadow(0 0 10px #ffd93d)">🏠</div>`
            })}
          >
            <Popup>Your Sweet Home ❤️</Popup>
          </Marker>
        )}

        {partnerData?.homeLocation && (
          <Marker 
            position={[partnerData.homeLocation.lat, partnerData.homeLocation.lng]} 
            icon={L.divIcon({
              className: "partner-home-marker",
              html: `<div style="font-size:30px; filter: drop-shadow(0 0 10px #ff2d55)">🏡</div>`
            })}
          >
            <Popup>{partnerData.name}'s Home ❤️</Popup>
          </Marker>
        )}

        {locations.map(loc => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <div style={{ padding: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.pink }}>{loc.title}</div>
                <div style={{ fontSize: 10, color: "#666" }}>Pinned by {loc.author}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {showAdd && (
        <div style={{ position:"absolute", bottom:40, left:20, right:20, background:"rgba(13,10,20,0.9)", backdropFilter:"blur(10px)", padding:20, borderRadius:20, border:`1px solid ${C.border}`, zIndex:1001, animation: "slideUp 0.3s ease" }}>
          <h3 style={{ color:"#fff", fontSize:14, marginBottom:12 }}>New Memory 📍</h3>
          <input 
            value={newLoc.title} 
            onChange={e => setNewLoc({...newLoc, title: e.target.value})} 
            placeholder="Place Name (e.g. Our First Date)" 
            style={{ width:"100%", padding:12, borderRadius:12, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, color:"#fff", marginBottom:12, outline:"none" }}
          />
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:12, borderRadius:12, border:`1px solid ${C.border}`, color:C.muted, background:"transparent" }}>Cancel</button>
            <button onClick={handleSave} style={{ flex:2, padding:12, borderRadius:12, background:C.grad, border:"none", color:"#fff", fontWeight:700 }}>Save Here ✨</button>
          </div>
        </div>
      )}

      {!showAdd && (
        <div style={{ position:"absolute", top:100, right:20, zIndex:1000, display:"flex", flexDirection:"column", gap:10 }}>
          <div onClick={locateMe} style={{ width:38, height:38, borderRadius:"50%", background:"rgba(13,10,20,0.8)", color:"#fff", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", backdropFilter:"blur(5px)" }}>🎯</div>
          
          <div onClick={() => setSettingHome(!settingHome)} style={{ padding:"10px 14px", borderRadius:50, background: settingHome ? C.grad : "rgba(13,10,20,0.8)", color:"#fff", fontSize:10, backdropFilter:"blur(5px)", cursor:"pointer", border:`1px solid ${C.border}`, textAlign:"center" }}>
            {settingHome ? "📍 Tap on your house..." : "🏠 Set My Home"}
          </div>

          <div onClick={() => setMapType(mapType === "dark" ? "satellite" : "dark")} style={{ padding:"10px 14px", borderRadius:50, background:"rgba(13,10,20,0.8)", color:"#fff", fontSize:10, backdropFilter:"blur(5px)", cursor:"pointer", border:`1px solid ${C.border}`, textAlign:"center", display:"flex", alignItems:"center", gap:6 }}>
            {mapType === "dark" ? "🛰️ Satellite View" : "🗺️ Map View"}
          </div>
          <div style={{ padding:"8px 16px", borderRadius:50, background:"rgba(13,10,20,0.7)", color:"#fff", fontSize:10, backdropFilter:"blur(5px)" }}>
            Tap on map to pin secret spots 📍
          </div>
        </div>
      )}
    </div>
  );
};

import TogetherModeScreen from "./TogetherMode";

/* ════════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState("home"); // home, chat, memory, profile
  const [memoryCount, setMemoryCount] = useState(0);
  const [dateCount, setDateCount] = useState(0);
  const [capsuleCount, setCapsuleCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    let unsubUserData = null;
    let unsubPartnerData = null;
    let unsubMemoirs = null;
    let unsubDates = null;
    let unsubCapsules = null;
    let unsubNotifications = null;

    const unsubAuth = subscribeToAuthChanges((u) => {
      if (unsubUserData) unsubUserData();
      if (unsubPartnerData) unsubPartnerData();

      setUser(u);
      
      if (u) {
        // Status tracking
        setUserStatus(u.uid, true);
        const handleStatus = () => setUserStatus(u.uid, true);
        const handleOffline = () => setUserStatus(u.uid, false);
        window.addEventListener("focus", handleStatus);
        window.addEventListener("blur", handleOffline);
        window.addEventListener("beforeunload", handleOffline);

        // Listen to notifications
        unsubNotifications = subscribeToNotifications(u.uid, (newList) => {
          setNotifications(newList);
          // NEW: Check for incoming 'touch' notification to vibrate
          if (newList.length > 0 && newList[0].type === "touch" && !newList[0].read) {
            if ("vibrate" in navigator) navigator.vibrate([300, 100, 300]);
          }
        });
        unsubUserData = onSnapshot(doc(db, "users", u.uid), async (userDoc) => {
          if (userDoc.exists()) {
            const d = userDoc.data();
            setUserData(d);
            
            // AUTO-FIX: If it is the old placeholder, reset to today
            if (d.togetherSince === "2024-01-01") {
              const today = new Date().toISOString().split('T')[0];
              await updateDoc(doc(db, "users", u.uid), { togetherSince: today });
              if (d.pairedWith) {
                await updateDoc(doc(db, "users", d.pairedWith), { togetherSince: today });
              }
            }
            
            if (d.pairedWith) {
              // Listen to partner data
              unsubPartnerData = onSnapshot(doc(db, "users", d.pairedWith), (pDoc) => {
                if (pDoc.exists()) setPartnerData(pDoc.data());
              });

              // Listen to memory count
              const coupleId = [u.uid, d.pairedWith].sort().join("_");
              if (unsubMemoirs) unsubMemoirs();
              unsubMemoirs = onSnapshot(collection(db, "chats", coupleId, "memories"), (snap) => {
                setMemoryCount(snap.size);
              });

              // Listen to date count
              if (unsubDates) unsubDates();
              unsubDates = onSnapshot(collection(db, "chats", coupleId, "dates"), (snap) => {
                setDateCount(snap.size);
              });

              // Listen to capsule count
              if (unsubCapsules) unsubCapsules();
              unsubCapsules = onSnapshot(collection(db, "chats", coupleId, "capsules"), (snap) => {
                setCapsuleCount(snap.size);
              });
            } else {
              setPartnerData(null);
              setMemoryCount(0);
              setDateCount(0);
              setCapsuleCount(0);
            }
          }
          setLoading(false); 
        }, () => setLoading(false));
      } else {
        setUserData(null);
        setPartnerData(null);
        setMemoryCount(0);
        setNotifications([]);
        setLoading(false);
      }
    });

    // Timeout to prevent infinite splash hang
    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubAuth();
      if (unsubUserData) unsubUserData();
      if (unsubPartnerData) unsubPartnerData();
      if (unsubMemoirs) unsubMemoirs();
      if (unsubDates) unsubDates();
      if (unsubCapsules) unsubCapsules();
      if (unsubNotifications) unsubNotifications();
      clearTimeout(timeout);
    };
  }, []);

  const [isInstallable, setIsInstallable] = useState(false);
  
  // PWA Install Prompt Listener
  useEffect(() => {
    const handleInstallPrompt = () => setIsInstallable(true);
    window.addEventListener('pwa-ready-to-install', handleInstallPrompt);
    if (window.deferredPrompt) setIsInstallable(true);
    return () => window.removeEventListener('pwa-ready-to-install', handleInstallPrompt);
  }, []);

  return (
    <>
      <GlobalStyles/>
      <AppContainer>
        {loading ? (
          <SplashScreen />
        ) : !user ? (
          <LoginScreen />
        ) : (
          <>
            <div style={{ 
              flex: 1, 
              width: "100%", 
              height: "100%", 
              overflowY: "auto", 
              overflowX: "hidden", 
              position: "relative",
              WebkitOverflowScrolling: "touch"
            }}>
              {activeScreen === "home" && (
                <HomeScreen 
                  user={user} 
                  userData={userData} 
                  partnerData={partnerData} 
                  memoryCount={memoryCount}
                  dateCount={dateCount}
                  capsuleCount={capsuleCount}
                  newMsgCount={notifications.filter(n => n.type === "message").length}
                  setScreen={setActiveScreen} 
                  handleNotifications={() => setShowNotifications(true)} 
                />
              )}
              {activeScreen === "chat" && <ChatScreen user={user} partnerData={partnerData} setScreen={setActiveScreen} />}
              {activeScreen === "memory" && <MemoryScreen user={user} partnerData={partnerData} setScreen={setActiveScreen} />}
              {activeScreen === "profile" && <ProfileScreen user={user} userData={userData} partnerData={partnerData} memoryCount={memoryCount} setScreen={setActiveScreen} handleNotifications={() => setShowNotifications(true)} isInstallable={isInstallable} />}
              {activeScreen === "dates" && <DatesScreen user={user} userData={userData} partnerData={partnerData} setScreen={setActiveScreen} />}
              {activeScreen === "virtualDate" && <VirtualDateScreen user={user} partnerData={partnerData} setScreen={setActiveScreen} />}
              {activeScreen === "capsule" && <CapsuleScreen user={user} userData={userData} partnerData={partnerData} setScreen={setActiveScreen} />}
              { activeScreen === "sync" && <HeartSyncScreen user={user} userData={userData} partnerData={partnerData} setScreen={setActiveScreen} /> }
              { activeScreen === "map" && <LoveMapScreen user={user} userData={userData} partnerData={partnerData} setScreen={setActiveScreen} /> }
              { activeScreen === "games" && <GamesScreen user={user} userData={userData} partnerData={partnerData} setScreen={setActiveScreen} /> }
              { activeScreen === "aidiary" && <AIDiaryScreen user={user} userData={userData} partnerData={partnerData} setScreen={setActiveScreen} /> }
              { activeScreen === "together" && <TogetherModeScreen user={user} userData={userData} partnerData={partnerData} setScreen={setActiveScreen} /> }
            </div>

            {/* FIXED BOTTOM NAV */}
            {activeScreen !== "splash" && (
              <BottomNav active={
                ["chat", "memory", "profile"].includes(activeScreen) ? activeScreen : "home"
              } setScreen={setActiveScreen} />
            )}

            {/* Notification Drawer */}
            {showNotifications && (
              <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(10px)", zIndex:1000, animation:"fadeIn 0.3s ease" }}>
                <div style={{ position:"absolute", bottom:0, width:"100%", background:"#111018", borderRadius:"32px 32px 0 0", padding:"32px 24px calc(32px + env(safe-area-inset-bottom))", maxHeight:"90%", overflowY:"auto" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                    <h2 style={{ color:"#fff", fontSize:20 }}>Notifications</h2>
                    <div style={{ display:"flex", gap:15 }}>
                      <span onClick={async () => { await clearNotifications(user.uid); }} style={{ color:C.pink, fontSize:12, cursor:"pointer" }}>Clear All</span>
                      <span onClick={() => setShowNotifications(false)} style={{ color:C.muted, fontSize:20, cursor:"pointer" }}>✕</span>
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"40px 0", color:C.muted }}>No new activities! ✨</div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{ padding:16, background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, marginBottom:12, display:"flex", gap:12 }}>
                      <div style={{ fontSize:20 }}>{n.type === "message" ? "💬" : n.type === "memory" ? "📸" : "✨"}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ color:"#fff", fontSize:13, fontWeight:600, marginBottom:2 }}>{n.fromName}</div>
                        <div style={{ color:C.muted, fontSize:12 }}>{n.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </AppContainer>
    </>
  );
}

export default App;
