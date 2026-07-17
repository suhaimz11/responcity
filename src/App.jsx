import { useMemo, useState } from "react";

const logo = "/assets/emerge-aid-logo.png";
const admins = [
  { name: "Suhaim", username: "suhaim", password: "Hajeeb" },
  { name: "Abdulla", username: "abdulla", password: "Hajeeb" },
];

const categories = [
  { id: "medical", label: "Medical", icon: "✚", color: "#ff1744", bg: "#fff0f3" },
  { id: "transport", label: "Vehicle", icon: "▣", color: "#f97316", bg: "#fff7ed" },
  { id: "home", label: "Home", icon: "⌂", color: "#0f766e", bg: "#ecfdf5" },
  { id: "blood", label: "Blood", icon: "●", color: "#dc2626", bg: "#fef2f2" },
  { id: "mental", label: "Mental", icon: "◌", color: "#7c3aed", bg: "#f5f3ff" },
  { id: "lost", label: "Lost & Found", icon: "⌕", color: "#2563eb", bg: "#eff6ff" },
];

const presets = {
  medical: ["I need medicine urgently", "Someone is injured and needs immediate help", "I am having chest pain / difficulty breathing"],
  transport: ["My vehicle has broken down", "I have a flat tyre and need help", "My vehicle battery is dead, need a jump start"],
  home: ["I am locked out of my home", "There is a gas leak, need immediate help", "There is a water leak / flooding at home"],
  blood: ["Need blood urgently - please help", "Looking for a specific blood group donor nearby", "Patient in hospital needs blood now"],
  mental: ["I am feeling overwhelmed and need someone to talk to", "I am having a panic attack", "I need emotional support right now"],
  lost: ["I lost my pet, please help", "I have lost something and need help finding it", "I found a lost child / elderly person"],
};

const seedPending = [
  {
    id: "p1",
    user: "Aisha R.",
    category: "medical",
    message: "Someone has fainted near the pharmacy and needs immediate first aid support.",
    urgency: 9,
    proof: "photo",
    location: "Near City Care Pharmacy, Oak Street",
    status: "NEW",
  },
  {
    id: "p2",
    user: "Kiran M.",
    category: "transport",
    message: "Flat tyre on the main road, stuck with family and need help changing it.",
    urgency: 6,
    proof: "photo",
    location: "Main Road service lane",
    status: "REVIEWING",
  },
  {
    id: "p3",
    user: "Nora S.",
    category: "home",
    message: "Gas smell in apartment corridor, need someone nearby to verify and help evacuate.",
    urgency: 10,
    proof: "video",
    location: "Greenview Residency Block C",
    status: "NEW",
  },
];

const helperRequests = [
  { id: "r1", user: "Sarah M.", category: "medical", message: "Diabetic emergency - need glucose tablets urgently", distance: "0.3 mi", urgent: true },
  { id: "r2", user: "James K.", category: "transport", message: "Flat tyre on I-95, stranded with kids in car", distance: "1.2 mi", urgent: false },
  { id: "r3", user: "Maria L.", category: "mental", message: "Feeling unsafe, need escort to parking garage", distance: "0.7 mi", urgent: true },
];

const activity = [
  { id: "m1", category: "medical", title: "Assisted neighbor with diabetic emergency", date: "Today", km: 0.7, points: 50 },
  { id: "m2", category: "transport", title: "Changed flat tyre for stranded family", date: "Dec 12", km: 1.8, points: 30 },
  { id: "m3", category: "home", title: "Helped elderly resident during power outage", date: "Dec 10", km: 3.2, points: 25 },
  { id: "m4", category: "mental", title: "Provided emotional support during panic episode", date: "Dec 3", km: 5.5, points: 35 },
  { id: "m5", category: "blood", title: "Connected O+ donor to nearby hospital", date: "Nov 29", km: 8.4, points: 45 },
];

const tierData = [
  { name: "Bronze", points: 0, color: "#b7791f", icon: "●" },
  { name: "Silver", points: 250, color: "#94a3b8", icon: "●" },
  { name: "Gold", points: 650, color: "#d6b96a", icon: "★" },
  { name: "Platinum", points: 1200, color: "#7fb7c5", icon: "✦" },
];

function categoryFor(id) {
  return categories.find((cat) => cat.id === id) || categories[0];
}

export default function App() {
  const [dark, setDark] = useState(true);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login");
  const [pending, setPending] = useState(seedPending);
  const [approved, setApproved] = useState([]);
  const [proof, setProof] = useState(null);

  function login(identifier, password, name) {
    const admin = admins.find((item) => item.username === identifier.toLowerCase() && item.password === password);
    const nextUser = admin || { name: name || identifier.split("@")[0] || "Demo User", username: identifier, role: "user" };
    if (admin) nextUser.role = "admin";
    setUser(nextUser);
    setScreen("home");
  }

  function logout() {
    setUser(null);
    setScreen("login");
  }

  return (
    <main className={dark ? "app dark" : "app"}>
      <div className="phone">
        {screen !== "login" && (
          <button className="settings-gear" onClick={() => setScreen("settings")} aria-label="Settings">
            ⚙
          </button>
        )}
        {screen === "login" && <Login onLogin={login} />}
        {screen === "home" && <Home user={user} setScreen={setScreen} />}
        {screen === "settings" && <Settings dark={dark} setDark={setDark} logout={logout} setScreen={setScreen} />}
        {screen === "requester" && <Requester setScreen={setScreen} setPending={setPending} user={user} />}
        {screen === "helper" && <Helper approved={approved} setScreen={setScreen} />}
        {screen === "admin" && <Admin pending={pending} setPending={setPending} setApproved={setApproved} setProof={setProof} />}
        {screen === "activity" && <Activity />}
        {screen === "rankings" && <Rankings />}
        {proof && <ProofModal proof={proof} onClose={() => setProof(null)} />}
      </div>
    </main>
  );
}

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <section className="login-screen">
      <Brand />
      <h1>Welcome to Emerge Aid</h1>
      <p>Sign in to request help, respond nearby, or review emergency posts.</p>
      <div className="panel auth-panel">
        <div className="segmented">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign Up</button>
        </div>
        {mode === "signup" && <input placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} />}
        <input placeholder="Username or email" value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="primary" onClick={() => onLogin(identifier || "demo", password, name)}>
          {mode === "login" ? "Login" : "Create Demo Account"}
        </button>
      </div>
    </section>
  );
}

function Brand() {
  return (
    <div className="brand-plate">
      <img src={logo} alt="Emerge Aid" />
    </div>
  );
}

function Home({ user, setScreen }) {
  return (
    <section className="home-screen">
      <Brand />
      <h1>How can Emerge Aid help?</h1>
      <p>Community emergency assistance - available now</p>
      <ModeCard color="red" icon="✚" title="I Need Help" subtitle="Request emergency assistance from nearby helpers" onClick={() => setScreen("requester")} />
      <ModeCard color="blue" icon="✋" title="I Can Help" subtitle="Respond to requests from people in need nearby" onClick={() => setScreen("helper")} />
      {user?.role === "admin" && <ModeCard color="navy" icon="✓" title="Admin Review" subtitle="Approve help requests before they appear to helpers" onClick={() => setScreen("admin")} />}
      <div className="stats panel">
        <span><b>2,841</b>Helpers</span>
        <span><b>14,920</b>Missions</span>
        <span><b>80 km</b>Coverage</span>
      </div>
    </section>
  );
}

function ModeCard({ color, icon, title, subtitle, onClick }) {
  return (
    <button className={`mode-card ${color}`} onClick={onClick}>
      <span className="mode-icon">{icon}</span>
      <span><b>{title}</b><small>{subtitle}</small></span>
      <i>›</i>
    </button>
  );
}

function Settings({ dark, setDark, logout, setScreen }) {
  return (
    <section className="page">
      <button className="back" onClick={() => setScreen("home")}>‹</button>
      <h1>Settings</h1>
      <div className="panel setting-row">
        <span><b>{dark ? "Dark mode" : "Light mode"}</b><small>Choose the app appearance.</small></span>
        <label className="switch"><input type="checkbox" checked={dark} onChange={(event) => setDark(event.target.checked)} /><i /></label>
      </div>
      <div className="panel list">
        <button>About Us <i>›</i></button>
        <button>Privacy Policy <i>›</i></button>
      </div>
      <div className="panel contact">
        <b>Contact Emerge Aid</b>
        <p>For business enquiries, suggestions, feedback, partnerships, or app support:</p>
        <a>imailemergeaid@gmail.com</a>
      </div>
      <button className="logout" onClick={logout}>Log out</button>
    </section>
  );
}

function Requester({ setScreen, setPending, user }) {
  const [category, setCategory] = useState(categories[0]);
  const [selected, setSelected] = useState("");
  const [details, setDetails] = useState("");
  const [urgency, setUrgency] = useState(5);
  const [proof, setProof] = useState("photo");

  function submit() {
    setPending((items) => [{
      id: `p-${Date.now()}`,
      user: user?.name || "Demo User",
      category: category.id,
      message: [selected, details].filter(Boolean).join(" - ") || "Custom emergency request",
      urgency,
      proof,
      location: "Shared live location",
      status: "NEW",
    }, ...items]);
    setScreen("activity");
  }

  return (
    <section className="page">
      <h1>I Need Help</h1>
      <div className="sos">SOS</div>
      <h2>Request Specific Help</h2>
      <div className="category-grid">
        {categories.map((cat) => <button key={cat.id} className={category.id === cat.id ? "selected" : ""} onClick={() => setCategory(cat)}>{cat.icon}<span>{cat.label}</span></button>)}
      </div>
      <div className="panel form-panel">
        <b>{category.label} Request</b>
        <div className="proof-row">
          <button className={proof === "photo" ? "active" : ""} onClick={() => setProof("photo")}>Photo proof</button>
          <button className={proof === "video" ? "active" : ""} onClick={() => setProof("video")}>Video proof</button>
        </div>
        {presets[category.id].map((item) => <button className={`preset ${selected === item ? "active" : ""}`} key={item} onClick={() => setSelected(item)}>{item}</button>)}
        <textarea placeholder="Describe more..." value={details} onChange={(event) => setDetails(event.target.value)} />
        <label className="slider-label">Urgency {urgency}/10</label>
        <input type="range" min="1" max="10" value={urgency} onChange={(event) => setUrgency(Number(event.target.value))} />
        <button className="primary" onClick={submit}>Request Help</button>
      </div>
      <BottomTabs active="home" setScreen={setScreen} />
    </section>
  );
}

function Helper({ approved, setScreen }) {
  const [tab, setTab] = useState("open");
  const requests = tab === "open" ? [...approved, ...helperRequests] : helperRequests.filter((item) => item.urgent);
  return (
    <section className="page helper-page">
      <div className="hero-blue">
        <small>HELPER MODE</small>
        <h1>Ready to Help?</h1>
        <div className="segmented blue">
          <button className={tab === "open" ? "active" : ""} onClick={() => setTab("open")}>Open Requests ({requests.length})</button>
          <button className={tab === "emergency" ? "active" : ""} onClick={() => setTab("emergency")}><span className="blink" /> Emergency</button>
        </div>
      </div>
      {requests.map((req) => <RequestCard key={req.id} request={req} />)}
      <BottomTabs active="helper" setScreen={setScreen} />
    </section>
  );
}

function RequestCard({ request }) {
  const cat = categoryFor(request.category);
  return (
    <div className="panel request-card" style={{ borderLeftColor: cat.color }}>
      <div className="request-head">
        <span className="request-icon" style={{ color: cat.color, background: cat.bg }}>{cat.icon}</span>
        <span><b>{request.user}</b><small>{cat.label.toUpperCase()}</small></span>
        {request.urgent && <em>URGENT</em>}
      </div>
      <p>{request.message}</p>
      <small>{request.distance || "0.4 mi"} · just now</small>
      <button className="primary">I Can Help</button>
    </div>
  );
}

function Admin({ pending, setPending, setApproved, setProof }) {
  const [filter, setFilter] = useState("all");
  const visible = pending.filter((item) => filter === "all" || item.urgency >= 8 || item.proof);
  function approve(item) {
    setApproved((approved) => [{ ...item, distance: "0.4 mi", urgent: item.urgency >= 8 }, ...approved]);
    setPending((items) => items.filter((req) => req.id !== item.id));
  }
  return (
    <section className="page">
      <div className="hero-blue dark-hero">
        <small>ADMIN REVIEW</small>
        <h1>Verify Help Requests</h1>
        <p>Approve posts before helpers see them.</p>
      </div>
      <div className="admin-metrics">
        <span><b>{pending.length}</b>Pending</span>
        <span><b>{pending.filter((i) => i.urgency >= 8).length}</b>Critical</span>
        <span><b>{pending.filter((i) => i.proof).length}</b>With proof</span>
      </div>
      <div className="chips">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        <button className={filter === "critical" ? "active" : ""} onClick={() => setFilter("critical")}>Critical</button>
        <button className={filter === "proof" ? "active" : ""} onClick={() => setFilter("proof")}>Proof attached</button>
      </div>
      {visible.map((item) => {
        const cat = categoryFor(item.category);
        return (
          <div className="panel admin-card" key={item.id}>
            <div className="request-head">
              <span className="request-icon" style={{ color: cat.color, background: cat.bg }}>{cat.icon}</span>
              <span><b>{item.user}</b><small>{cat.label.toUpperCase()} · urgency {item.urgency}/10</small></span>
              <em>{item.status}</em>
            </div>
            <p>{item.message}</p>
            <button className="proof-chip" onClick={() => setProof(item)}>View {item.proof} proof</button>
            <div className="admin-actions">
              <button className="reject" onClick={() => setPending((items) => items.filter((req) => req.id !== item.id))}>Reject</button>
              <button className="primary" onClick={() => approve(item)}>Approve & Publish</button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ProofModal({ proof, onClose }) {
  return (
    <div className="modal">
      <div className="proof-modal">
        <button onClick={onClose}>×</button>
        <h2>Proof Preview</h2>
        <p>{proof.user} · {proof.proof}</p>
        <div className="proof-placeholder">▧<span>Demo proof image</span></div>
      </div>
    </div>
  );
}

function Activity() {
  const [radius, setRadius] = useState(5);
  const visible = activity.filter((item) => item.km <= radius);
  return (
    <section className="page">
      <h1>Activity</h1>
      <div className="stats panel">
        <span><b>{visible.length}</b>Missions</span>
        <span><b>{visible.reduce((sum, item) => sum + item.points, 0)}</b>Points</span>
        <span><b>5</b>Day streak</span>
      </div>
      <div className="panel radius">
        <b>Nearby radius</b>
        <input type="number" min="0.1" max="25" step="0.1" value={radius} onChange={(event) => setRadius(Number(event.target.value))} />
        <input type="range" min="0.1" max="25" step="0.1" value={radius} onChange={(event) => setRadius(Number(event.target.value))} />
        <small>100 m to 25 km</small>
      </div>
      {visible.map((item) => <HistoryCard key={item.id} item={item} />)}
    </section>
  );
}

function HistoryCard({ item }) {
  const cat = categoryFor(item.category);
  return (
    <div className="panel history-card">
      <span className="request-icon" style={{ color: cat.color, background: cat.bg }}>{cat.icon}</span>
      <span><b>{item.title}</b><small>{item.date} · {item.km} km away</small></span>
      <em>+{item.points}</em>
    </div>
  );
}

function Rankings() {
  const points = 430;
  const current = tierData[1];
  return (
    <section className="page">
      <div className="hero-blue">
        <small>HELPER RANK</small>
        <h1>{current.name}</h1>
        <p>{points} points earned</p>
        <div className="progress"><i style={{ width: `${((points - 250) / 400) * 100}%` }} /></div>
      </div>
      <div className="panel tier-ladder">
        <h2>Tier ladder</h2>
        {tierData.map((tier) => {
          const unlocked = points >= tier.points;
          return (
            <div className="tier-row" key={tier.name}>
              <span className={`tier-dot ${unlocked ? "unlocked" : ""}`} style={{ background: unlocked ? tier.color : `${tier.color}99` }}>{tier.icon}</span>
              <span><b>{tier.name}</b><small>{tier.points}+ points</small></span>
              {tier.name === current.name ? <em>Current</em> : unlocked ? <strong>✓</strong> : <small>{tier.points - points} pts</small>}
            </div>
          );
        })}
      </div>
      {activity.map((item) => <HistoryCard key={item.id} item={item} />)}
    </section>
  );
}

function BottomTabs({ setScreen }) {
  return (
    <nav className="bottom-tabs">
      <button onClick={() => setScreen("home")}>Home</button>
      <button onClick={() => setScreen("activity")}>Activity</button>
      <button onClick={() => setScreen("rankings")}>Rankings</button>
    </nav>
  );
}
