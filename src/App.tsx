import { useState, useEffect, useRef } from "react";

const T = {
  orange: "#FF5722", red: "#FF1744", deepRed: "#C62828",
  green: "#00C853", teal: "#00897B",
  bg: "#FFF8F5", white: "#FFFFFF",
  text: "#1C0A00", muted: "#A07060",
  border: "rgba(255,87,34,0.13)",
};

const CATS = [
  { id: "medical", icon: "🏥", label: "Medical", color: "#FF1744", bg: "#FFF0F3" },
  { id: "accident", icon: "🚨", label: "Accident", color: "#FF6D00", bg: "#FFF8F0" },
  { id: "mental", icon: "💙", label: "Mental Health", color: "#7C4DFF", bg: "#F3F0FF" },
  { id: "safety", icon: "🛡️", label: "Safety", color: "#D32F2F", bg: "#FFF0F0" },
  { id: "transport", icon: "🚗", label: "Transport", color: "#1565C0", bg: "#F0F4FF" },
];

const HELPERS = [
  { id: 1, name: "Dr. Sarah M.", role: "Medical Professional", rating: 4.9, dist: "0.4 km", eta: "3 min", online: true, avatar: "👩‍⚕️" },
  { id: 2, name: "James R.", role: "Community Responder", rating: 4.8, dist: "0.8 km", eta: "6 min", online: true, avatar: "👨‍🦱" },
  { id: 3, name: "Amira H.", role: "Crisis Counselor", rating: 5.0, dist: "1.2 km", eta: "9 min", online: true, avatar: "👩‍💼" },
  { id: 4, name: "Tom B.", role: "Emergency Volunteer", rating: 4.7, dist: "1.5 km", eta: "11 min", online: false, avatar: "👨‍🚒" },
];

const HELPER_PROFILES: Record<number, {
  bio: string;
  missions: number;
  avgResponse: string;
  memberSince: string;
  specialties: string[];
  badges: { icon: string; label: string; color: string }[];
  history: { cat: string; user: string; time: string; rating: number }[];
}> = {
  1: {
    bio: "Emergency physician with 12 years of clinical experience. Certified in advanced cardiac life support and trauma care. Passionate about community health.",
    missions: 342, avgResponse: "2.8 min", memberSince: "Mar 2023",
    specialties: ["Cardiac", "Trauma", "Pediatrics"],
    badges: [
      { icon: "🏆", label: "Top Rated", color: "#F59E0B" },
      { icon: "⚡", label: "Fast Responder", color: "#3B82F6" },
      { icon: "💯", label: "300+ Missions", color: "#8B5CF6" },
      { icon: "❤️", label: "Community Hero", color: "#EF4444" },
      { icon: "🛡️", label: "Verified Pro", color: "#10B981" },
    ],
    history: [
      { cat: "medical", user: "Marco D.", time: "2h ago", rating: 5 },
      { cat: "accident", user: "Lena S.", time: "Yesterday", rating: 5 },
      { cat: "medical", user: "Yuna P.", time: "2 days ago", rating: 4 },
      { cat: "safety", user: "Ali K.", time: "3 days ago", rating: 5 },
    ],
  },
  2: {
    bio: "Former firefighter, now a full-time community responder. Trained in first aid, CPR, and disaster relief. Loves helping neighbours in need.",
    missions: 189, avgResponse: "4.5 min", memberSince: "Jul 2023",
    specialties: ["First Aid", "Disaster Relief", "Transport"],
    badges: [
      { icon: "🤝", label: "Community Star", color: "#10B981" },
      { icon: "🚒", label: "Ex-Firefighter", color: "#EF4444" },
      { icon: "💯", label: "100+ Missions", color: "#8B5CF6" },
      { icon: "⚡", label: "Quick Helper", color: "#3B82F6" },
    ],
    history: [
      { cat: "accident", user: "Ali K.", time: "3h ago", rating: 5 },
      { cat: "transport", user: "Yuna P.", time: "Yesterday", rating: 4 },
      { cat: "safety", user: "Marco D.", time: "3 days ago", rating: 5 },
    ],
  },
  3: {
    bio: "Licensed clinical psychologist specialising in crisis intervention and anxiety disorders. Committed to making mental health support accessible to everyone.",
    missions: 217, avgResponse: "3.2 min", memberSince: "Jan 2023",
    specialties: ["Anxiety", "Crisis Intervention", "Grief Support"],
    badges: [
      { icon: "💙", label: "Mental Health Pro", color: "#7C4DFF" },
      { icon: "🏆", label: "Top Rated", color: "#F59E0B" },
      { icon: "🌟", label: "Perfect Score", color: "#F59E0B" },
      { icon: "💯", label: "200+ Missions", color: "#8B5CF6" },
      { icon: "🧘", label: "Calm & Caring", color: "#10B981" },
    ],
    history: [
      { cat: "mental", user: "Lena S.", time: "1h ago", rating: 5 },
      { cat: "mental", user: "Yuna P.", time: "Yesterday", rating: 5 },
      { cat: "mental", user: "Marco D.", time: "4 days ago", rating: 5 },
    ],
  },
  4: {
    bio: "Volunteer paramedic and emergency coordinator. Weekend warrior for community safety. Trained in wilderness first aid and vehicle extraction.",
    missions: 94, avgResponse: "6.1 min", memberSince: "Oct 2023",
    specialties: ["First Aid", "Vehicle Rescue", "Safety"],
    badges: [
      { icon: "🚨", label: "Emergency Volunteer", color: "#EF4444" },
      { icon: "🌱", label: "Rising Star", color: "#10B981" },
      { icon: "🤝", label: "Reliable Helper", color: "#3B82F6" },
    ],
    history: [
      { cat: "accident", user: "Ali K.", time: "2 days ago", rating: 5 },
      { cat: "safety", user: "Marco D.", time: "5 days ago", rating: 4 },
    ],
  },
};

const REQUESTS = [
  { id: 1, user: "Ali K.", cat: "medical", msg: "Chest pain, need help urgently", dist: "0.3 km", time: "Just now", urgent: true, buddy: true },
  { id: 2, user: "Yuna P.", cat: "mental", msg: "Feeling very anxious, need someone", dist: "0.9 km", time: "2 min ago", urgent: false, buddy: false },
  { id: 3, user: "Marco D.", cat: "accident", msg: "Car crash on main street, need assistance", dist: "1.1 km", time: "5 min ago", urgent: true, buddy: false },
  { id: 4, user: "Lena S.", cat: "transport", msg: "Wheelchair user, need ride to hospital", dist: "1.4 km", time: "8 min ago", urgent: true, buddy: false },
];

const ALERT_POOL = [
  { id: 101, user: "Priya S.", cat: "mental", msg: "Panic attack, need someone to talk to", dist: "0.6 km", urgent: false, buddy: true },
  { id: 102, user: "Dan W.", cat: "medical", msg: "Diabetic emergency, feeling faint", dist: "0.2 km", urgent: true, buddy: false },
  { id: 103, user: "Sofia M.", cat: "safety", msg: "Being followed, need help now", dist: "0.5 km", urgent: true, buddy: true },
  { id: 104, user: "Kenji L.", cat: "accident", msg: "Fell from bicycle, possible fracture", dist: "1.0 km", urgent: false, buddy: false },
  { id: 105, user: "Hana R.", cat: "transport", msg: "Stranded after breakdown, pregnant", dist: "1.3 km", urgent: false, buddy: false },
];

const COMMUNITY_FEED_DATA = [
  { id: 1, cat: "medical", msg: "Someone received immediate CPR assistance and is recovering well", area: "0.3 km away", time: "12 min ago", helperAvatar: "👩‍⚕️", hearts: 24 },
  { id: 2, cat: "mental", msg: "A person in crisis was safely supported through a panic attack", area: "0.7 km away", time: "28 min ago", helperAvatar: "👩‍💼", hearts: 31 },
  { id: 3, cat: "accident", msg: "Quick first aid provided after a bicycle fall on Oak Street", area: "1.1 km away", time: "1h ago", helperAvatar: "👨‍🦱", hearts: 17 },
  { id: 4, cat: "transport", msg: "Elderly resident safely escorted to their medical appointment", area: "0.5 km away", time: "2h ago", helperAvatar: "👨‍🚒", hearts: 42 },
  { id: 5, cat: "safety", msg: "A woman was safely escorted home after feeling followed at night", area: "1.4 km away", time: "3h ago", helperAvatar: "👩‍⚕️", hearts: 58 },
  { id: 6, cat: "medical", msg: "Severe allergic reaction managed calmly until paramedics arrived", area: "0.9 km away", time: "4h ago", helperAvatar: "👩‍💼", hearts: 36 },
];

const MISSIONS_HISTORY_DATA = [
  { id: 1, type: "requested" as const, cat: "medical", msg: "Chest pain emergency", helperName: "Dr. Sarah M.", helperAvatar: "👩‍⚕️", requesterName: "", time: "Today, 10:32 AM", rating: 5 },
  { id: 2, type: "helped" as const, cat: "mental", msg: "Person having panic attack near the park", requesterName: "Ali K.", helperName: "", helperAvatar: "", time: "Yesterday, 3:15 PM", rating: 5 },
  { id: 3, type: "helped" as const, cat: "accident", msg: "Fall from bicycle, needed first aid", requesterName: "Yuna P.", helperName: "", helperAvatar: "", time: "2 days ago", rating: 4 },
  { id: 4, type: "requested" as const, cat: "transport", msg: "Needed ride to urgent care clinic", helperName: "James R.", helperAvatar: "👨‍🦱", requesterName: "", time: "3 days ago", rating: 5 },
  { id: 5, type: "helped" as const, cat: "safety", msg: "Person felt unsafe walking alone at night", requesterName: "Marco D.", helperName: "", helperAvatar: "", time: "5 days ago", rating: 5 },
  { id: 6, type: "requested" as const, cat: "mental", msg: "Extreme anxiety, needed emotional support", helperName: "Amira H.", helperAvatar: "👩‍💼", requesterName: "", time: "1 week ago", rating: 5 },
];

const LEADERBOARD_DATA = [
  { rank: 1, name: "Dr. Sarah M.", avatar: "👩‍⚕️", role: "Medical Professional", rating: 4.9, missions: 342, response: "2.8 min", medal: "🥇" },
  { rank: 2, name: "Amira H.", avatar: "👩‍💼", role: "Crisis Counselor", rating: 5.0, missions: 217, response: "3.2 min", medal: "🥈" },
  { rank: 3, name: "James R.", avatar: "👨‍🦱", role: "Community Responder", rating: 4.8, missions: 189, response: "4.5 min", medal: "🥉" },
  { rank: 4, name: "Chen W.", avatar: "👨‍⚕️", role: "Paramedic", rating: 4.7, missions: 156, response: "3.9 min", medal: "" },
  { rank: 5, name: "Tom B.", avatar: "👨‍🚒", role: "Emergency Volunteer", rating: 4.7, missions: 94, response: "6.1 min", medal: "" },
  { rank: 6, name: "Nadia K.", avatar: "👩‍🦰", role: "Nurse Practitioner", rating: 4.6, missions: 78, response: "5.2 min", medal: "" },
];

const MAP_PINS = [
  { id: 1, user: "Ali K.", cat: "medical", msg: "Chest pain, need help urgently", dist: "0.3 km", time: "Just now", urgent: true, x: 45, y: 62 },
  { id: 2, user: "Yuna P.", cat: "mental", msg: "Feeling very anxious, need someone", dist: "0.9 km", time: "2 min ago", urgent: false, x: 28, y: 38 },
  { id: 3, user: "Marco D.", cat: "accident", msg: "Car crash on main street", dist: "1.1 km", time: "5 min ago", urgent: true, x: 68, y: 28 },
  { id: 4, user: "Lena S.", cat: "transport", msg: "Wheelchair user, need ride to hospital", dist: "1.4 km", time: "8 min ago", urgent: false, x: 74, y: 72 },
  { id: 5, user: "Priya S.", cat: "mental", msg: "Panic attack, need someone to talk to", dist: "0.6 km", time: "1 min ago", urgent: false, x: 20, y: 70 },
  { id: 6, user: "Dan W.", cat: "medical", msg: "Diabetic emergency, feeling faint", dist: "0.2 km", time: "Just now", urgent: true, x: 58, y: 18 },
];

const SKILL_OPTIONS = [
  "CPR Certified", "First Aid", "Mental Health", "Crisis Intervention",
  "Paramedic", "Nursing", "Physiotherapy", "Transport Assist",
  "Sign Language", "Elder Care", "Child Safety", "Trauma Support",
];

type GroupMissionData = {
  id: string; title: string; cat: string; location: string; dist: string; urgent: boolean; msg: string; coordinator: string;
  slots: { role: string; filled: boolean; name?: string; avatar?: string }[];
  updates: { time: string; msg: string; type: "info" | "alert" }[];
};

const GROUP_MISSIONS_DATA: GroupMissionData[] = [
  {
    id: "g1", title: "Multi-Vehicle Accident", cat: "accident", location: "Oak St & 5th Ave", dist: "0.4 km", urgent: true,
    msg: "3-car pileup with multiple injuries. Emergency services en route — coordinated ground support needed now.",
    coordinator: "Dr. Sarah M.",
    slots: [
      { role: "🏥 First Aid Lead", filled: true, name: "Dr. Sarah M.", avatar: "👩‍⚕️" },
      { role: "🚦 Traffic Control", filled: true, name: "James R.", avatar: "👨‍🦱" },
      { role: "🩺 Medical Support", filled: false },
      { role: "📞 Comms & Liaison", filled: false },
    ],
    updates: [
      { time: "2 min ago", msg: "Scene secured. Approaching from the east side carefully.", type: "info" },
      { time: "1 min ago", msg: "2 people need immediate first aid — victim near the red car.", type: "alert" },
    ],
  },
  {
    id: "g2", title: "Community Flooding", cat: "safety", location: "Riverside Park", dist: "1.2 km", urgent: false,
    msg: "Flash flooding affecting 6 households. Residents need evacuation help and emergency supplies.",
    coordinator: "Amira H.",
    slots: [
      { role: "🏠 Evacuation Lead", filled: true, name: "Amira H.", avatar: "👩‍💼" },
      { role: "🚗 Transport Coordinator", filled: false },
      { role: "📦 Supplies Manager", filled: false },
      { role: "👶 Vulnerable Persons Care", filled: false },
    ],
    updates: [
      { time: "5 min ago", msg: "Starting evacuation on Block C. Transport helpers urgently needed.", type: "info" },
    ],
  },
];

const GROUP_CHAT_INIT = [
  { id: 1, sender: "Dr. Sarah M.", avatar: "👩‍⚕️", role: "First Aid Lead", msg: "On scene. One victim has chest injuries — need Medical Support ASAP.", time: "2 min ago" },
  { id: 2, sender: "James R.", avatar: "👨‍🦱", role: "Traffic Control", msg: "Road blocked northbound. Redirecting traffic now.", time: "1 min ago" },
  { id: 3, sender: "System", avatar: "🤖", role: "Auto-update", msg: "Ambulance ETA: 6 minutes. Stay clear of the south lane.", time: "30s ago" },
];

const REQUESTER_AUTO_REPLIES = [
  "I'm on my way, stay with me 🙏",
  "Can you describe how you're feeling right now?",
  "I'll be there in about 2 minutes.",
  "Is anyone else with you?",
  "Try to stay calm, I'm almost there.",
  "Do you have any medication nearby?",
];

const HELPER_AUTO_REPLIES = [
  "Thank you so much, please hurry! 🙏",
  "I'm at the corner of Main and Oak St.",
  "It's getting worse, please be quick.",
  "I'm wearing a blue jacket.",
  "Should I do anything while I wait?",
  "I can see you on the map, almost there!",
];

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── CHAT SCREEN ──────────────────────────────────────────────────── */
type ChatMessage = {
  id: number;
  from: "me" | "them";
  text: string;
  time: Date;
  read: boolean;
};

type ChatScreenProps = {
  otherName: string;
  otherAvatar: string;
  otherRole: string;
  accentColor: string;
  accentGrad: string;
  initialMessages: ChatMessage[];
  autoReplies: string[];
  onBack: () => void;
};

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px", background: T.white, borderRadius: "18px 18px 18px 4px", width: "fit-content", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#C4A99A",
          animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

function ChatScreen({ otherName, otherAvatar, otherRole, accentColor, accentGrad, initialMessages, autoReplies, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const QUICK_REPLIES = ["I'm here", "On my way 🚗", "Thank you!", "Are you safe?", "Need more info?", "Stay calm 🙏"];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const now = new Date();
    const myMsg: ChatMessage = { id: Date.now(), from: "me", text: text.trim(), time: now, read: false };
    setMessages(prev => [...prev, myMsg]);
    setInput("");

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === myMsg.id ? { ...m, read: true } : m));
    }, 800);

    setTimeout(() => setTyping(true), 1200);
    setTimeout(() => {
      setTyping(false);
      const reply = autoReplies[replyIdx % autoReplies.length];
      setReplyIdx(r => r + 1);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: "them",
        text: reply,
        time: new Date(),
        read: false,
      }]);
    }, 3000 + Math.random() * 800);
  }

  const lastMsgFromMe = [...messages].reverse().find(m => m.from === "me");

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif",
      display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease both",
    }}>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes msgIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{
        background: accentGrad,
        padding: "48px 18px 18px",
        position: "relative", overflow: "hidden",
      }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            position: "absolute", right: -20 * i, top: -20 * i,
            width: 100 + i * 60, height: 100 + i * 60, borderRadius: "50%",
            border: `1px solid rgba(255,255,255,${0.1 - i * 0.03})`,
            pointerEvents: "none",
          }} />
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 11,
            width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            fontFamily: "'Nunito',sans-serif",
          }}>‹</button>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, fontSize: 22,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid rgba(255,255,255,0.3)",
            }}>{otherAvatar}</div>
            <div style={{
              position: "absolute", bottom: 1, right: 1,
              width: 10, height: 10, borderRadius: "50%",
              background: T.green, border: "2px solid white",
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{otherName}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{otherRole} · Online now</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["📞", "🔔"].map(ic => (
              <button key={ic} style={{
                width: 36, height: 36, borderRadius: 11, border: "none",
                background: "rgba(255,255,255,0.2)", fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Nunito',sans-serif",
              }}>{ic}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto", padding: "18px 14px 8px",
          display: "flex", flexDirection: "column", gap: 10,
        }}
      >
        {/* Date stamp */}
        <div style={{ textAlign: "center", fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 0.4, marginBottom: 4 }}>Today</div>

        {messages.map((msg, idx) => {
          const isMe = msg.from === "me";
          const showAvatar = !isMe && (idx === 0 || messages[idx - 1].from === "me");
          return (
            <div key={msg.id} style={{
              display: "flex", flexDirection: isMe ? "row-reverse" : "row",
              alignItems: "flex-end", gap: 8,
              animation: "msgIn 0.25s ease both",
            }}>
              {!isMe && (
                <div style={{
                  width: 30, height: 30, borderRadius: 10, fontSize: 16, flexShrink: 0,
                  background: "#FFF0EB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: showAvatar ? 1 : 0,
                }}>{otherAvatar}</div>
              )}
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 3 }}>
                <div style={{
                  padding: "10px 14px",
                  background: isMe ? accentGrad : T.white,
                  color: isMe ? "#fff" : T.text,
                  borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  fontSize: 13, fontWeight: 600, lineHeight: 1.55,
                  boxShadow: isMe ? `0 4px 14px ${accentColor}44` : "0 2px 8px rgba(0,0,0,0.06)",
                  border: isMe ? "none" : `1.5px solid ${T.border}`,
                }}>
                  {msg.text}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{formatTime(msg.time)}</div>
                  {isMe && (
                    <div style={{ fontSize: 11, color: msg.read ? accentColor : T.muted }}>
                      {lastMsgFromMe?.id === msg.id ? (msg.read ? "✓✓" : "✓") : "✓✓"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, animation: "msgIn 0.25s ease both" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10, fontSize: 16, flexShrink: 0,
              background: "#FFF0EB",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{otherAvatar}</div>
            <div>
              <TypingIndicator />
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, marginTop: 3, marginLeft: 4 }}>typing…</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick replies */}
      <div style={{ paddingLeft: 14, paddingRight: 14, paddingBottom: 8, overflowX: "auto", display: "flex", gap: 8, scrollbarWidth: "none" }}>
        {QUICK_REPLIES.map(qr => (
          <button
            key={qr}
            onClick={() => sendMessage(qr)}
            style={{
              flexShrink: 0, border: `1.5px solid ${accentColor}44`,
              borderRadius: 20, padding: "7px 14px",
              background: `${accentColor}0D`, color: accentColor,
              fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "'Nunito',sans-serif",
              transition: "background 0.15s",
            }}
          >{qr}</button>
        ))}
      </div>

      {/* Input bar */}
      <div style={{
        padding: "10px 14px 22px",
        background: T.white,
        borderTop: `1.5px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          background: T.bg, borderRadius: 24,
          border: `1.5px solid ${input ? accentColor : T.border}`,
          padding: "8px 16px",
          transition: "border-color 0.2s",
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { sendMessage(input); } }}
            placeholder="Type a message…"
            style={{
              flex: 1, border: "none", outline: "none", background: "none",
              fontSize: 13, fontWeight: 600, color: T.text,
              fontFamily: "'Nunito',sans-serif",
            }}
          />
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, padding: 0, lineHeight: 1,
          }}>😊</button>
        </div>
        <button
          className="press"
          onClick={() => sendMessage(input)}
          disabled={!input.trim()}
          style={{
            width: 44, height: 44, borderRadius: "50%", border: "none",
            background: input.trim() ? accentGrad : "#E8DBD7",
            cursor: input.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: input.trim() ? `0 4px 14px ${accentColor}55` : "none",
            transition: "all 0.2s",
            fontSize: 18, flexShrink: 0,
            fontFamily: "'Nunito',sans-serif",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function Splash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1100);
    const t2 = setTimeout(() => setPhase(2), 2700);
    const t3 = setTimeout(onDone, 3100);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "#ffffff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      transition: "opacity 0.4s ease",
      opacity: phase === 2 ? 0 : 1,
      pointerEvents: phase === 2 ? "none" : "auto",
    }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          border: `1px solid rgba(0,86,148,${0.06 - i * 0.015})`,
          width: i * 200, height: i * 200, pointerEvents: "none",
        }} />
      ))}
      <div style={{
        zIndex: 2,
        animation: "float 3s ease-in-out infinite, scaleIn 0.6s cubic-bezier(.34,1.56,.64,1) both",
        opacity: 0, animationFillMode: "forwards",
      }}>
        <img
          src="/responcity-logo.png"
          alt="Responcity"
          style={{ width: 270, height: "auto", display: "block" }}
        />
      </div>
      <div style={{
        position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)",
        width: 120, height: 3,
        background: "rgba(0,86,148,0.1)", borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg,#005694,#FF6B35)", borderRadius: 2, animation: "progBar 2.5s ease both" }} />
      </div>
    </div>
  );
}

function ModeSelect({ onSelect }: { onSelect: (mode: string) => void }) {
  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      fontFamily: "'Nunito',sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        background: "linear-gradient(145deg,#FF6B35,#FF1744,#C62828)",
        padding: "54px 28px 46px", textAlign: "center",
        borderRadius: "0 0 36px 36px",
        boxShadow: "0 14px 44px rgba(255,23,68,0.35)",
        position: "relative", overflow: "hidden",
      }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            position: "absolute", right: -30 * i, top: -30 * i,
            width: 150 + i * 70, height: 150 + i * 70, borderRadius: "50%",
            border: `1px solid rgba(255,255,255,${0.09 - i * 0.03})`,
          }} />
        ))}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
          position: "relative", zIndex: 1,
          animation: "scaleIn 0.5s cubic-bezier(.34,1.56,.64,1) both",
        }}>
          <img src="/responcity-logo.png" alt="Responcity" style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", background: "#fff" }} />
          <div style={{
            fontFamily: "'Poppins',sans-serif", fontWeight: 900,
            fontSize: 30, color: "#fff", letterSpacing: -0.5,
            textShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}>Responcity</div>
        </div>
        <div style={{
          marginTop: 12, fontSize: 14, color: "rgba(255,255,255,0.8)",
          fontWeight: 700, letterSpacing: 0.3, position: "relative", zIndex: 1,
          animation: "fadeUp 0.5s 0.18s ease both", opacity: 0, animationFillMode: "forwards",
        }}>
          How will you use the app today?
        </div>
      </div>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", gap: 16, padding: "36px 22px 40px",
      }}>
        {[
          {
            mode: "user", icon: "🆘", title: "I Need Help",
            desc: "Request immediate help from verified professionals near you.",
            grad: "linear-gradient(135deg,#FF6B35 0%,#FF1744 100%)",
            shadow: "rgba(255,87,34,0.4)",
            tag: "Verified helpers nearby  •  Free",
            delay: "0.15s",
          },
          {
            mode: "helper", icon: "🤝", title: "I'm Ready to Help",
            desc: "Respond to people in need around you and make a real difference.",
            grad: "linear-gradient(135deg,#43A047 0%,#00897B 100%)",
            shadow: "rgba(67,160,71,0.4)",
            tag: "Make a difference  •  Free to join",
            delay: "0.27s",
          },
        ].map(opt => (
          <button
            key={opt.mode}
            className="press"
            onClick={() => onSelect(opt.mode)}
            style={{
              border: "none", borderRadius: 26, padding: 0, cursor: "pointer",
              background: opt.grad,
              boxShadow: `0 10px 32px ${opt.shadow}`,
              transition: "transform 0.2s, box-shadow 0.2s",
              animation: `slideUp 0.5s ${opt.delay} ease both`,
              opacity: 0, animationFillMode: "forwards",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "28px 24px", display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{
                width: 68, height: 68, borderRadius: 20, flexShrink: 0,
                background: "rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32,
                boxShadow: "inset 0 2px 8px rgba(255,255,255,0.15)",
              }}>{opt.icon}</div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{opt.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, marginTop: 5, fontWeight: 600 }}>{opt.desc}</div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 24 }}>›</div>
            </div>
            <div style={{
              background: "rgba(0,0,0,0.12)", padding: "9px 24px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "blink 2s ease-in-out infinite" }} />
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", fontWeight: 700, letterSpacing: 0.3 }}>{opt.tag}</div>
            </div>
          </button>
        ))}

        <div style={{
          textAlign: "center", fontSize: 12, color: T.muted, fontWeight: 700, lineHeight: 1.8,
          animation: "fadeIn 0.5s 0.5s ease both", opacity: 0, animationFillMode: "forwards",
        }}>
          🔒 Free for everyone &nbsp;•&nbsp; Available now
        </div>
      </div>
    </div>
  );
}

type Cat = typeof CATS[number];

function RequestForm({ cat, onBack }: { cat: Cat; onBack: () => void }) {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loc, setLoc] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  const helper = HELPERS[0];
  const now = new Date();

  const requesterInitialMessages: ChatMessage[] = [
    { id: 1, from: "them", text: "Hi! I've accepted your request and I'm on my way. Stay calm, I'll be there in about 3 minutes 🙏", time: new Date(now.getTime() - 60000), read: true },
    { id: 2, from: "them", text: "Can you briefly describe your current condition?", time: new Date(now.getTime() - 30000), read: true },
  ];

  if (chatOpen) return (
    <ChatScreen
      otherName={helper.name}
      otherAvatar={helper.avatar}
      otherRole={helper.role}
      accentColor={T.orange}
      accentGrad={`linear-gradient(135deg,${T.orange},${T.red})`}
      initialMessages={requesterInitialMessages}
      autoReplies={REQUESTER_AUTO_REPLIES}
      onBack={() => setChatOpen(false)}
    />
  );

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setPhotos(p => [...p, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(idx: number) {
    setPhotos(p => p.filter((_, i) => i !== idx));
  }

  const canSubmit = msg.trim() && photos.length > 0;

  function submit() {
    if (!canSubmit) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 2000);
  }

  if (sent) return (
    <div style={{
      minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 26px", textAlign: "center", animation: "fadeIn 0.4s ease both",
    }}>
      <div style={{ fontSize: 80, animation: "pop 0.5s ease both" }}>✅</div>
      <div style={{ fontSize: 25, fontWeight: 900, color: T.text, marginTop: 20, marginBottom: 8 }}>Request Sent!</div>
      <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.8, marginBottom: 28, fontWeight: 600 }}>
        Nearby verified helpers have been alerted.<br />You'll be contacted very soon.
      </div>

      {/* ETA Card */}
      <div style={{
        background: T.white, borderRadius: 22, padding: "20px 24px", width: "100%",
        border: `1.5px solid ${T.border}`, marginBottom: 14,
        boxShadow: "0 4px 20px rgba(255,87,34,0.08)",
      }}>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Estimated Response</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: T.orange }}>~3 min</div>
        <div style={{ fontSize: 13, color: T.muted, fontWeight: 700, marginTop: 4 }}>{helper.avatar} {helper.name} is on the way</div>
      </div>

      {/* Chat with helper button */}
      <button
        className="press"
        onClick={() => setChatOpen(true)}
        style={{
          width: "100%", padding: "16px 24px", borderRadius: 18, border: "none",
          background: "linear-gradient(135deg,#FF6B35,#FF1744)",
          color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 8px 28px rgba(255,87,34,0.38)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          marginBottom: 12,
          fontFamily: "'Nunito',sans-serif",
          animation: "slideUp 0.4s 0.1s ease both", opacity: 0, animationFillMode: "forwards",
        }}
      >
        <div style={{ position: "relative" }}>
          <span style={{ fontSize: 20 }}>💬</span>
          <div style={{
            position: "absolute", top: -4, right: -4,
            width: 10, height: 10, borderRadius: "50%",
            background: T.green, border: "2px solid white",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
        </div>
        Chat with {helper.name}
        <div style={{
          background: "rgba(255,255,255,0.25)", borderRadius: 10, padding: "2px 8px",
          fontSize: 11, fontWeight: 900,
        }}>2 new</div>
      </button>

      <button className="press" onClick={onBack} style={{
        width: "100%", background: T.white,
        border: `1.5px solid ${T.border}`, borderRadius: 18, padding: "14px 40px",
        color: T.text, fontSize: 14, fontWeight: 800, cursor: "pointer",
        fontFamily: "'Nunito',sans-serif",
        animation: "slideUp 0.4s 0.2s ease both", opacity: 0, animationFillMode: "forwards",
      }}>← Back to Home</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", padding: "52px 22px 32px", animation: "fadeIn 0.3s ease both" }}>
      <button onClick={onBack} style={{
        background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 12,
        padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 26,
      }}>← Back</button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
        <div style={{
          width: 58, height: 58, borderRadius: 18, fontSize: 26,
          background: `${cat.color}1A`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{cat.icon}</div>
        <div>
          <div style={{ fontSize: 21, fontWeight: 900, color: T.text }}>{cat.label} Help</div>
          <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Describe your situation</div>
        </div>
      </div>

      <div style={{
        background: T.white, borderRadius: 20,
        border: `2px solid ${msg ? cat.color : T.border}`,
        padding: "16px 18px", marginBottom: 12, transition: "border-color 0.2s",
        boxShadow: "0 2px 12px rgba(255,87,34,0.05)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: cat.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Your Message</div>
        <textarea
          value={msg} onChange={e => setMsg(e.target.value)}
          placeholder={`Describe your ${cat.label.toLowerCase()} situation...`}
          rows={4}
          style={{
            width: "100%", border: "none", outline: "none", background: "none",
            fontSize: 14, fontWeight: 600, color: T.text, resize: "none", lineHeight: 1.7,
            fontFamily: "'Nunito',sans-serif",
          }}
        />
      </div>

      <div style={{
        background: T.white, borderRadius: 20, padding: "16px 18px", marginBottom: 12,
        border: `2px solid ${photos.length > 0 ? cat.color : T.border}`,
        transition: "border-color 0.2s",
        boxShadow: "0 2px 12px rgba(255,87,34,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: cat.color, textTransform: "uppercase", letterSpacing: 1 }}>
              Photo Proof <span style={{ color: T.red }}>*</span>
            </div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginTop: 2 }}>Required — helps verify your request</div>
          </div>
          <label style={{
            background: `${cat.color}14`, border: `1.5px solid ${cat.color}33`,
            borderRadius: 10, padding: "7px 13px", cursor: "pointer",
            fontSize: 11, fontWeight: 800, color: cat.color,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <input type="file" accept="image/*" multiple onChange={handlePhoto} style={{ display: "none" }} />
            + Add Photo
          </label>
        </div>

        {photos.length === 0 ? (
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "24px 16px",
            border: `2px dashed ${T.border}`, borderRadius: 14, cursor: "pointer",
            background: T.bg,
          }}>
            <input type="file" accept="image/*" multiple onChange={handlePhoto} style={{ display: "none" }} />
            <div style={{ fontSize: 32 }}>📷</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, textAlign: "center", lineHeight: 1.5 }}>
              Tap to upload photos<br />
              <span style={{ fontSize: 11, fontWeight: 600 }}>JPG, PNG supported</span>
            </div>
          </label>
        ) : (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {photos.map((src, idx) => (
              <div key={idx} style={{ position: "relative", width: 80, height: 80 }}>
                <img src={src} alt="proof" style={{
                  width: 80, height: 80, borderRadius: 12, objectFit: "cover",
                  border: `1.5px solid ${cat.color}33`,
                }} />
                <button
                  onClick={() => removePhoto(idx)}
                  style={{
                    position: "absolute", top: -6, right: -6,
                    width: 20, height: 20, borderRadius: "50%",
                    background: T.red, border: "2px solid #fff",
                    color: "#fff", fontSize: 10, fontWeight: 900,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    lineHeight: 1,
                  }}
                >✕</button>
              </div>
            ))}
            <label style={{
              width: 80, height: 80, borderRadius: 12, cursor: "pointer",
              border: `2px dashed ${T.border}`, background: T.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: T.muted,
            }}>
              <input type="file" accept="image/*" multiple onChange={handlePhoto} style={{ display: "none" }} />
              +
            </label>
          </div>
        )}
      </div>

      <div style={{
        background: T.white, borderRadius: 18, padding: "14px 18px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${T.border}`,
      }}>
        <span style={{ fontSize: 22 }}>📍</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Share My Location</div>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>Helps helpers find you faster</div>
        </div>
        <div onClick={() => setLoc(!loc)} style={{
          width: 48, height: 27, borderRadius: 14, cursor: "pointer",
          background: loc ? `linear-gradient(90deg,${T.orange},${T.red})` : "#E0D0CC",
          position: "relative", transition: "background 0.25s",
        }}>
          <div style={{
            position: "absolute", top: 3,
            left: loc ? "calc(100% - 24px)" : 3,
            width: 21, height: 21, borderRadius: "50%", background: "#fff",
            boxShadow: "0 1px 5px rgba(0,0,0,0.2)",
            transition: "left 0.25s",
          }} />
        </div>
      </div>

      <button
        className="press"
        onClick={submit}
        disabled={!canSubmit || sending}
        style={{
          width: "100%", padding: "18px", borderRadius: 20, border: "none",
          background: canSubmit ? `linear-gradient(135deg,${T.orange},${T.red})` : "#E8DBD7",
          color: "#fff", fontSize: 16, fontWeight: 900, cursor: canSubmit ? "pointer" : "not-allowed",
          boxShadow: canSubmit ? `0 8px 28px rgba(255,87,34,0.4)` : "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.2s",
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        {sending
          ? <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
          : <>{cat.icon} Send Help Request</>
        }
      </button>
      {!canSubmit && (
        <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: T.muted, fontWeight: 700 }}>
          {!msg.trim() ? "✏️ Add a message" : "At least 1 photo required"}
        </div>
      )}
    </div>
  );
}

/* ── HELPER PROFILE ────────────────────────────────────────────────── */
type Helper = typeof HELPERS[number];

function HelperProfile({ helper, onBack, isBuddy, onToggleBuddy }: { helper: Helper; onBack: () => void; isBuddy?: boolean; onToggleBuddy?: () => void }) {
  const profile = HELPER_PROFILES[helper.id];
  const totalStars = "★".repeat(Math.round(helper.rating)) + "☆".repeat(5 - Math.round(helper.rating));

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", animation: "fadeIn 0.3s ease both" }}>
      {/* Hero header */}
      <div style={{
        background: "linear-gradient(145deg,#FF6B35,#FF1744,#C62828)",
        padding: "52px 22px 32px", textAlign: "center",
        borderRadius: "0 0 36px 36px",
        boxShadow: "0 10px 32px rgba(255,23,68,0.28)",
        position: "relative", overflow: "hidden",
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: "absolute", right: -40 * i, top: -40 * i,
            width: 160 + i * 60, height: 160 + i * 60, borderRadius: "50%",
            border: `1px solid rgba(255,255,255,${0.1 - i * 0.025})`,
          }} />
        ))}

        <button onClick={onBack} style={{
          position: "absolute", top: 16, left: 18,
          background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12,
          padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 800,
          cursor: "pointer", fontFamily: "'Nunito',sans-serif",
          backdropFilter: "blur(8px)",
        }}>← Back</button>
        {onToggleBuddy && (
          <button onClick={onToggleBuddy} className="press" style={{
            position: "absolute", top: 16, right: 18,
            background: isBuddy ? "rgba(255,215,0,0.32)" : "rgba(255,255,255,0.2)",
            border: isBuddy ? "1.5px solid rgba(255,215,0,0.6)" : "none",
            borderRadius: 12, padding: "8px 13px",
            color: "#fff", fontSize: 12, fontWeight: 900,
            cursor: "pointer", fontFamily: "'Nunito',sans-serif",
            backdropFilter: "blur(8px)",
          }}>{isBuddy ? "⭐ Buddy" : "☆ Add Buddy"}</button>
        )}

        {/* Avatar */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 14, animation: "scaleIn 0.4s cubic-bezier(.34,1.56,.64,1) both" }}>
          <div style={{
            width: 90, height: 90, borderRadius: 28, fontSize: 44,
            background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center",
            border: "3px solid rgba(255,255,255,0.45)", backdropFilter: "blur(8px)",
          }}>{helper.avatar}</div>
          {helper.online && (
            <div style={{
              position: "absolute", bottom: 4, right: 4,
              width: 18, height: 18, borderRadius: "50%",
              background: "#43EA80", border: "3px solid rgba(255,255,255,0.9)",
            }} />
          )}
        </div>

        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 3, position: "relative", zIndex: 1 }}>{helper.name}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 700, marginBottom: 10, position: "relative", zIndex: 1 }}>{helper.role}</div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, position: "relative", zIndex: 1 }}>
          <div style={{
            background: "rgba(255,255,255,0.22)", borderRadius: 20, padding: "6px 14px",
            fontSize: 13, fontWeight: 800, color: "#FFD700", backdropFilter: "blur(6px)",
          }}>{totalStars} {helper.rating}</div>
          <div style={{
            background: helper.online ? "rgba(67,234,128,0.25)" : "rgba(255,255,255,0.15)",
            borderRadius: 20, padding: "6px 14px",
            fontSize: 11, fontWeight: 800,
            color: helper.online ? "#43EA80" : "rgba(255,255,255,0.7)",
          }}>{helper.online ? "● Online now" : "● Offline"}</div>
        </div>
      </div>

      <div style={{ padding: "22px 18px 40px" }}>
        {/* Stats row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 18,
          animation: "fadeUp 0.4s 0.1s ease both", opacity: 0, animationFillMode: "forwards",
        }}>
          {[
            { icon: "🤝", value: profile.missions.toString(), label: "Missions" },
            { icon: "⚡", value: profile.avgResponse, label: "Avg. Response" },
            { icon: "⭐", value: helper.rating.toFixed(1), label: "Rating" },
            { icon: "📅", value: profile.memberSince, label: "Member since" },
          ].map(s => (
            <div key={s.label} style={{
              background: T.white, borderRadius: 16, padding: "12px 6px", textAlign: "center",
              border: `1.5px solid ${T.border}`,
              boxShadow: "0 2px 10px rgba(255,87,34,0.05)",
            }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: T.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 8, color: T.muted, fontWeight: 700, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div style={{
          background: T.white, borderRadius: 20, padding: "18px 18px", marginBottom: 14,
          border: `1.5px solid ${T.border}`,
          boxShadow: "0 2px 10px rgba(255,87,34,0.05)",
          animation: "fadeUp 0.4s 0.17s ease both", opacity: 0, animationFillMode: "forwards",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.orange, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>About</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.75 }}>{profile.bio}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
            {profile.specialties.map(s => (
              <div key={s} style={{
                fontSize: 11, fontWeight: 800, padding: "5px 12px", borderRadius: 20,
                background: "rgba(255,87,34,0.08)", color: T.orange,
                border: `1px solid ${T.orange}33`,
              }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div style={{
          background: T.white, borderRadius: 20, padding: "18px 18px", marginBottom: 14,
          border: `1.5px solid ${T.border}`,
          boxShadow: "0 2px 10px rgba(255,87,34,0.05)",
          animation: "fadeUp 0.4s 0.24s ease both", opacity: 0, animationFillMode: "forwards",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.orange, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Earned Badges</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {profile.badges.map(badge => (
              <div key={badge.label} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                width: 68,
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 16, fontSize: 24,
                  background: `${badge.color}14`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1.5px solid ${badge.color}33`,
                  boxShadow: `0 4px 12px ${badge.color}22`,
                  animation: "scaleIn 0.35s cubic-bezier(.34,1.56,.64,1) both",
                }}>{badge.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: badge.color, textAlign: "center", lineHeight: 1.3 }}>{badge.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Past missions */}
        <div style={{
          background: T.white, borderRadius: 20, padding: "18px 18px", marginBottom: 20,
          border: `1.5px solid ${T.border}`,
          boxShadow: "0 2px 10px rgba(255,87,34,0.05)",
          animation: "fadeUp 0.4s 0.31s ease both", opacity: 0, animationFillMode: "forwards",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.orange, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Recent Missions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {profile.history.map((h, i) => {
              const cat = CATS.find(c => c.id === h.cat);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  paddingBottom: i < profile.history.length - 1 ? 10 : 0,
                  borderBottom: i < profile.history.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: cat ? `${cat.color}14` : "#f5f5f5",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                  }}>{cat?.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{h.user}</div>
                    <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{cat?.label} · {h.time}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "#F59E0B", fontWeight: 800 }}>{"★".repeat(h.rating)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        {helper.online && (
          <button className="press" onClick={onBack} style={{
            width: "100%", padding: "17px", borderRadius: 20, border: "none",
            background: "linear-gradient(135deg,#FF6B35,#FF1744)",
            color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer",
            boxShadow: "0 8px 28px rgba(255,87,34,0.38)",
            fontFamily: "'Nunito',sans-serif",
            animation: "slideUp 0.4s 0.38s ease both", opacity: 0, animationFillMode: "forwards",
          }}>Request {helper.name.split(" ")[0]}'s Help</button>
        )}
      </div>
    </div>
  );
}

/* ── SAFE CHECK-IN ───────────────────────────────────────────────── */
function SafeCheckIn({ onBack, onSOSTrigger }: { onBack: () => void; onSOSTrigger: () => void }) {
  const DURATION = 60;
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [phase, setPhase] = useState<"counting" | "safe" | "triggered">("counting");
  const [triggeredDone, setTriggeredDone] = useState(false);

  useEffect(() => {
    if (phase !== "counting") return;
    if (timeLeft <= 0) { setPhase("triggered"); onSOSTrigger(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, onSOSTrigger]);

  useEffect(() => {
    if (phase !== "safe") return;
    const t = setTimeout(onBack, 2200);
    return () => clearTimeout(t);
  }, [phase, onBack]);

  useEffect(() => {
    if (phase !== "triggered") {
      setTriggeredDone(false);
      return;
    }
    const t = setTimeout(() => setTriggeredDone(true), 1700);
    return () => clearTimeout(t);
  }, [phase]);

  const r = 88;
  const circumference = 2 * Math.PI * r;
  const pct = timeLeft / DURATION;
  const urgency = timeLeft <= 10 ? "red" : timeLeft <= 20 ? "amber" : "green";
  const ringColor = urgency === "red" ? "#FF1744" : urgency === "amber" ? "#FF8F00" : "#43A047";
  const secs = timeLeft % 60;
  const timeStr = `0:${secs.toString().padStart(2, "0")}`;
  const headerGrad = urgency === "red" ? "linear-gradient(135deg,#FF1744,#C62828)" : urgency === "amber" ? "linear-gradient(135deg,#FF8F00,#E65100)" : "linear-gradient(135deg,#43A047,#00897B)";

  if (phase === "triggered") return (
    <div style={{ minHeight: "100vh", background: "#F40012", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif", animation: "fadeIn 0.3s ease", position: "relative", overflow: "hidden", padding: "0 28px" }}>
      <div style={{ position: "absolute", width: 190, height: 190, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.72)", background: "rgba(255,255,255,0.16)", animation: "sosWave 0.76s ease-out infinite" }} />
      <div style={{ position: "absolute", width: 138, height: 138, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.58)", background: "rgba(255,255,255,0.12)", animation: "sosWave 0.76s 0.18s ease-out infinite" }} />
      <div style={{ width: 116, height: 116, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, color: "#fff", animation: "sosIconPop 0.62s ease both", zIndex: 1 }}>
        {triggeredDone ? "!" : "⌁"}
      </div>
      <div style={{ fontSize: 27, fontWeight: 900, color: "#fff", marginTop: 30, textAlign: "center", zIndex: 1 }}>
        {triggeredDone ? "SOS Triggered!" : "Sending SOS..."}
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.92)", fontWeight: 800, marginTop: 16, textAlign: "center", lineHeight: 1.55, maxWidth: 320, zIndex: 1 }}>
        {triggeredDone
          ? "Buddy helpers and emergency contacts are being notified now."
          : "Sharing your live location with selected buddies and emergency contacts."}
      </div>
    </div>
  );

  if (phase === "safe") return (
    <div style={{ minHeight: "100vh", background: "#E8F5E9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ fontSize: 90, animation: "pop 0.5s ease both" }}>✅</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: "#2E7D32", marginTop: 16 }}>You're safe!</div>
      <div style={{ fontSize: 14, color: "#388E3C", fontWeight: 600, marginTop: 6 }}>Check-in cancelled. Stay well 💚</div>
    </div>
  );

  if (phase === "triggered") return (
    <div style={{ minHeight: "100vh", background: "#FF1744", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 90, animation: "pop 0.5s ease both" }}>🆘</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginTop: 16 }}>SOS Triggered!</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", fontWeight: 600, marginTop: 8, textAlign: "center", padding: "0 44px", lineHeight: 1.6 }}>Your buddy helpers and emergency contacts have been notified with your live location.</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: headerGrad, padding: "52px 22px 22px", borderRadius: "0 0 28px 28px", boxShadow: `0 8px 24px ${ringColor}44`, position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 16, left: 18, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>← Back</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.72)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Safe Check-In</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: "#fff" }}>Are you OK?</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", fontWeight: 600, marginTop: 4 }}>
            {urgency === "red" ? "⚠️ SOS will trigger in seconds!" : urgency === "amber" ? "⏳ Tap the button to stay safe" : "Tap below to confirm you're safe"}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 22px 40px" }}>
        <div style={{ position: "relative", width: r * 2 + 20, height: r * 2 + 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
          <svg width={r * 2 + 20} height={r * 2 + 20} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
            <circle cx={r + 10} cy={r + 10} r={r} fill="none" stroke={`${ringColor}20`} strokeWidth={12} />
            <circle cx={r + 10} cy={r + 10} r={r} fill="none" stroke={ringColor} strokeWidth={12} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)}
              style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.5s ease" }} />
          </svg>
          <div style={{ textAlign: "center", zIndex: 1 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: ringColor, fontFamily: "'Poppins',sans-serif", lineHeight: 1, transition: "color 0.5s ease" }}>{timeStr}</div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginTop: 6, letterSpacing: 0.5 }}>seconds left</div>
          </div>
          {urgency === "red" && <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `3px solid ${ringColor}`, animation: "ring 1s ease-out infinite" }} />}
        </div>

        <button className="press" onClick={() => setPhase("safe")} style={{
          width: "100%", padding: "20px", borderRadius: 24, border: "none",
          background: "linear-gradient(135deg,#43A047,#00897B)", color: "#fff",
          fontSize: 20, fontWeight: 900, cursor: "pointer", marginBottom: 18,
          boxShadow: "0 10px 32px rgba(67,160,71,0.45)", fontFamily: "'Nunito',sans-serif",
        }}>✅ I'm OK — Cancel Alert</button>

        <div style={{ background: T.white, borderRadius: 20, padding: "16px 18px", border: `1.5px solid ${T.border}`, width: "100%" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>If the timer hits zero:</div>
          {["⭐ Buddy helpers are notified instantly", "🔔 Emergency contacts receive a text + live location", "🆘 SOS request goes live on the helper map"].map(line => (
            <div key={line} style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 7, display: "flex", alignItems: "center", gap: 8 }}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RequesterHome({ onSwitch }: { onSwitch: () => void }) {
  const [sos, setSos] = useState<"idle" | "sending" | "sent">("idle");
  const [activeCat, setActiveCat] = useState<Cat | null>(null);
  const [viewingHelper, setViewingHelper] = useState<Helper | null>(null);
  const [screen, setScreen] = useState<"home" | "timeline" | "contacts" | "history" | "checkin">("home");
  const [buddies, setBuddies] = useState<number[]>([]);

  function triggerSOS() {
    setSos("sending");
    setTimeout(() => {
      setSos("sent");
      setTimeout(() => { setScreen("timeline"); setSos("idle"); }, 800);
    }, 2000);
  }

  if (screen === "timeline") return <StatusTimeline onDone={() => setScreen("home")} onCancel={() => setScreen("home")} />;
  if (screen === "contacts") return <EmergencyContacts onBack={() => setScreen("home")} />;
  if (screen === "history") return <MissionsHistory onBack={() => setScreen("home")} />;
  if (screen === "checkin") return <SafeCheckIn onBack={() => setScreen("home")} onSOSTrigger={() => setScreen("timeline")} />;
  if (viewingHelper) return <HelperProfile helper={viewingHelper} onBack={() => setViewingHelper(null)} isBuddy={buddies.includes(viewingHelper.id)} onToggleBuddy={() => setBuddies(b => b.includes(viewingHelper.id) ? b.filter(id => id !== viewingHelper.id) : [...b, viewingHelper.id])} />;
  if (activeCat) return <RequestForm cat={activeCat} onBack={() => setActiveCat(null)} />;

  return (
    <div style={{ fontFamily: "'Nunito',sans-serif", background: T.bg, minHeight: "100vh", paddingBottom: 36 }}>
      <div style={{
        background: "linear-gradient(150deg,#FF6B35 0%,#FF1744 100%)",
        padding: "52px 22px 32px", position: "relative", overflow: "hidden",
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: "absolute", right: -20 - i * 35, top: -20 - i * 35,
            width: 120 + i * 70, height: 120 + i * 70, borderRadius: "50%",
            border: `1px solid rgba(255,255,255,${0.1 - i * 0.025})`,
          }} />
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/responcity-logo.png" alt="Responcity" style={{ width: 42, height: 42, borderRadius: 12, objectFit: "cover", background: "#fff" }} />
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Requester Mode</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>What do you need?</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setScreen("contacts")} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 12px", color: "#fff", fontSize: 17, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>🔔</button>
            <button onClick={() => setScreen("checkin")} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 12px", color: "#fff", fontSize: 17, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>⏱️</button>
            <button onClick={onSwitch} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 14px", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>⇄ Switch</button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 18px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 0 22px", animation: "fadeUp 0.4s ease both" }}>
          <div style={{ position: "relative", width: 172, height: 172 }}>
            {sos === "idle" && [1, 2, 3].map(i => (
              <div key={i} style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: `2.5px solid ${T.red}`,
                animation: `ring 2.5s ${i * 0.75}s ease-out infinite`,
                opacity: 0,
              }} />
            ))}
            <button
              className="press"
              onClick={triggerSOS}
              disabled={sos !== "idle"}
              style={{
                position: "absolute", inset: 18, borderRadius: "50%", border: "none",
                background: sos === "sent"
                  ? "linear-gradient(135deg,#00C853,#00897B)"
                  : "linear-gradient(135deg,#FF6B35,#FF1744)",
                cursor: sos === "idle" ? "pointer" : "default",
                boxShadow: sos === "sent"
                  ? "0 0 0 7px rgba(0,200,83,0.22), 0 14px 40px rgba(0,200,83,0.45)"
                  : "0 0 0 7px rgba(255,87,34,0.22), 0 14px 40px rgba(255,23,68,0.55)",
                animation: sos === "idle" ? "pulse 2s ease-in-out infinite" : "none",
                transition: "background 0.4s, box-shadow 0.4s",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              {sos === "sending" && <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />}
              {sos === "sent" && <div style={{ animation: "pop 0.4s ease both", textAlign: "center" }}><div style={{ fontSize: 34 }}>✓</div><div style={{ fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>SENT!</div></div>}
              {sos === "idle" && <><div style={{ fontSize: 34, lineHeight: 1 }}>🆘</div><div style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: 3 }}>SOS</div></>}
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: T.muted, fontWeight: 700, textAlign: "center" }}>
            {sos === "sending" && buddies.length > 0
              ? `Alerting your ${buddies.length} buddy helper${buddies.length > 1 ? "s" : ""} first...`
              : sos === "sent" ? "Help is on the way!" : "Tap for instant emergency alert"}
          </div>
          {buddies.length > 0 && sos === "idle" && (
            <div style={{ marginTop: 5, fontSize: 11, color: T.orange, fontWeight: 800, textAlign: "center" }}>
              ⭐ {buddies.length} buddy helper{buddies.length > 1 ? "s" : ""} get priority alert
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 800, letterSpacing: 0.8 }}>OR CHOOSE CATEGORY</div>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11, marginBottom: 28 }}>
          {CATS.map((cat, i) => (
            <button
              key={cat.id}
              className="press"
              onClick={() => setActiveCat(cat)}
              style={{
                background: cat.bg, border: `1.5px solid ${cat.color}22`, borderRadius: 18,
                padding: "16px 8px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                animation: `fadeUp 0.4s ${i * 0.05 + 0.1}s ease both`,
                opacity: 0, animationFillMode: "forwards",
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 14, fontSize: 21,
                background: `${cat.color}1A`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{cat.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: cat.color, textAlign: "center", lineHeight: 1.3 }}>{cat.label}</div>
            </button>
          ))}
        </div>

        {buddies.length > 0 && (
          <div style={{ marginBottom: 18, animation: "fadeUp 0.35s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>⭐ Buddy Helpers</div>
              <div style={{ fontSize: 10, color: T.orange, fontWeight: 700 }}>{buddies.length} saved · get priority SOS alert</div>
            </div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
              {HELPERS.filter(h => buddies.includes(h.id)).map(h => (
                <button key={h.id} onClick={() => setViewingHelper(h)} className="press" style={{ flex: "0 0 auto", background: T.white, borderRadius: 18, padding: "12px 14px", border: `1.5px solid ${T.orange}44`, cursor: "pointer", fontFamily: "'Nunito',sans-serif", textAlign: "center", minWidth: 82, boxShadow: "0 2px 10px rgba(255,87,34,0.08)" }}>
                  <div style={{ position: "relative", display: "inline-block", marginBottom: 6 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, fontSize: 22, background: "#FFF0EB", display: "flex", alignItems: "center", justifyContent: "center" }}>{h.avatar}</div>
                    {h.online && <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: T.green, border: "2px solid #fff" }} />}
                    <div style={{ position: "absolute", top: -5, right: -5, fontSize: 13 }}>⭐</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: T.text }}>{h.name.split(" ")[0]}</div>
                  <div style={{ fontSize: 9, color: h.online ? T.green : T.muted, fontWeight: 700, marginTop: 1 }}>{h.online ? "Online" : "Offline"}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="press" onClick={() => setScreen("history")} style={{ width: "100%", padding: "13px 18px", borderRadius: 18, border: `1.5px solid ${T.border}`, background: T.white, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 18, fontFamily: "'Nunito',sans-serif" }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(124,77,255,0.1)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>📋</div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>My Missions</div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>6 missions · all resolved ✓</div>
          </div>
          <div style={{ fontSize: 18, color: T.muted }}>›</div>
        </button>

        <div style={{ animation: "fadeUp 0.4s 0.3s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>Nearby Helpers</div>
            <button onClick={() => setScreen("history")} style={{ fontSize: 12, color: T.orange, fontWeight: 800, background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>History →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {HELPERS.filter(h => h.online).slice(0, 3).map(h => (
              <button
                key={h.id}
                className="press"
                onClick={() => setViewingHelper(h)}
                style={{
                  background: T.white, borderRadius: 18, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  border: `1.5px solid ${T.border}`,
                  boxShadow: "0 2px 14px rgba(255,87,34,0.06)",
                  cursor: "pointer", width: "100%", textAlign: "left",
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 15, fontSize: 22,
                    background: "#FFF0EB", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{h.avatar}</div>
                  <div style={{
                    position: "absolute", bottom: 1, right: 1,
                    width: 11, height: 11, borderRadius: "50%",
                    background: T.green, border: "2px solid #fff",
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{h.role} · {h.dist}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 800 }}>★ {h.rating}</div>
                  <div style={{ fontSize: 11, color: T.orange, fontWeight: 700 }}>{h.eta}</div>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, marginTop: 2 }}>View →</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type Request = typeof REQUESTS[number];

function ActiveMission({ req, onBack, onResolve }: { req: Request; onBack: () => void; onResolve: () => void }) {
  const cat = CATS.find(c => c.id === req.cat);
  const [resolving, setResolving] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(1);
  const [viewingProfile, setViewingProfile] = useState(false);
  const helper = HELPERS[0];

  const now = new Date();
  const helperInitialMessages: ChatMessage[] = [
    { id: 1, from: "them", text: "Thank you for accepting! I'm at the main entrance wearing a blue jacket.", time: new Date(now.getTime() - 90000), read: true },
    { id: 2, from: "me", text: "Got it! I can see your location on the map, I'll be there in 2 minutes.", time: new Date(now.getTime() - 60000), read: true },
    { id: 3, from: "them", text: "Please hurry, it's getting worse 😟", time: new Date(now.getTime() - 15000), read: false },
  ];

  function handleResolve() {
    setResolving(true);
    setTimeout(onResolve, 1800);
  }

  if (viewingProfile) return <HelperProfile helper={helper} onBack={() => setViewingProfile(false)} />;

  if (chatOpen) return (
    <ChatScreen
      otherName={req.user}
      otherAvatar="🧑"
      otherRole="Person in Need"
      accentColor="#43A047"
      accentGrad="linear-gradient(135deg,#43A047,#00897B)"
      initialMessages={helperInitialMessages}
      autoReplies={HELPER_AUTO_REPLIES}
      onBack={() => { setChatOpen(false); setUnread(0); }}
    />
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", padding: "52px 22px 32px", animation: "fadeIn 0.3s ease both" }}>
      <button onClick={onBack} style={{
        background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 12,
        padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 22,
        fontFamily: "'Nunito',sans-serif",
      }}>← Back</button>

      {/* Tappable helper mini-card */}
      <button
        className="press"
        onClick={() => setViewingProfile(true)}
        style={{
          width: "100%", background: T.white, border: `1.5px solid ${T.border}`,
          borderRadius: 18, padding: "12px 16px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 12,
          cursor: "pointer", textAlign: "left",
          boxShadow: "0 2px 12px rgba(255,87,34,0.07)",
          fontFamily: "'Nunito',sans-serif",
          animation: "fadeUp 0.35s ease both",
        }}
      >
        <div style={{ position: "relative" }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, fontSize: 22,
            background: "#FFF0EB", display: "flex", alignItems: "center", justifyContent: "center",
          }}>{helper.avatar}</div>
          <div style={{
            position: "absolute", bottom: 1, right: 1,
            width: 11, height: 11, borderRadius: "50%",
            background: T.green, border: "2px solid #fff",
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{helper.name}</div>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{helper.role}</div>
          <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 800, marginTop: 2 }}>★ {helper.rating} · {HELPER_PROFILES[helper.id].missions} missions</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: T.orange, fontWeight: 800, marginBottom: 4 }}>View Profile</div>
          <div style={{ color: T.muted, fontSize: 18 }}>›</div>
        </div>
      </button>

      <div style={{
        background: "linear-gradient(135deg,#43A047,#00897B)",
        borderRadius: 24, padding: "22px 22px", marginBottom: 18, color: "#fff",
        boxShadow: "0 10px 32px rgba(67,160,71,0.38)",
        animation: "scaleIn 0.4s cubic-bezier(.34,1.56,.64,1) both",
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.72, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Active Mission</div>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Helping {req.user}</div>
        <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.65, marginBottom: 16 }}>{req.msg}</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[{ icon: "📍", text: req.dist }, { icon: cat?.icon, text: cat?.label }, { icon: "⏱", text: "En route" }].map(tag => (
            <div key={tag.text} style={{
              background: "rgba(255,255,255,0.2)", borderRadius: 10,
              padding: "7px 13px", fontSize: 12, fontWeight: 800,
              display: "flex", alignItems: "center", gap: 5,
            }}>{tag.icon} {tag.text}</div>
          ))}
        </div>
      </div>

      <div style={{
        background: "#E8F5E9", borderRadius: 22, height: 200, marginBottom: 16,
        border: "1.5px solid #C8E6C9", position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 7,
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${i * 25}%`, height: 1, background: "rgba(0,0,0,0.04)" }} />
        ))}
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${i * 25}%`, width: 1, background: "rgba(0,0,0,0.04)" }} />
        ))}
        <div style={{ position: "absolute", top: "60%", left: "45%", transform: "translate(-50%,-50%)" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: T.red, border: "2.5px solid #fff", boxShadow: `0 2px 8px ${T.red}88` }} />
        </div>
        <div style={{ position: "absolute", top: "28%", left: "64%", transform: "translate(-50%,-50%)" }}>
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#43A047", border: "2.5px solid #fff", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <line x1="64%" y1="28%" x2="45%" y2="60%" stroke="#43A047" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.4" />
          {[0.15, 0.33, 0.52, 0.7, 0.88].map(p => (
            <circle key={p} cx={`${64 - 19 * p}%`} cy={`${28 + 32 * p}%`} r="3" fill="#43A047" opacity={0.18 + p * 0.28} />
          ))}
          <circle cx="64%" cy="28%" r="5" fill="#43A047" opacity="0.95">
            <animateMotion dur="4s" repeatCount="indefinite" path="M0,0 L-57,96" />
          </circle>
        </svg>
        <div style={{ fontSize: 14, color: "#2E7D32", fontWeight: 900, zIndex: 1 }}>Navigation Active</div>
        <div style={{ fontSize: 11, color: "#388E3C", fontWeight: 700 }}>Tap to open in Maps</div>
      </div>

      {/* Chat button */}
      <button
        className="press"
        onClick={() => { setChatOpen(true); setUnread(0); }}
        style={{
          width: "100%", padding: "14px 20px", borderRadius: 18,
          background: T.white,
          border: `1.5px solid ${unread > 0 ? "#43A04755" : T.border}`,
          cursor: "pointer", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: unread > 0 ? "0 4px 16px rgba(67,160,71,0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
          transition: "all 0.2s",
          fontFamily: "'Nunito',sans-serif",
        } as React.CSSProperties}
      >
        <div style={{ position: "relative" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, fontSize: 20,
            background: unread > 0 ? "#E8F5E9" : T.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>💬</div>
          {unread > 0 && (
            <div style={{
              position: "absolute", top: -4, right: -4,
              width: 18, height: 18, borderRadius: "50%",
              background: T.red, border: "2px solid #fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 900, color: "#fff",
              animation: "pulse 1.5s ease-in-out infinite",
            }}>{unread}</div>
          )}
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>
            Chat with {req.user}
            {unread > 0 && <span style={{ fontSize: 11, color: "#43A047", fontWeight: 700, marginLeft: 6 }}>• New message</span>}
          </div>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginTop: 1 }}>
            {unread > 0 ? '"Please hurry, it\'s getting worse 😟"' : "Tap to open conversation"}
          </div>
        </div>
        <div style={{ color: T.muted, fontSize: 18 }}>›</div>
      </button>

      {/* Contact row */}
      <div style={{
        background: T.white, borderRadius: 18, padding: "12px 18px", marginBottom: 14,
        display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${T.border}`,
      }}>
        <span style={{ fontSize: 24 }}>📞</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>Call {req.user}</div>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>Direct voice call</div>
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 11, border: `1.5px solid ${T.border}`,
          background: T.bg, fontSize: 17, cursor: "pointer",
          fontFamily: "'Nunito',sans-serif",
        }}>📞</button>
      </div>

      <button
        className="press"
        onClick={handleResolve}
        disabled={resolving}
        style={{
          width: "100%", padding: "17px", borderRadius: 20, border: "none",
          background: "linear-gradient(135deg,#43A047,#00897B)",
          color: "#fff", fontSize: 15, fontWeight: 900, cursor: resolving ? "default" : "pointer",
          boxShadow: "0 8px 28px rgba(67,160,71,0.38)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.3s",
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        {resolving
          ? <><div style={{ width: 20, height: 20, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} /> Resolving…</>
          : "✅ Mark as Resolved"
        }
      </button>
    </div>
  );
}

/* ── RATING SCREEN ────────────────────────────────────────────────── */
const FEEDBACK_TAGS = [
  { id: "fast", label: "⚡ Fast response" },
  { id: "helpful", label: "🙌 Very helpful" },
  { id: "professional", label: "💼 Professional" },
  { id: "calm", label: "🧘 Calm & reassuring" },
  { id: "listener", label: "👂 Great listener" },
  { id: "lifesaver", label: "🏆 Life saver!" },
  { id: "caring", label: "❤️ Caring" },
  { id: "clear", label: "🗣️ Clear communication" },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontSize: 42, lineHeight: 1,
            filter: i <= display ? "none" : "grayscale(1) opacity(0.25)",
            transform: i <= display ? "scale(1.1)" : "scale(1)",
            transition: "all 0.15s cubic-bezier(.34,1.56,.64,1)",
            animation: i <= value ? `pop 0.3s ${(i - 1) * 0.06}s cubic-bezier(.34,1.56,.64,1) both` : "none",
          }}
        >⭐</button>
      ))}
    </div>
  );
}

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Outstanding!"];

type RatingScreenProps = {
  req: Request;
  helper: typeof HELPERS[number];
  onDone: (stars: number) => void;
};

function RatingScreen({ req, helper, onDone }: RatingScreenProps) {
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cat = CATS.find(c => c.id === req.cat);

  function toggleTag(id: string) {
    setTags(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id]);
  }

  function submit() {
    if (stars === 0) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1600);
  }

  const newRating = stars > 0 ? ((helper.rating * 20 + stars) / 21).toFixed(1) : helper.rating.toFixed(1);

  if (submitted) return (
    <div style={{
      minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 24px", textAlign: "center", animation: "fadeIn 0.4s ease both",
    }}>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* Confetti dots */}
      <div style={{ position: "absolute", top: 80, left: 0, right: 0, height: 200, overflow: "hidden", pointerEvents: "none" }}>
        {["#FF1744","#FF6B35","#43A047","#7C4DFF","#F59E0B","#00897B"].map((color, i) => (
          Array.from({ length: 4 }).map((_, j) => (
            <div key={`${i}-${j}`} style={{
              position: "absolute",
              left: `${(i * 17 + j * 23) % 100}%`,
              width: 8, height: 8, borderRadius: j % 2 === 0 ? "50%" : 2,
              background: color,
              animation: `confettiFall 1.8s ${(i * 0.1 + j * 0.15)}s ease-in both`,
            }} />
          ))
        ))}
      </div>

      <div style={{ fontSize: 88, animation: "pop 0.5s cubic-bezier(.34,1.56,.64,1) both", marginBottom: 6 }}>🎉</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: T.text, marginBottom: 6 }}>Thank You!</div>
      <div style={{ fontSize: 14, color: T.muted, fontWeight: 600, lineHeight: 1.7, marginBottom: 32 }}>
        Your rating helps build a stronger,<br />safer community.
      </div>

      {/* Helper card with new rating */}
      <div style={{
        background: T.white, borderRadius: 24, padding: "22px 24px", width: "100%",
        border: `1.5px solid ${T.border}`, marginBottom: 28,
        boxShadow: "0 6px 24px rgba(255,87,34,0.08)",
        animation: "slideUp 0.5s 0.2s ease both", opacity: 0, animationFillMode: "forwards",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 18, fontSize: 28,
            background: "#FFF0EB", display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid rgba(255,87,34,0.12)",
          }}>{helper.avatar}</div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{helper.name}</div>
            <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{helper.role}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginBottom: 2 }}>New rating</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#F59E0B", animation: "scaleIn 0.4s 0.4s cubic-bezier(.34,1.56,.64,1) both", opacity: 0, animationFillMode: "forwards" }}>
              ⭐ {newRating}
            </div>
          </div>
        </div>

        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {tags.map(id => {
              const tag = FEEDBACK_TAGS.find(t => t.id === id);
              return tag ? (
                <div key={id} style={{
                  fontSize: 11, fontWeight: 800, padding: "5px 12px", borderRadius: 20,
                  background: "rgba(255,87,34,0.08)", color: T.orange,
                  border: `1px solid ${T.orange}33`,
                }}>{tag.label}</div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Impact stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", marginBottom: 28,
        animation: "slideUp 0.5s 0.35s ease both", opacity: 0, animationFillMode: "forwards",
      }}>
        {[
          { icon: "🤝", value: "1", label: "Helped today" },
          { icon: "🌟", value: `${stars}★`, label: "Your rating" },
          { icon: "🏘️", value: "247", label: "Community pts" },
        ].map(s => (
          <div key={s.label} style={{
            background: T.white, borderRadius: 16, padding: "14px 8px", textAlign: "center",
            border: `1.5px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 22, marginBottom: 3 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{s.value}</div>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <button className="press" onClick={() => onDone(stars)} style={{
        width: "100%", background: "linear-gradient(135deg,#43A047,#00897B)",
        border: "none", borderRadius: 18, padding: "16px",
        color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer",
        boxShadow: "0 8px 28px rgba(67,160,71,0.38)",
        fontFamily: "'Nunito',sans-serif",
        animation: "slideUp 0.5s 0.5s ease both", opacity: 0, animationFillMode: "forwards",
      }}>Back to Dashboard →</button>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif",
      animation: "fadeIn 0.35s ease both",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg,#FF6B35,#FF1744,#C62828)",
        padding: "52px 22px 28px", textAlign: "center",
        borderRadius: "0 0 36px 36px",
        boxShadow: "0 10px 32px rgba(255,23,68,0.3)",
        position: "relative", overflow: "hidden",
      }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            position: "absolute", right: -30 * i, top: -30 * i,
            width: 140 + i * 70, height: 140 + i * 70, borderRadius: "50%",
            border: `1px solid rgba(255,255,255,${0.09 - i * 0.03})`,
          }} />
        ))}
        <div style={{ fontSize: 64, animation: "pop 0.5s cubic-bezier(.34,1.56,.64,1) both", marginBottom: 10, position: "relative", zIndex: 1 }}>✅</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", position: "relative", zIndex: 1, marginBottom: 4 }}>Mission Complete!</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", fontWeight: 600, position: "relative", zIndex: 1 }}>
          {req.user} has been helped — great work!
        </div>
      </div>

      <div style={{ padding: "26px 20px 36px" }}>
        {/* Helper card */}
        <div style={{
          background: T.white, borderRadius: 22, padding: "18px 20px", marginBottom: 22,
          border: `1.5px solid ${T.border}`,
          boxShadow: "0 4px 18px rgba(255,87,34,0.07)",
          display: "flex", alignItems: "center", gap: 14,
          animation: "fadeUp 0.4s 0.1s ease both", opacity: 0, animationFillMode: "forwards",
        }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 17, fontSize: 26,
              background: "#FFF0EB", display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid rgba(255,87,34,0.12)",
            }}>{helper.avatar}</div>
            <div style={{
              position: "absolute", bottom: 1, right: 1,
              width: 13, height: 13, borderRadius: "50%",
              background: T.green, border: "2.5px solid #fff",
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>{helper.name}</div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{helper.role}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "#F59E0B", fontWeight: 800 }}>★ {helper.rating}</span>
              <div style={{
                fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 8,
                background: cat ? `${cat.color}14` : "#eee", color: cat?.color,
              }}>{cat?.label}</div>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginBottom: 2 }}>Helped in</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#43A047" }}>3 min</div>
          </div>
        </div>

        {/* Rate section */}
        <div style={{
          background: T.white, borderRadius: 22, padding: "20px 18px", marginBottom: 14,
          border: `1.5px solid ${T.border}`,
          boxShadow: "0 4px 18px rgba(255,87,34,0.07)",
          animation: "fadeUp 0.4s 0.18s ease both", opacity: 0, animationFillMode: "forwards",
        }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: T.text, marginBottom: 4 }}>Rate {helper.name}</div>
            <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>How was your experience?</div>
          </div>
          <StarRating value={stars} onChange={setStars} />
          {stars > 0 && (
            <div style={{
              textAlign: "center", marginTop: 10, fontSize: 13, fontWeight: 800,
              color: stars >= 4 ? "#43A047" : stars >= 3 ? "#F59E0B" : T.red,
              animation: "fadeIn 0.2s ease both",
            }}>
              {STAR_LABELS[stars]}
            </div>
          )}
        </div>

        {/* Feedback tags */}
        <div style={{
          background: T.white, borderRadius: 22, padding: "18px 18px", marginBottom: 14,
          border: `1.5px solid ${T.border}`,
          boxShadow: "0 4px 18px rgba(255,87,34,0.07)",
          animation: "fadeUp 0.4s 0.25s ease both", opacity: 0, animationFillMode: "forwards",
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.text, marginBottom: 12 }}>
            What stood out? <span style={{ color: T.muted, fontWeight: 600 }}>(optional)</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {FEEDBACK_TAGS.map(tag => {
              const active = tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  className="press"
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    border: `1.5px solid ${active ? T.orange : T.border}`,
                    borderRadius: 20, padding: "7px 13px",
                    background: active ? `${T.orange}12` : T.bg,
                    color: active ? T.orange : T.muted,
                    fontSize: 12, fontWeight: 800, cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >{tag.label}</button>
              );
            })}
          </div>
        </div>

        {/* Written review */}
        <div style={{
          background: T.white, borderRadius: 22, padding: "16px 18px", marginBottom: 22,
          border: `1.5px solid ${review ? T.orange : T.border}`,
          boxShadow: "0 4px 18px rgba(255,87,34,0.07)",
          transition: "border-color 0.2s",
          animation: "fadeUp 0.4s 0.32s ease both", opacity: 0, animationFillMode: "forwards",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Leave a review <span style={{ fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </div>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="Share your experience to help others..."
            rows={3}
            style={{
              width: "100%", border: "none", outline: "none", background: "none",
              fontSize: 13, fontWeight: 600, color: T.text, resize: "none", lineHeight: 1.7,
              fontFamily: "'Nunito',sans-serif",
            }}
          />
        </div>

        {/* Submit */}
        <button
          className="press"
          onClick={submit}
          disabled={stars === 0 || submitting}
          style={{
            width: "100%", padding: "17px", borderRadius: 20, border: "none",
            background: stars > 0 ? "linear-gradient(135deg,#FF6B35,#FF1744)" : "#E8DBD7",
            color: "#fff", fontSize: 15, fontWeight: 900,
            cursor: stars > 0 ? "pointer" : "not-allowed",
            boxShadow: stars > 0 ? "0 8px 28px rgba(255,87,34,0.38)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.2s",
            fontFamily: "'Nunito',sans-serif",
            marginBottom: 10,
          }}
        >
          {submitting
            ? <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
            : "Submit Rating ⭐"
          }
        </button>
        {stars === 0 && (
          <div style={{ textAlign: "center", fontSize: 11, color: T.muted, fontWeight: 700 }}>
            Select a star rating to continue
          </div>
        )}
        <button
          onClick={() => onDone(0)}
          style={{
            width: "100%", background: "none", border: "none",
            fontSize: 12, color: T.muted, fontWeight: 700, cursor: "pointer",
            padding: "8px", marginTop: 2,
            fontFamily: "'Nunito',sans-serif",
          }}
        >Skip for now</button>
      </div>
    </div>
  );
}

/* ── STATUS TIMELINE ─────────────────────────────────────────────── */
const TIMELINE_STAGES = [
  { icon: "🔍", label: "Searching for nearby helpers", sub: "Contacting helpers within 1.5 km...", color: T.orange },
  { icon: "🤝", label: "Helper found!", sub: "Dr. Sarah M. has accepted your request", color: "#3B82F6" },
  { icon: "🏃", label: "En route to you", sub: "Dr. Sarah M. · ETA 3 min · 0.4 km away", color: "#8B5CF6" },
  { icon: "📍", label: "Helper has arrived", sub: "Dr. Sarah M. is at your location now", color: "#F59E0B" },
  { icon: "✅", label: "You've been helped!", sub: "Mission complete — you're safe 💙", color: "#43A047" },
];

function StatusTimeline({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [stage, setStage] = useState(0);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const DELAYS = [2500, 2000, 3500, 2500];

  useEffect(() => {
    if (stage >= TIMELINE_STAGES.length - 1) return;
    const t = setTimeout(() => setStage(s => s + 1), DELAYS[stage]);
    return () => clearTimeout(t);
  }, [stage]);

  const done = stage >= TIMELINE_STAGES.length - 1;

  if (cancelConfirm) return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", padding: "52px 22px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "fadeIn 0.3s ease both" }}>
      <div style={{ fontSize: 64, marginBottom: 16, animation: "pop 0.4s ease both" }}>⚠️</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 8 }}>Cancel & Flag as Unsafe?</div>
      <div style={{ fontSize: 13, color: T.muted, fontWeight: 600, lineHeight: 1.7, marginBottom: 32, maxWidth: 280 }}>
        Your request will be cancelled and our safety team will be notified immediately.
      </div>
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        <button className="press" onClick={() => setCancelConfirm(false)} style={{ flex: 1, padding: "15px", borderRadius: 18, border: `1.5px solid ${T.border}`, background: T.white, fontSize: 14, fontWeight: 800, color: T.text, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Go Back</button>
        <button className="press" onClick={onCancel} style={{ flex: 1, padding: "15px", borderRadius: 18, border: "none", background: "linear-gradient(135deg,#FF1744,#C62828)", fontSize: 14, fontWeight: 900, color: "#fff", cursor: "pointer", fontFamily: "'Nunito',sans-serif", boxShadow: "0 6px 20px rgba(255,23,68,0.4)" }}>Cancel & Flag</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", animation: "fadeIn 0.3s ease both" }}>
      <div style={{
        background: done ? "linear-gradient(135deg,#43A047,#00897B)" : "linear-gradient(135deg,#FF6B35,#FF1744)",
        padding: "52px 22px 28px", transition: "background 0.6s ease",
        borderRadius: "0 0 32px 32px",
        boxShadow: done ? "0 8px 28px rgba(67,160,71,0.35)" : "0 8px 28px rgba(255,23,68,0.3)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 54, animation: "pop 0.4s ease both", marginBottom: 8 }}>{done ? "🎉" : TIMELINE_STAGES[stage].icon}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{done ? "You're Safe!" : TIMELINE_STAGES[stage].label}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{TIMELINE_STAGES[stage].sub}</div>
        </div>
      </div>

      <div style={{ padding: "24px 20px 36px" }}>
        {stage >= 1 && (
          <div style={{ background: T.white, borderRadius: 20, padding: "14px 16px", marginBottom: 20, border: `1.5px solid ${T.border}`, boxShadow: "0 4px 16px rgba(255,87,34,0.07)", display: "flex", alignItems: "center", gap: 14, animation: "slideDown 0.4s ease both" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 50, height: 50, borderRadius: 16, background: "#FFF0EB", fontSize: 25, display: "flex", alignItems: "center", justifyContent: "center" }}>👩‍⚕️</div>
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 13, height: 13, borderRadius: "50%", background: T.green, border: "2.5px solid #fff" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>Dr. Sarah M.</div>
              <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>Medical Professional · 0.4 km away</div>
              <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 800, marginTop: 2 }}>★ 4.9 · 342 missions</div>
            </div>
            {stage >= 2 && stage < 4 && <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: T.muted, fontWeight: 700 }}>ETA</div><div style={{ fontSize: 22, fontWeight: 900, color: T.orange }}>~3 min</div></div>}
            {stage >= 4 && <div style={{ fontSize: 26, animation: "pop 0.4s ease both" }}>✅</div>}
          </div>
        )}

        <div style={{ background: T.white, borderRadius: 20, padding: "20px 18px", marginBottom: 20, border: `1.5px solid ${T.border}` }}>
          {TIMELINE_STAGES.map((s, i) => {
            const past = i < stage; const active = i === stage; const future = i > stage;
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: i < TIMELINE_STAGES.length - 1 ? 18 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: past ? s.color : active ? `${s.color}22` : T.bg, border: `2px solid ${past || active ? s.color : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all 0.4s", animation: active ? "pulse 1.5s ease-in-out infinite" : "none", color: past ? "#fff" : "transparent" }}>
                    {past ? "✓" : active ? <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, animation: "blink 0.8s infinite" }} /> : null}
                  </div>
                  {i < TIMELINE_STAGES.length - 1 && <div style={{ width: 2, height: 20, marginTop: 4, background: past ? s.color : T.border, transition: "background 0.4s" }} />}
                </div>
                <div style={{ paddingTop: 6, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: past || active ? 900 : 700, color: future ? T.muted : T.text }}>{s.label}</div>
                  {(past || active) && <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginTop: 2, lineHeight: 1.5 }}>{s.sub}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {!done && stage < 2 && (
          <button className="press" onClick={() => setCancelConfirm(true)} style={{ width: "100%", padding: "13px", borderRadius: 16, border: `1.5px solid ${T.red}44`, background: "#FFF0F3", color: T.red, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>⚠️ Cancel & Flag as Unsafe</button>
        )}
        {done && (
          <button className="press" onClick={onDone} style={{ width: "100%", padding: "17px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#43A047,#00897B)", color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 28px rgba(67,160,71,0.38)", fontFamily: "'Nunito',sans-serif" }}>Back to Home 🏠</button>
        )}
      </div>
    </div>
  );
}

/* ── EMERGENCY CONTACTS ──────────────────────────────────────────── */
type Contact = { id: number; name: string; phone: string; relation: string };

function EmergencyContacts({ onBack }: { onBack: () => void }) {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: "Mom", phone: "+1 555-0101", relation: "Family" },
    { id: 2, name: "Jake (Flatmate)", phone: "+1 555-0188", relation: "Friend" },
  ]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelation, setNewRelation] = useState("Family");
  const RELATIONS = ["Family", "Friend", "Colleague", "Neighbour", "Doctor"];

  function addContact() {
    if (!newName || !newPhone) return;
    setContacts(c => [...c, { id: Date.now(), name: newName, phone: newPhone, relation: newRelation }]);
    setNewName(""); setNewPhone(""); setNewRelation("Family"); setAdding(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", animation: "fadeIn 0.3s ease both" }}>
      <div style={{ background: "linear-gradient(135deg,#FF6B35,#FF1744)", padding: "52px 22px 26px", borderRadius: "0 0 32px 32px", boxShadow: "0 8px 28px rgba(255,23,68,0.28)", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 16, left: 18, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>← Back</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 46, marginBottom: 8 }}>🆘</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Emergency Contacts</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>Notified instantly when you press SOS</div>
        </div>
      </div>

      <div style={{ padding: "22px 18px 40px" }}>
        <div style={{ background: "rgba(255,87,34,0.07)", borderRadius: 16, padding: "13px 16px", marginBottom: 20, border: `1px solid ${T.orange}33`, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20 }}>📱</span>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.orange, lineHeight: 1.65 }}>When you press SOS, everyone below gets a text with your live location link.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {contacts.map((c, i) => (
            <div key={c.id} style={{ background: T.white, borderRadius: 18, padding: "13px 16px", border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, animation: `fadeUp 0.3s ${i * 0.07}s ease both`, opacity: 0, animationFillMode: "forwards", boxShadow: "0 2px 10px rgba(255,87,34,0.05)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,87,34,0.1)", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {c.relation === "Family" ? "👨‍👩‍👧" : c.relation === "Friend" ? "👥" : c.relation === "Doctor" ? "👨‍⚕️" : "🤝"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{c.phone} · {c.relation}</div>
              </div>
              <button onClick={() => setContacts(cs => cs.filter(x => x.id !== c.id))} style={{ width: 32, height: 32, borderRadius: 10, background: "#FFF0F3", border: `1px solid ${T.red}33`, cursor: "pointer", fontSize: 14, color: T.red, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          ))}
        </div>

        {adding ? (
          <div style={{ background: T.white, borderRadius: 20, padding: "18px", border: `1.5px solid ${T.orange}44`, marginBottom: 12, animation: "slideDown 0.3s ease both" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.orange, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.8 }}>New Contact</div>
            {[{ label: "Name", value: newName, setter: setNewName, placeholder: "e.g. Mom, Jake..." }, { label: "Phone", value: newPhone, setter: setNewPhone, placeholder: "+1 555-0000" }].map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{f.label}</div>
                <input value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: T.text, background: T.bg, outline: "none", fontFamily: "'Nunito',sans-serif" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Relation</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {RELATIONS.map(r => <button key={r} onClick={() => setNewRelation(r)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${newRelation === r ? T.orange : T.border}`, background: newRelation === r ? `${T.orange}12` : T.bg, color: newRelation === r ? T.orange : T.muted, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{r}</button>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAdding(false)} style={{ flex: 1, padding: "11px", borderRadius: 14, border: `1.5px solid ${T.border}`, background: T.bg, color: T.muted, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Cancel</button>
              <button className="press" onClick={addContact} style={{ flex: 2, padding: "11px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#FF6B35,#FF1744)", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Add Contact ✓</button>
            </div>
          </div>
        ) : (
          <button className="press" onClick={() => setAdding(true)} style={{ width: "100%", padding: "15px", borderRadius: 18, border: `2px dashed ${T.orange}55`, background: "rgba(255,87,34,0.04)", color: T.orange, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif", marginBottom: 12 }}>+ Add Emergency Contact</button>
        )}
      </div>
    </div>
  );
}

/* ── MISSIONS HISTORY ────────────────────────────────────────────── */
function MissionsHistory({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<"all" | "requested" | "helped">("all");
  const filtered = filter === "all" ? MISSIONS_HISTORY_DATA : MISSIONS_HISTORY_DATA.filter(m => m.type === filter);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", animation: "fadeIn 0.3s ease both" }}>
      <div style={{ background: "linear-gradient(135deg,#7C4DFF,#4527A0)", padding: "52px 22px 24px", borderRadius: "0 0 32px 32px", boxShadow: "0 8px 28px rgba(124,77,255,0.28)", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 16, left: 18, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>← Back</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>My Missions</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>{MISSIONS_HISTORY_DATA.length} total · all resolved ✓</div>
        </div>
      </div>

      <div style={{ padding: "20px 18px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[{ label: "Requested", value: MISSIONS_HISTORY_DATA.filter(m => m.type === "requested").length, color: T.orange }, { label: "Helped", value: MISSIONS_HISTORY_DATA.filter(m => m.type === "helped").length, color: "#43A047" }, { label: "Avg Rating", value: "4.8★", color: "#F59E0B" }].map(s => (
            <div key={s.label} style={{ background: T.white, borderRadius: 16, padding: "14px 8px", textAlign: "center", border: `1.5px solid ${T.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {(["all", "requested", "helped"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: "9px 0", borderRadius: 14, border: `1.5px solid ${filter === f ? "#7C4DFF" : T.border}`, background: filter === f ? "#7C4DFF" : T.white, color: filter === f ? "#fff" : T.muted, fontSize: 11, fontWeight: 800, cursor: "pointer", textTransform: "capitalize", fontFamily: "'Nunito',sans-serif" }}>{f}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((m, i) => {
            const cat = CATS.find(c => c.id === m.cat);
            return (
              <div key={m.id} style={{ background: T.white, borderRadius: 18, padding: "14px 16px", border: `1.5px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", animation: `fadeUp 0.35s ${i * 0.06}s ease both`, opacity: 0, animationFillMode: "forwards" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: cat ? `${cat.color}14` : "#f5f5f5", fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cat?.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 8, background: m.type === "helped" ? "#E8F5E9" : "#FFF0F3", color: m.type === "helped" ? "#43A047" : T.red }}>{m.type === "helped" ? "🤝 Helped" : "🆘 Requested"}</div>
                      <div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{m.time}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.5, marginBottom: 6 }}>{m.msg}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{m.type === "helped" ? `Helped: ${m.requesterName}` : `Helper: ${m.helperName}`}</div>
                      <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 800 }}>{"★".repeat(m.rating)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── COMMUNITY FEED ──────────────────────────────────────────────── */
function CommunityFeed({ onBack }: { onBack: () => void }) {
  const [liked, setLiked] = useState<number[]>([]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", animation: "fadeIn 0.3s ease both", paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg,#43A047,#00897B)", padding: "52px 22px 24px", borderRadius: "0 0 32px 32px", boxShadow: "0 8px 28px rgba(67,160,71,0.28)", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 16, left: 18, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>← Back</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>💙</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Community Feed</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>Real stories from your neighbourhood</div>
        </div>
      </div>

      <div style={{ padding: "20px 18px 20px" }}>
        <div style={{ background: "linear-gradient(135deg,#43A047,#00897B)", borderRadius: 20, padding: "18px 20px", marginBottom: 20, color: "#fff" }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, marginBottom: 4 }}>Today in your area</div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>🤝 6 people helped</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>within 1.5 km · last 24 hours</div>
        </div>

        {COMMUNITY_FEED_DATA.map((story, i) => {
          const cat = CATS.find(c => c.id === story.cat);
          const isLiked = liked.includes(story.id);
          return (
            <div key={story.id} style={{ background: T.white, borderRadius: 20, padding: "16px", marginBottom: 12, border: `1.5px solid ${T.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", animation: `fadeUp 0.35s ${i * 0.07}s ease both`, opacity: 0, animationFillMode: "forwards" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: cat ? `${cat.color}14` : "#f5f5f5", fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cat?.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.6 }}>{story.msg}</div>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginTop: 4 }}>📍 {story.area} · {story.time}</div>
                </div>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{story.helperAvatar}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: cat ? `${cat.color}14` : "#f5f5f5", color: cat?.color }}>{cat?.icon} {cat?.label}</div>
                <button onClick={() => setLiked(l => isLiked ? l.filter(x => x !== story.id) : [...l, story.id])} style={{ display: "flex", alignItems: "center", gap: 5, background: isLiked ? "#FFF0F3" : "none", border: `1px solid ${isLiked ? T.red + "44" : T.border}`, borderRadius: 10, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 800, color: isLiked ? T.red : T.muted, fontFamily: "'Nunito',sans-serif" }}>
                  {isLiked ? "❤️" : "🤍"} {story.hearts + (isLiked ? 1 : 0)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── LEADERBOARD ─────────────────────────────────────────────────── */
function Leaderboard({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<"week" | "alltime">("week");
  const top3 = LEADERBOARD_DATA.slice(0, 3);
  const rest = LEADERBOARD_DATA.slice(3);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", animation: "fadeIn 0.3s ease both", paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", padding: "52px 22px 24px", borderRadius: "0 0 32px 32px", boxShadow: "0 8px 28px rgba(245,158,11,0.35)", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 16, left: 18, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>← Back</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>🏆</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 10 }}>Leaderboard</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {(["week", "alltime"] as const).map(p => <button key={p} onClick={() => setPeriod(p)} style={{ padding: "6px 16px", borderRadius: 20, background: period === p ? "#fff" : "rgba(255,255,255,0.2)", border: "none", color: period === p ? "#D97706" : "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{p === "week" ? "This Week" : "All Time"}</button>)}
          </div>
        </div>
      </div>

      <div style={{ padding: "22px 18px 20px" }}>
        {/* Podium */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {[top3[1], top3[0], top3[2]].map((h, idx) => {
            const podiumH = [100, 130, 80][idx];
            const grad = ["linear-gradient(135deg,#9CA3AF,#6B7280)", "linear-gradient(135deg,#F59E0B,#D97706)", "linear-gradient(135deg,#CD853F,#8B4513)"][idx];
            return (
              <div key={h.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: idx === 1 ? 1.2 : 1 }}>
                <div style={{ fontSize: idx === 1 ? 34 : 26, marginBottom: 4 }}>{h.avatar}</div>
                <div style={{ fontSize: idx === 1 ? 11 : 10, fontWeight: 900, color: T.text, marginBottom: 2, textAlign: "center" }}>{h.name.split(" ")[0]}</div>
                <div style={{ fontSize: 10, color: "#F59E0B", fontWeight: 800, marginBottom: 6 }}>{h.missions}</div>
                <div style={{ width: "100%", height: podiumH, borderRadius: "12px 12px 0 0", background: grad, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 8, boxShadow: idx === 1 ? "0 -6px 20px rgba(245,158,11,0.4)" : "none" }}>
                  <div style={{ fontSize: idx === 1 ? 24 : 18 }}>{h.medal}</div>
                </div>
              </div>
            );
          })}
        </div>

        {rest.map((h, i) => (
          <div key={h.name} style={{ background: T.white, borderRadius: 18, padding: "13px 16px", marginBottom: 10, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, animation: `fadeUp 0.35s ${i * 0.07}s ease both`, opacity: 0, animationFillMode: "forwards" }}>
            <div style={{ width: 24, textAlign: "center", fontSize: 13, fontWeight: 900, color: T.muted }}>#{h.rank}</div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FFF0EB", fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>{h.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{h.name}</div>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{h.role}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{h.missions}</div>
              <div style={{ fontSize: 9, color: T.muted, fontWeight: 700 }}>missions</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 800 }}>★{h.rating}</div>
              <div style={{ fontSize: 9, color: T.muted, fontWeight: 700 }}>{h.response}</div>
            </div>
          </div>
        ))}

        <div style={{ background: "rgba(255,87,34,0.06)", borderRadius: 18, padding: "13px 16px", border: `1.5px dashed ${T.orange}55`, marginTop: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, marginBottom: 6 }}>YOUR RANK</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 24, textAlign: "center", fontSize: 14, fontWeight: 900, color: T.orange }}>#12</div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FFF0EB", fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>🤝</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>You</div>
              <div style={{ fontSize: 11, color: T.orange, fontWeight: 700 }}>+3 spots this week 🔥</div>
            </div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>8</div><div style={{ fontSize: 9, color: T.muted, fontWeight: 700 }}>missions</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAP VIEW ────────────────────────────────────────────────────── */
function MapView({ onAccept }: { onAccept: (req: Request) => void }) {
  const [selected, setSelected] = useState<typeof MAP_PINS[number] | null>(null);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Nunito',sans-serif", paddingBottom: 80 }}>
      <div style={{ background: "#D4EDDA", height: 400, position: "relative", overflow: "hidden", borderBottom: "2px solid #A8D5B5" }}>
        {[1,2,3,4,5].map(i => <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${i*17}%`, height: 1, background: "rgba(0,0,0,0.05)" }} />)}
        {[1,2,3,4,5].map(i => <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${i*17}%`, width: 1, background: "rgba(0,0,0,0.05)" }} />)}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.14 }}>
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#2E7D32" strokeWidth="4" />
          <line x1="35%" y1="0" x2="35%" y2="100%" stroke="#2E7D32" strokeWidth="4" />
          <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#2E7D32" strokeWidth="3" />
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#2E7D32" strokeWidth="2" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#2E7D32" strokeWidth="2" />
        </svg>
        {/* You pin */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10 }}>
          <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "2px solid rgba(59,130,246,0.35)", animation: "ring 2s ease-out infinite" }} />
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#3B82F6", border: "3px solid #fff", boxShadow: "0 2px 8px rgba(59,130,246,0.5)" }} />
          <div style={{ position: "absolute", top: "110%", left: "50%", transform: "translateX(-50%)", background: "#3B82F6", color: "#fff", fontSize: 9, fontWeight: 900, padding: "2px 7px", borderRadius: 8, whiteSpace: "nowrap", marginTop: 2 }}>You</div>
        </div>
        {/* Request pins */}
        {MAP_PINS.map(pin => {
          const cat = CATS.find(c => c.id === pin.cat);
          return (
            <button key={pin.id} className="press" onClick={() => setSelected(pin === selected ? null : pin)} style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%,-100%)", background: pin.urgent ? T.red : (cat?.color ?? T.orange), border: "2.5px solid #fff", borderRadius: "50% 50% 50% 0", rotate: "-45deg", width: pin.urgent ? 36 : 30, height: pin.urgent ? 36 : 30, cursor: "pointer", zIndex: selected?.id === pin.id ? 20 : 5, boxShadow: pin.urgent ? `0 4px 14px ${T.red}88` : `0 3px 10px ${(cat?.color ?? T.orange)}66`, animation: pin.urgent ? "urgentGlow 1.5s ease-in-out infinite" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ rotate: "45deg", fontSize: pin.urgent ? 15 : 13 }}>{cat?.icon}</span>
            </button>
          );
        })}
        <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(255,255,255,0.92)", borderRadius: 10, padding: "5px 12px", fontSize: 10, fontWeight: 800, color: T.muted, backdropFilter: "blur(4px)" }}>📍 Live · {MAP_PINS.length} requests nearby</div>
      </div>

      <div style={{ padding: "16px 18px" }}>
        {selected ? (() => {
          const cat = CATS.find(c => c.id === selected.cat);
          return (
            <div style={{ animation: "slideUp 0.3s ease both" }}>
              {selected.urgent && <div style={{ background: T.red, borderRadius: "14px 14px 0 0", padding: "7px 16px", fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: 1, display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "blink 0.8s infinite" }} />URGENT REQUEST</div>}
              <div style={{ background: T.white, borderRadius: selected.urgent ? "0 0 18px 18px" : 18, padding: "14px 16px", border: `1.5px solid ${T.border}`, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: cat ? `${cat.color}14` : "#f5f5f5", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cat?.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: T.text, marginBottom: 2 }}>{selected.user} needs help</div>
                    <div style={{ fontSize: 12, color: T.muted, fontWeight: 600, lineHeight: 1.5, marginBottom: 8 }}>{selected.msg}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: cat?.color, background: cat ? `${cat.color}14` : "#f5f5f5", borderRadius: 8, padding: "3px 9px" }}>{cat?.label}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>📍 {selected.dist}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setSelected(null)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: `1.5px solid ${T.border}`, background: T.white, fontSize: 13, fontWeight: 800, color: T.muted, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Dismiss</button>
                <button className="press" onClick={() => { onAccept(selected as unknown as Request); setSelected(null); }} style={{ flex: 2, padding: "12px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#43A047,#00897B)", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 16px rgba(67,160,71,0.38)", fontFamily: "'Nunito',sans-serif" }}>✅ Accept Request</button>
              </div>
            </div>
          );
        })() : (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, textAlign: "center", padding: "12px 0 16px" }}>Tap a pin on the map to preview a request</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATS.map(cat => <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 6, background: T.white, borderRadius: 10, padding: "6px 12px", border: `1px solid ${T.border}` }}><div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color }} /><span style={{ fontSize: 10, fontWeight: 800, color: T.muted }}>{cat.icon} {cat.label}</span></div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── HELPER ONBOARDING ───────────────────────────────────────────── */
function HelperOnboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);

  const canNext = step === 1 ? skills.length > 0 : step === 2 ? agreed : true;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", animation: "fadeIn 0.3s ease both" }}>
      <div style={{ height: 4, background: T.border }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg,#43A047,#00897B)", width: `${((step + 1) / 3) * 100}%`, transition: "width 0.4s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, padding: "16px 0 0" }}>
        {["Welcome", "Skills", "Pledge"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: i <= step ? "linear-gradient(135deg,#43A047,#00897B)" : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: i <= step ? "#fff" : T.muted, transition: "all 0.3s" }}>{i < step ? "✓" : i + 1}</div>
            {i < 2 && <div style={{ width: 28, height: 2, background: i < step ? "#43A047" : T.border, transition: "background 0.3s" }} />}
          </div>
        ))}
      </div>

      <div style={{ padding: "24px 22px 40px" }}>
        {step === 0 && (
          <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease both" }}>
            <div style={{ fontSize: 72, marginBottom: 18, animation: "float 3s ease-in-out infinite" }}>🤝</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text, marginBottom: 8 }}>Welcome, Helper!</div>
            <div style={{ fontSize: 13, color: T.muted, fontWeight: 600, lineHeight: 1.75, marginBottom: 28, maxWidth: 290, margin: "0 auto 28px" }}>You're joining a community of everyday heroes — real people helping each other in moments that matter.</div>
            {[{ icon: "⚡", text: "Respond to nearby requests in seconds" }, { icon: "🛡️", text: "Vetted community with safety standards" }, { icon: "🏆", text: "Earn badges and recognition for your help" }].map(f => (
              <div key={f.icon} style={{ display: "flex", alignItems: "center", gap: 14, background: T.white, borderRadius: 16, padding: "14px 18px", marginBottom: 10, border: `1.5px solid ${T.border}`, textAlign: "left" }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{f.text}</span>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 46, marginBottom: 8 }}>🎓</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 4 }}>Your Skills</div>
              <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Select everything that applies</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 16 }}>
              {SKILL_OPTIONS.map(s => {
                const active = skills.includes(s);
                return <button key={s} onClick={() => setSkills(sk => active ? sk.filter(x => x !== s) : [...sk, s])} style={{ padding: "9px 16px", borderRadius: 22, border: `1.5px solid ${active ? "#43A047" : T.border}`, background: active ? "#E8F5E9" : T.white, color: active ? "#43A047" : T.muted, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif", transition: "all 0.15s" }}>{active ? "✓ " : ""}{s}</button>;
              })}
            </div>
            {skills.length === 0 && <div style={{ textAlign: "center", fontSize: 12, color: T.muted, fontWeight: 600 }}>Select at least one skill to continue</div>}
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 46, marginBottom: 8 }}>🤲</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 4 }}>Community Pledge</div>
              <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Read and agree to our code of conduct</div>
            </div>
            <div style={{ background: T.white, borderRadius: 20, padding: "18px", border: `1.5px solid ${T.border}`, marginBottom: 16, maxHeight: 240, overflowY: "auto" }}>
              {[{ icon: "🛡️", title: "Safety First", text: "Never put yourself in danger to help someone else." }, { icon: "🤝", title: "Respect Always", text: "Treat every person with dignity and compassion." }, { icon: "🔒", title: "Privacy Matters", text: "Never share personal info about the people you help." }, { icon: "⚡", title: "Be Reliable", text: "If you accept a request, commit to following through." }, { icon: "📞", title: "Know Your Limits", text: "Always call emergency services for life-threatening situations." }].map(item => (
                <div key={item.icon} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: T.text, marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, lineHeight: 1.55 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setAgreed(a => !a)} style={{ width: "100%", padding: "13px 16px", borderRadius: 16, border: `1.5px solid ${agreed ? "#43A047" : T.border}`, background: agreed ? "#E8F5E9" : T.white, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "'Nunito',sans-serif", marginBottom: 4 }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, background: agreed ? "#43A047" : T.bg, border: `2px solid ${agreed ? "#43A047" : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", flexShrink: 0 }}>{agreed ? "✓" : ""}</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text, textAlign: "left" }}>I agree to the pledge and always put safety first</span>
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "15px", borderRadius: 18, border: `1.5px solid ${T.border}`, background: T.white, fontSize: 14, fontWeight: 800, color: T.muted, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>← Back</button>}
          <button className="press" disabled={!canNext} onClick={() => step < 2 ? setStep(s => s + 1) : onDone()} style={{ flex: step > 0 ? 2 : 1, padding: "15px", borderRadius: 18, border: "none", background: canNext ? "linear-gradient(135deg,#43A047,#00897B)" : "#E8DBD7", color: "#fff", fontSize: 15, fontWeight: 900, cursor: canNext ? "pointer" : "not-allowed", boxShadow: canNext ? "0 8px 24px rgba(67,160,71,0.38)" : "none", fontFamily: "'Nunito',sans-serif", transition: "all 0.2s" }}>
            {step < 2 ? "Continue →" : "🚀 Start Helping!"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── NOTIFICATION TOAST ───────────────────────────────────────────── */
type AlertItem = typeof ALERT_POOL[number];

type NotificationToastProps = {
  alert: AlertItem;
  onAccept: (a: AlertItem) => void;
  onDismiss: () => void;
  duration?: number;
};

function NotificationToast({ alert, onAccept, onDismiss, duration = 7000 }: NotificationToastProps) {
  const cat = CATS.find(c => c.id === alert.cat);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function dismiss() {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onDismiss, 320);
  }

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function handleAccept() {
    if (timerRef.current) clearTimeout(timerRef.current);
    onAccept(alert);
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "min(430px, 100vw)", zIndex: 9999,
      padding: "12px 14px 0",
      animation: leaving ? "slideOut 0.32s cubic-bezier(.4,0,.2,1) both" : "slideDown 0.38s cubic-bezier(.34,1.28,.64,1) both",
      pointerEvents: "all",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: alert.urgent
          ? "0 8px 32px rgba(255,23,68,0.28), 0 2px 8px rgba(0,0,0,0.1)"
          : "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)",
        border: `1.5px solid ${alert.urgent ? T.red + "44" : T.border}`,
        animation: alert.urgent ? "urgentGlow 1.6s ease-in-out infinite" : "none",
      }}>
        {/* Accent bar */}
        <div style={{
          height: 4,
          background: alert.urgent
            ? `linear-gradient(90deg,${T.red},#FF6D00)`
            : `linear-gradient(90deg,${cat?.color ?? T.orange},${cat?.color ?? T.orange}88)`,
        }} />

        {/* Content */}
        <div style={{ padding: "14px 16px 12px", display: "flex", gap: 12, alignItems: "flex-start" }}>
          {/* Icon */}
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0, fontSize: 21,
            background: alert.urgent ? "#FFF0F3" : `${cat?.color ?? T.orange}14`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1.5px solid ${alert.urgent ? T.red + "33" : (cat?.color ?? T.orange) + "33"}`,
            position: "relative",
          }}>
            {cat?.icon}
            {alert.urgent && (
              <div style={{
                position: "absolute", top: -4, right: -4,
                width: 14, height: 14, borderRadius: "50%",
                background: T.red, border: "2px solid #fff",
                animation: "blink 0.9s ease-in-out infinite",
              }} />
            )}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              {alert.urgent && (
                <div style={{
                  fontSize: 9, fontWeight: 900, color: "#fff",
                  background: T.red, borderRadius: 6, padding: "2px 7px", letterSpacing: 1,
                }}>URGENT</div>
              )}
              <div style={{ fontSize: 13, fontWeight: 900, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {alert.user} needs help
              </div>
            </div>
            <div style={{ fontSize: 12, color: T.muted, fontWeight: 600, lineHeight: 1.5, marginBottom: 6,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            } as React.CSSProperties}>
              {alert.msg}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: cat?.color ?? T.orange, background: `${cat?.color ?? T.orange}14`, borderRadius: 7, padding: "2px 8px" }}>
                {cat?.icon} {cat?.label}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>📍 {alert.dist}</div>
            </div>
          </div>

          {/* Dismiss X */}
          <button onClick={dismiss} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: T.muted, lineHeight: 1, padding: "0 2px", flexShrink: 0,
          }}>×</button>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, padding: "0 14px 14px" }}>
          <button className="press" onClick={handleAccept} style={{
            flex: 1, padding: "11px 0", borderRadius: 14, border: "none",
            background: alert.urgent ? `linear-gradient(135deg,${T.red},#FF6D00)` : `linear-gradient(135deg,#43A047,#00897B)`,
            color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer",
            boxShadow: alert.urgent ? "0 4px 16px rgba(255,23,68,0.35)" : "0 4px 16px rgba(67,160,71,0.35)",
            fontFamily: "'Nunito',sans-serif",
          }}>✓ Accept</button>
          <button className="press" onClick={dismiss} style={{
            flex: 1, padding: "11px 0", borderRadius: 14,
            border: `1.5px solid ${T.border}`,
            background: "#fff", color: T.muted, fontSize: 13, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Nunito',sans-serif",
          }}>Skip</button>
        </div>

        {/* Countdown bar */}
        <div style={{ height: 3, background: T.border }}>
          <div style={{
            height: "100%",
            background: alert.urgent ? T.red : "#43A047",
            animation: `progBar ${duration}ms linear both`,
          }} />
        </div>
      </div>
    </div>
  );
}

/* ── GROUP MISSION ───────────────────────────────────────────────── */
function GroupMission({ mission, onLeave }: { mission: GroupMissionData; onLeave: () => void }) {
  const [tab, setTab] = useState<"mission" | "roster" | "chat">("mission");
  const [myRole, setMyRole] = useState<string | null>(null);
  const [slots, setSlots] = useState(mission.slots);
  const [messages, setMessages] = useState(GROUP_CHAT_INIT);
  const [input, setInput] = useState("");
  const [joined, setJoined] = useState(false);
  const cat = CATS.find(c => c.id === mission.cat);
  const filledCount = slots.filter(s => s.filled).length;

  function claimSlot(roleLabel: string) {
    if (myRole) return;
    setSlots(s => s.map(sl => sl.role === roleLabel ? { ...sl, filled: true, name: "You", avatar: "🤝" } : sl));
    setMyRole(roleLabel);
    setJoined(true);
    setMessages(m => [...m, { id: Date.now(), sender: "You", avatar: "🤝", role: roleLabel.replace(/[^\w\s&]/g, "").trim(), msg: `Just joined! On my way to ${mission.location}. 🏃`, time: "now" }]);
  }

  function sendMsg() {
    if (!input.trim()) return;
    setMessages(m => [...m, { id: Date.now(), sender: "You", avatar: "🤝", role: myRole?.replace(/[^\w\s&]/g, "").trim() ?? "Helper", msg: input.trim(), time: "now" }]);
    setInput("");
  }

  const accentColor = mission.urgent ? "#FF1744" : "#43A047";
  const headerGrad = mission.urgent ? "linear-gradient(135deg,#FF1744,#C62828)" : "linear-gradient(135deg,#43A047,#00897B)";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", animation: "fadeIn 0.3s ease both", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: headerGrad, padding: "52px 22px 18px", borderRadius: "0 0 28px 28px", boxShadow: `0 8px 28px ${accentColor}44`, position: "relative" }}>
        <button onClick={onLeave} style={{ position: "absolute", top: 16, left: 18, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>← Back</button>
        {joined && <div style={{ position: "absolute", top: 16, right: 18, background: "rgba(255,255,255,0.22)", borderRadius: 12, padding: "6px 12px", fontSize: 11, fontWeight: 900, color: "#fff" }}>✅ Joined</div>}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Group Mission</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{mission.title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>📍 {mission.location} · {mission.dist}</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 10 }}>
            {slots.map((s, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: s.filled ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)", border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{s.filled ? (s.avatar ?? "✓") : ""}</div>
            ))}
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.9)", marginLeft: 4 }}>{filledCount}/{slots.length} joined</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 14, justifyContent: "center" }}>
          {([{ id: "mission", label: "📋 Mission" }, { id: "roster", label: "👥 Roster" }, { id: "chat", label: `💬 Chat${joined ? " ●" : ""}` }] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "6px 14px", borderRadius: 20, background: tab === t.id ? "#fff" : "rgba(255,255,255,0.18)", border: "none", color: tab === t.id ? accentColor : "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 18px 36px", overflowY: "auto" }}>
        {/* MISSION TAB */}
        {tab === "mission" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ background: T.white, borderRadius: 20, padding: "16px 18px", marginBottom: 14, border: `1.5px solid ${T.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Mission Brief</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.65, marginBottom: 12 }}>{mission.msg}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 10, fontWeight: 800, background: cat ? `${cat.color}14` : "#f5f5f5", color: cat?.color, borderRadius: 8, padding: "3px 10px" }}>{cat?.icon} {cat?.label}</div>
                <div style={{ fontSize: 10, fontWeight: 800, background: "#EDE7F6", color: "#7C4DFF", borderRadius: 8, padding: "3px 10px" }}>👑 Coordinator: {mission.coordinator}</div>
              </div>
            </div>

            <div style={{ background: T.white, borderRadius: 20, padding: "16px 18px", marginBottom: 14, border: `1.5px solid ${T.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, animation: "blink 0.8s infinite" }} />Live Updates
              </div>
              {mission.updates.map((u, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < mission.updates.length - 1 ? 12 : 0, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 9, background: u.type === "alert" ? "#FFF0F3" : "#E8F5E9", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{u.type === "alert" ? "⚠️" : "ℹ️"}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.5 }}>{u.msg}</div>
                    <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, marginTop: 2 }}>{u.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mini map */}
            <div style={{ background: "#D4EDDA", borderRadius: 20, height: 130, position: "relative", overflow: "hidden", border: "1.5px solid #A8D5B5", marginBottom: 16 }}>
              {[1,2,3,4].map(i => <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${i*25}%`, height: 1, background: "rgba(0,0,0,0.04)" }} />)}
              {[1,2,3].map(i => <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${i*33}%`, width: 1, background: "rgba(0,0,0,0.04)" }} />)}
              <div style={{ position: "absolute", top: "45%", left: "38%", transform: "translate(-50%,-50%)" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: accentColor, border: "2.5px solid #fff", boxShadow: `0 2px 8px ${accentColor}88` }} />
                <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `2px solid ${accentColor}44`, animation: "ring 2s ease-out infinite" }} />
              </div>
              {slots.filter(s => s.filled).map((s, i) => (
                <div key={i} style={{ position: "absolute", top: `${25 + i * 18}%`, left: `${52 + i * 10}%`, transform: "translate(-50%,-50%)" }}>
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#43A047", border: "2px solid #fff", animation: "pulse 1.5s ease-in-out infinite" }} />
                </div>
              ))}
              <div style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10, fontWeight: 800, color: "#2E7D32", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "3px 10px" }}>📍 {mission.location}</div>
            </div>

            {!joined ? (
              <button className="press" onClick={() => setTab("roster")} style={{ width: "100%", padding: "16px", borderRadius: 20, border: "none", background: headerGrad, color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer", boxShadow: `0 8px 24px ${accentColor}44`, fontFamily: "'Nunito',sans-serif" }}>👥 Join This Mission →</button>
            ) : (
              <button className="press" onClick={() => setTab("chat")} style={{ width: "100%", padding: "16px", borderRadius: 20, border: "none", background: headerGrad, color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer", boxShadow: `0 8px 24px ${accentColor}44`, fontFamily: "'Nunito',sans-serif" }}>💬 Open Team Chat →</button>
            )}
          </div>
        )}

        {/* ROSTER TAB */}
        {tab === "roster" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 14, textAlign: "center" }}>
              {slots.length - filledCount} role{slots.length - filledCount !== 1 ? "s" : ""} still open — tap to claim yours
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {slots.map((s, i) => (
                <div key={i} style={{ background: T.white, borderRadius: 18, padding: "14px 16px", border: `1.5px solid ${s.filled ? (myRole === s.role ? "#43A047" : T.border) : T.orange + "55"}`, animation: `fadeUp 0.3s ${i * 0.06}s ease both`, opacity: 0, animationFillMode: "forwards" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: s.filled ? (s.avatar === "🤝" ? "#E8F5E9" : "#FFF0EB") : "rgba(255,87,34,0.08)", fontSize: 21, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.filled ? (s.avatar ?? "✓") : "+"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{s.role}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: s.filled ? (s.avatar === "🤝" ? "#43A047" : T.muted) : T.orange }}>{s.filled ? (s.avatar === "🤝" ? "You · Active" : `${s.name} · Active`) : "Open · Tap to join"}</div>
                    </div>
                    {!s.filled && !myRole && (
                      <button className="press" onClick={() => claimSlot(s.role)} style={{ padding: "8px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#43A047,#00897B)", color: "#fff", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "'Nunito',sans-serif", boxShadow: "0 3px 12px rgba(67,160,71,0.35)" }}>Join</button>
                    )}
                    {myRole === s.role && <div style={{ fontSize: 9, fontWeight: 900, color: "#43A047", background: "#E8F5E9", borderRadius: 8, padding: "4px 10px" }}>YOUR ROLE</div>}
                  </div>
                </div>
              ))}
            </div>
            {joined && (
              <div style={{ background: "#E8F5E9", borderRadius: 18, padding: "14px 18px", marginTop: 16, border: "1.5px solid #C8E6C9", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#43A047", marginBottom: 4 }}>✅ You're part of this mission!</div>
                <div style={{ fontSize: 12, color: "#388E3C", fontWeight: 600 }}>Switch to the Chat tab to coordinate with your team</div>
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {tab === "chat" && (
          <div style={{ animation: "fadeUp 0.3s ease both", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {messages.map((m) => {
                const isMe = m.sender === "You";
                const isSystem = m.sender === "System";
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: isMe ? "row-reverse" : "row" }}>
                    {!isMe && <div style={{ width: 32, height: 32, borderRadius: 10, background: isSystem ? "#E3F2FD" : "#FFF0EB", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.avatar}</div>}
                    <div style={{ maxWidth: "73%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                      {!isMe && <div style={{ fontSize: 9, fontWeight: 800, color: T.muted, marginBottom: 3 }}>{m.sender} · {m.role}</div>}
                      <div style={{ background: isMe ? "linear-gradient(135deg,#43A047,#00897B)" : isSystem ? "#E3F2FD" : T.white, color: isMe ? "#fff" : T.text, borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", fontSize: 13, fontWeight: 600, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: isMe || isSystem ? "none" : `1px solid ${T.border}` }}>{m.msg}</div>
                      <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginTop: 3 }}>{m.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {joined ? (
              <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Message the team..." style={{ flex: 1, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "11px 16px", fontSize: 13, fontWeight: 600, color: T.text, background: T.white, outline: "none", fontFamily: "'Nunito',sans-serif" }} />
                <button className="press" onClick={sendMsg} style={{ width: 44, height: 44, borderRadius: 14, border: "none", background: "linear-gradient(135deg,#43A047,#00897B)", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0", fontSize: 12, color: T.muted, fontWeight: 600, borderTop: `1px solid ${T.border}` }}>
                <button className="press" onClick={() => setTab("roster")} style={{ color: "#43A047", fontWeight: 900, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "'Nunito',sans-serif" }}>Claim a role</button> to message the team
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HelperHome({ onSwitch }: { onSwitch: () => void }) {
  const [accepted, setAccepted] = useState<Request | null>(null);
  const [resolved, setResolved] = useState<number[]>([]);
  const [ratingFor, setRatingFor] = useState<{ req: Request; helper: typeof HELPERS[number] } | null>(null);
  const [activeAlert, setActiveAlert] = useState<AlertItem | null>(null);
  const [alertQueue, setAlertQueue] = useState<AlertItem[]>([]);
  const [tab, setTab] = useState<"requests" | "map" | "feed" | "board">("requests");
  const [onboarded, setOnboarded] = useState(false);
  const [groupMission, setGroupMission] = useState<GroupMissionData | null>(null);
  const streak = 5;
  const alertIndexRef = useRef(0);

  useEffect(() => {
    const fire = () => {
      const next = ALERT_POOL[alertIndexRef.current % ALERT_POOL.length];
      alertIndexRef.current += 1;
      setActiveAlert(prev => {
        if (prev) {
          setAlertQueue(q => [...q, next]);
          return prev;
        }
        return next;
      });
    };
    const id = setInterval(fire, 12000);
    const firstId = setTimeout(fire, 3500);
    return () => { clearInterval(id); clearTimeout(firstId); };
  }, []);

  function dismissAlert() {
    setActiveAlert(null);
    setTimeout(() => {
      setAlertQueue(q => {
        if (q.length === 0) return q;
        const [next, ...rest] = q;
        setActiveAlert(next);
        return rest;
      });
    }, 400);
  }

  function acceptAlert(a: AlertItem) {
    const req: Request = { ...a, time: "Just now" };
    setActiveAlert(null);
    setAlertQueue([]);
    setAccepted(req);
  }

  if (!onboarded) return <HelperOnboarding onDone={() => setOnboarded(true)} />;
  if (groupMission) return <GroupMission mission={groupMission} onLeave={() => setGroupMission(null)} />;

  if (ratingFor) return (
    <RatingScreen
      req={ratingFor.req}
      helper={ratingFor.helper}
      onDone={() => setRatingFor(null)}
    />
  );

  if (accepted) return (
    <ActiveMission
      req={accepted}
      onBack={() => setAccepted(null)}
      onResolve={() => {
        setResolved(r => [...r, accepted.id]);
        setRatingFor({ req: accepted, helper: HELPERS[0] });
        setAccepted(null);
      }}
    />
  );

  const open = REQUESTS.filter(r => !resolved.includes(r.id));

  return (
    <>
      {activeAlert && (
        <NotificationToast
          key={activeAlert.id}
          alert={activeAlert}
          onAccept={acceptAlert}
          onDismiss={dismissAlert}
        />
      )}
    <div style={{ fontFamily: "'Nunito',sans-serif", background: T.bg, minHeight: "100vh", paddingBottom: 36 }}>
      <div style={{
        background: "linear-gradient(150deg,#43A047 0%,#00897B 100%)",
        padding: "52px 22px 32px", position: "relative", overflow: "hidden",
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: "absolute", right: -20 - i * 35, top: -20 - i * 35,
            width: 120 + i * 70, height: 120 + i * 70, borderRadius: "50%",
            border: `1px solid rgba(255,255,255,${0.1 - i * 0.025})`,
          }} />
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14, flexShrink: 0,
              background: "rgba(255,255,255,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>🤝</div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Helper Mode</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Ready to Help? 🤝</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>🔥 {streak}-day streak · 🏅 {resolved.length + 8} missions</div>
            </div>
          </div>
          <button onClick={onSwitch} style={{
            background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12,
            padding: "8px 14px", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Nunito',sans-serif",
          }}>⇄ Switch</button>
        </div>

        <div style={{ display: "flex", gap: 10, position: "relative", zIndex: 1 }}>
          {[
            { label: "Open Requests", value: open.length },
            { label: "Helpers Online", value: HELPERS.filter(h => h.online).length },
            { label: "Resolved Today", value: resolved.length },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: "rgba(255,255,255,0.18)", borderRadius: 14,
              padding: "12px 10px", backdropFilter: "blur(8px)", textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.72)", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {tab === "requests" && (
      <div style={{ padding: "22px 18px 100px" }}>
        {/* Group Missions */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>🤝 Group Missions</div>
            <div style={{ fontSize: 11, background: "#E8F5E9", color: "#43A047", fontWeight: 800, borderRadius: 8, padding: "2px 10px" }}>{GROUP_MISSIONS_DATA.length} active</div>
          </div>
          {GROUP_MISSIONS_DATA.map((gm, i) => {
            const gmCat = CATS.find(c => c.id === gm.cat);
            const filled = gm.slots.filter(s => s.filled).length;
            return (
              <button key={gm.id} className="press" onClick={() => setGroupMission(gm)} style={{ width: "100%", background: T.white, borderRadius: 20, overflow: "hidden", border: `1.5px solid ${gm.urgent ? T.red + "44" : T.border}`, marginBottom: 10, cursor: "pointer", fontFamily: "'Nunito',sans-serif", textAlign: "left", animation: `fadeUp 0.4s ${i * 0.07}s ease both`, opacity: 0, animationFillMode: "forwards" }}>
                {gm.urgent && <div style={{ background: `linear-gradient(90deg,${T.red},#FF6D00)`, padding: "5px 16px", fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: 1.2, display: "flex", alignItems: "center", gap: 7 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", animation: "blink 1s ease-in-out infinite" }} />URGENT GROUP MISSION</div>}
                <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: gmCat ? `${gmCat.color}14` : "#f5f5f5", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{gmCat?.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: T.text, marginBottom: 2 }}>{gm.title}</div>
                    <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 7, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{gm.msg}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        {gm.slots.map((s, si) => <div key={si} style={{ width: 18, height: 18, borderRadius: "50%", background: s.filled ? "#43A047" : T.border, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{s.filled ? (s.avatar ?? "✓") : ""}</div>)}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: T.orange }}>{gm.slots.length - filled} role{gm.slots.length - filled !== 1 ? "s" : ""} open</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>📍 {gm.dist}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, color: T.muted, alignSelf: "center" }}>›</div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 800, letterSpacing: 0.8 }}>INDIVIDUAL REQUESTS</div>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: T.text, marginBottom: 14 }}>
          {open.length > 0 ? `${open.length} Open Requests Near You` : "All caught up! No open requests 🎉"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {open.map((req, i) => {
            const cat = CATS.find(c => c.id === req.cat);
            return (
              <div key={req.id} style={{
                background: T.white, borderRadius: 20, overflow: "hidden",
                border: `1.5px solid ${req.urgent ? T.red + "33" : T.border}`,
                boxShadow: req.urgent ? "0 4px 18px rgba(255,23,68,0.1)" : "0 2px 12px rgba(255,87,34,0.05)",
                animation: `fadeUp 0.4s ${i * 0.07}s ease both`,
                opacity: 0, animationFillMode: "forwards",
              }}>
                {req.urgent && (
                  <div style={{
                    background: `linear-gradient(90deg,${T.red},#FF6D00)`,
                    padding: "6px 16px", fontSize: 10, fontWeight: 900, color: "#fff",
                    letterSpacing: 1.2, display: "flex", alignItems: "center", gap: 7,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "blink 1s ease-in-out infinite" }} />
                    URGENT
                  </div>
                )}
                {req.buddy && (
                  <div style={{ background: "linear-gradient(90deg,#FF8F00,#FFB300)", padding: "5px 16px", fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: 1.2, display: "flex", alignItems: "center", gap: 7 }}>
                    ⭐ BUDDY REQUEST · Priority Alert
                  </div>
                )}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                      background: `${cat?.color}1A`, fontSize: 20,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{cat?.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{req.user}</div>
                        <div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{req.time}</div>
                      </div>
                      <div style={{ fontSize: 12, color: T.muted, fontWeight: 600, lineHeight: 1.55, marginBottom: 10 }}>{req.msg}</div>
                      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                        <div style={{
                          fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 8,
                          background: `${cat?.color}14`, color: cat?.color,
                        }}>{cat?.label}</div>
                        <div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>📍 {req.dist}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button style={{
                      flex: 1, padding: "10px", borderRadius: 12,
                      border: `1.5px solid ${T.border}`,
                      background: T.bg, fontSize: 12, fontWeight: 800,
                      color: T.muted, cursor: "pointer",
                      fontFamily: "'Nunito',sans-serif",
                    }}>Decline</button>
                    <button
                      className="press"
                      onClick={() => setAccepted(req)}
                      style={{
                        flex: 2, padding: "10px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg,#43A047,#00897B)",
                        color: "#fff", fontSize: 12, fontWeight: 900, cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(67,160,71,0.35)",
                        fontFamily: "'Nunito',sans-serif",
                      }}
                    >✅ Accept Request</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
      {tab === "map" && <MapView onAccept={(req) => setAccepted(req)} />}
      {tab === "feed" && <CommunityFeed onBack={() => setTab("requests")} />}
      {tab === "board" && <Leaderboard onBack={() => setTab("requests")} />}
    </div>
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "min(430px, 100vw)", background: T.white, borderTop: `1px solid ${T.border}`, display: "flex", zIndex: 100, padding: "4px 0 6px", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
      {([{ id: "requests", icon: "🏠", label: "Requests" }, { id: "map", icon: "🗺️", label: "Map" }, { id: "feed", icon: "💙", label: "Community" }, { id: "board", icon: "🏆", label: "Rankings" }] as const).map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0 6px", border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "'Nunito',sans-serif" }}>
          <span style={{ fontSize: 20, opacity: tab === t.id ? 1 : 0.45 }}>{t.icon}</span>
          <span style={{ fontSize: 9, fontWeight: tab === t.id ? 900 : 700, color: tab === t.id ? "#43A047" : T.muted }}>{t.label}</span>
          {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#43A047", marginTop: 1 }} />}
        </button>
      ))}
    </div>
    </>
  );
}

export default function App() {
  type Stage = "splash" | "mode" | "user" | "helper";
  const [stage, setStage] = useState<"splash" | "mode" | "user" | "helper">("splash");
  const [showSplash, setShowSplash] = useState(true);
  const [history, setHistory] = useState<Stage[]>([]);

  const activeStage = showSplash ? "splash" : stage;

  function navigate(next: Stage) {
    setShowSplash(false);
    if (next === stage) return;
    setHistory(prev => [...prev, stage]);
    setStage(next);
  }

  function goBack() {
    setShowSplash(false);
    setHistory(prev => {
      const nextHistory = [...prev];
      const previous = nextHistory.pop();
      setStage(previous ?? "mode");
      return nextHistory;
    });
  }

  function goHome() {
    setShowSplash(false);
    setHistory([]);
    setStage("mode");
  }

  const navItems: { id: Stage; label: string; icon: string }[] = [
    { id: "mode", label: "Home", icon: "⌂" },
    { id: "user", label: "Need Help", icon: "SOS" },
    { id: "helper", label: "Helper", icon: "+" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Poppins:wght@700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 0; }
        button, input, textarea { font-family: 'Nunito', sans-serif; }

        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(0.82)} to{opacity:1;transform:scale(1)} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(55px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-110%)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideOut  { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-110%)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes ring      { 0%{transform:scale(1);opacity:0.55} 100%{transform:scale(2.2);opacity:0} }
        @keyframes pulse     { 0%,100%{transform:scale(1)} 50%{transform:scale(0.94)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes pop       { 0%{transform:scale(0);opacity:0} 65%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes progBar   { from{width:100%} to{width:0%} }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes urgentGlow{ 0%,100%{box-shadow:0 0 0 0 rgba(255,23,68,0.5)} 50%{box-shadow:0 0 0 8px rgba(255,23,68,0)} }
        @keyframes sosWave   { 0%{transform:scale(0.72);opacity:0.55} 100%{transform:scale(2.35);opacity:0} }
        @keyframes sosIconPop{ 0%{transform:scale(0.72);opacity:0} 68%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }

        .press:active { transform:scale(0.95) !important; transition:transform 0.1s !important; }

        html, body, #root {
          min-height: 100vh;
          background: #1C0A00;
        }

        body {
          overflow-x: hidden;
        }

        .app-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255,107,53,0.12), transparent 34rem),
            radial-gradient(circle at top right, rgba(0,137,123,0.12), transparent 32rem),
            #fff8f5;
          font-family: 'Nunito', sans-serif;
        }

        .app-top-nav {
          position: sticky;
          top: 0;
          z-index: 250;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 14px clamp(16px, 4vw, 42px);
          background: rgba(255, 248, 245, 0.88);
          border-bottom: 1px solid rgba(255,87,34,0.13);
          backdrop-filter: blur(18px);
        }

        .app-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
        }

        .app-brand img {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          object-fit: cover;
          background: #fff;
          box-shadow: 0 4px 14px rgba(255,87,34,0.18);
        }

        .app-brand-title {
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          font-weight: 900;
          color: #1C0A00;
          line-height: 1;
        }

        .app-brand-subtitle {
          font-size: 11px;
          font-weight: 800;
          color: #A07060;
          margin-top: 3px;
        }

        .app-nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .app-nav-button {
          border: 1px solid rgba(255,87,34,0.13);
          background: #fff;
          color: #1C0A00;
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(255,87,34,0.06);
        }

        .app-nav-button.active {
          border-color: transparent;
          background: linear-gradient(135deg,#FF6B35,#FF1744);
          color: #fff;
          box-shadow: 0 8px 22px rgba(255,87,34,0.28);
        }

        .app-nav-button.back {
          background: #fff7f2;
          color: #A07060;
        }

        .app-content {
          width: min(1120px, 100%);
          margin: 0 auto;
          min-height: calc(100vh - 67px);
          background: #FFF8F5;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 80px rgba(0,0,0,0.12);
        }

        .app-bottom-nav {
          display: none;
        }

        @media (min-width: 900px) {
          .app-content > div {
            min-height: calc(100vh - 67px) !important;
          }

          .app-content [style*="padding: 52px 22px"] {
            padding-left: 42px !important;
            padding-right: 42px !important;
          }
        }

        @media (max-width: 720px) {
          .app-top-nav {
            padding: 10px 14px;
          }

          .app-brand-title {
            font-size: 16px;
          }

          .app-brand-subtitle {
            display: none;
          }

          .app-nav-actions {
            display: none;
          }

          .app-content {
            width: 100%;
            min-height: calc(100vh - 59px);
            box-shadow: none;
          }

          .app-bottom-nav {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 300;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 4px;
            padding: 7px 8px max(7px, env(safe-area-inset-bottom));
            background: rgba(255,255,255,0.94);
            border-top: 1px solid rgba(255,87,34,0.13);
            backdrop-filter: blur(16px);
          }

          .app-bottom-nav button {
            border: none;
            background: transparent;
            border-radius: 14px;
            padding: 7px 4px;
            color: #A07060;
            font-size: 10px;
            font-weight: 900;
            cursor: pointer;
          }

          .app-bottom-nav button.active {
            background: #FFF0EB;
            color: #FF1744;
          }

          .app-bottom-nav strong {
            display: block;
            font-size: 13px;
            line-height: 1.1;
            margin-bottom: 2px;
          }
        }
      `}</style>
      <div className="app-shell">
        {!showSplash && (
          <header className="app-top-nav">
            <button className="app-brand" onClick={goHome} aria-label="Go to Responcity home">
              <img src="/responcity-logo.png" alt="" />
              <span>
                <span className="app-brand-title">Responcity</span>
                <span className="app-brand-subtitle">Help is just a tap away</span>
              </span>
            </button>

            <nav className="app-nav-actions" aria-label="Primary navigation">
              {history.length > 0 && (
                <button className="app-nav-button back" onClick={goBack}>Back</button>
              )}
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`app-nav-button ${activeStage === item.id ? "active" : ""}`}
                  onClick={() => item.id === "mode" ? goHome() : navigate(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </header>
        )}

        <main className="app-content">
          {showSplash && (
            <Splash onDone={() => { setShowSplash(false); setStage("mode"); }} />
          )}
          {stage === "mode" && <ModeSelect onSelect={m => navigate(m as "user" | "helper")} />}
          {stage === "user" && <RequesterHome onSwitch={goHome} />}
          {stage === "helper" && <HelperHome onSwitch={goHome} />}
        </main>

        {!showSplash && (
          <nav
            className="app-bottom-nav"
            aria-label="Mobile navigation"
            style={{ gridTemplateColumns: `repeat(${history.length > 0 ? 4 : 3}, 1fr)` }}
          >
            {history.length > 0 && (
              <button onClick={goBack}><strong>‹</strong>Back</button>
            )}
            {navItems.map(item => (
              <button
                key={item.id}
                className={activeStage === item.id ? "active" : ""}
                onClick={() => item.id === "mode" ? goHome() : navigate(item.id)}
              >
                <strong>{item.icon}</strong>{item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
