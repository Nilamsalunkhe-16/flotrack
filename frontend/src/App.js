import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
 
// ─── THEME & CONSTANTS ────────────────────────────────────────────────────────
const COLORS = {
  rose: "#E8476A",
  roseDark: "#C4314F",
  roseLight: "#F9A8BC",
  blush: "#FDE8EE",
  mauve: "#9B4F7A",
  lavender: "#C4A8D4",
  sage: "#7DAA8B",
  gold: "#D4A853",
  cream: "#FFF8F5",
  dark: "#2D1B2E",
  mid: "#5C3A5E",
  muted: "#9E7DA0",
  white: "#FFFFFF",
};
 
const CYCLE_PHASES = {
  menstrual: { label: "Menstrual", color: "#E8476A", days: "1-5" },
  follicular: { label: "Follicular", color: "#D4A853", days: "6-13" },
  ovulation: { label: "Ovulation", color: "#7DAA8B", days: "14" },
  luteal: { label: "Luteal", color: "#9B4F7A", days: "15-28" },
};
 
const SYMPTOM_OPTIONS = ["😊 Happy", "😢 Sad", "😠 Irritable", "😰 Anxious", "😴 Tired", "🍫 Cravings", "🤕 Headache", "🤢 Bloating", "💪 Energetic", "🌊 Heavy flow", "💧 Light flow", "🔥 Cramps", "🌸 Spotting", "🌙 Insomnia", "💆 Relaxed"];
 
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
 
// ─── UTILITY FUNCTIONS ─────────────────────────────────────



function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// ✅ FIXED (added backticks)
function formatDate(date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(dateStr) {
  if (!dateStr) return new Date(NaN);

  return new Date(dateStr);
}

function addDays(dateStr, days) {
  const d = parseDate(dateStr);

  if (isNaN(d.getTime())) return null;

  d.setDate(d.getDate() + Number(days));

  return formatDate(d);
}

function daysBetween(d1, d2) {
  const date1 = parseDate(d1);
  const date2 = parseDate(d2);

  if (
    isNaN(date1.getTime()) ||
    isNaN(date2.getTime())
  ) {
    console.error("Invalid dates:", d1, d2);
    return 0;
  }

  return Math.round((date2 - date1) / 86400000);
}


// ✅ same (this was fine)
function getCyclePhase(dayOfCycle) {
  if (dayOfCycle <= 5) return "menstrual";
  if (dayOfCycle <= 13) return "follicular";
  if (dayOfCycle === 14) return "ovulation";
  return "luteal";
}
 
// ─── PCOS RISK CALCULATOR ────────────────────────────────────────────────────
function calculatePCOSRisk(data) {
  let score = 0;
  const factors = [];
  if (data.irregularCycles) { score += 25; factors.push("Irregular cycles"); }
  if (data.acne === "severe") { score += 15; factors.push("Severe acne"); }
  else if (data.acne === "moderate") score += 8;
  if (data.hairFall === "excessive") { score += 15; factors.push("Excessive hair fall"); }
  else if (data.hairFall === "moderate") score += 8;
  if (data.excessHairGrowth) { score += 20; factors.push("Hirsutism"); }
  const bmi = parseFloat(data.bmi);
  if (bmi > 30) { score += 15; factors.push("Obesity (BMI > 30)"); }
  else if (bmi > 25) { score += 8; factors.push("Overweight (BMI > 25)"); }
  if (data.exerciseFrequency === "never") { score += 10; factors.push("Sedentary lifestyle"); }
  if (data.weightGain) { score += 10; factors.push("Unexplained weight gain"); }
  if (data.skinTagsDarkPatches) { score += 10; factors.push("Skin tags/dark patches"); }
  if (data.familyHistoryPCOS) { score += 15; factors.push("Family history of PCOS"); }
  const risk = score >= 50 ? "High" : score >= 25 ? "Moderate" : "Low";
  return { score: Math.min(score, 100), risk, factors };
}
 
// ─── ANEMIA RISK CALCULATOR ──────────────────────────────────────────────────
function calculateAnemiaRisk(data) {
  let score = 0;
  const factors = [];
  if (data.fatigue === "severe") { score += 20; factors.push("Severe fatigue"); }
  else if (data.fatigue === "moderate") score += 10;
  if (data.dizziness === "frequent") { score += 15; factors.push("Frequent dizziness"); }
  else if (data.dizziness === "occasional") score += 7;
  if (data.paleSkin) { score += 15; factors.push("Pale skin"); }
  if (data.shortnessOfBreath) { score += 15; factors.push("Shortness of breath"); }
  if (data.coldHandsFeet) { score += 10; factors.push("Cold hands/feet"); }
  if (!data.ironRichDiet) { score += 20; factors.push("Low iron diet"); }
  if (data.junkFoodFrequency === "daily") { score += 15; factors.push("Daily junk food"); }
  else if (data.junkFoodFrequency === "often") score += 8;
  if (data.heavyPeriods) { score += 20; factors.push("Heavy menstrual flow"); }
  if (data.vegetarian && !data.ironSupplements) { score += 10; factors.push("Vegetarian without iron supplements"); }
  const risk = score >= 50 ? "High" : score >= 25 ? "Moderate" : "Low";
  return { score: Math.min(score, 100), risk, factors };
}
 
// ─── COMPONENTS ──────────────────────────────────────────────────────────────
 
function RiskGauge({ score, risk }) {
  const color = risk === "High" ? "#E8476A" : risk === "Moderate" ? "#D4A853" : "#7DAA8B";
  const angle = (score / 100) * 180 - 90;
  return (
    <div style={{ textAlign: "center", margin: "16px 0" }}>
      <svg width="200" height="110" viewBox="0 0 200 110">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7DAA8B" />
            <stop offset="50%" stopColor="#D4A853" />
            <stop offset="100%" stopColor="#E8476A" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#F0E0E8" strokeWidth="16" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${score * 2.51} 251`} />
        <g transform={`rotate(${angle}, 100, 100)`}>
          <line x1="100" y1="100" x2="100" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="6" fill={color} />
        </g>
        <text x="100" y="88" textAnchor="middle" fill={color} fontSize="22" fontWeight="bold">{score}%</text>
      </svg>
      <div style={{ fontWeight: 700, color, fontSize: 18, marginTop: -8 }}>{risk} Risk</div>
    </div>
  );
}
 
function Tag({ children, color = COLORS.rose }) {
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, display: "inline-block", margin: "2px" }}>
      {children}
    </span>
  );
}
 
function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "20px 22px", boxShadow: "0 2px 20px #E8476A0D", border: "1px solid #F5E0E8", marginBottom: 16, ...style }}>
      {children}
    </div>
  );
}
 
function SectionTitle({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: COLORS.dark, fontFamily: "'Playfair Display', serif" }}>{children}</h2>
    </div>
  );
}
 
function Input({ label, type = "text", value, onChange, options, placeholder, min, max, step }) {
  const style = { width: "100%", padding: "10px 14px", borderRadius: 12, border: `1.5px solid #F0D8E4`, background: "#FFF8F5", color: COLORS.dark, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border 0.2s" };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.mid, marginBottom: 5 }}>{label}</label>}
      {type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={style}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === "range" ? (
        <div>
          <input type="range" min={min} max={max} step={step || 1} value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", accentColor: COLORS.rose }} />
          <div style={{ textAlign: "center", fontWeight: 700, color: COLORS.rose, fontSize: 16 }}>{value}</div>
        </div>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
      )}
    </div>
  );
}
 
function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "8px 0" }}>
      <span style={{ fontSize: 14, color: COLORS.dark, fontWeight: 500 }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? COLORS.rose : "#E0D0D8", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: value ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px #0002" }} />
      </div>
    </div>
  );
}
 
function Button({ children, onClick, variant = "primary", disabled, style: extraStyle = {} }) {
  const base = { border: "none", borderRadius: 14, padding: "11px 22px", fontWeight: 700, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "inherit", opacity: disabled ? 0.6 : 1 };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${COLORS.rose}, ${COLORS.mauve})`, color: "#fff", boxShadow: `0 4px 18px ${COLORS.rose}44` },
    secondary: { background: COLORS.blush, color: COLORS.rose, border: `1.5px solid ${COLORS.roseLight}` },
    ghost: { background: "transparent", color: COLORS.mid, border: `1.5px solid #E8D0DC` },
  };
  return <button style={{ ...base, ...variants[variant], ...extraStyle }} onClick={onClick} disabled={disabled}>{children}</button>;
}
 
// ─── NAVIGATION ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", icon: "🌸", label: "Home" },
  { id: "calendar", icon: "📅", label: "Calendar" },
  { id: "profile", icon: "👤", label: "Profile" },
  { id: "pcos", icon: "🔬", label: "PCOS" },
  { id: "anemia", icon: "🩸", label: "Anemia" },
  { id: "lifestyle", icon: "🌿", label: "Lifestyle" },
  { id: "insights", icon: "📊", label: "Insights" },
];
 
function Nav({ active, setActive }) {
  return (
    <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #F0E0E8", display: "flex", justifyContent: "space-around", padding: "8px 4px 12px", zIndex: 100, boxShadow: "0 -4px 20px #E8476A11" }}>
      {NAV_ITEMS.map(n => (
        <button key={n.id} onClick={() => setActive(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 12, transition: "all 0.2s", color: active === n.id ? COLORS.rose : COLORS.muted }}>
          <span style={{ fontSize: active === n.id ? 22 : 20, filter: active === n.id ? "none" : "grayscale(0.4)" }}>{n.icon}</span>
          <span style={{ fontSize: 9, fontWeight: active === n.id ? 700 : 500 }}>{n.label}</span>
        </button>
      ))}
    </nav>
  );
}
 
// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  const handle = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (mode === "signup" && !name) { setError("Name is required"); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("flo_users") || "{}");
      if (mode === "signup") {
        if (users[email]) { setError("Account already exists"); setLoading(false); return; }
        users[email] = { name, password, createdAt: new Date().toISOString() };
        localStorage.setItem("flo_users", JSON.stringify(users));
        localStorage.setItem("flo_current_user", email);
        onLogin({ email, name });
      } else {
        if (!users[email] || users[email].password !== password) { setError("Invalid credentials"); setLoading(false); return; }
        localStorage.setItem("flo_current_user", email);
        onLogin({ email, name: users[email].name });
      }
      setLoading(false);
    }, 800);
  };
 
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${COLORS.blush} 0%, #fff 60%, #F0E8F8 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🌸</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, color: COLORS.dark, margin: "0 0 4px" }}>FloTrack</h1>
        <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 32 }}>Your women's health companion</p>
        <Card>
          <div style={{ display: "flex", background: COLORS.blush, borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: mode === m ? "#fff" : "transparent", color: mode === m ? COLORS.rose : COLORS.muted, fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: mode === m ? "0 2px 8px #E8476A22" : "none", transition: "all 0.2s" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
          {mode === "signup" && <Input label="Your Name" value={name} onChange={setName} placeholder="e.g. Priya" />}
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {error && <p style={{ color: COLORS.rose, fontSize: 13, margin: "0 0 12px", textAlign: "left" }}>⚠ {error}</p>}
          <Button onClick={handle} disabled={loading} style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
          <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 16, marginBottom: 0 }}>
            Data stored securely on your device. <br />No account required to explore.
          </p>
        </Card>
        <button onClick={() => onLogin({ email: "guest@flotrack.app", name: "Guest" })} style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 13, cursor: "pointer", textDecoration: "underline", marginTop: 8 }}>
          Continue as guest
        </button>
      </div>
    </div>
  );
}
 
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, profile, cycles, lifestyle, pcosResult, anemiaResult, setActive }) {
  const today = formatDate(new Date());
  const lastPeriod = cycles.length > 0 ? cycles[cycles.length - 1] : null;
  const cycleLength = profile.cycleLength || 28;
  const nextPeriod = lastPeriod ? addDays(lastPeriod.startDate, cycleLength) : null;
  const daysUntilNext = nextPeriod ? daysBetween(today, nextPeriod) : null;
  const dayOfCycle = lastPeriod ? daysBetween(lastPeriod.startDate, today) + 1 : null;
  const phase = dayOfCycle ? getCyclePhase(dayOfCycle) : null;
  const phaseInfo = phase ? CYCLE_PHASES[phase] : null;
 
  const recentLifestyle = lifestyle.length > 0 ? lifestyle[lifestyle.length - 1] : null;

  
 
  const phaseMessages = {
    menstrual: "Rest and be gentle with yourself. Your body is working hard. 💕",
    follicular: "Energy rising! Great time to start new projects and exercise. ✨",
    ovulation: "Peak energy and social confidence. You're radiant today! 🌟",
    luteal: "Wind down and nurture yourself. Cravings are normal. 🌙",
  };
 
  return (
    <div>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.rose} 0%, ${COLORS.mauve} 100%)`, borderRadius: "0 0 32px 32px", padding: "28px 22px 32px", marginBottom: 20, color: "#fff" }}>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Good day,</div>
        <h1 style={{ margin: "0 0 16px", fontSize: 26, fontFamily: "'Playfair Display', serif" }}>{user.name} 🌸</h1>
        {phaseInfo ? (
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Current Phase · Day {dayOfCycle}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{phaseInfo.label} Phase</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>{phaseMessages[phase]}</div>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 16, padding: "14px 16px", fontSize: 14 }}>
            Set up your profile to see cycle insights ✨
          </div>
        )}
      </div>
 
      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Card style={{ margin: 0, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.rose }}>{daysUntilNext !== null ? (daysUntilNext <= 0 ? "Today" : `${daysUntilNext}d`) : "—"}</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Next Period</div>
          {daysUntilNext !== null && daysUntilNext <= 3 && daysUntilNext > 0 && (
            <Tag color={COLORS.rose}>Approaching! 🔔</Tag>
          )}
        </Card>
        <Card style={{ margin: 0, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.mauve }}>{cycleLength}d</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Avg Cycle Length</div>
        </Card>
      </div>
 
      {/* Risk Summary */}
      {(pcosResult || anemiaResult) && (
        <Card>
          <SectionTitle icon="🔬">Risk Overview</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {pcosResult && (
              <div style={{ textAlign: "center", padding: "12px", background: COLORS.blush, borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>PCOS Risk</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: pcosResult.risk === "High" ? COLORS.rose : pcosResult.risk === "Moderate" ? COLORS.gold : COLORS.sage }}>{pcosResult.score}%</div>
                <Tag color={pcosResult.risk === "High" ? COLORS.rose : pcosResult.risk === "Moderate" ? COLORS.gold : COLORS.sage}>{pcosResult.risk}</Tag>
              </div>
            )}
            {anemiaResult && (
              <div style={{ textAlign: "center", padding: "12px", background: COLORS.blush, borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>Anemia Risk</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: anemiaResult.risk === "High" ? COLORS.rose : anemiaResult.risk === "Moderate" ? COLORS.gold : COLORS.sage }}>{anemiaResult.score}%</div>
                <Tag color={anemiaResult.risk === "High" ? COLORS.rose : anemiaResult.risk === "Moderate" ? COLORS.gold : COLORS.sage}>{anemiaResult.risk}</Tag>
              </div>
            )}
          </div>
        </Card>
      )}
 
      {/* Lifestyle Snapshot */}
      {recentLifestyle && (
        <Card>
          <SectionTitle icon="🌿">Yesterday's Lifestyle</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div style={{ textAlign: "center", padding: 10, background: "#F0F8F4", borderRadius: 12 }}>
              <div style={{ fontSize: 20 }}>😴</div>
              <div style={{ fontWeight: 700, color: COLORS.sage }}>{recentLifestyle.sleepHours}h</div>
              <div style={{ fontSize: 10, color: COLORS.muted }}>Sleep</div>
            </div>
            <div style={{ textAlign: "center", padding: 10, background: "#EEF4FF", borderRadius: 12 }}>
              <div style={{ fontSize: 20 }}>💧</div>
              <div style={{ fontWeight: 700, color: "#4A90D9" }}>{recentLifestyle.waterIntake}L</div>
              <div style={{ fontSize: 10, color: COLORS.muted }}>Water</div>
            </div>
            <div style={{ textAlign: "center", padding: 10, background: "#FFF4F0", borderRadius: 12 }}>
              <div style={{ fontSize: 20 }}>😌</div>
              <div style={{ fontWeight: 700, color: COLORS.gold }}>{recentLifestyle.stressLevel}/10</div>
              <div style={{ fontSize: 10, color: COLORS.muted }}>Stress</div>
            </div>
          </div>
        </Card>
      )}
 
      {/* Quick Actions */}
      <Card>
        <SectionTitle icon="⚡">Quick Actions</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "📅", label: "Log Period", action: () => setActive("calendar") },
            { icon: "💊", label: "PCOS Check", action: () => setActive("pcos") },
            { icon: "🩸", label: "Anemia Check", action: () => setActive("anemia") },
            { icon: "🌿", label: "Log Lifestyle", action: () => setActive("lifestyle") },
          ].map(a => (
            <button key={a.label} onClick={a.action} style={{ background: COLORS.blush, border: `1.5px solid ${COLORS.roseLight}`, borderRadius: 14, padding: "14px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
              <span style={{ fontSize: 24 }}>{a.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.rose }}>{a.label}</span>
            </button>
          ))}
        </div>
      </Card>
 
      Awareness Tips
     ```jsx id="34bz2x"
<Card style={{ background: `linear-gradient(135deg, #FDF0F5, #F5EEF8)` }}>
  
  <SectionTitle icon="💡">
    Health Awareness
  </SectionTitle>

  {phase === "menstrual" && (
    <div>
      <h3 style={{ color: COLORS.dark, marginBottom: 8 }}>
        🩸 Menstrual Phase
      </h3>

      <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.8 }}>
        During your period, hormone levels and iron levels drop, which may
        cause cramps, fatigue, headaches, or mood swings. Your body is shedding
        the uterine lining and needs extra care and rest.
      </p>

      <ul style={{ color: COLORS.mid, fontSize: 13, lineHeight: 1.8, paddingLeft: 18 }}>
        <li>Eat iron-rich foods like spinach, lentils, dates, and dark chocolate</li>
        <li>Stay hydrated to reduce bloating and headaches</li>
        <li>Use heat pads or warm drinks for cramps</li>
        <li>Light yoga and walking may help ease discomfort</li>
      </ul>
    </div>
  )}

  {phase === "follicular" && (
    <div>
      <h3 style={{ color: COLORS.dark, marginBottom: 8 }}>
        🌱 Follicular Phase
      </h3>

      <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.8 }}>
        Estrogen rises during this phase, increasing energy, confidence,
        motivation, and focus. This is usually the best time for productivity,
        exercise, and trying new activities.
      </p>

      <ul style={{ color: COLORS.mid, fontSize: 13, lineHeight: 1.8, paddingLeft: 18 }}>
        <li>Great time for strength training and cardio</li>
        <li>Eat protein-rich and fermented foods</li>
        <li>Your brain performance is often strongest now</li>
        <li>Perfect phase for learning and social activities</li>
      </ul>
    </div>
  )}

  {phase === "ovulation" && (
    <div>
      <h3 style={{ color: COLORS.dark, marginBottom: 8 }}>
        🌟 Ovulation Phase
      </h3>

      <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.8 }}>
        This is your peak fertility window. Many people feel more social,
        attractive, energetic, and emotionally confident during ovulation.
      </p>

      <ul style={{ color: COLORS.mid, fontSize: 13, lineHeight: 1.8, paddingLeft: 18 }}>
        <li>Stay hydrated and eat balanced meals</li>
        <li>Mild ovulation cramps or spotting can happen</li>
        <li>Track fertility signs if trying to conceive</li>
        <li>Use protection if avoiding pregnancy</li>
      </ul>
    </div>
  )}

  {phase === "luteal" && (
    <div>
      <h3 style={{ color: COLORS.dark, marginBottom: 8 }}>
        🌙 Luteal Phase
      </h3>

      <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.8 }}>
        Progesterone rises after ovulation and PMS symptoms may appear.
        Bloating, cravings, mood swings, breast tenderness, and fatigue are
        common during this phase.
      </p>

      <ul style={{ color: COLORS.mid, fontSize: 13, lineHeight: 1.8, paddingLeft: 18 }}>
        <li>Magnesium-rich foods may reduce PMS symptoms</li>
        <li>Prioritize sleep and stress management</li>
        <li>Gentle yoga and meditation can help</li>
        <li>Cravings are normal — choose nourishing snacks</li>
      </ul>
    </div>
  )}

  {!phase && (
    <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.6 }}>
      🌸 Track your first period to unlock personalized health insights and
      wellness guidance based on your cycle phase.
    </p>
  )}

</Card>
```

    </div>
  );
}
 
// ─── CALENDAR ────────────────────────────────────────────────────────────────
function CalendarView({ cycles, setCycles, symptoms, setSymptoms, profile }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSymptomPicker, setShowSymptomPicker] = useState(false);
  const [markingMode, setMarkingMode] = useState(false);
 
  const today = formatDate(now);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cycleLength = profile.cycleLength || 28;
  const periodDuration = profile.periodDuration || 5;
  
 
  // Build period day set
  const periodDays = new Set();
  const predictedDays = new Set();
  cycles.forEach(cycle => {
    for (let i = 0; i < (cycle.duration || periodDuration); i++) {
      periodDays.add(addDays(cycle.startDate, i));
    }
    // Predict next 2 cycles
    for (let c = 1; c <= 2; c++) {
      const nextStart = addDays(cycle.startDate, cycleLength * c);
      for (let i = 0; i < periodDuration; i++) {
        predictedDays.add(addDays(nextStart, i));
      }
    }
  });
 
  const getDateStr = day => `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
 
  const getDaySymptoms = (dateStr) => symptoms[dateStr] || [];
 
  const togglePeriodDay = (dateStr) => {
    const existing = cycles.find(c => {
      for (let i = 0; i < (c.duration || periodDuration); i++) {
        if (addDays(c.startDate, i) === dateStr) return true;
      }
      return false;
    });
    if (existing) {
      setCycles(prev => prev.filter(c => c.startDate !== existing.startDate));
    } else {
      setCycles(prev => [...prev, { startDate: dateStr, duration: periodDuration, id: Date.now() }]);
    }
  };
 
  const toggleSymptom = (sym) => {
    if (!selectedDate) return;
    setSymptoms(prev => {
      const existing = prev[selectedDate] || [];
      const updated = existing.includes(sym) ? existing.filter(s => s !== sym) : [...existing, sym];
      return { ...prev, [selectedDate]: updated };
    });
  };
 
  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
 
  return (
    <div>
      <SectionTitle icon="📅">Cycle Calendar</SectionTitle>
 
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: COLORS.blush, border: "none", borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: "pointer", color: COLORS.rose }}>‹</button>
        <span style={{ fontWeight: 800, fontSize: 18, color: COLORS.dark, fontFamily: "'Playfair Display', serif" }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{ background: COLORS.blush, border: "none", borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: "pointer", color: COLORS.rose }}>›</button>
      </div>
 
      {/* Legend */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        {[{ color: COLORS.rose, label: "Period" }, { color: COLORS.roseLight, label: "Predicted" }, { color: COLORS.sage, label: "Symptoms" }, { color: "#E8E0F0", label: "Today" }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.mid }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
 
      {/* Mode Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Button onClick={() => setMarkingMode(!markingMode)} variant={markingMode ? "primary" : "secondary"} style={{ fontSize: 12, padding: "7px 14px" }}>
          {markingMode ? "✓ Marking Period" : "Mark Period Days"}
        </Button>
      </div>
 
      {/* Calendar Grid */}
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <div key={d} style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, padding: "4px 0" }}>{d}</div>
          ))}
          {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const dateStr = getDateStr(day);
            const isPeriod = periodDays.has(dateStr);
            const isPredicted = !isPeriod && predictedDays.has(dateStr);
            const isToday = dateStr === today;
            const isSelected = selectedDate === dateStr;
            const daySymptoms = getDaySymptoms(dateStr);
            return (
              <div key={day} onClick={() => {
                if (markingMode) { togglePeriodDay(dateStr); }
                else { setSelectedDate(isSelected ? null : dateStr); setShowSymptomPicker(!isSelected); }
              }} style={{
                width: "100%", paddingBottom: "100%", position: "relative", cursor: "pointer", borderRadius: 10,
                background: isSelected ? COLORS.rose : isPeriod ? COLORS.rose + "CC" : isPredicted ? COLORS.roseLight + "99" : isToday ? "#E8E0F0" : "transparent",
                transition: "all 0.15s",
              }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: isToday || isPeriod ? 700 : 400, color: isPeriod || isSelected ? "#fff" : isToday ? COLORS.mauve : COLORS.dark }}>{day}</span>
                  {daySymptoms.length > 0 && <div style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.sage, marginTop: 1 }} />}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
 
      {/* Symptom Log */}
      {selectedDate && !markingMode && (
        <Card>
          <SectionTitle icon="📝">Log Symptoms for {selectedDate}</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SYMPTOM_OPTIONS.map(sym => {
              const active = (symptoms[selectedDate] || []).includes(sym);
              return (
                <button key={sym} onClick={() => toggleSymptom(sym)} style={{
                  border: `1.5px solid ${active ? COLORS.rose : "#E0D0D8"}`,
                  background: active ? COLORS.blush : "#fff",
                  color: active ? COLORS.rose : COLORS.mid,
                  borderRadius: 20, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: active ? 700 : 400,
                  transition: "all 0.15s"
                }}>{sym}</button>
              );
            })}
          </div>
          {(symptoms[selectedDate] || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>Logged today:</div>
              <div>{(symptoms[selectedDate] || []).map(s => <Tag key={s} color={COLORS.sage}>{s}</Tag>)}</div>
            </div>
          )}
        </Card>
      )}
 
      {/* Cycle History */}
      <Card>
        <SectionTitle icon="🗓">Period History</SectionTitle>
        {cycles.length === 0 ? (
          <p style={{ color: COLORS.muted, fontSize: 13 }}>No periods logged yet. Tap "Mark Period Days" and select your period days on the calendar.</p>
        ) : (
          cycles.slice().reverse().slice(0, 6).map((c, i) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 5 ? "1px solid #F0E0E8" : "none" }}>
              <div>
                <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: 14 }}>{c.startDate}</div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>Duration: {c.duration || periodDuration} days</div>
              </div>
              <Tag color={COLORS.rose}>Logged</Tag>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
 
// ─── PROFILE ─────────────────────────────────────────────────────────────────
function ProfileView({ user, profile, setProfile, onLogout }) {
  const [saved, setSaved] = useState(false);
  const [local, setLocal] = useState({ ...profile });
 
  const save = () => {
    setProfile(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
 
  const upd = (key, val) => setLocal(p => ({ ...p, [key]: val }));
 
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle icon="👤">My Profile</SectionTitle>
        <button onClick={onLogout} style={{ background: COLORS.blush, border: "none", borderRadius: 10, padding: "6px 12px", color: COLORS.rose, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Logout</button>
      </div>
 
      {/* Avatar */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.rose}, ${COLORS.mauve})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 8px" }}>
          {user.name?.[0]?.toUpperCase() || "🌸"}
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.dark }}>{user.name}</div>
        <div style={{ fontSize: 13, color: COLORS.muted }}>{user.email}</div>
      </div>
 
      <Card>
        <SectionTitle icon="🌺">Basic Information</SectionTitle>
        <Input label="Age" type="number" value={local.age || ""} onChange={v => upd("age", v)} placeholder="e.g. 26" />
        <Input label="Height (cm)" type="number" value={local.height || ""} onChange={v => upd("height", v)} placeholder="e.g. 162" />
        <Input label="Weight (kg)" type="number" value={local.weight || ""} onChange={v => upd("weight", v)} placeholder="e.g. 58" />
        {local.height && local.weight && (
          <div style={{ background: COLORS.blush, borderRadius: 10, padding: "8px 12px", marginBottom: 12, fontSize: 13 }}>
            <span style={{ color: COLORS.muted }}>Your BMI: </span>
            <span style={{ fontWeight: 700, color: COLORS.rose }}>{(local.weight / Math.pow(local.height / 100, 2)).toFixed(1)}</span>
          </div>
        )}
      </Card>
 
      <Card>
        <SectionTitle icon="📊">Cycle Information</SectionTitle>
        <Input label="Average Cycle Length (days)" type="number" value={local.cycleLength || ""} onChange={v => upd("cycleLength", v)} placeholder="e.g. 28" />
        <Input label="Period Duration (days)" type="number" value={local.periodDuration || ""} onChange={v => upd("periodDuration", v)} placeholder="e.g. 5" />
        <Input label="Cycle Regularity" type="select" value={local.cycleRegularity || ""} onChange={v => upd("cycleRegularity", v)} options={[
          { value: "", label: "Select..." },
          { value: "regular", label: "Regular (within 2-3 days)" },
          { value: "slightly_irregular", label: "Slightly Irregular (4-7 days variance)" },
          { value: "irregular", label: "Irregular (7+ days variance)" },
          { value: "very_irregular", label: "Very Irregular" },
        ]} />
        <Input label="Flow Type" type="select" value={local.flowType || ""} onChange={v => upd("flowType", v)} options={[
          { value: "", label: "Select..." },
          { value: "light", label: "Light" },
          { value: "normal", label: "Normal" },
          { value: "heavy", label: "Heavy" },
          { value: "very_heavy", label: "Very Heavy" },
        ]} />
        <Input label="Pain Level (1-10)" type="range" min={1} max={10} value={local.painLevel || 1} onChange={v => upd("painLevel", v)} />
        <Toggle label="Diagnosed with PCOS?" value={local.pcosdiagnosed || false} onChange={v => upd("pcosdiagnosed", v)} />
        <Toggle label="Taking hormonal contraceptives?" value={local.contraceptives || false} onChange={v => upd("contraceptives", v)} />
      </Card>
 
      <Card>
        <SectionTitle icon="🏥">Medical History</SectionTitle>
        <Toggle label="Family history of PCOS" value={local.familyPCOS || false} onChange={v => upd("familyPCOS", v)} />
        <Toggle label="Family history of anemia" value={local.familyAnemia || false} onChange={v => upd("familyAnemia", v)} />
        <Toggle label="Thyroid condition" value={local.thyroid || false} onChange={v => upd("thyroid", v)} />
        <Toggle label="Diabetes or pre-diabetes" value={local.diabetes || false} onChange={v => upd("diabetes", v)} />
      </Card>
 
      <Button onClick={save} style={{ width: "100%", marginBottom: 8 }}>
        {saved ? "✓ Profile Saved!" : "Save Profile"}
      </Button>
    </div>
  );
}
 
// ─── PCOS ASSESSMENT ──────────────────────────────────────────────────────────
function PCOSAssessment({ profile, cycles, setPcosResult, pcosResult }) {
  const [form, setForm] = useState({
    irregularCycles: cycles.length > 1 ? false : false,
    acne: "none", hairFall: "normal", excessHairGrowth: false, bmi: profile.weight && profile.height ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1) : "",
    exerciseFrequency: "sometimes", weightGain: false, skinTagsDarkPatches: false, familyHistoryPCOS: profile.familyPCOS || false,
  });
  const [result, setResult] = useState(pcosResult);
  const [step, setStep] = useState(0);
 
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
 
  const run = () => {
    const r = calculatePCOSRisk({ ...form, irregularCycles: profile.cycleRegularity === "irregular" || profile.cycleRegularity === "very_irregular" || form.irregularCycles });
    setResult(r);
    setPcosResult(r);
  };
 
  const steps = [
    {
      title: "Cycle Patterns", icon: "📊",
      content: (
        <>
          <Toggle label="Do you have irregular periods?" value={form.irregularCycles} onChange={v => upd("irregularCycles", v)} />
          <Input label="BMI (auto-filled if height/weight set)" type="number" value={form.bmi} onChange={v => upd("bmi", v)} placeholder="e.g. 24.5" />
          <Toggle label="Unexplained weight gain?" value={form.weightGain} onChange={v => upd("weightGain", v)} />
        </>
      )
    },
    {
      title: "Skin & Hair", icon: "✨",
      content: (
        <>
          <Input label="Acne level" type="select" value={form.acne} onChange={v => upd("acne", v)} options={[{ value: "none", label: "None/Minimal" }, { value: "mild", label: "Mild" }, { value: "moderate", label: "Moderate" }, { value: "severe", label: "Severe" }]} />
          <Input label="Hair fall" type="select" value={form.hairFall} onChange={v => upd("hairFall", v)} options={[{ value: "normal", label: "Normal" }, { value: "moderate", label: "Moderate thinning" }, { value: "excessive", label: "Excessive/Patches" }]} />
          <Toggle label="Excess facial/body hair growth?" value={form.excessHairGrowth} onChange={v => upd("excessHairGrowth", v)} />
          <Toggle label="Skin tags or dark patches?" value={form.skinTagsDarkPatches} onChange={v => upd("skinTagsDarkPatches", v)} />
        </>
      )
    },
    {
      title: "Lifestyle & Family", icon: "🏃",
      content: (
        <>
          <Input label="Exercise frequency" type="select" value={form.exerciseFrequency} onChange={v => upd("exerciseFrequency", v)} options={[{ value: "daily", label: "Daily" }, { value: "often", label: "3-5x/week" }, { value: "sometimes", label: "1-2x/week" }, { value: "rarely", label: "Rarely" }, { value: "never", label: "Never" }]} />
          <Toggle label="Family history of PCOS?" value={form.familyHistoryPCOS} onChange={v => upd("familyHistoryPCOS", v)} />
        </>
      )
    }
  ];
 
  return (
    <div>
      <SectionTitle icon="🔬">PCOS Risk Assessment</SectionTitle>
      <Card style={{ background: "linear-gradient(135deg, #FDF0F5, #F5EEF8)", marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: COLORS.mid, margin: 0, lineHeight: 1.6 }}>
          <strong>What is PCOS?</strong> Polycystic Ovary Syndrome affects 1 in 10 women. It causes hormonal imbalances, irregular periods, and can affect fertility. Early detection helps in management.
        </p>
      </Card>
 
      {!result ? (
        <>
          {/* Progress */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? COLORS.rose : "#F0E0E8", transition: "background 0.3s" }} />
            ))}
          </div>
 
          <Card>
            <SectionTitle icon={steps[step].icon}>{steps[step].title}</SectionTitle>
            {steps[step].content}
          </Card>
 
          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && <Button variant="ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>← Back</Button>}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} style={{ flex: 1 }}>Next →</Button>
            ) : (
              <Button onClick={run} style={{ flex: 1 }}>Calculate Risk 🔬</Button>
            )}
          </div>
        </>
      ) : (
        <>
          <Card>
            <SectionTitle icon="📋">Your PCOS Risk Result</SectionTitle>
            <RiskGauge score={result.score} risk={result.risk} />
            {result.factors.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.mid, marginBottom: 8 }}>Risk Factors Identified:</div>
                <div>{result.factors.map(f => <Tag key={f} color={COLORS.rose}>{f}</Tag>)}</div>
              </div>
            )}
          </Card>
 
          <Card>
            <SectionTitle icon="💊">What This Means</SectionTitle>
            {result.risk === "High" && <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.7 }}>🚨 Your risk score is high. Please consult a gynecologist or endocrinologist. They may recommend blood tests (LH/FSH ratio, testosterone, insulin), ultrasound, and lifestyle modifications.</p>}
            {result.risk === "Moderate" && <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.7 }}>⚠️ Moderate risk detected. Monitor your symptoms and consider speaking with your doctor. Maintaining a healthy weight, exercising regularly, and reducing sugar intake can help.</p>}
            {result.risk === "Low" && <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.7 }}>✅ Low risk — great news! Continue tracking your cycle. Maintaining a healthy lifestyle reduces PCOS risk further.</p>}
          </Card>
 
          <Card>
            <SectionTitle icon="🌿">Lifestyle Recommendations</SectionTitle>
            {["Maintain a balanced diet rich in fiber and low in refined carbs", "Exercise at least 150 minutes per week", "Manage stress through yoga or meditation", "Get 7-9 hours of quality sleep", "Limit dairy and sugar intake", "Stay hydrated — aim for 2-3L water daily"].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: COLORS.mid }}>
                <span style={{ color: COLORS.rose, fontWeight: 700 }}>•</span>
                {tip}
              </div>
            ))}
          </Card>
 
          <Button variant="secondary" onClick={() => setResult(null)} style={{ width: "100%" }}>Retake Assessment</Button>
        </>
      )}
    </div>
  );
}
 
// ─── ANEMIA ASSESSMENT ────────────────────────────────────────────────────────
function AnemiaAssessment({ profile, setPcosResult: _, setAnemiaResult, anemiaResult }) {
  const [form, setForm] = useState({
    fatigue: "none", dizziness: "never", paleSkin: false, shortnessOfBreath: false, coldHandsFeet: false,
    ironRichDiet: true, junkFoodFrequency: "rarely", heavyPeriods: profile.flowType === "heavy" || profile.flowType === "very_heavy",
    vegetarian: false, ironSupplements: false,
  });
  const [result, setResult] = useState(anemiaResult);
  const [step, setStep] = useState(0);
 
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
 
  const run = () => {
    const r = calculateAnemiaRisk(form);
    setResult(r);
    setAnemiaResult(r);
  };
 
  const steps = [
    {
      title: "Physical Symptoms", icon: "🩸",
      content: (
        <>
          <Input label="Fatigue level" type="select" value={form.fatigue} onChange={v => upd("fatigue", v)} options={[{ value: "none", label: "None" }, { value: "mild", label: "Mild fatigue" }, { value: "moderate", label: "Moderate — affects daily activities" }, { value: "severe", label: "Severe — constant exhaustion" }]} />
          <Input label="Dizziness/lightheadedness" type="select" value={form.dizziness} onChange={v => upd("dizziness", v)} options={[{ value: "never", label: "Never" }, { value: "occasional", label: "Occasionally" }, { value: "frequent", label: "Frequently" }]} />
          <Toggle label="Pale or yellowish skin?" value={form.paleSkin} onChange={v => upd("paleSkin", v)} />
          <Toggle label="Shortness of breath?" value={form.shortnessOfBreath} onChange={v => upd("shortnessOfBreath", v)} />
          <Toggle label="Cold hands and feet?" value={form.coldHandsFeet} onChange={v => upd("coldHandsFeet", v)} />
        </>
      )
    },
    {
      title: "Diet & Nutrition", icon: "🥗",
      content: (
        <>
          <Toggle label="Do you eat iron-rich foods regularly?" value={form.ironRichDiet} onChange={v => upd("ironRichDiet", v)} />
          <Input label="Junk food frequency" type="select" value={form.junkFoodFrequency} onChange={v => upd("junkFoodFrequency", v)} options={[{ value: "rarely", label: "Rarely" }, { value: "sometimes", label: "Sometimes (1-2x/week)" }, { value: "often", label: "Often (3-5x/week)" }, { value: "daily", label: "Daily" }]} />
          <Toggle label="Are you vegetarian/vegan?" value={form.vegetarian} onChange={v => upd("vegetarian", v)} />
          <Toggle label="Do you take iron supplements?" value={form.ironSupplements} onChange={v => upd("ironSupplements", v)} />
        </>
      )
    },
    {
      title: "Menstrual Factors", icon: "🌊",
      content: (
        <>
          <Toggle label="Do you have heavy periods?" value={form.heavyPeriods} onChange={v => upd("heavyPeriods", v)} />
          <div style={{ background: COLORS.blush, borderRadius: 12, padding: "12px 14px", marginTop: 8, fontSize: 13, color: COLORS.mid, lineHeight: 1.6 }}>
            💡 Heavy menstrual bleeding is the leading cause of iron-deficiency anemia in women. Losing more than 80ml of blood per cycle significantly increases risk.
          </div>
        </>
      )
    }
  ];
 
  return (
    <div>
      <SectionTitle icon="🩸">Anemia Risk Assessment</SectionTitle>
      <Card style={{ background: "linear-gradient(135deg, #FDF0F5, #F5EEF8)" }}>
        <p style={{ fontSize: 13, color: COLORS.mid, margin: 0, lineHeight: 1.6 }}>
          <strong>What is Anemia?</strong> Anemia occurs when you have fewer red blood cells than normal, often due to iron deficiency. It affects ~30% of women globally and is especially common in those with heavy periods.
        </p>
      </Card>
 
      {!result ? (
        <>
          <div style={{ display: "flex", gap: 6, margin: "16px 0" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "#E8476A" : "#F0E0E8", transition: "background 0.3s" }} />
            ))}
          </div>
          <Card>
            <SectionTitle icon={steps[step].icon}>{steps[step].title}</SectionTitle>
            {steps[step].content}
          </Card>
          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && <Button variant="ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>← Back</Button>}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} style={{ flex: 1 }}>Next →</Button>
            ) : (
              <Button onClick={run} style={{ flex: 1 }}>Calculate Risk 🩸</Button>
            )}
          </div>
        </>
      ) : (
        <>
          <Card style={{ marginTop: 16 }}>
            <SectionTitle icon="📋">Your Anemia Risk Result</SectionTitle>
            <RiskGauge score={result.score} risk={result.risk} />
            {result.factors.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.mid, marginBottom: 8 }}>Risk Factors Identified:</div>
                <div>{result.factors.map(f => <Tag key={f} color="#E8476A">{f}</Tag>)}</div>
              </div>
            )}
          </Card>
 
          <Card>
            <SectionTitle icon="🥗">Iron-Rich Foods to Include</SectionTitle>
            {[["🥩", "Red meat & poultry"], ["🫘", "Lentils & beans"], ["🥬", "Spinach & leafy greens"], ["🐟", "Sardines & tuna"], ["🫐", "Tofu & tempeh"], ["🥜", "Pumpkin seeds & nuts"]].map(([emoji, food]) => (
              <div key={food} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13, color: COLORS.mid }}>
                <span>{emoji}</span><span>{food}</span>
              </div>
            ))}
          </Card>
 
          <Card>
            <SectionTitle icon="💊">Recommendations</SectionTitle>
            {result.risk === "High" && <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.7 }}>🚨 High risk detected. Please see a doctor for a complete blood count (CBC) test. Iron supplements may be prescribed. Avoid tea/coffee with meals as they inhibit iron absorption.</p>}
            {result.risk === "Moderate" && <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.7 }}>⚠️ Moderate risk. Consider adding more iron-rich foods to your diet. Vitamin C enhances iron absorption — pair iron foods with citrus. Monitor your energy levels.</p>}
            {result.risk === "Low" && <p style={{ fontSize: 13, color: COLORS.mid, lineHeight: 1.7 }}>✅ Low risk — great! Continue eating a balanced diet. If you feel consistently tired despite good sleep, consult your doctor.</p>}
          </Card>
 
          <Button variant="secondary" onClick={() => setResult(null)} style={{ width: "100%" }}>Retake Assessment</Button>
        </>
      )}
    </div>
  );
}
 
// ─── LIFESTYLE ────────────────────────────────────────────────────────────────
function LifestyleLog({ lifestyle, setLifestyle }) {
  const [form, setForm] = useState({ date: formatDate(new Date()), sleepHours: 7, waterIntake: 2.0, stressLevel: 5, exerciseMinutes: 30, exerciseType: "walking", mood: "neutral", meals: 3 });
  const [saved, setSaved] = useState(false);
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
 
  const save = () => {
    setLifestyle(prev => {
      const filtered = prev.filter(l => l.date !== form.date);
      return [...filtered, { ...form }].sort((a, b) => a.date.localeCompare(b.date));
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
 
  const recentData = lifestyle.slice(-7);
 
  return (
    <div>
      <SectionTitle icon="🌿">Lifestyle Tracker</SectionTitle>
      <Card>
        <SectionTitle icon="📝">Log Today</SectionTitle>
        <Input label="Date" type="date" value={form.date} onChange={v => upd("date", v)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.mid, display: "block", marginBottom: 5 }}>😴 Sleep Hours</label>
            <input type="range" min={3} max={12} step={0.5} value={form.sleepHours} onChange={e => upd("sleepHours", parseFloat(e.target.value))} style={{ width: "100%", accentColor: COLORS.rose }} />
            <div style={{ textAlign: "center", fontWeight: 700, color: COLORS.rose, fontSize: 15 }}>{form.sleepHours}h</div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.mid, display: "block", marginBottom: 5 }}>💧 Water (L)</label>
            <input type="range" min={0.5} max={5} step={0.25} value={form.waterIntake} onChange={e => upd("waterIntake", parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#4A90D9" }} />
            <div style={{ textAlign: "center", fontWeight: 700, color: "#4A90D9", fontSize: 15 }}>{form.waterIntake}L</div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.mid, display: "block", marginBottom: 5 }}>😌 Stress (1-10)</label>
            <input type="range" min={1} max={10} value={form.stressLevel} onChange={e => upd("stressLevel", parseInt(e.target.value))} style={{ width: "100%", accentColor: COLORS.gold }} />
            <div style={{ textAlign: "center", fontWeight: 700, color: COLORS.gold, fontSize: 15 }}>{form.stressLevel}/10</div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.mid, display: "block", marginBottom: 5 }}>🏃 Exercise (min)</label>
            <input type="range" min={0} max={120} step={5} value={form.exerciseMinutes} onChange={e => upd("exerciseMinutes", parseInt(e.target.value))} style={{ width: "100%", accentColor: COLORS.sage }} />
            <div style={{ textAlign: "center", fontWeight: 700, color: COLORS.sage, fontSize: 15 }}>{form.exerciseMinutes}m</div>
          </div>
        </div>
        <Input label="Mood" type="select" value={form.mood} onChange={v => upd("mood", v)} options={[{ value: "great", label: "😄 Great" }, { value: "good", label: "🙂 Good" }, { value: "neutral", label: "😐 Neutral" }, { value: "low", label: "😔 Low" }, { value: "terrible", label: "😢 Terrible" }]} />
        <Input label="Exercise Type" type="select" value={form.exerciseType} onChange={v => upd("exerciseType", v)} options={[{ value: "none", label: "None" }, { value: "walking", label: "Walking" }, { value: "yoga", label: "Yoga" }, { value: "running", label: "Running" }, { value: "gym", label: "Gym/Strength" }, { value: "dance", label: "Dance/Zumba" }, { value: "swimming", label: "Swimming" }]} />
        <Button onClick={save} style={{ width: "100%" }}>{saved ? "✓ Logged!" : "Save Today's Log 💾"}</Button>
      </Card>
 
      {recentData.length > 0 && (
        <>
          <Card>
            <SectionTitle icon="😴">Sleep Trend (Last 7 Days)</SectionTitle>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={recentData}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.mauve} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.mauve} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E0E8" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={d => d.slice(5)} />
                <YAxis domain={[0, 12]} tick={{ fontSize: 9 }} />
                <Tooltip formatter={v => [`${v}h`, "Sleep"]} />
                <Area type="monotone" dataKey="sleepHours" stroke={COLORS.mauve} fill="url(#sleepGrad)" strokeWidth={2} dot={{ fill: COLORS.mauve, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
 
          <Card>
            <SectionTitle icon="💧">Water & Stress Trend</SectionTitle>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={recentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E0E8" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="waterIntake" stroke="#4A90D9" strokeWidth={2} name="Water (L)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="stressLevel" stroke={COLORS.gold} strokeWidth={2} name="Stress" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}
 
// ─── INSIGHTS ────────────────────────────────────────────────────────────────
function Insights({ cycles, lifestyle, pcosResult, anemiaResult, symptoms }) {
  // Cycle length history
  const cycleLengthData = cycles.slice(-6).map((c, i, arr) => ({
    month: c.startDate.slice(0, 7),
    length: i > 0 ? daysBetween(arr[i - 1].startDate, c.startDate) : 28
  })).filter(d => d.length > 0 && d.length < 60);
 
  // Symptom frequency
  const allSymptoms = Object.values(symptoms).flat();
  const symptomFreq = SYMPTOM_OPTIONS.map(s => ({ name: s.split(" ")[1] || s, count: allSymptoms.filter(x => x === s).length })).filter(s => s.count > 0).sort((a, b) => b.count - a.count).slice(0, 8);
 
  // Lifestyle averages
  const avgSleep = lifestyle.length ? (lifestyle.reduce((a, b) => a + parseFloat(b.sleepHours), 0) / lifestyle.length).toFixed(1) : null;
  const avgWater = lifestyle.length ? (lifestyle.reduce((a, b) => a + parseFloat(b.waterIntake), 0) / lifestyle.length).toFixed(1) : null;
  const avgStress = lifestyle.length ? (lifestyle.reduce((a, b) => a + parseInt(b.stressLevel), 0) / lifestyle.length).toFixed(1) : null;
 
  // Radar data for health overview
  const radarData = [
    { subject: "Sleep", value: avgSleep ? Math.min((parseFloat(avgSleep) / 8) * 100, 100) : 0 },
    { subject: "Hydration", value: avgWater ? Math.min((parseFloat(avgWater) / 2.5) * 100, 100) : 0 },
    { subject: "Low Stress", value: avgStress ? Math.max(100 - (parseFloat(avgStress) * 10), 0) : 0 },
    { subject: "Cycle Track", value: cycles.length > 2 ? 100 : cycles.length * 33 },
    { subject: "PCOS Low", value: pcosResult ? 100 - pcosResult.score : 0 },
    { subject: "Anemia Low", value: anemiaResult ? 100 - anemiaResult.score : 0 },
  ];
 
  return (
    <div>
      <SectionTitle icon="📊">Health Insights</SectionTitle>
 
      {/* Overall Health Radar */}
      <Card>
        <SectionTitle icon="🌐">Overall Health Score</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#F0E0E8" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: COLORS.mid }} />
            <Radar name="Health" dataKey="value" stroke={COLORS.rose} fill={COLORS.rose} fillOpacity={0.25} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
 
      {/* Lifestyle Summary */}
      {lifestyle.length > 0 && (
        <Card>
          <SectionTitle icon="📈">Lifestyle Averages</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[{ label: "Avg Sleep", val: `${avgSleep}h`, emoji: "😴", color: COLORS.mauve, good: parseFloat(avgSleep) >= 7 }, { label: "Avg Water", val: `${avgWater}L`, emoji: "💧", color: "#4A90D9", good: parseFloat(avgWater) >= 2 }, { label: "Avg Stress", val: `${avgStress}/10`, emoji: "😌", color: COLORS.gold, good: parseFloat(avgStress) <= 5 }].map(item => (
              <div key={item.label} style={{ textAlign: "center", padding: 12, background: item.good ? "#F0F8F4" : "#FFF0F0", borderRadius: 14 }}>
                <div style={{ fontSize: 20 }}>{item.emoji}</div>
                <div style={{ fontWeight: 700, color: item.color, fontSize: 16 }}>{item.val}</div>
                <div style={{ fontSize: 10, color: COLORS.muted }}>{item.label}</div>
                <div style={{ fontSize: 14 }}>{item.good ? "✅" : "⚠️"}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
 
      {/* Cycle Length Chart */}
      {cycleLengthData.length > 1 && (
        <Card>
          <SectionTitle icon="📅">Cycle Length History</SectionTitle>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={cycleLengthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E0E8" />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} />
              <YAxis domain={[20, 40]} tick={{ fontSize: 9 }} />
              <Tooltip formatter={v => [`${v} days`, "Cycle Length"]} />
              <Bar dataKey="length" fill={COLORS.rose} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.muted, marginTop: 8 }}>
            <span>Normal range: 21–35 days</span>
            <Tag color={cycleLengthData.every(d => d.length >= 21 && d.length <= 35) ? COLORS.sage : COLORS.gold}>
              {cycleLengthData.every(d => d.length >= 21 && d.length <= 35) ? "Regular" : "Check pattern"}
            </Tag>
          </div>
        </Card>
      )}
 
      {/* Symptom Frequency */}
      {symptomFreq.length > 0 && (
        <Card>
          <SectionTitle icon="📝">Common Symptoms</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={symptomFreq} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E0E8" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
              <Tooltip />
              <Bar dataKey="count" fill={COLORS.mauve} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
 
      {/* Risk Timeline */}
      {(pcosResult || anemiaResult) && (
        <Card>
          <SectionTitle icon="🔬">Risk Assessment Summary</SectionTitle>
          {pcosResult && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: COLORS.mid }}>PCOS Risk</span>
                <Tag color={pcosResult.risk === "High" ? COLORS.rose : pcosResult.risk === "Moderate" ? COLORS.gold : COLORS.sage}>{pcosResult.risk} ({pcosResult.score}%)</Tag>
              </div>
              <div style={{ height: 8, background: "#F0E0E8", borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${pcosResult.score}%`, background: pcosResult.risk === "High" ? COLORS.rose : pcosResult.risk === "Moderate" ? COLORS.gold : COLORS.sage, borderRadius: 4, transition: "width 1s" }} />
              </div>
            </div>
          )}
          {anemiaResult && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: COLORS.mid }}>Anemia Risk</span>
                <Tag color={anemiaResult.risk === "High" ? COLORS.rose : anemiaResult.risk === "Moderate" ? COLORS.gold : COLORS.sage}>{anemiaResult.risk} ({anemiaResult.score}%)</Tag>
              </div>
              <div style={{ height: 8, background: "#F0E0E8", borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${anemiaResult.score}%`, background: anemiaResult.risk === "High" ? COLORS.rose : anemiaResult.risk === "Moderate" ? COLORS.gold : COLORS.sage, borderRadius: 4, transition: "width 1s" }} />
              </div>
            </div>
          )}
        </Card>
      )}
 
      {/* Empty state */}
      {cycles.length === 0 && lifestyle.length === 0 && !pcosResult && !anemiaResult && (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <div style={{ fontWeight: 700, color: COLORS.dark, marginBottom: 8 }}>No data yet</div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>Log your cycles, lifestyle data, and complete assessments to see personalized insights here.</div>
        </Card>
      )}
    </div>
  );
}
 
// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
 
  const getKey = useCallback((key) => {
  return user ? `flo_${user.email}_${key}` : null;
}, [user]);

const loadData = useCallback((key, defaultVal) => {
  if (!user) return defaultVal;
  try {
    const v = localStorage.getItem(getKey(key));
    return v ? JSON.parse(v) : defaultVal;
  } catch {
    return defaultVal;
  }
}, [user, getKey]);

const saveData = useCallback((key, val) => {
  if (!user) return;
  localStorage.setItem(getKey(key), JSON.stringify(val));
}, [user, getKey]);
 
  const [profile, setProfileState] = useState({});
  const [cycles, setCyclesState] = useState([]);
  const [lifestyle, setLifestyleState] = useState([]);
  const [symptoms, setSymptomsState] = useState({});
  const [pcosResult, setPcosResultState] = useState(null);
  const [anemiaResult, setAnemiaResultState] = useState(null);
 
  useEffect(() => {
    const saved = localStorage.getItem("flo_current_user");
    if (saved) {
      const users = JSON.parse(localStorage.getItem("flo_users") || "{}");
      if (users[saved]) setUser({ email: saved, name: users[saved].name });
      else if (saved === "guest@flotrack.app") setUser({ email: saved, name: "Guest" });
    }
  }, []);
 
  useEffect(() => {
    if (!user) return;
    setProfileState(loadData("profile", {}));
    setCyclesState(loadData("cycles", []));
    setLifestyleState(loadData("lifestyle", []));
    setSymptomsState(loadData("symptoms", {}));
    setPcosResultState(loadData("pcosResult", null));
    setAnemiaResultState(loadData("anemiaResult", null));
  }, [user,loadData]);
 
 
  const setProfile = v => { setProfileState(v); saveData("profile", v); };
  const setCycles = fn => { setCyclesState(prev => { const v = typeof fn === "function" ? fn(prev) : fn; saveData("cycles", v); return v; }); };
  const setLifestyle = fn => { setLifestyleState(prev => { const v = typeof fn === "function" ? fn(prev) : fn; saveData("lifestyle", v); return v; }); };
  const setSymptoms = fn => { setSymptomsState(prev => { const v = typeof fn === "function" ? fn(prev) : fn; saveData("symptoms", v); return v; }); };
  const setPcosResult = v => { setPcosResultState(v); saveData("pcosResult", v); };
  const setAnemiaResult = v => { setAnemiaResultState(v); saveData("anemiaResult", v); };
 
  const onLogin = (u) => setUser(u);
  const onLogout = () => { localStorage.removeItem("flo_current_user"); setUser(null); };
 
  if (!user) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=DM+Sans:wght@400;500;600;700&display=swap'); * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; } body { margin: 0; background: #FFF8F5; }`}</style>
      <AuthScreen onLogin={onLogin} />
    </>
  );
 
  const views = { dashboard: Dashboard, calendar: CalendarView, profile: ProfileView, pcos: PCOSAssessment, anemia: AnemiaAssessment, lifestyle: LifestyleLog, insights: Insights };
  const View = views[active];
 
  const viewProps = { user, profile, setProfile, cycles, setCycles, lifestyle, setLifestyle, symptoms, setSymptoms, pcosResult, setPcosResult, anemiaResult, setAnemiaResult, onLogout, setActive };
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        body { margin: 0; background: #FFF8F5; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #F0D0DC; border-radius: 2px; }
        input[type=range] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: #F0D0DC; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #E8476A; cursor: pointer; box-shadow: 0 2px 6px #E8476A44; }
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#FFF8F5" }}>
        {/* Header */}
        <div style={{ background: "#fff", padding: "16px 20px 12px", borderBottom: "1px solid #F0E0E8", position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🌸</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 20, color: COLORS.dark }}>FloTrack</span>
          <div style={{ flex: 1 }} />
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.rose}, ${COLORS.mauve})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
        </div>
 
        {/* Content */}
        <div style={{ padding: "20px 16px 100px" }}>
          <View {...viewProps} />
        </div>
 
        {/* Bottom Nav */}
        <Nav active={active} setActive={setActive} />
      </div>
    </>
  );
}
 