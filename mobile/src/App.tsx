import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  GestureResponderEvent,
  Image,
  LayoutChangeEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  Login: undefined;
  Mode: undefined;
  RequesterTabs: undefined;
  HelperTabs: undefined;
  Timeline: undefined;
  RequestDetails: { categoryId: string };
  AdminDashboard: undefined;
  Settings: undefined;
  AboutUs: undefined;
  PrivacyPolicy: undefined;
};

type Category = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
};

type Request = {
  id: string;
  user: string;
  category: string;
  message: string;
  distance: string;
  eta: string;
  urgent: boolean;
  buddy?: boolean;
  timeAgo?: string;
};

type DemoUserRole = "user" | "admin";

type DemoUser = {
  name: string;
  email: string;
  role: DemoUserRole;
};

type PendingHelpRequest = Request & {
  submittedAt: string;
  userUrgency: number;
  proofType?: ProofAsset["type"];
  locationLabel?: string;
  contactHint?: string;
  riskSignals?: string[];
  adminUrgency?: number;
  status?: "new" | "reviewing";
};

type CheckInStatus = "locked" | "ready" | "active" | "sos" | "review" | "thanks";

type EmergencySession = {
  unlocked: boolean;
  buddiesNotified: boolean;
  buddyCount: number;
  startedAt?: number;
  elapsedSeconds: number;
  status: CheckInStatus;
};

type MissionChatMessage = {
  id: number;
  from: "me" | "them" | "system";
  text: string;
};

type ProofAsset = {
  type: "photo" | "video";
  name: string;
  uri?: string;
};

type MissionHistoryItem = {
  id: string;
  category: string;
  title: string;
  date: string;
  distanceKm: number;
  points: number;
};

type PersonalActivityItem = {
  id: string;
  type: "sos" | "checkin" | "request" | "review";
  title: string;
  detail: string;
  date: string;
  status: "completed" | "active" | "cancelled";
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

type CommunityPost = {
  id: string;
  author: string;
  org?: string;
  official?: boolean;
  rating?: string;
  time: string;
  message: string;
  likes: number;
  color: string;
};

type GroupMission = {
  id: string;
  title: string;
  org: string;
  location: string;
  need: string;
  slots: string;
  urgent: boolean;
};

type LegalSection = {
  title: string;
  body: string[];
  accent?: string;
};

type AppThemeMode = "light" | "dark";

type AppThemeContextValue = {
  mode: AppThemeMode;
  isDark: boolean;
  setMode: (mode: AppThemeMode) => void;
};

type AuthContextValue = {
  user: DemoUser | null;
  login: (identifier: string, password: string) => DemoUser;
  signup: (name: string, email: string, password: string) => DemoUser;
  logout: () => void;
};

type RequestReviewContextValue = {
  pendingRequests: PendingHelpRequest[];
  approvedRequests: Request[];
  submitForReview: (request: Omit<PendingHelpRequest, "id" | "submittedAt" | "distance" | "eta" | "timeAgo">) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const emergeAidLogo = require("../assets/emerge-aid-logo-transparent-cropped.png");
const emergeAidSplash = require("../assets/emerge-aid-splash-transparent.png");
const contactEmail = "imailemergeaid@gmail.com";
const hardcodedAdmins = [
  { name: "Suhaim", email: "suhaim@emergeaid.demo", username: "suhaim", password: "Hajeeb" },
  { name: "Abdulla", email: "abdulla@emergeaid.demo", username: "abdulla", password: "Hajeeb" },
];

const AppThemeContext = createContext<AppThemeContextValue>({
  mode: "light",
  isDark: false,
  setMode: () => {},
});
const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => ({ name: "Demo User", email: "demo@emergeaid.app", role: "user" }),
  signup: () => ({ name: "Demo User", email: "demo@emergeaid.app", role: "user" }),
  logout: () => {},
});
const RequestReviewContext = createContext<RequestReviewContextValue>({
  pendingRequests: [],
  approvedRequests: [],
  submitForReview: () => {},
  approveRequest: () => {},
  rejectRequest: () => {},
});

function useAppTheme() {
  return useContext(AppThemeContext);
}

function useAuth() {
  return useContext(AuthContext);
}

function useRequestReview() {
  return useContext(RequestReviewContext);
}

const theme = {
  orange: "#FF6B35",
  red: "#FF1744",
  green: "#00A86B",
  teal: "#00897B",
  cream: "#FFF8F5",
  card: "#FFFFFF",
  text: "#1C0A00",
  muted: "#8B6F63",
  border: "rgba(255, 107, 53, 0.16)",
};

const categories: Category[] = [
  { id: "medical", label: "Medical", icon: "medical", color: "#FF1744", bg: "#FFF0F3" },
  { id: "blood", label: "Blood Donation", icon: "water", color: "#D50000", bg: "#FFF1F1" },
  { id: "accident", label: "Accident", icon: "car-sport", color: "#FF6D00", bg: "#FFF7EC" },
  { id: "lost-found", label: "Lost & Found", icon: "search", color: "#5E35B1", bg: "#F4F0FF" },
  { id: "safety", label: "Safety", icon: "shield-checkmark", color: "#C62828", bg: "#FFF0F0" },
  { id: "mental", label: "Mental", icon: "heart", color: "#7C4DFF", bg: "#F4F0FF" },
  { id: "transport", label: "Vehicle", icon: "car", color: "#1565C0", bg: "#EEF4FF" },
  { id: "home", label: "Home", icon: "home", color: "#00897B", bg: "#EAF7F4" },
];

const nearbyRequests: Request[] = [
  {
    id: "r1",
    user: "Sarah M.",
    category: "medical",
    message: "Diabetic emergency - need glucose tablets urgently",
    distance: "0.3 mi",
    eta: "2 min",
    urgent: true,
    timeAgo: "2 min ago",
  },
  {
    id: "r2",
    user: "James K.",
    category: "transport",
    message: "Flat tire on I-95, stranded with kids in car",
    distance: "1.2 mi",
    eta: "5 min",
    urgent: false,
    buddy: true,
    timeAgo: "5 min ago",
  },
  {
    id: "r3",
    user: "Maria L.",
    category: "safety",
    message: "Feeling unsafe, need escort to parking garage",
    distance: "0.7 mi",
    eta: "8 min",
    urgent: true,
    timeAgo: "8 min ago",
  },
  {
    id: "r4",
    user: "Omar H.",
    category: "blood",
    message: "Hospital patient needs O+ blood donor nearby",
    distance: "2.0 mi",
    eta: "10 min",
    urgent: false,
    timeAgo: "10 min ago",
  },
];

const alertPoolRequests: Request[] = [
  {
    id: "a1",
    user: "Nina P.",
    category: "home",
    message: "Gas smell in apartment hallway, needs nearby support",
    distance: "0.9 mi",
    eta: "4 min",
    urgent: true,
    timeAgo: "3 min ago",
  },
  {
    id: "a2",
    user: "Dev R.",
    category: "lost-found",
    message: "Lost elderly person near bus stop",
    distance: "1.6 mi",
    eta: "7 min",
    urgent: false,
    timeAgo: "6 min ago",
  },
  {
    id: "a3",
    user: "Leah T.",
    category: "mental",
    message: "Panic attack, needs a calm responder",
    distance: "2.4 mi",
    eta: "12 min",
    urgent: false,
    timeAgo: "9 min ago",
  },
];

const demoPendingRequests: PendingHelpRequest[] = [
  {
    id: "pending-medical-1",
    user: "Aisha R.",
    category: "medical",
    message: "Someone has fainted near the pharmacy and needs immediate first aid support.",
    distance: "0.5 mi",
    eta: "3 min",
    urgent: true,
    timeAgo: "1 min ago",
    submittedAt: "1 min ago",
    userUrgency: 9,
    adminUrgency: 8,
    proofType: "photo",
    locationLabel: "Near City Care Pharmacy, Oak Street",
    contactHint: "Phone verified - same device used for proof upload",
    riskSignals: ["High medical urgency", "Photo proof attached", "Nearby helpers available"],
    status: "new",
  },
  {
    id: "pending-vehicle-1",
    user: "Kiran M.",
    category: "transport",
    message: "Flat tyre on the main road, stuck with family and need help changing it.",
    distance: "1.1 mi",
    eta: "6 min",
    urgent: false,
    timeAgo: "4 min ago",
    submittedAt: "4 min ago",
    userUrgency: 6,
    adminUrgency: 5,
    proofType: "photo",
    locationLabel: "Main Road service lane, 1.1 mi from helpers",
    contactHint: "Known user - 2 previous completed requests",
    riskSignals: ["Moderate urgency", "Photo proof attached", "Not life-threatening"],
    status: "reviewing",
  },
  {
    id: "pending-home-1",
    user: "Nora S.",
    category: "home",
    message: "Gas smell in apartment corridor, need someone nearby to verify and help evacuate.",
    distance: "0.8 mi",
    eta: "5 min",
    urgent: true,
    timeAgo: "6 min ago",
    submittedAt: "6 min ago",
    userUrgency: 10,
    adminUrgency: 10,
    proofType: "video",
    locationLabel: "Apartment Block C corridor, Greenview Residency",
    contactHint: "New user - location and video proof available",
    riskSignals: ["Gas leak keywords", "Video proof attached", "Escalate if no helper accepts"],
    status: "new",
  },
];

const nearbyMissionHistory: MissionHistoryItem[] = [
  {
    id: "m1",
    category: "medical",
    title: "Assisted neighbor with diabetic emergency",
    date: "Dec 15",
    distanceKm: 0.7,
    points: 50,
  },
  {
    id: "m2",
    category: "transport",
    title: "Changed flat tyre for stranded family",
    date: "Dec 12",
    distanceKm: 1.8,
    points: 30,
  },
  {
    id: "m3",
    category: "home",
    title: "Helped elderly resident during power outage",
    date: "Dec 10",
    distanceKm: 3.2,
    points: 25,
  },
  {
    id: "m4",
    category: "safety",
    title: "Escorted neighbor safely to parking garage",
    date: "Dec 7",
    distanceKm: 4.6,
    points: 40,
  },
  {
    id: "m5",
    category: "mental",
    title: "Provided emotional support during panic episode",
    date: "Dec 3",
    distanceKm: 5.5,
    points: 35,
  },
  {
    id: "m6",
    category: "blood",
    title: "Connected O+ donor to nearby hospital",
    date: "Nov 29",
    distanceKm: 8.4,
    points: 45,
  },
  {
    id: "m7",
    category: "lost-found",
    title: "Returned lost pet to owner",
    date: "Nov 24",
    distanceKm: 12.8,
    points: 20,
  },
];

const personalActivity: PersonalActivityItem[] = [
  {
    id: "a1",
    type: "checkin",
    title: "Safe Check-In completed",
    detail: "Session ended safely. Buddies were notified.",
    date: "Today",
    status: "completed",
    icon: "shield-checkmark",
    color: theme.green,
  },
  {
    id: "a2",
    type: "request",
    title: "Medical request sent",
    detail: "Chest pain or breathing trouble - responders alerted.",
    date: "Yesterday",
    status: "completed",
    icon: "medical",
    color: theme.red,
  },
  {
    id: "a3",
    type: "sos",
    title: "SOS triggered",
    detail: "Emergency contacts and buddies received your live location.",
    date: "Dec 12",
    status: "completed",
    icon: "warning",
    color: "#E11D48",
  },
  {
    id: "a4",
    type: "review",
    title: "Review submitted",
    detail: "You rated your completed check-in experience.",
    date: "Dec 10",
    status: "completed",
    icon: "star",
    color: "#F59E0B",
  },
];

const helperOrganisation = {
  name: "Red Cross District 5",
  type: "NGO",
  role: "Verified Community Helper",
  joined: "Mar 2026",
  coordinator: "Anita Rao",
  coverage: "5.2 km active response area",
  verifiedBy: "Emerge Aid Trust Network",
};

const communityFeed: CommunityPost[] = [
  {
    id: "c1",
    author: "Jordan K.",
    org: "Red Cross",
    rating: "4.9",
    time: "2h ago",
    message: "Just helped 3 neighbors during the storm. Amazing community spirit - Emerge Aid works!",
    likes: 24,
    color: "#F45A3D",
  },
  {
    id: "c2",
    author: "Community",
    official: true,
    time: "5h ago",
    message: "District 5 helper network has reached 500 active members. Thank you all.",
    likes: 67,
    color: "#1652B7",
  },
  {
    id: "c3",
    author: "Priya S.",
    org: "St. John Ambulance",
    rating: "4.8",
    time: "8h ago",
    message: "Completed my 40th mission today. Every small act of help creates a ripple of good.",
    likes: 31,
    color: "#FF6B35",
  },
];

const communityGroupMissions: GroupMission[] = [
  {
    id: "g1",
    title: "Storm Response Team",
    org: "Red Cross District 5",
    location: "Oak Street area",
    need: "Need 4 helpers for elderly resident checks",
    slots: "2/6 joined",
    urgent: true,
  },
  {
    id: "g2",
    title: "Blood Camp Volunteers",
    org: "LifeTrust Foundation",
    location: "City Hospital",
    need: "Registration desk and donor escort support",
    slots: "5/10 joined",
    urgent: false,
  },
  {
    id: "g3",
    title: "Night Safety Escort",
    org: "SafeWalk Trust",
    location: "Metro parking zone",
    need: "Verified helpers for 8 PM - 11 PM shift",
    slots: "3/5 joined",
    urgent: false,
  },
];

const defaultEmergencySession: EmergencySession = {
  unlocked: false,
  buddiesNotified: false,
  buddyCount: 2,
  elapsedSeconds: 0,
  status: "locked",
};

const presetChatMessages = [
  "I'm on my way. Stay where you are if it is safe.",
  "Can you share exactly what you can see around you?",
  "Are you able to talk right now?",
  "Move to a brighter or more public place if you can.",
  "Keep your phone with you and do not end the session.",
  "I can see your location. I will update you every minute.",
];

const requestPresetMessagesByCategory: Record<string, string[]> = {
  medical: [
    "Medical emergency",
    "Chest pain or breathing trouble",
    "Injury or bleeding",
    "Fainted or unconscious",
    "Medicine or first-aid needed",
  ],
  transport: [
    "Vehicle breakdown",
    "Flat tyre",
    "Dead battery / jump start",
    "Minor accident assistance",
    "Need towing or roadside help",
  ],
  home: [
    "Locked out of home",
    "Water leak or flooding",
    "Power outage",
    "Gas leak or unsafe smell",
    "Urgent help at home",
  ],
  blood: [
    "Need blood urgently",
    "Specific blood group needed",
    "Hospital patient needs blood",
    "Need help contacting donors",
    "Blood donation camp volunteers",
  ],
  mental: [
    "Panic attack",
    "Need someone to talk to",
    "Emotional support needed",
    "Feeling unsafe with myself",
    "Need mental health professional nearby",
  ],
  "lost-found": [
    "Lost item",
    "Found item",
    "Lost pet",
    "Found lost child / elderly person",
  ],
  safety: [
    "I feel unsafe",
    "I am being followed",
    "Trace me with Safe Check-In",
    "Unsafe unfamiliar place",
    "Urgent safety help",
  ],
  accident: [
    "Road accident",
    "Minor accident assistance",
    "Someone is injured",
    "Need first aid",
    "Need urgent location sharing",
  ],
};

const urgencyDemoExamples: Record<string, { user: number; admin: number; example: string }> = {
  medical: { user: 8, admin: 10, example: "Chest pain with breathing trouble" },
  transport: { user: 5, admin: 4, example: "Flat tyre, parked safely off-road" },
  home: { user: 7, admin: 9, example: "Gas smell inside apartment" },
  blood: { user: 9, admin: 8, example: "O- blood needed for hospital patient" },
  mental: { user: 7, admin: 8, example: "Panic attack, alone at night" },
  "lost-found": { user: 6, admin: 9, example: "Lost child found near bus stop" },
  safety: { user: 9, admin: 10, example: "Being followed in an unsafe area" },
  accident: { user: 8, admin: 9, example: "Road accident with visible injury" },
};

const aboutSections: LegalSection[] = [
  {
    title: "Who We Are",
    body: [
      "Emerge Aid is a one-tap emergency response platform connecting people in crisis to nearby verified community responders within seconds.",
      "We are building the missing coordination layer between \"I need help\" and \"help has arrived\" - city by city, country by country.",
      "We are not a government service or a helpline. We are the network that fills the gap before official help arrives, powered by people nearby.",
    ],
    accent: "#2563EB",
  },
  {
    title: "Why We Exist",
    body: [
      "The problem is not a lack of willing helpers. It is a lack of coordination.",
      "The trained nurse two buildings away or the off-duty paramedic around the corner may never know someone needs help. Emerge Aid closes that connection gap.",
    ],
    accent: "#F97316",
  },
  {
    title: "What We Do",
    body: [
      "When you tap SOS, Emerge Aid alerts the nearest verified responder with your live location and medical profile.",
      "They accept, navigate, and arrive with live tracking. If nobody responds within 90 seconds, official emergency services can be contacted on your behalf.",
      "Tap SOS once. Location shared. Responder alerted. Track live. Help arrives.",
    ],
    accent: "#0EA5E9",
  },
  {
    title: "Who We Serve",
    body: [
      "Citizens who may need urgent help. Responders who want to make a real difference. Organizations that want better safety. Governments building smarter community emergency infrastructure.",
    ],
    accent: "#16A34A",
  },
  {
    title: "Our Vision",
    body: [
      "A world where nobody faces a crisis alone. A world where help is always seconds away.",
      "We are not building an app. We are building the emergency response infrastructure the world never had.",
    ],
    accent: "#1B2A6B",
  },
  {
    title: "Our Values",
    body: [
      "We believe in strangers: people who show up for someone they have never met.",
      "Technology serves humanity: our platform amplifies human connection, it does not replace it.",
      "Trust is earned one response at a time. Every life is worth showing up for.",
    ],
    accent: "#7C3AED",
  },
];

const privacySections: LegalSection[] = [
  {
    title: "Who We Are",
    body: [
      "Emerge Aid is operated by Emerge Aid Technologies Private Limited, registered and operating in Bengaluru, Karnataka, India.",
      "This Privacy Policy applies to citizens, verified responders, and B2B clients using our mobile app and web dashboard.",
      `Contact for privacy: ${contactEmail}.`,
    ],
  },
  {
    title: "Information We Collect",
    body: [
      "Account information such as name, mobile number, email address, and profile photo.",
      "Medical profile details such as blood group, allergies, medical conditions, medications, and emergency contacts.",
      "Real-time GPS location during active SOS events and app use, responder verification documents, incident records, device information, payment records, usage data, and support communications.",
      "Medical information, location data, and identity documents are treated as sensitive personal data.",
    ],
  },
  {
    title: "Why We Collect Data",
    body: [
      "We use data to connect citizens in distress to nearby verified responders, share critical medical profiles, enable live tracking, verify responders, auto-escalate emergencies, create incident records, process payments, improve the platform, communicate with users, and comply with law.",
      "We never sell your personal data and never use it for advertising.",
    ],
  },
  {
    title: "Location Data",
    body: [
      "During SOS events, your real-time GPS location is shared only with your assigned responder and Emerge Aid operations team for the active incident.",
      "Responder GPS data is shared with the citizen during active incidents only.",
      "We do not continuously track your location when you are not involved in an active incident.",
      "You may withdraw location permission, but SOS alerts and responder matching may stop working.",
    ],
  },
  {
    title: "Medical Data",
    body: [
      "Your medical profile is voluntary and is shared only with your assigned responder during an active SOS event.",
      "It is never used for research, advertising, insurance underwriting, or unrelated commercial purposes.",
      "You may update or delete your medical profile at any time.",
    ],
  },
  {
    title: "How We Share Data",
    body: [
      "Assigned responders receive the minimum information needed to reach and help you.",
      "Emergency services may receive location and basic incident details if an incident is escalated.",
      "Operations teams, B2B clients, legal authorities, and technology partners receive only what is necessary for safety, compliance, or platform operation.",
      "We never sell, rent, or trade personal data.",
    ],
  },
  {
    title: "Security and Retention",
    body: [
      "We use encryption, HTTPS, role-based access, two-factor admin authentication, audit logs, secure cloud infrastructure, backups, and breach response protocols.",
      "Incident records and incident-related location, audio, or video data may be retained for a minimum of 7 years for legal compliance.",
      "Payment records may be retained for 8 years for financial and tax compliance. Other records are deleted or anonymized after their retention period.",
    ],
  },
  {
    title: "Your Rights",
    body: [
      "Under Indian law, you may request access, correction, deletion, withdrawal of consent, grievance redressal, and nomination rights related to your personal data.",
      `To exercise your rights, contact ${contactEmail}. We aim to respond within 30 days.`,
    ],
  },
  {
    title: "Children, Tracking, and Third Parties",
    body: [
      "Emerge Aid is not intended for children under 18 without parent or guardian consent.",
      "The mobile app does not use browser cookies, but may use device identifiers, analytics SDKs, and crash reporting tools for app operation and improvement.",
      "Third-party services such as cloud hosting, maps, payments, and messaging are used only as needed to operate the platform.",
    ],
  },
];

function categoryFor(id: string) {
  return categories.find(cat => cat.id === id) ?? categories[0];
}

function Screen({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <SafeAreaView style={[styles.safe, dark && styles.safeDark]}>{children}</SafeAreaView>;
}

function BrandHeader({ mode, onSwitch }: { mode?: string; onSwitch?: () => void }) {
  return (
    <LinearGradient colors={[theme.orange, theme.red]} style={styles.hero}>
      <View style={styles.heroRow}>
        <View style={styles.logoMark}>
          <Image source={emergeAidLogo} style={styles.logoImage} />
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.brand}>Emerge Aid</Text>
          <Text style={styles.tagline}>Help is just a tap away</Text>
          {mode ? <Text style={styles.modeLabel}>{mode}</Text> : null}
        </View>
        {onSwitch ? (
          <Pressable style={styles.switchButton} onPress={onSwitch}>
            <Text style={styles.switchText}>Switch</Text>
          </Pressable>
        ) : null}
      </View>
    </LinearGradient>
  );
}

function ModeScreen({ navigation }: any) {
  const { isDark } = useAppTheme();
  const { user } = useAuth();

  return (
    <Screen dark={isDark}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Pressable style={({ pressed }) => [styles.homeSettingsButton, isDark && styles.homeSettingsButtonDark, pressed && styles.categoryPressed]} onPress={() => navigation.navigate("Settings")}>
        <Ionicons name="settings-outline" size={22} color={isDark ? "#E5EEFF" : "#1B2A6B"} />
      </Pressable>
      <View style={[styles.homeContent, isDark && styles.homeContentDark]}>
        <Image source={emergeAidLogo} style={styles.homeLogo} />
        <Text style={[styles.homeTitle, isDark && styles.homeTitleDark]}>How can Emerge Aid help?</Text>
        <Text style={[styles.homeSubtitle, isDark && styles.homeSubtitleDark]}>Community emergency assistance - available now</Text>
        <ModeCard
          title="I Need Help"
          subtitle="Request emergency assistance from nearby helpers"
          icon="medkit"
          colors={["#FF5A3D", "#E71933"]}
          onPress={() => navigation.navigate("RequesterTabs")}
        />
        <ModeCard
          title="I Can Help"
          subtitle="Respond to requests from people in need nearby"
          icon="hand-left"
          colors={["#1BA3F7", "#1652B7"]}
          onPress={() => navigation.navigate("HelperTabs")}
        />
        {user?.role === "admin" ? (
          <ModeCard
            title="Admin Review"
            subtitle="Approve help requests before they appear to helpers"
            icon="shield-checkmark"
            colors={["#14213D", "#0B67D1"]}
            onPress={() => navigation.navigate("AdminDashboard")}
          />
        ) : null}
        <View style={[styles.homeStatsCard, isDark && styles.homeStatsCardDark]}>
          <HomeStat icon="people" value="2,841" label="Helpers" />
          <HomeStat icon="checkmark-done-circle" value="14,920" label="Missions" />
          <HomeStat icon="navigate" value="80 km" label="Coverage" />
        </View>
      </View>
    </Screen>
  );
}

function ModeCard({
  title,
  subtitle,
  icon,
  colors,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.modeCardPress, pressed && styles.pressed]}>
      <LinearGradient colors={colors} style={styles.modeCard}>
        <View style={styles.modeIcon}>
          <Ionicons name={icon} size={34} color="#fff" />
        </View>
        <View style={styles.modeCopy}>
          <Text style={styles.modeCardTitle}>{title}</Text>
          <Text style={styles.modeCardSub}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.75)" />
      </LinearGradient>
    </Pressable>
  );
}

function HomeStat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  const { isDark } = useAppTheme();

  return (
    <View style={styles.homeStat}>
      <Ionicons name={icon} size={17} color={theme.teal} />
      <Text style={[styles.homeStatValue, isDark && styles.homeStatValueDark]}>{value}</Text>
      <Text style={[styles.homeStatLabel, isDark && styles.homeStatLabelDark]}>{label}</Text>
    </View>
  );
}

function RequesterTabs({ navigation, route }: any) {
  const [session, setSession] = useState<EmergencySession>(defaultEmergencySession);
  const lastUnlockToken = useRef<number | null>(null);

  function unlockCheckIn() {
    setSession({
      unlocked: true,
      buddiesNotified: true,
      buddyCount: 2,
      elapsedSeconds: 0,
      status: "ready",
    });
  }

  useEffect(() => {
    const token = route.params?.unlockCheckInToken;
    if (typeof token === "number" && lastUnlockToken.current !== token) {
      lastUnlockToken.current = token;
      unlockCheckIn();
      navigation.navigate("Check In");
    }
  }, [navigation, route.params?.unlockCheckInToken]);

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="Home"
        options={{ tabBarIcon: tabIcon("home") }}
      >
        {props => <RequesterHome {...props} rootNavigation={navigation} onEmergencyRequest={unlockCheckIn} />}
      </Tab.Screen>
      <Tab.Screen
        name="Check In"
        options={{ tabBarIcon: tabIcon("checkmark-circle") }}
      >
        {props => <SafeCheckIn {...props} session={session} setSession={setSession} />}
      </Tab.Screen>
      <Tab.Screen name="Activity" component={MissionHistoryScreen} options={{ tabBarIcon: tabIcon("pulse") }} />
    </Tab.Navigator>
  );
}

function HelperTabs({ navigation }: any) {
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="Requests"
        component={HelperHome}
        initialParams={{ rootNavigation: navigation }}
        options={{ tabBarIcon: tabIcon("radio") }}
      />
      <Tab.Screen name="Community" component={ResponderMap} options={{ tabBarIcon: tabIcon("people") }} />
      <Tab.Screen name="Rankings" component={ResponderStats} options={{ tabBarIcon: tabIcon("trophy") }} />
    </Tab.Navigator>
  );
}

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => <Ionicons name={name} color={color} size={size} />;
}

const tabOptions = {
  headerShown: false,
  tabBarActiveTintColor: theme.red,
  tabBarInactiveTintColor: "#6B7280",
  tabBarStyle: {
    height: 70,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderTopColor: "rgba(22, 82, 183, 0.08)",
    borderTopWidth: 1,
    shadowColor: "#14213D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -5 },
    elevation: 12,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: "800" as const,
  },
};

function RequesterHome({ navigation, route, rootNavigation: providedRootNavigation, onEmergencyRequest }: any) {
  const [locationStatus, setLocationStatus] = useState("Location not shared yet");
  const [sosLaunching, setSosLaunching] = useState(false);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState(5);
  const rootNavigation = providedRootNavigation ?? route.params?.rootNavigation ?? navigation;
  const radarPulse = useRef(new Animated.Value(0)).current;
  const launchPulse = useRef(new Animated.Value(0)).current;
  const launchIconScale = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(radarPulse, {
          toValue: 1,
          duration: 1900,
          useNativeDriver: true,
        }),
        Animated.timing(radarPulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [radarPulse]);

  useEffect(() => {
    if (!sosLaunching) {
      launchPulse.setValue(0);
      launchIconScale.setValue(0.72);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(launchPulse, {
          toValue: 1,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(launchPulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.spring(launchIconScale, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [launchIconScale, launchPulse, sosLaunching]);

  const radarScale = radarPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });
  const radarOpacity = radarPulse.interpolate({
    inputRange: [0, 0.72, 1],
    outputRange: [0.34, 0.16, 0],
  });

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationStatus("Location permission denied");
      return;
    }
    const position = await Location.getCurrentPositionAsync({});
    setLocationStatus(`Shared: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
  }

  async function sendSos() {
    if (sosLaunching) return;
    setSosLaunching(true);
    await requestLocation();
    onEmergencyRequest?.();
    setTimeout(() => {
      setSosLaunching(false);
      navigation.navigate("Check In");
    }, 1850);
  }

  const launchPulseScale = launchPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 2.45],
  });
  const launchPulseOpacity = launchPulse.interpolate({
    inputRange: [0, 0.62, 1],
    outputRange: [0.42, 0.18, 0],
  });
  const homeNearbyMissions = nearbyMissionHistory.filter(mission => mission.distanceKm <= nearbyRadiusKm);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <RequesterHeader onSwitch={() => rootNavigation.navigate("Mode")} />
        <View style={styles.sosWrap}>
          <Text style={styles.sosPrompt}>Press the button for immediate help</Text>
          <View style={styles.sosRadarStage}>
            <Animated.View
              pointerEvents="none"
              style={[styles.sosRadarRing, { opacity: radarOpacity, transform: [{ scale: radarScale }] }]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.sosRadarRing,
                styles.sosRadarRingDelay,
                {
                  opacity: radarOpacity,
                  transform: [
                    {
                      scale: radarPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.42, 0.78],
                      }),
                    },
                  ],
                },
              ]}
            />
            {sosLaunching ? (
              <>
                <Animated.View pointerEvents="none" style={[styles.sosButtonLaunchRing, { opacity: launchPulseOpacity, transform: [{ scale: launchPulseScale }] }]} />
                <Animated.View pointerEvents="none" style={[styles.sosButtonLaunchRing, styles.sosButtonLaunchRingSmall, { opacity: launchPulseOpacity, transform: [{ scale: launchPulseScale }] }]} />
              </>
            ) : null}
            <Pressable style={({ pressed }) => [styles.sosButton, pressed && styles.pressed]} onPress={sendSos}>
              <LinearGradient colors={[theme.orange, theme.red]} style={styles.sosGradient}>
                {sosLaunching ? (
                  <Animated.View style={{ alignItems: "center", transform: [{ scale: launchIconScale }] }}>
                    <Ionicons name="radio" size={35} color="#fff" />
                    <Text style={styles.sosSmallText}>Sending</Text>
                  </Animated.View>
                ) : (
                  <>
                    <Text style={styles.sosText}>SOS</Text>
                    <Text style={styles.sosSmallText}>Press for help</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>
          <Text style={styles.locationText}>{locationStatus}</Text>
        </View>

        <View style={styles.requestSectionHeader}>
          <Text style={styles.requestSectionTitle}>Request Specific Help</Text>
          <View style={styles.termsPill}>
            <Text style={styles.termsText}>T&C</Text>
          </View>
        </View>
        <Text style={styles.requestSectionSub}>
          Tap a category - you'll be asked for photo/video proof and a description
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [
                styles.categoryCard,
                { backgroundColor: cat.bg, borderColor: "rgba(17, 24, 39, 0.06)" },
                pressed && styles.categoryPressed,
              ]}
              onPress={() => {
                rootNavigation.navigate("RequestDetails", { categoryId: cat.id });
              }}
            >
              <Ionicons name={cat.icon} size={25} color={cat.color} />
              <Text style={[styles.categoryText, { color: cat.color }]}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.buddiesTitle}>My Buddies</Text>
        <View style={styles.buddyCard}>
          <View style={styles.buddyAvatar}>
            <Text style={styles.buddyInitial}>J</Text>
            <View style={styles.buddyOnline} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function RequestDetailsScreen({ navigation, route }: any) {
  const category = categoryFor(route.params?.categoryId ?? "medical");
  const { submitForReview } = useRequestReview();
  const categoryPresets = requestPresetMessagesByCategory[category.id] ?? requestPresetMessagesByCategory.safety;
  const [selectedPreset, setSelectedPreset] = useState("");
  const [moreDetails, setMoreDetails] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [proofAsset, setProofAsset] = useState<ProofAsset | null>(null);
  const [userUrgency, setUserUrgency] = useState(0);
  const [urgencyTrackWidth, setUrgencyTrackWidth] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [customMessageOpen, setCustomMessageOpen] = useState(false);
  const [requestLaunching, setRequestLaunching] = useState(false);
  const requestLaunchPulse = useRef(new Animated.Value(0)).current;
  const requestLaunchIconScale = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    if (!requestLaunching) {
      requestLaunchPulse.setValue(0);
      requestLaunchIconScale.setValue(0.72);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(requestLaunchPulse, {
          toValue: 1,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(requestLaunchPulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.spring(requestLaunchIconScale, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [requestLaunchIconScale, requestLaunchPulse, requestLaunching]);

  const requestPulseScale = requestLaunchPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 2.45],
  });
  const requestPulseOpacity = requestLaunchPulse.interpolate({
    inputRange: [0, 0.62, 1],
    outputRange: [0.42, 0.18, 0],
  });

  function submitRequest() {
    submitForReview({
      user: "Demo User",
      category: category.id,
      message: finalDescription,
      urgent: userUrgency >= 8,
      buddy: false,
      userUrgency,
      proofType: proofAsset?.type,
    });
    setRequestLaunching(true);
    setTimeout(() => {
      setRequestLaunching(false);
      navigation.navigate("RequesterTabs", { unlockCheckInToken: Date.now() });
    }, 1850);
  }

  function pickProof() {
    Alert.alert("Add proof", "Open camera for a photo or video.", [
      { text: "Photo", onPress: () => openCamera("photo") },
      { text: "Video", onPress: () => openCamera("video") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function openCamera(type: "photo" | "video") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission needed", "Allow camera access to capture emergency proof.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: type === "video" ? ["videos"] : ["images"],
      allowsEditing: false,
      quality: 0.72,
      videoMaxDuration: 30,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setProofAsset({
        type,
        uri: asset.uri,
        name: asset.fileName ?? (type === "video" ? "Emergency video captured" : "Emergency photo captured"),
      });
    }
  }

  const finalDescription = customMessageOpen
    ? customDescription.trim()
    : [selectedPreset, moreDetails.trim()].filter(Boolean).join(" - ");
  const canSubmit = confirmed && userUrgency > 0 && finalDescription.length > 0 && (customMessageOpen || moreDetails.trim().length > 0);
  const charCount = customMessageOpen
    ? customDescription.length
    : selectedPreset.length + (moreDetails.trim().length > 0 ? 3 + moreDetails.length : moreDetails.length);
  const urgencyExample = urgencyDemoExamples[category.id] ?? urgencyDemoExamples.safety;

  function updateUrgencyFromTouch(event: GestureResponderEvent) {
    if (urgencyTrackWidth <= 0) return;
    const x = Math.max(0, Math.min(event.nativeEvent.locationX, urgencyTrackWidth));
    const nextValue = Math.max(1, Math.min(10, Math.round((x / urgencyTrackWidth) * 9 + 1)));
    setUserUrgency(nextValue);
  }

  function handleUrgencyTrackLayout(event: LayoutChangeEvent) {
    setUrgencyTrackWidth(event.nativeEvent.layout.width);
  }

  return (
    <Screen>
      {requestLaunching ? (
        <View style={styles.sosLaunchOverlay}>
          <Animated.View pointerEvents="none" style={[styles.sosLaunchRing, { opacity: requestPulseOpacity, transform: [{ scale: requestPulseScale }] }]} />
          <Animated.View pointerEvents="none" style={[styles.sosLaunchRing, styles.sosLaunchRingSmall, { opacity: requestPulseOpacity, transform: [{ scale: requestPulseScale }] }]} />
          <Animated.View style={[styles.sosLaunchIcon, { transform: [{ scale: requestLaunchIconScale }] }]}>
            <Ionicons name="radio" size={58} color="#fff" />
          </Animated.View>
          <Text style={styles.sosLaunchTitle}>Sending SOS...</Text>
          <Text style={styles.sosLaunchSub}>Notifying your selected buddies and preparing Safe Check-In.</Text>
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.detailScroll}>
        <RequesterHeader onSwitch={() => navigation.navigate("Mode")} />
        <View style={styles.detailSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.detailTopRow}>
            <View style={[styles.detailCategoryPill, { backgroundColor: category.bg }]}>
              <Ionicons name={category.icon} size={21} color={category.color} />
              <Text style={[styles.detailCategoryText, { color: category.color }]}>{category.label} Request</Text>
            </View>
            <Pressable style={styles.detailCloseButton} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={19} color="#6B7280" />
            </Pressable>
          </View>

          <Text style={styles.detailLabel}>Photo or Video Proof <Text style={styles.required}>*</Text></Text>
          <Text style={styles.detailHelp}>Take a direct photo or short video (max 30s) to verify your emergency.</Text>

          <View style={styles.proofBox}>
            <Ionicons name={proofAsset ? "checkmark-circle" : "camera-outline"} size={34} color={proofAsset ? theme.green : "#9CA3AF"} />
            <Text style={styles.proofText}>{proofAsset ? "Proof added" : "Add a photo or video as proof"}</Text>
            {proofAsset ? (
              <View style={styles.proofSelectedPill}>
                <Ionicons name={proofAsset.type === "video" ? "videocam" : "image"} size={16} color="#1652B7" />
                <Text style={styles.proofSelectedText} numberOfLines={1}>
                  {proofAsset.name}
                </Text>
              </View>
            ) : null}
            <Pressable style={({ pressed }) => [styles.proofButton, styles.mediaButton, pressed && styles.categoryPressed]} onPress={pickProof}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.proofButtonText}>{proofAsset ? "Change Proof" : "Add Photo or Video"}</Text>
            </Pressable>
          </View>

          <Text style={styles.detailLabel}>Describe Your Situation <Text style={styles.required}>*</Text></Text>
          <Text style={styles.presetHint}>Choose a preset or write your own.</Text>
          <View style={styles.requestPresetGrid}>
            {categoryPresets.map(message => (
              <Pressable
                key={message}
                style={({ pressed }) => [
                  styles.requestPresetChip,
                  !customMessageOpen && selectedPreset === message && styles.requestPresetChipSelected,
                  pressed && styles.categoryPressed,
                ]}
                onPress={() => {
                  setSelectedPreset(message);
                  setCustomMessageOpen(false);
                  setCustomDescription("");
                }}
              >
                <Text style={[styles.requestPresetText, !customMessageOpen && selectedPreset === message && styles.requestPresetTextSelected]}>{message}</Text>
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [styles.requestCustomChip, customMessageOpen && styles.requestCustomChipSelected, pressed && styles.categoryPressed]}
              onPress={() => {
                setCustomMessageOpen(value => {
                  const next = !value;
                  if (next) {
                    setSelectedPreset("");
                    setMoreDetails("");
                  }
                  return next;
                });
              }}
            >
              <View style={styles.requestCustomIcon}>
                <Ionicons name="create-outline" size={17} color={customMessageOpen ? "#fff" : "#1652B7"} />
              </View>
              <View style={styles.requestCustomCopy}>
                <Text style={[styles.requestCustomText, customMessageOpen && styles.requestPresetTextSelected]}>Custom message</Text>
                <Text style={[styles.requestCustomSub, customMessageOpen && styles.requestCustomSubSelected]}>Write details in your own words</Text>
              </View>
              <Ionicons name={customMessageOpen ? "chevron-up" : "chevron-down"} size={18} color={customMessageOpen ? "#fff" : "#64748B"} />
            </Pressable>
          </View>
          {customMessageOpen ? (
            <View style={styles.customRequestBox}>
              <TextInput
                value={customDescription}
                onChangeText={setCustomDescription}
                multiline
                maxLength={300}
                placeholder="Type your custom emergency message..."
                placeholderTextColor="#8B95A1"
                style={styles.detailInput}
              />
            </View>
          ) : selectedPreset ? (
            <View style={styles.describeMoreBox}>
              <View style={styles.selectedPresetBox}>
                <Ionicons name="checkmark-circle" size={18} color="#1652B7" />
                <Text style={styles.selectedPresetText}>{selectedPreset}</Text>
              </View>
              <Text style={styles.describeMoreLabel}>Describe more <Text style={styles.required}>*</Text></Text>
              <TextInput
                value={moreDetails}
                onChangeText={setMoreDetails}
                multiline
                maxLength={220}
                placeholder={detailPlaceholderFor(category.id)}
                placeholderTextColor="#8B95A1"
                style={styles.describeMoreInput}
              />
            </View>
          ) : null}
          <Text style={styles.charCount}>{charCount}/300</Text>

          <Text style={styles.detailLabel}>How urgent is it? <Text style={styles.required}>*</Text></Text>
          <Text style={styles.presetHint}>Your rating helps triage faster. Admin will review and finalize urgency.</Text>
          <View style={styles.urgencySliderCard}>
            <View style={styles.urgencyValueRow}>
              <Text style={styles.urgencyValueLabel}>User urgency</Text>
              <Text style={styles.urgencyValue}>{userUrgency > 0 ? `${userUrgency}/10` : "Set level"}</Text>
            </View>
            <View
              style={styles.urgencySliderTrack}
              onLayout={handleUrgencyTrackLayout}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={updateUrgencyFromTouch}
              onResponderMove={updateUrgencyFromTouch}
            >
              <View style={[styles.urgencySliderFill, { width: `${userUrgency > 0 ? ((userUrgency - 1) / 9) * 100 : 0}%` }]} />
              <View style={[styles.urgencySliderThumb, { left: `${userUrgency > 0 ? ((userUrgency - 1) / 9) * 100 : 0}%` }]} />
            </View>
            <View style={styles.urgencySliderLabels}>
              <Text style={styles.urgencySliderLabel}>1 Low</Text>
              <Text style={styles.urgencySliderLabel}>10 Critical</Text>
            </View>
          </View>
          <View style={styles.urgencyReviewCard}>
            <View style={styles.urgencyReviewHeader}>
              <Ionicons name="shield-checkmark" size={17} color="#1652B7" />
              <Text style={styles.urgencyReviewTitle}>Admin finalizes urgency</Text>
            </View>
            <Text style={styles.urgencyReviewText}>
              Demo: {urgencyExample.example}
            </Text>
            <View style={styles.urgencyReviewRow}>
              <View style={styles.urgencyReviewPill}>
                <Text style={styles.urgencyReviewPillLabel}>User</Text>
                <Text style={styles.urgencyReviewPillValue}>{urgencyExample.user}/10</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#64748B" />
              <View style={[styles.urgencyReviewPill, styles.urgencyReviewAdminPill]}>
                <Text style={styles.urgencyReviewPillLabel}>Admin</Text>
                <Text style={styles.urgencyReviewPillValue}>{urgencyExample.admin}/10</Text>
              </View>
            </View>
          </View>

          <Pressable style={styles.confirmBox} onPress={() => setConfirmed(value => !value)}>
            <View style={[styles.checkboxBox, confirmed && styles.checkboxChecked]}>
              {confirmed ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}
            </View>
            <View style={styles.confirmCopy}>
              <Text style={styles.confirmText}>
                This is <Text style={styles.confirmStrong}>NOT a fake request.</Text> I understand that submitting false
                emergencies is a violation and admin may take action against my account.
              </Text>
              <Text style={styles.termsLink}>View full Terms &amp; Conditions -&gt;</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.requestHelpButton,
              !canSubmit && styles.requestHelpButtonDisabled,
              pressed && canSubmit && styles.pressed,
            ]}
            disabled={!canSubmit}
            onPress={submitRequest}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.requestHelpButtonText}>Request Help</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function RequesterHeader({ onSwitch }: { onSwitch: () => void }) {
  return (
    <LinearGradient colors={["#FF5A3D", "#E71933"]} style={styles.requesterHeader}>
      <View style={styles.requesterHeaderLogo}>
        <Image source={emergeAidLogo} style={styles.requesterHeaderLogoImage} />
      </View>
      <View style={styles.requesterHeaderCopy}>
        <Text style={styles.requesterEyebrow}>REQUESTER MODE</Text>
        <Text style={styles.requesterTitle}>Need Help?</Text>
      </View>
      <Pressable style={styles.headerIconButton}>
        <Ionicons name="notifications-outline" size={18} color="#fff" />
      </Pressable>
      <Pressable style={styles.headerSwitchButton} onPress={onSwitch}>
        <Ionicons name="swap-horizontal" size={16} color="#fff" />
        <Text style={styles.headerSwitchText}>Switch</Text>
      </Pressable>
    </LinearGradient>
  );
}

function TimelineScreen({ navigation }: any) {
  const steps = [
    ["SOS sent", "Your request and location were shared."],
    ["Responders alerted", "3 verified helpers nearby received the alert."],
    ["Helper accepted", "Dr. Sarah M. is on the way."],
    ["Emergency services backup", "Auto-escalation stays ready if needed."],
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={[theme.red, "#C62828"]} style={styles.timelineHero}>
          <Ionicons name="pulse" color="#fff" size={56} />
          <Text style={styles.timelineTitle}>Help is on the way</Text>
          <Text style={styles.timelineSub}>Estimated arrival: 3 minutes</Text>
        </LinearGradient>

        {steps.map(([title, sub], index) => (
          <View key={title} style={styles.timelineStep}>
            <View style={styles.timelineDot}>
              <Text style={styles.timelineDotText}>{index + 1}</Text>
            </View>
            <View style={styles.timelineCopy}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSub}>{sub}</Text>
            </View>
          </View>
        ))}

        <Pressable style={styles.safeButton} onPress={() => navigation.navigate("RequesterTabs")}>
          <Text style={styles.safeButtonText}>I'm safe - close alert</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function SafeCheckIn({
  session,
  setSession,
}: {
  session: EmergencySession;
  setSession: React.Dispatch<React.SetStateAction<EmergencySession>>;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sosAnimationDone, setSosAnimationDone] = useState(false);
  const sosPulse = useRef(new Animated.Value(0)).current;
  const sosIconScale = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    if (session.status !== "active" || !session.startedAt) return;
    const timer = setInterval(() => {
      setSession(current =>
        current.status === "active" && current.startedAt
          ? { ...current, elapsedSeconds: Math.max(0, Math.floor((Date.now() - current.startedAt) / 1000)) }
          : current,
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [session.status, session.startedAt, setSession]);

  useEffect(() => {
    if (session.status !== "sos") {
      setSosAnimationDone(false);
      sosPulse.setValue(0);
      sosIconScale.setValue(0.72);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulse, {
          toValue: 1,
          duration: 760,
          useNativeDriver: true,
        }),
        Animated.timing(sosPulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.spring(sosIconScale, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
    pulseLoop.start();

    const doneTimer = setTimeout(() => setSosAnimationDone(true), 1700);
    return () => {
      pulseLoop.stop();
      clearTimeout(doneTimer);
    };
  }, [session.status, sosIconScale, sosPulse]);

  function startSession() {
    setSession(current => ({
      ...current,
      status: "active",
      startedAt: Date.now(),
      elapsedSeconds: 0,
    }));
  }

  function endSession() {
    setSession(current => ({ ...current, status: "review" }));
  }

  function triggerSos() {
    setSession(current => ({ ...current, status: "sos" }));
    setSosAnimationDone(false);
    Alert.alert("SOS triggered", "Emergency contacts and selected buddies were alerted with your live location.");
  }

  function submitReview() {
    setSession(current => ({ ...current, status: "thanks" }));
    setRating(0);
    setComment("");
  }

  if (!session.unlocked || session.status === "locked") {
    return (
      <Screen>
        <View style={styles.checkInCenter}>
          <View style={styles.checkIconSoft}>
            <Ionicons name="lock-closed" size={34} color="#1652B7" />
          </View>
          <Text style={styles.checkTitle}>Safe Check-In locked</Text>
          <Text style={styles.checkSub}>
            Send an emergency request first. Once your selected buddies are notified, this page becomes available for live tracing.
          </Text>
        </View>
      </Screen>
    );
  }

  if (session.status === "active") {
    return (
      <Screen>
        <View style={styles.activeHeader}>
          <Text style={styles.activeEyebrow}>● SESSION ACTIVE</Text>
          <Text style={styles.activeTitle}>You're being monitored</Text>
          <Text style={styles.activeSub}>End the session when you're safe</Text>
        </View>
        <View style={styles.checkBody}>
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>SESSION TIME</Text>
            <Text style={styles.timerValue}>{formatElapsed(session.elapsedSeconds)}</Text>
            <Text style={styles.timerCaption}>minutes elapsed</Text>
          </View>
          <View style={styles.buddyNotice}>
            <Ionicons name="people" size={18} color="#2E7D32" />
            <Text style={styles.buddyNoticeText}>{session.buddyCount} buddies are watching your session</Text>
          </View>
          <Pressable style={[styles.checkAction, styles.safeEndAction]} onPress={endSession}>
            <Ionicons name="shield-checkmark" size={19} color="#fff" />
            <Text style={styles.checkActionText}>I'm Safe - End Session</Text>
          </Pressable>
          <Pressable style={[styles.checkAction, styles.sosAction]} onPress={triggerSos}>
            <Ionicons name="warning" size={19} color="#fff" />
            <Text style={styles.checkActionText}>EMERGENCY - Trigger SOS</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (session.status === "review") {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.checkReview}>
          <View style={styles.checkIconSuccess}>
            <Ionicons name="shield-checkmark" size={34} color={theme.green} />
          </View>
          <Text style={styles.checkTitle}>Session Complete!</Text>
          <Text style={styles.checkSub}>Session lasted {formatElapsed(session.elapsedSeconds)}. How would you rate your experience with Emerge Aid?</Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Rate your overall experience</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(value => (
                <Pressable key={value} onPress={() => setRating(value)}>
                  <Ionicons name={rating >= value ? "person" : "person-outline"} size={30} color={rating >= value ? theme.green : "#9CA3AF"} />
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Leave a comment (optional)</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              multiline
              placeholder="Tell us how it went..."
              placeholderTextColor="#8B95A1"
              style={styles.reviewInput}
            />
          </View>
          <Pressable style={[styles.submitReviewButton, rating === 0 && styles.submitReviewDisabled]} disabled={rating === 0} onPress={submitReview}>
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.submitReviewText}>Submit Review</Text>
          </Pressable>
          <Pressable onPress={submitReview}>
            <Text style={styles.skipReview}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </Screen>
    );
  }

  if (session.status === "sos") {
    const pulseScale = sosPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.82, 2.4],
    });
    const pulseOpacity = sosPulse.interpolate({
      inputRange: [0, 0.65, 1],
      outputRange: [0.42, 0.18, 0],
    });

    return (
      <Screen>
        <View style={styles.sosTriggeredScreen}>
          <Animated.View pointerEvents="none" style={[styles.sosPulseRing, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
          <Animated.View pointerEvents="none" style={[styles.sosPulseRing, styles.sosPulseRingDelay, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
          <Animated.View style={[styles.sosTriggeredIcon, { transform: [{ scale: sosIconScale }] }]}>
            <Ionicons name={sosAnimationDone ? "warning-outline" : "radio"} size={58} color="#fff" />
          </Animated.View>
          <Text style={styles.sosTriggeredTitle}>{sosAnimationDone ? "SOS Triggered!" : "Sending SOS..."}</Text>
          <Text style={styles.sosTriggeredSub}>
            {sosAnimationDone
              ? "Buddy helpers and emergency contacts are being notified now."
              : "Sharing your live location with selected buddies and emergency contacts."}
          </Text>
        </View>
      </Screen>
    );
  }

  if (session.status === "thanks") {
    return (
      <Screen>
        <View style={styles.checkInCenter}>
          <Ionicons name="shield-checkmark" size={54} color={theme.green} />
          <Text style={[styles.checkTitle, { color: "#2E7D32" }]}>Thank you!</Text>
          <Text style={[styles.checkSub, { color: "#2E7D32" }]}>Your review has been submitted. Stay safe!</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.checkIntro}>
        <View style={styles.checkIconSoft}>
          <Ionicons name="shield-checkmark" size={38} color="#1652B7" />
        </View>
        <Text style={styles.checkTitle}>Safe Check-In</Text>
        <Text style={styles.checkSub}>
          Activate before meeting someone new or entering an unfamiliar place. Your session stays active until you end it. If you trigger SOS, your buddies and emergency contacts are alerted instantly.
        </Text>
        {session.buddiesNotified ? (
          <View style={styles.buddyNotice}>
            <Ionicons name="notifications" size={18} color="#2E7D32" />
            <Text style={styles.buddyNoticeText}>{session.buddyCount} selected buddies notified and ready to trace you</Text>
          </View>
        ) : null}
        <Pressable style={styles.startCheckButton} onPress={startSession}>
          <Ionicons name="shield-checkmark" size={19} color="#fff" />
          <Text style={styles.startCheckText}>Start Safe Check-In</Text>
        </Pressable>
        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>HOW IT WORKS</Text>
          {[
            "Session runs until you manually end it",
            "No auto-trigger - you stay in control",
            "Buddy helpers are notified only if you press SOS",
            "Emergency contacts alerted on SOS",
            "Rate your experience when the mission ends",
          ].map((line, index) => (
            <View key={line} style={styles.howRow}>
              <Ionicons name={index < 2 ? "shield-checkmark-outline" : index < 4 ? "warning-outline" : "star-outline"} size={16} color={index < 2 ? theme.green : index < 4 ? theme.red : "#7C4DFF"} />
              <Text style={styles.howText}>{line}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function detailPlaceholderFor(categoryId: string) {
  switch (categoryId) {
    case "medical":
      return "Add symptoms, age if relevant, medicine needed, and exact location...";
    case "transport":
      return "Add vehicle type, road/location, whether you are safe, and what help is needed...";
    case "home":
      return "Add address details, who can access it, and what makes it urgent...";
    case "blood":
      return "Add blood group, hospital, patient name/ward, units needed, and contact number...";
    case "mental":
      return "Add what is happening, whether you are alone, and what kind of support you need...";
    case "lost-found":
      return "Add item/person/pet description, last seen location, time, and contact details...";
    default:
      return "Add exact location, what happened, who is with you, and what help you need...";
  }
}

function EmergencyContacts() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandHeader mode="Emergency contacts" />
        <InfoCard title="Primary contact" lines={["Ayaan S.", "+91 90000 00000", "Receives SMS and location during SOS"]} />
        <InfoCard title="Official escalation" lines={["India emergency: 112", "Ambulance: 108", "Auto-escalates if no responder accepts"]} />
      </ScrollView>
    </Screen>
  );
}

function MissionHistoryScreen() {
  const radiusOptions = [1, 3, 5, 10, 25];
  const [radiusKm, setRadiusKm] = useState(5);
  const visibleMissions = nearbyMissionHistory.filter(mission => mission.distanceKm <= radiusKm);
  const totalPoints = visibleMissions.reduce((sum, mission) => sum + mission.points, 0);
  const streak = Math.min(7, Math.max(1, visibleMissions.length));

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.activityScroll}>
        <Text style={styles.activityTitle}>Activity</Text>

        <View style={styles.activityStatsCard}>
          <ActivityStat icon="checkmark-done" value={String(visibleMissions.length)} label="Missions" color={theme.green} />
          <ActivityStat icon="leaf" value={String(totalPoints)} label="Points" color={theme.orange} />
          <ActivityStat icon="flame" value={String(streak)} label="Day Streak" color={theme.red} />
        </View>

        <View style={styles.radiusCard}>
          <View style={styles.radiusHeader}>
            <View>
              <Text style={styles.radiusTitle}>Nearby radius</Text>
              <Text style={styles.radiusSub}>Showing missions within {radiusKm} km</Text>
            </View>
            <View style={styles.radiusBadge}>
              <Text style={styles.radiusBadgeText}>{radiusKm} km</Text>
            </View>
          </View>
          <View style={styles.radiusOptions}>
            {radiusOptions.map(option => (
              <Pressable
                key={option}
                style={({ pressed }) => [
                  styles.radiusChip,
                  radiusKm === option && styles.radiusChipActive,
                  pressed && styles.categoryPressed,
                ]}
                onPress={() => setRadiusKm(option)}
              >
                <Text style={[styles.radiusChipText, radiusKm === option && styles.radiusChipTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.activitySectionHeader}>
          <Text style={styles.activitySectionTitle}>Mission History</Text>
          <Text style={styles.activitySectionMeta}>{visibleMissions.length} nearby</Text>
        </View>

        {visibleMissions.length > 0 ? (
          visibleMissions.map(mission => <MissionHistoryCard key={mission.id} mission={mission} />)
        ) : (
          <View style={styles.emptyHistoryCard}>
            <Ionicons name="map-outline" size={28} color="#94A3B8" />
            <Text style={styles.emptyHistoryTitle}>No missions in this radius</Text>
            <Text style={styles.emptyHistorySub}>Increase the radius to view more nearby activity.</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function ActivityStat({ icon, value, label, color }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; color: string }) {
  return (
    <View style={styles.activityStat}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.activityStatValue}>{value}</Text>
      <Text style={styles.activityStatLabel}>{label}</Text>
    </View>
  );
}

function MissionHistoryCard({ mission }: { mission: MissionHistoryItem }) {
  const category = categoryFor(mission.category);
  return (
    <View style={styles.missionHistoryCard}>
      <View style={[styles.missionHistoryIcon, { backgroundColor: category.bg }]}>
        <Ionicons name={category.icon} size={22} color={category.color} />
      </View>
      <View style={styles.missionHistoryCopy}>
        <Text style={[styles.missionHistoryCategory, { color: category.color }]}>{category.label.toUpperCase()}</Text>
        <Text style={styles.missionHistoryTitle}>{mission.title}</Text>
        <Text style={styles.missionHistoryMeta}>{mission.date} - {mission.distanceKm.toFixed(1)} km away</Text>
      </View>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsValue}>+{mission.points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );
}

function HelperHome({ navigation, route }: any) {
  const rootNavigation = route.params?.rootNavigation ?? navigation;
  const { approvedRequests } = useRequestReview();
  const [activeChatRequest, setActiveChatRequest] = useState<Request | null>(null);
  const [helperTab, setHelperTab] = useState<"open" | "emergency">("open");
  const emergencyPulse = useRef(new Animated.Value(0)).current;

  function acceptRequest(req: Request) {
    setActiveChatRequest(req);
  }

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(emergencyPulse, {
          toValue: 1,
          duration: 760,
          useNativeDriver: true,
        }),
        Animated.timing(emergencyPulse, {
          toValue: 0,
          duration: 760,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [emergencyPulse]);

  if (activeChatRequest) {
    return <MissionChat request={activeChatRequest} onBack={() => setActiveChatRequest(null)} />;
  }

  const openRequests = [...approvedRequests, ...nearbyRequests];
  const activeRequests = helperTab === "open" ? openRequests : alertPoolRequests;
  const dotOpacity = emergencyPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });
  const dotRingScale = emergencyPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 2.35],
  });
  const dotRingOpacity = emergencyPulse.interpolate({
    inputRange: [0, 0.65, 1],
    outputRange: [0.6, 0.22, 0],
  });

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={
          <>
            <LinearGradient colors={["#0B67D1", "#0857B6"]} style={styles.helperHero}>
              <View style={styles.helperHeroTop}>
                <View style={styles.helperLogoBox}>
                  <Image source={emergeAidLogo} style={styles.helperLogoImage} />
                </View>
                <View style={styles.helperHeroCopy}>
                  <Text style={styles.helperEyebrow}>HELPER MODE</Text>
                  <Text style={styles.helperHeroTitle}>Ready to Help?</Text>
                </View>
                <Pressable style={styles.helperSwitchButton} onPress={() => rootNavigation.navigate("Mode")}>
                  <Ionicons name="swap-horizontal" size={16} color="#fff" />
                  <Text style={styles.helperSwitchText}>Switch</Text>
                </Pressable>
              </View>

              <View style={styles.helperSegment}>
                <Pressable
                  style={[styles.helperSegmentButton, helperTab === "open" && styles.helperSegmentActive]}
                  onPress={() => setHelperTab("open")}
                >
                  <Text style={[styles.helperSegmentText, helperTab === "open" && styles.helperSegmentTextActive]}>
                    Open Requests ({openRequests.length})
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.helperSegmentButton, helperTab === "emergency" && styles.helperSegmentActive]}
                  onPress={() => setHelperTab("emergency")}
                >
                  <View style={styles.helperEmergencyLabel}>
                    <View style={styles.emergencyPulseWrap}>
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.emergencyPulseRing,
                          { opacity: dotRingOpacity, transform: [{ scale: dotRingScale }] },
                        ]}
                      />
                      <Animated.View style={[styles.emergencyBlinkDot, { opacity: dotOpacity }]} />
                    </View>
                    <Text style={[styles.helperSegmentText, helperTab === "emergency" && styles.helperSegmentTextActive]}>
                      Emergency ({alertPoolRequests.length})
                    </Text>
                  </View>
                </Pressable>
              </View>
            </LinearGradient>

            <View style={styles.helperListHeader}>
              <Text style={styles.helperListTitle}>{helperTab === "open" ? "Open Requests" : "Emergency Requests"}</Text>
              <Text style={styles.helperListSub}>{helperTab === "open" ? "People nearby asking for help" : "Highest urgency alerts near you"}</Text>
            </View>
          </>
        }
        data={activeRequests}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.helperListContent}
        renderItem={({ item }) => <HelperRequestCard request={item} onAccept={() => acceptRequest(item)} />}
      />
    </Screen>
  );
}

function HelperRequestCard({ request, onAccept }: { request: Request; onAccept: () => void }) {
  const cat = categoryFor(request.category);
  return (
    <View style={[styles.requestCard, { borderLeftColor: cat.color }, request.urgent && styles.urgentCard]}>
      {request.buddy ? (
        <View style={styles.buddyRequestBadge}>
          <Ionicons name="star" size={12} color="#B45309" />
          <Text style={styles.buddyRequestText}>BUDDY REQUEST</Text>
        </View>
      ) : null}
      <View style={styles.requestRow}>
        <View style={[styles.requestIcon, { backgroundColor: cat.bg }]}>
          <Ionicons name={cat.icon} color={cat.color} size={24} />
        </View>
        <View style={styles.requestCopy}>
          <View style={styles.requestNameRow}>
            <Text style={styles.requestUserName}>{request.user}</Text>
            {request.urgent ? (
              <View style={styles.urgentPill}>
                <Text style={styles.urgentPillText}>URGENT</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.requestCategoryText, { color: cat.color }]}>{cat.label.toUpperCase()}</Text>
          <Text style={styles.requestMessage}>{request.message}</Text>
          <Text style={styles.metaText}>{request.distance} - {request.timeAgo ?? request.eta}</Text>
        </View>
      </View>
      <Pressable style={styles.acceptButton} onPress={onAccept}>
        <Text style={styles.acceptButtonText}>I Can Help</Text>
      </Pressable>
    </View>
  );
}

function MissionChat({ request, onBack }: { request: Request; onBack: () => void }) {
  const [messages, setMessages] = useState<MissionChatMessage[]>([
    { id: 1, from: "system", text: `Mission accepted. ETA ${request.eta}.` },
    { id: 2, from: "them", text: request.message },
  ]);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState("");

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(current => [...current, { id: Date.now(), from: "me", text: trimmed }]);
    setCustomText("");
    setCustomOpen(false);
  }

  return (
    <Screen>
      <View style={styles.chatScreen}>
        <LinearGradient colors={["#1652B7", "#2F75C8"]} style={styles.chatHeader}>
          <Pressable style={styles.chatBackButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarText}>{request.user.slice(0, 1)}</Text>
          </View>
          <View style={styles.chatHeaderCopy}>
            <Text style={styles.chatTitle}>{request.user}</Text>
            <Text style={styles.chatSub}>{request.distance} away - live mission chat</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.chatMessages} contentContainerStyle={styles.chatMessagesContent}>
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.chatBubble,
                message.from === "me" && styles.chatBubbleMe,
                message.from === "system" && styles.chatBubbleSystem,
              ]}
            >
              <Text
                style={[
                  styles.chatBubbleText,
                  message.from === "me" && styles.chatBubbleTextMe,
                  message.from === "system" && styles.chatBubbleTextSystem,
                ]}
              >
                {message.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.presetPanel}>
          <Text style={styles.presetTitle}>Quick messages</Text>
          <View style={styles.presetGrid}>
            {presetChatMessages.map(message => (
              <Pressable key={message} style={({ pressed }) => [styles.presetChip, pressed && styles.categoryPressed]} onPress={() => sendMessage(message)}>
                <Text style={styles.presetChipText}>{message}</Text>
              </Pressable>
            ))}
            <Pressable style={({ pressed }) => [styles.customChip, pressed && styles.categoryPressed]} onPress={() => setCustomOpen(value => !value)}>
              <Ionicons name="create-outline" size={17} color="#1652B7" />
              <Text style={styles.customChipText}>Custom message</Text>
            </Pressable>
          </View>

          {customOpen ? (
            <View style={styles.customMessageBox}>
              <TextInput
                value={customText}
                onChangeText={setCustomText}
                placeholder="Type a custom update..."
                placeholderTextColor="#8B95A1"
                style={styles.customMessageInput}
                multiline
              />
              <Pressable
                style={[styles.customSendButton, customText.trim().length === 0 && styles.customSendDisabled]}
                disabled={customText.trim().length === 0}
                onPress={() => sendMessage(customText)}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

function RequestCard({ request, onAccept }: { request: Request; onAccept: () => void }) {
  const cat = categoryFor(request.category);
  return (
    <View style={[styles.requestCard, request.urgent && styles.urgentCard]}>
      {request.urgent ? <Text style={styles.urgentLabel}>URGENT</Text> : null}
      <View style={styles.requestRow}>
        <View style={[styles.requestIcon, { backgroundColor: cat.bg }]}>
          <Ionicons name={cat.icon} color={cat.color} size={24} />
        </View>
        <View style={styles.requestCopy}>
          <Text style={styles.cardTitle}>{request.user}</Text>
          <Text style={styles.cardSub}>{request.message}</Text>
          <Text style={styles.metaText}>{request.distance} • ETA {request.eta}</Text>
        </View>
      </View>
      <Pressable style={styles.acceptButton} onPress={onAccept}>
        <Text style={styles.acceptButtonText}>Accept mission</Text>
      </Pressable>
    </View>
  );
}

function ResponderMap() {
  const [communityTab, setCommunityTab] = useState<"feed" | "groups">("feed");

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.communityScroll}>
        <Text style={styles.communityTitle}>Community</Text>

        <View style={styles.communitySlider}>
          <View style={[styles.communitySliderThumb, communityTab === "groups" && styles.communitySliderThumbRight]} />
          <Pressable style={styles.communitySliderOption} onPress={() => setCommunityTab("feed")}>
            <Text style={[styles.communitySliderText, communityTab === "feed" && styles.communitySliderTextActive]}>Feed</Text>
          </Pressable>
          <Pressable style={styles.communitySliderOption} onPress={() => setCommunityTab("groups")}>
            <Text style={[styles.communitySliderText, communityTab === "groups" && styles.communitySliderTextActive]}>Group Missions</Text>
          </Pressable>
        </View>

        <View style={styles.orgInfoCard}>
          <View style={styles.orgInfoHeader}>
            <View style={styles.orgMark}>
              <Ionicons name="ribbon" size={24} color="#1652B7" />
            </View>
            <View style={styles.orgInfoCopy}>
              <Text style={styles.orgName}>{helperOrganisation.name}</Text>
              <Text style={styles.orgRole}>{helperOrganisation.role}</Text>
            </View>
            <View style={styles.orgTypePill}>
              <Text style={styles.orgTypeText}>{helperOrganisation.type}</Text>
            </View>
          </View>
          <View style={styles.orgMetaGrid}>
            <OrgMeta icon="calendar" label="Joined" value={helperOrganisation.joined} />
            <OrgMeta icon="person" label="Coordinator" value={helperOrganisation.coordinator} />
            <OrgMeta icon="navigate" label="Coverage" value={helperOrganisation.coverage} />
            <OrgMeta icon="shield-checkmark" label="Verified by" value={helperOrganisation.verifiedBy} />
          </View>
        </View>

        {communityTab === "feed" ? (
          <>
            <View style={styles.communityTrustCard}>
              <CommunityTrustLine icon="shield-checkmark" text="Verified by NGO, NPO, trust or trusted organisation" />
              <CommunityTrustLine icon="star" text="Community helper rating and mission reputation shown" />
            </View>
            {communityFeed.map(post => <CommunityPostCard key={post.id} post={post} />)}
          </>
        ) : (
          <>
            {communityGroupMissions.map(mission => <GroupMissionCard key={mission.id} mission={mission} />)}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function OrgMeta({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.orgMetaItem}>
      <Ionicons name={icon} size={15} color="#1652B7" />
      <Text style={styles.orgMetaLabel}>{label}</Text>
      <Text style={styles.orgMetaValue}>{value}</Text>
    </View>
  );
}

function CommunityTrustLine({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.communityTrustLine}>
      <Ionicons name={icon} size={16} color="#1652B7" />
      <Text style={styles.communityTrustText}>{text}</Text>
    </View>
  );
}

function CommunityPostCard({ post }: { post: CommunityPost }) {
  return (
    <View style={styles.communityPostCard}>
      <View style={styles.communityPostHeader}>
        <View style={[styles.communityAvatar, { backgroundColor: post.color }]}>
          <Text style={styles.communityAvatarText}>{post.author.slice(0, 1)}</Text>
        </View>
        <View style={styles.communityPostCopy}>
          <View style={styles.communityNameRow}>
            <Text style={styles.communityAuthor}>{post.author}</Text>
            {post.rating ? <Text style={styles.communityRating}>★ {post.rating}</Text> : null}
          </View>
          <Text style={styles.communityTime}>{post.time}</Text>
          {post.org ? (
            <View style={styles.communityOrgPill}>
              <Ionicons name="ribbon" size={12} color="#1652B7" />
              <Text style={styles.communityOrgText}>{post.org}</Text>
            </View>
          ) : null}
        </View>
        {post.official ? (
          <View style={styles.officialPill}>
            <Text style={styles.officialText}>Official</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.communityMessage}>{post.message}</Text>
      <View style={styles.communityLikeRow}>
        <Ionicons name="heart-outline" size={16} color="#64748B" />
        <Text style={styles.communityLikes}>{post.likes}</Text>
      </View>
    </View>
  );
}

function GroupMissionCard({ mission }: { mission: GroupMission }) {
  return (
    <View style={[styles.groupMissionCard, mission.urgent && styles.groupMissionUrgent]}>
      <View style={styles.groupMissionHeader}>
        <View style={styles.groupMissionIcon}>
          <Ionicons name="people" size={22} color="#1652B7" />
        </View>
        <View style={styles.groupMissionCopy}>
          <View style={styles.communityNameRow}>
            <Text style={styles.groupMissionTitle}>{mission.title}</Text>
            {mission.urgent ? (
              <View style={styles.urgentPill}>
                <Text style={styles.urgentPillText}>URGENT</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.groupMissionOrg}>{mission.org}</Text>
        </View>
      </View>
      <Text style={styles.groupMissionNeed}>{mission.need}</Text>
      <View style={styles.groupMissionFooter}>
        <Text style={styles.groupMissionMeta}>{mission.location}</Text>
        <Text style={styles.groupMissionSlots}>{mission.slots}</Text>
      </View>
    </View>
  );
}

function ResponderStats() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandHeader mode="Responder stats" />
        <InfoCard title="This week" lines={["Missions helped: 8", "Average response: 3.6 minutes", "Rating: 4.9/5"]} />
        <InfoCard title="Badges" lines={["Fast responder", "Verified first aid", "Community helper"]} />
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      {lines.map(line => (
        <Text key={line} style={styles.cardSub}>{line}</Text>
      ))}
    </View>
  );
}

function LegalScreen({
  navigation,
  title,
  subtitle,
  sections,
  updated,
}: {
  navigation: any;
  title: string;
  subtitle: string;
  sections: LegalSection[];
  updated?: string;
}) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.legalScroll}>
        <LinearGradient colors={["#EFF6FF", "#ECFEFF"]} style={styles.legalHero}>
          <Pressable style={styles.legalBackButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#1B2A6B" />
          </Pressable>
          <Image source={emergeAidSplash} style={styles.legalLogo} />
          <Text style={styles.legalEyebrow}>Emerge Aid</Text>
          <Text style={styles.legalTitle}>{title}</Text>
          <Text style={styles.legalSubtitle}>{subtitle}</Text>
        </LinearGradient>

        {sections.map((section, index) => (
          <View key={section.title} style={styles.legalCard}>
            <View style={[styles.legalAccent, { backgroundColor: section.accent ?? "#2563EB" }]} />
            <View style={styles.legalCardHeader}>
              <Text style={styles.legalNumber}>{String(index + 1).padStart(2, "0")}</Text>
              <Text style={styles.legalSectionTitle}>{section.title}</Text>
            </View>
            {section.body.map(paragraph => (
              <Text key={paragraph} style={styles.legalParagraph}>{paragraph}</Text>
            ))}
          </View>
        ))}

        <View style={styles.legalFooter}>
          <Text style={styles.legalFooterTitle}>Emerge Aid</Text>
          <Text style={styles.legalFooterText}>Help is just a tap away</Text>
          <Text style={styles.legalFooterEmail}>{contactEmail}</Text>
          {updated ? <Text style={styles.legalUpdated}>{updated}</Text> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function AboutUsScreen({ navigation }: any) {
  return (
    <LegalScreen
      navigation={navigation}
      title="About Us"
      subtitle="A community-powered emergency response platform connecting people in crisis to nearby verified helpers with a single tap."
      sections={aboutSections}
    />
  );
}

function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <LegalScreen
      navigation={navigation}
      title="Privacy Policy"
      subtitle="How Emerge Aid collects, uses, protects, and shares data while operating emergency response services."
      sections={privacySections}
      updated="Effective January 1, 2025 - Emerge Aid Technologies Private Limited"
    />
  );
}

function LoginScreen({ navigation }: any) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function continueWith(user: DemoUser) {
    navigation.reset({
      index: 0,
      routes: [{ name: "Mode" }],
    });
  }

  function submitAuth() {
    const cleanIdentifier = identifier.trim();
    const cleanName = name.trim();
    if (!cleanIdentifier || !password.trim() || (mode === "signup" && !cleanName)) {
      Alert.alert("Missing details", mode === "signup" ? "Enter your name, email, and password." : "Enter username/email and password.");
      return;
    }

    const user = mode === "signup"
      ? signup(cleanName, cleanIdentifier, password)
      : login(cleanIdentifier, password);
    continueWith(user);
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.authScroll}>
        <Image source={emergeAidLogo} style={styles.authLogo} />
        <Text style={styles.authTitle}>Welcome to Emerge Aid</Text>
        <Text style={styles.authSub}>Sign in to request help, respond nearby, or review emergency posts.</Text>

        <View style={styles.authCard}>
          <View style={styles.authModeSwitch}>
            <Pressable style={[styles.authModeButton, mode === "login" && styles.authModeButtonActive]} onPress={() => setMode("login")}>
              <Text style={[styles.authModeText, mode === "login" && styles.authModeTextActive]}>Login</Text>
            </Pressable>
            <Pressable style={[styles.authModeButton, mode === "signup" && styles.authModeButtonActive]} onPress={() => setMode("signup")}>
              <Text style={[styles.authModeText, mode === "signup" && styles.authModeTextActive]}>Sign Up</Text>
            </Pressable>
          </View>

          {mode === "signup" ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor="#8B95A1"
              style={styles.authInput}
            />
          ) : null}
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Username or email"
            placeholderTextColor="#8B95A1"
            style={styles.authInput}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#8B95A1"
            style={styles.authInput}
          />

          <Pressable style={styles.authSubmitButton} onPress={submitAuth}>
            <Text style={styles.authSubmitText}>{mode === "signup" ? "Create Demo Account" : "Login"}</Text>
          </Pressable>

        </View>
      </ScrollView>
    </Screen>
  );
}

function AdminDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { pendingRequests, approveRequest, rejectRequest } = useRequestReview();
  const [filter, setFilter] = useState<"all" | "critical" | "proof">("all");
  const [expandedId, setExpandedId] = useState<string | null>(pendingRequests[0]?.id ?? null);
  const [adminUrgencyById, setAdminUrgencyById] = useState<Record<string, number>>({});
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  function leaveAdmin() {
    logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  const visibleRequests = pendingRequests.filter(request => {
    if (filter === "critical") return request.userUrgency >= 8 || request.urgent;
    if (filter === "proof") return Boolean(request.proofType);
    return true;
  });
  const criticalCount = pendingRequests.filter(request => request.userUrgency >= 8 || request.urgent).length;
  const proofCount = pendingRequests.filter(request => Boolean(request.proofType)).length;

  function updateAdminUrgency(id: string, delta: number, fallback: number) {
    setAdminUrgencyById(current => {
      const currentValue = current[id] ?? fallback;
      return { ...current, [id]: Math.max(1, Math.min(10, currentValue + delta)) };
    });
  }

  function publishRequest(item: PendingHelpRequest) {
    const adminUrgency = adminUrgencyById[item.id] ?? item.adminUrgency ?? item.userUrgency;
    Alert.alert("Publish request?", `Admin urgency will be set to ${adminUrgency}/10 and helpers will see this request.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Publish", onPress: () => approveRequest(item.id) },
    ]);
  }

  function declineRequest(item: PendingHelpRequest) {
    Alert.alert("Reject request?", "This removes the request from admin review for this demo.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reject", style: "destructive", onPress: () => rejectRequest(item.id) },
    ]);
  }

  return (
    <Screen>
      <StatusBar style="light" />
      <FlatList
        ListHeaderComponent={
          <>
            <LinearGradient colors={["#14213D", "#0B67D1"]} style={styles.adminHero}>
              <View style={styles.adminHeroTop}>
                <View>
                  <Text style={styles.adminEyebrow}>ADMIN REVIEW</Text>
                  <Text style={styles.adminTitle}>Verify Help Requests</Text>
                  <Text style={styles.adminSub}>{user?.name ?? "Admin"} approves posts before helpers see them.</Text>
                </View>
                <Pressable style={styles.adminLogoutButton} onPress={leaveAdmin}>
                  <Ionicons name="log-out-outline" size={18} color="#fff" />
                </Pressable>
              </View>
            </LinearGradient>
            <View style={styles.adminSummaryGrid}>
              <AdminMetric icon="time" value={String(pendingRequests.length)} label="Pending" color="#1652B7" />
              <AdminMetric icon="flame" value={String(criticalCount)} label="Critical" color="#E11D48" />
              <AdminMetric icon="camera" value={String(proofCount)} label="With proof" color="#059669" />
            </View>
            <View style={styles.adminFilterRow}>
              <AdminFilterChip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
              <AdminFilterChip label="Critical" active={filter === "critical"} onPress={() => setFilter("critical")} />
              <AdminFilterChip label="Proof attached" active={filter === "proof"} onPress={() => setFilter("proof")} />
            </View>
          </>
        }
        data={visibleRequests}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.adminList}
        ListEmptyComponent={
          <View style={styles.adminEmptyCard}>
            <Ionicons name="checkmark-done-circle" size={34} color={theme.green} />
            <Text style={styles.adminEmptyTitle}>No pending requests</Text>
            <Text style={styles.adminEmptySub}>New help requests will appear here before going live.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cat = categoryFor(item.category);
          const expanded = expandedId === item.id;
          const adminUrgency = adminUrgencyById[item.id] ?? item.adminUrgency ?? item.userUrgency;
          const note = notesById[item.id] ?? "";
          return (
            <View style={styles.adminRequestCard}>
              <Pressable style={styles.adminRequestHeader} onPress={() => setExpandedId(expanded ? null : item.id)}>
                <View style={[styles.adminRequestIcon, { backgroundColor: cat.bg }]}>
                  <Ionicons name={cat.icon} size={22} color={cat.color} />
                </View>
                <View style={styles.adminRequestCopy}>
                  <View style={styles.adminRequestTitleRow}>
                    <Text style={styles.adminRequestUser}>{item.user}</Text>
                    <View style={[styles.adminStatusPill, item.status === "new" && styles.adminStatusPillNew]}>
                      <Text style={[styles.adminStatusText, item.status === "new" && styles.adminStatusTextNew]}>{item.status === "new" ? "NEW" : "REVIEWING"}</Text>
                    </View>
                  </View>
                  <Text style={[styles.adminRequestCategory, { color: cat.color }]}>{cat.label.toUpperCase()} - user urgency {item.userUrgency}/10</Text>
                </View>
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
              </Pressable>
              <Text style={styles.adminRequestMessage}>{item.message}</Text>
              <View style={styles.adminQuickFacts}>
                <AdminFact icon="location" text={item.locationLabel ?? item.distance} />
                <AdminFact icon={item.proofType === "video" ? "videocam" : "camera"} text={item.proofType ? `${item.proofType} proof` : "No proof"} />
                <AdminFact icon="time" text={item.submittedAt} />
              </View>
              {expanded ? (
                <View style={styles.adminDeepPanel}>
                  <Text style={styles.adminPanelTitle}>Verification checklist</Text>
                  <View style={styles.adminChecklist}>
                    <AdminCheck label="Proof file attached" passed={Boolean(item.proofType)} />
                    <AdminCheck label="Location available" passed={Boolean(item.locationLabel)} />
                    <AdminCheck label="Requester contact verified" passed={Boolean(item.contactHint)} />
                  </View>
                  <Text style={styles.adminPanelTitle}>Signals</Text>
                  <View style={styles.adminSignalWrap}>
                    {(item.riskSignals ?? ["Review details before publishing"]).map(signal => (
                      <View key={signal} style={styles.adminSignalPill}>
                        <Text style={styles.adminSignalText}>{signal}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.adminPanelTitle}>Admin urgency decision</Text>
                  <View style={styles.adminUrgencyControl}>
                    <Pressable style={styles.adminUrgencyButton} onPress={() => updateAdminUrgency(item.id, -1, adminUrgency)}>
                      <Ionicons name="remove" size={18} color="#1652B7" />
                    </Pressable>
                    <View style={styles.adminUrgencyReadout}>
                      <Text style={styles.adminUrgencyValue}>{adminUrgency}/10</Text>
                      <Text style={styles.adminUrgencySub}>Final urgency</Text>
                    </View>
                    <Pressable style={styles.adminUrgencyButton} onPress={() => updateAdminUrgency(item.id, 1, adminUrgency)}>
                      <Ionicons name="add" size={18} color="#1652B7" />
                    </Pressable>
                  </View>
                  <TextInput
                    value={note}
                    onChangeText={text => setNotesById(current => ({ ...current, [item.id]: text }))}
                    multiline
                    placeholder="Admin note for demo review..."
                    placeholderTextColor="#94A3B8"
                    style={styles.adminNoteInput}
                  />
                  <Text style={styles.adminRequestMeta}>{item.contactHint ?? "Contact verification unavailable"}</Text>
                </View>
              ) : null}
              <View style={styles.adminActionRow}>
                <Pressable style={[styles.adminActionButton, styles.adminRejectButton]} onPress={() => declineRequest(item)}>
                  <Text style={styles.adminRejectText}>Reject</Text>
                </Pressable>
                <Pressable style={[styles.adminActionButton, styles.adminApproveButton]} onPress={() => publishRequest(item)}>
                  <Text style={styles.adminApproveText}>Approve & Publish</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </Screen>
  );
}

function AdminMetric({ icon, value, label, color }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; color: string }) {
  return (
    <View style={styles.adminMetricCard}>
      <Ionicons name={icon} size={19} color={color} />
      <Text style={styles.adminMetricValue}>{value}</Text>
      <Text style={styles.adminMetricLabel}>{label}</Text>
    </View>
  );
}

function AdminFilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.adminFilterChip, active && styles.adminFilterChipActive]} onPress={onPress}>
      <Text style={[styles.adminFilterText, active && styles.adminFilterTextActive]}>{label}</Text>
    </Pressable>
  );
}

function AdminFact({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.adminFact}>
      <Ionicons name={icon} size={13} color="#64748B" />
      <Text style={styles.adminFactText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

function AdminCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <View style={styles.adminCheckRow}>
      <Ionicons name={passed ? "checkmark-circle" : "alert-circle"} size={17} color={passed ? "#059669" : "#E11D48"} />
      <Text style={styles.adminCheckText}>{label}</Text>
    </View>
  );
}

function SettingsScreen({ navigation }: any) {
  const { isDark, setMode } = useAppTheme();
  const { logout } = useAuth();

  function signOut() {
    logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  return (
    <Screen dark={isDark}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={[styles.settingsScroll, isDark && styles.settingsScrollDark]}>
        <View style={styles.settingsHeader}>
          <Pressable style={({ pressed }) => [styles.settingsBackButton, isDark && styles.settingsBackButtonDark, pressed && styles.categoryPressed]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={isDark ? "#E5EEFF" : "#1B2A6B"} />
          </Pressable>
          <View>
            <Text style={[styles.settingsEyebrow, isDark && styles.settingsEyebrowDark]}>EMERGE AID</Text>
            <Text style={[styles.settingsTitle, isDark && styles.settingsTitleDark]}>Settings</Text>
          </View>
        </View>

        <View style={[styles.settingsCard, isDark && styles.settingsCardDark]}>
          <View style={styles.settingsRow}>
            <View style={[styles.settingsIconBox, isDark && styles.settingsIconBoxDark]}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={isDark ? "#93C5FD" : "#F97316"} />
            </View>
            <View style={styles.settingsRowCopy}>
              <Text style={[styles.settingsRowTitle, isDark && styles.settingsRowTitleDark]}>{isDark ? "Dark mode" : "Light mode"}</Text>
              <Text style={[styles.settingsRowSub, isDark && styles.settingsRowSubDark]}>Choose the app appearance for this device.</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={value => setMode(value ? "dark" : "light")}
              trackColor={{ false: "#CBD5E1", true: "#1D4ED8" }}
              thumbColor={isDark ? "#FFFFFF" : "#F8FAFC"}
            />
          </View>
        </View>

        <View style={[styles.settingsCard, isDark && styles.settingsCardDark]}>
          <SettingsLink
            icon="information-circle"
            title="About Us"
            subtitle="Learn what Emerge Aid is building."
            dark={isDark}
            onPress={() => navigation.navigate("AboutUs")}
          />
          <View style={[styles.settingsDivider, isDark && styles.settingsDividerDark]} />
          <SettingsLink
            icon="shield-checkmark"
            title="Privacy Policy"
            subtitle="How emergency and account data is handled."
            dark={isDark}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          />
        </View>

        <View style={[styles.settingsContactCard, isDark && styles.settingsContactCardDark]}>
          <Ionicons name="mail" size={22} color={isDark ? "#93C5FD" : "#1652B7"} />
          <Text style={[styles.settingsContactTitle, isDark && styles.settingsContactTitleDark]}>Contact Emerge Aid</Text>
          <Text style={[styles.settingsContactText, isDark && styles.settingsContactTextDark]}>
            For business enquiries, suggestions, feedback, partnerships, or app support, contact us at:
          </Text>
          <Text style={styles.settingsContactEmail}>{contactEmail}</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.settingsLogoutButton, pressed && styles.categoryPressed]} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color="#E11D48" />
          <Text style={styles.settingsLogoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function SettingsLink({
  icon,
  title,
  subtitle,
  dark,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  dark: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.settingsLink, pressed && styles.categoryPressed]} onPress={onPress}>
      <View style={[styles.settingsIconBox, dark && styles.settingsIconBoxDark]}>
        <Ionicons name={icon} size={20} color={dark ? "#93C5FD" : "#1652B7"} />
      </View>
      <View style={styles.settingsRowCopy}>
        <Text style={[styles.settingsRowTitle, dark && styles.settingsRowTitleDark]}>{title}</Text>
        <Text style={[styles.settingsRowSub, dark && styles.settingsRowSubDark]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={dark ? "#64748B" : "#94A3B8"} />
    </Pressable>
  );
}

export default function App() {
  const [showStartup, setShowStartup] = useState(true);
  const [themeMode, setThemeMode] = useState<AppThemeMode>("light");
  const [user, setUser] = useState<DemoUser | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingHelpRequest[]>(demoPendingRequests);
  const [approvedRequests, setApprovedRequests] = useState<Request[]>([]);
  const isDark = themeMode === "dark";

  useEffect(() => {
    const timeout = setTimeout(() => setShowStartup(false), 1400);
    return () => clearTimeout(timeout);
  }, []);

  if (showStartup) {
    return <StartupScreen />;
  }

  function login(identifier: string, password: string) {
    const cleanIdentifier = identifier.trim().toLowerCase();
    const admin = hardcodedAdmins.find(
      account => (account.email.toLowerCase() === cleanIdentifier || account.username.toLowerCase() === cleanIdentifier) && account.password === password,
    );
    const nextUser: DemoUser = admin
      ? { name: admin.name, email: admin.email, role: "admin" }
      : { name: cleanIdentifier.includes("@") ? cleanIdentifier.split("@")[0] : cleanIdentifier, email: cleanIdentifier, role: "user" };
    setUser(nextUser);
    return nextUser;
  }

  function signup(name: string, email: string, _password: string) {
    const nextUser: DemoUser = { name: name.trim(), email: email.trim().toLowerCase(), role: "user" };
    setUser(nextUser);
    return nextUser;
  }

  function logout() {
    setUser(null);
  }

  function submitForReview(request: Omit<PendingHelpRequest, "id" | "submittedAt" | "distance" | "eta" | "timeAgo">) {
    const pendingRequest: PendingHelpRequest = {
      ...request,
      id: `demo-${Date.now()}`,
      distance: "0.4 mi",
      eta: "3 min",
      timeAgo: "just now",
      submittedAt: "just now",
    };
    setPendingRequests(current => [pendingRequest, ...current]);
  }

  function approveRequest(id: string) {
    setPendingRequests(current => {
      const approved = current.find(item => item.id === id);
      if (!approved) return current;
      setApprovedRequests(existing => [
        {
          id: approved.id,
          user: approved.user,
          category: approved.category,
          message: approved.message,
          distance: approved.distance,
          eta: approved.eta,
          urgent: approved.urgent,
          buddy: approved.buddy,
          timeAgo: "approved now",
        },
        ...existing,
      ]);
      return current.filter(item => item.id !== id);
    });
  }

  function rejectRequest(id: string) {
    setPendingRequests(current => current.filter(item => item.id !== id));
  }

  return (
    <AppThemeContext.Provider value={{ mode: themeMode, isDark, setMode: setThemeMode }}>
      <AuthContext.Provider value={{ user, login, signup, logout }}>
        <RequestReviewContext.Provider value={{ pendingRequests, approvedRequests, submitForReview, approveRequest, rejectRequest }}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Mode" component={ModeScreen} />
              <Stack.Screen name="RequesterTabs" component={RequesterTabs} />
              <Stack.Screen name="HelperTabs" component={HelperTabs} />
              <Stack.Screen name="Timeline" component={TimelineScreen} />
              <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="AboutUs" component={AboutUsScreen} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </RequestReviewContext.Provider>
      </AuthContext.Provider>
    </AppThemeContext.Provider>
  );
}

function StartupScreen() {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, [logoAnim, pulseAnim]);

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  });
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.78, 1.25],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.22, 0.1, 0],
  });

  return (
    <SafeAreaView style={styles.startupScreen}>
      <StatusBar style="dark" />
      <Animated.View
        pointerEvents="none"
        style={[styles.startupPulse, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]}
      />
      <Animated.View style={[styles.startupLogoShell, { opacity: logoAnim, transform: [{ scale: logoScale }] }]}>
        <Image source={emergeAidSplash} style={styles.startupLogo} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  startupScreen: {
    flex: 1,
    backgroundColor: "#FAFCFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  startupPulse: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(22, 82, 183, 0.16)",
  },
  startupLogoShell: {
    width: 188,
    height: 188,
    borderRadius: 48,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  startupLogo: {
    width: 190,
    height: 190,
    resizeMode: "contain",
  },
  safe: {
    flex: 1,
    backgroundColor: "#FAFCFF",
  },
  safeDark: {
    backgroundColor: "#08111F",
  },
  scroll: {
    paddingBottom: 28,
  },
  listContent: {
    paddingBottom: 28,
  },
  detailScroll: {
    paddingBottom: 30,
  },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  heroTextWrap: {
    flex: 1,
  },
  brand: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
  },
  tagline: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  modeLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  switchButton: {
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  switchText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  homeContent: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 22,
    alignItems: "center",
  },
  homeContentDark: {
    backgroundColor: "#08111F",
  },
  homeSettingsButton: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#14213D",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  homeSettingsButtonDark: {
    backgroundColor: "#111C2E",
    borderColor: "rgba(147, 197, 253, 0.16)",
  },
  homeLogo: {
    width: 172,
    height: 172,
    resizeMode: "contain",
    marginBottom: 22,
  },
  homeTitle: {
    color: "#192238",
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 9,
  },
  homeTitleDark: {
    color: "#F8FAFC",
  },
  homeSubtitle: {
    color: "#7A8798",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
  },
  homeSubtitleDark: {
    color: "#94A3B8",
  },
  modeCardPress: {
    width: "100%",
    borderRadius: 22,
    marginBottom: 15,
    shadowColor: "#14213D",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  modeCard: {
    minHeight: 108,
    borderRadius: 22,
    paddingHorizontal: 19,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  modeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modeCopy: {
    flex: 1,
  },
  modeCardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  modeCardSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
    marginTop: 5,
  },
  homeStatsCard: {
    width: "100%",
    minHeight: 94,
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#14213D",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  homeStatsCardDark: {
    backgroundColor: "#111C2E",
    borderColor: "rgba(147, 197, 253, 0.14)",
  },
  homeStat: {
    flex: 1,
    alignItems: "center",
  },
  homeStatValue: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 5,
  },
  homeStatValueDark: {
    color: "#F8FAFC",
  },
  homeStatLabel: {
    color: "#718096",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 3,
  },
  homeStatLabelDark: {
    color: "#94A3B8",
  },
  homeContact: {
    marginTop: "auto",
    color: "#7A8798",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 17,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  homeContactDark: {
    color: "#94A3B8",
  },
  homeContactEmail: {
    color: "#1652B7",
    fontWeight: "800",
  },
  homeLegalLinks: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  homeLegalButton: {
    minHeight: 38,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.1)",
  },
  homeLegalText: {
    color: "#1652B7",
    fontSize: 12,
    fontWeight: "800",
  },
  authScroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 28,
    alignItems: "center",
    backgroundColor: "#FAFCFF",
  },
  authLogo: {
    width: 142,
    height: 142,
    resizeMode: "contain",
    marginBottom: 18,
  },
  authTitle: {
    color: "#172033",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
  },
  authSub: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },
  authCard: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 16,
    shadowColor: "#14213D",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  authModeSwitch: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EEF4FF",
    flexDirection: "row",
    padding: 4,
    marginBottom: 14,
  },
  authModeButton: {
    flex: 1,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  authModeButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  authModeText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "900",
  },
  authModeTextActive: {
    color: "#1652B7",
  },
  authInput: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D8DEE8",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  authSubmitButton: {
    height: 54,
    borderRadius: 17,
    backgroundColor: "#1652B7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  authSubmitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  authDemoBox: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.18)",
    padding: 12,
  },
  authDemoTitle: {
    color: "#9A3412",
    fontSize: 12,
    fontWeight: "900",
  },
  authDemoText: {
    color: "#9A3412",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 4,
  },
  adminHero: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  adminHeroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  adminEyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  adminTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 4,
  },
  adminSub: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 6,
  },
  adminLogoutButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminList: {
    paddingBottom: 28,
    backgroundColor: "#F8FAFF",
  },
  adminSummaryGrid: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  adminMetricCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    paddingVertical: 13,
    alignItems: "center",
  },
  adminMetricValue: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
  },
  adminMetricLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
  adminFilterRow: {
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 4,
  },
  adminFilterChip: {
    minHeight: 38,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  adminFilterChipActive: {
    backgroundColor: "#1652B7",
    borderColor: "#1652B7",
  },
  adminFilterText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
  },
  adminFilterTextActive: {
    color: "#FFFFFF",
  },
  adminRequestCard: {
    marginHorizontal: 18,
    marginBottom: 14,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 16,
  },
  adminRequestHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  adminRequestIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  adminRequestCopy: {
    flex: 1,
  },
  adminRequestUser: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "900",
  },
  adminRequestTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adminStatusPill: {
    borderRadius: 999,
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adminStatusPillNew: {
    backgroundColor: "#FFF1F2",
  },
  adminStatusText: {
    color: "#1652B7",
    fontSize: 9,
    fontWeight: "900",
  },
  adminStatusTextNew: {
    color: "#E11D48",
  },
  adminRequestCategory: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
  },
  adminRequestMessage: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 12,
  },
  adminRequestMeta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  adminQuickFacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  adminFact: {
    maxWidth: "100%",
    borderRadius: 999,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.12)",
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  adminFactText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
    maxWidth: 230,
  },
  adminDeepPanel: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 13,
  },
  adminPanelTitle: {
    color: "#172033",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
    marginBottom: 8,
  },
  adminChecklist: {
    gap: 7,
    marginBottom: 12,
  },
  adminCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adminCheckText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },
  adminSignalWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  adminSignalPill: {
    borderRadius: 999,
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  adminSignalText: {
    color: "#1652B7",
    fontSize: 11,
    fontWeight: "900",
  },
  adminUrgencyControl: {
    minHeight: 58,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  adminUrgencyButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  adminUrgencyReadout: {
    alignItems: "center",
  },
  adminUrgencyValue: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "900",
  },
  adminUrgencySub: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
  adminNoteInput: {
    minHeight: 72,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8DEE8",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "700",
    textAlignVertical: "top",
  },
  adminActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  adminActionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  adminRejectButton: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.18)",
  },
  adminApproveButton: {
    backgroundColor: "#1652B7",
  },
  adminRejectText: {
    color: "#E11D48",
    fontSize: 13,
    fontWeight: "900",
  },
  adminApproveText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  adminEmptyCard: {
    marginHorizontal: 18,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 22,
    alignItems: "center",
  },
  adminEmptyTitle: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 10,
  },
  adminEmptySub: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 5,
  },
  settingsScroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    backgroundColor: "#F8FAFF",
  },
  settingsScrollDark: {
    backgroundColor: "#08111F",
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  settingsBackButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsBackButtonDark: {
    backgroundColor: "#111C2E",
    borderColor: "rgba(147, 197, 253, 0.14)",
  },
  settingsEyebrow: {
    color: "#1652B7",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  settingsEyebrowDark: {
    color: "#93C5FD",
  },
  settingsTitle: {
    color: "#172033",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 2,
  },
  settingsTitleDark: {
    color: "#F8FAFC",
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#14213D",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  settingsCardDark: {
    backgroundColor: "#111C2E",
    borderColor: "rgba(147, 197, 253, 0.14)",
    shadowOpacity: 0,
  },
  settingsRow: {
    minHeight: 82,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsLink: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsIconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIconBoxDark: {
    backgroundColor: "rgba(37, 99, 235, 0.18)",
  },
  settingsRowCopy: {
    flex: 1,
  },
  settingsRowTitle: {
    color: "#172033",
    fontSize: 15,
    fontWeight: "900",
  },
  settingsRowTitleDark: {
    color: "#F8FAFC",
  },
  settingsRowSub: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 3,
  },
  settingsRowSubDark: {
    color: "#94A3B8",
  },
  settingsDivider: {
    height: 1,
    backgroundColor: "rgba(22, 82, 183, 0.08)",
    marginLeft: 70,
  },
  settingsDividerDark: {
    backgroundColor: "rgba(147, 197, 253, 0.12)",
  },
  settingsContactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 18,
  },
  settingsContactCardDark: {
    backgroundColor: "#111C2E",
    borderColor: "rgba(147, 197, 253, 0.14)",
  },
  settingsContactTitle: {
    color: "#172033",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 10,
  },
  settingsContactTitleDark: {
    color: "#F8FAFC",
  },
  settingsContactText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 8,
  },
  settingsContactTextDark: {
    color: "#94A3B8",
  },
  settingsContactEmail: {
    color: "#1652B7",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 12,
  },
  settingsLogoutButton: {
    minHeight: 50,
    borderRadius: 17,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.14)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  settingsLogoutText: {
    color: "#E11D48",
    fontSize: 14,
    fontWeight: "900",
  },
  legalScroll: {
    paddingBottom: 28,
    backgroundColor: "#F8FAFF",
  },
  legalHero: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },
  legalBackButton: {
    position: "absolute",
    top: 18,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  legalLogo: {
    width: 132,
    height: 132,
    resizeMode: "contain",
    marginTop: 18,
  },
  legalEyebrow: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginTop: 8,
  },
  legalTitle: {
    color: "#1B2A6B",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 6,
  },
  legalSubtitle: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },
  legalCard: {
    marginHorizontal: 18,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.1)",
    shadowColor: "#14213D",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
    overflow: "hidden",
  },
  legalAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  legalCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  legalNumber: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#EEF2FF",
    color: "#1B2A6B",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    textAlignVertical: "center",
    paddingTop: 8,
  },
  legalSectionTitle: {
    flex: 1,
    color: "#1B2A6B",
    fontSize: 18,
    fontWeight: "900",
  },
  legalParagraph: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
    marginTop: 8,
  },
  legalFooter: {
    marginHorizontal: 18,
    marginTop: 18,
    backgroundColor: "#1B2A6B",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
  },
  legalFooterTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  legalFooterText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  legalFooterEmail: {
    color: "#7DD3FC",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 14,
  },
  legalUpdated: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 16,
    marginTop: 14,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  sosWrap: {
    alignItems: "center",
    paddingTop: 34,
    paddingBottom: 18,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: -6,
  },
  sosRadarStage: {
    width: 268,
    height: 192,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  sosRadarRing: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 23, 68, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 23, 68, 0.14)",
  },
  sosRadarRingDelay: {
    backgroundColor: "rgba(255, 90, 61, 0.16)",
    borderColor: "rgba(255, 90, 61, 0.14)",
  },
  sosButtonLaunchRing: {
    position: "absolute",
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: "rgba(255, 23, 68, 0.28)",
    borderWidth: 2,
    borderColor: "rgba(255, 23, 68, 0.34)",
  },
  sosButtonLaunchRingSmall: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "rgba(255, 107, 53, 0.24)",
    borderColor: "rgba(255, 107, 53, 0.32)",
  },
  sosPrompt: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 28,
  },
  sosButton: {
    width: 142,
    height: 142,
    borderRadius: 71,
    shadowColor: theme.red,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  sosGradient: {
    flex: 1,
    borderRadius: 71,
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 1,
  },
  sosSmallText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  helpText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 12,
    paddingHorizontal: 22,
  },
  locationText: {
    color: theme.orange,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },
  sosLaunchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: "#F40012",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    overflow: "hidden",
  },
  sosLaunchRing: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  sosLaunchRingSmall: {
    width: 138,
    height: 138,
    borderRadius: 69,
    borderColor: "rgba(255,255,255,0.58)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  sosLaunchIcon: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  sosLaunchTitle: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 30,
  },
  sosLaunchSub: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
    textAlign: "center",
    marginTop: 16,
    maxWidth: 320,
  },
  requesterHeader: {
    marginHorizontal: 0,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  requesterHeaderLogo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  requesterHeaderLogoImage: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },
  requesterHeaderCopy: {
    flex: 1,
  },
  requesterEyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  requesterTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  headerSwitchButton: {
    height: 42,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  headerSwitchText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  requestSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 4,
    gap: 8,
  },
  requestSectionTitle: {
    color: "#2D3748",
    fontSize: 16,
    fontWeight: "900",
  },
  termsPill: {
    backgroundColor: "#EAF2F8",
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  termsText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
  },
  requestSectionSub: {
    color: "#7A8798",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 10,
    paddingHorizontal: 20,
  },
  categoryCard: {
    width: "31%",
    minHeight: 92,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 6,
    shadowColor: "#14213D",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
  },
  categoryPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  buddiesTitle: {
    color: "#2D3748",
    fontSize: 16,
    fontWeight: "900",
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  buddyCard: {
    width: 82,
    height: 82,
    marginLeft: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#14213D",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buddyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#2F75C8",
    alignItems: "center",
    justifyContent: "center",
  },
  buddyInitial: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  buddyOnline: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#fff",
  },
  input: {
    minHeight: 110,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 15,
    color: theme.text,
    fontSize: 14,
    fontWeight: "700",
    textAlignVertical: "top",
  },
  primaryButton: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: theme.red,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  detailSheet: {
    marginTop: -16,
    marginHorizontal: 10,
    backgroundColor: "#FFFDFB",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 26,
    shadowColor: "#14213D",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -3 },
    elevation: 4,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D9DEE7",
    marginBottom: 22,
  },
  detailTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  detailCategoryPill: {
    minHeight: 62,
    borderRadius: 22,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailCategoryText: {
    fontSize: 18,
    fontWeight: "900",
  },
  detailCloseButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: {
    color: "#374151",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
  },
  presetHint: {
    color: "#7A8798",
    fontSize: 12,
    fontWeight: "700",
    marginTop: -4,
    marginBottom: 12,
  },
  requestPresetGrid: {
    gap: 8,
    marginBottom: 14,
  },
  requestPresetChip: {
    width: "100%",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.12)",
    backgroundColor: "#F1F5FF",
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  requestPresetChipSelected: {
    backgroundColor: "#1652B7",
    borderColor: "#1652B7",
  },
  requestPresetText: {
    color: "#1E3A8A",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  requestPresetTextSelected: {
    color: "#fff",
  },
  requestCustomChip: {
    width: "100%",
    borderRadius: 15,
    borderWidth: 1.4,
    borderColor: "#1652B7",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  requestCustomChipSelected: {
    backgroundColor: "#1652B7",
    borderColor: "#1652B7",
  },
  requestCustomIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(22, 82, 183, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  requestCustomCopy: {
    flex: 1,
  },
  requestCustomText: {
    color: "#1652B7",
    fontSize: 12,
    fontWeight: "900",
  },
  requestCustomSub: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  requestCustomSubSelected: {
    color: "rgba(255,255,255,0.78)",
  },
  customRequestBox: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "rgba(22, 82, 183, 0.12)",
    padding: 4,
    marginBottom: 2,
  },
  selectedPresetBox: {
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.14)",
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  describeMoreBox: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "rgba(22, 82, 183, 0.12)",
    padding: 10,
  },
  describeMoreLabel: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 8,
  },
  describeMoreInput: {
    minHeight: 104,
    backgroundColor: "#F8FAFC",
    borderColor: "#D5DAE2",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlignVertical: "top",
  },
  selectedPresetText: {
    flex: 1,
    color: "#1E3A8A",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  required: {
    color: theme.red,
  },
  detailHelp: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 22,
  },
  proofBox: {
    minHeight: 244,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    marginBottom: 26,
  },
  proofText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 22,
  },
  proofActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  proofButton: {
    minWidth: 130,
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: "#14213D",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  mediaButton: {
    minWidth: 190,
    marginTop: 18,
    backgroundColor: "#2F6FBA",
  },
  photoButton: {
    backgroundColor: "#2F6FBA",
  },
  videoButton: {
    backgroundColor: "#F45A3D",
  },
  proofButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  proofSelectedPill: {
    maxWidth: "92%",
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.14)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  proofSelectedText: {
    flex: 1,
    color: "#1652B7",
    fontSize: 12,
    fontWeight: "800",
  },
  detailInput: {
    minHeight: 126,
    backgroundColor: "#F4F6F8",
    borderColor: "#D5DAE2",
    borderWidth: 1.2,
    borderRadius: 16,
    padding: 14,
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlignVertical: "top",
  },
  detailInputMuted: {
    backgroundColor: "#F8FAFC",
  },
  charCount: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 18,
  },
  urgencySliderCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.1)",
    padding: 14,
    marginBottom: 14,
  },
  urgencyValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  urgencyValueLabel: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "900",
  },
  urgencyValue: {
    color: theme.red,
    fontSize: 15,
    fontWeight: "900",
  },
  urgencySliderTrack: {
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    overflow: "visible",
  },
  urgencySliderFill: {
    position: "absolute",
    left: 0,
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.red,
  },
  urgencySliderThumb: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: -14,
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: theme.red,
    shadowColor: theme.red,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  urgencySliderLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  urgencySliderLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
  },
  urgencyReviewCard: {
    borderRadius: 16,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.14)",
    padding: 13,
    marginBottom: 18,
  },
  urgencyReviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  urgencyReviewTitle: {
    color: "#1E3A8A",
    fontSize: 13,
    fontWeight: "900",
  },
  urgencyReviewText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8,
  },
  urgencyReviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  urgencyReviewPill: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  urgencyReviewAdminPill: {
    backgroundColor: "#FFE2E8",
  },
  urgencyReviewPillLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  urgencyReviewPillValue: {
    color: "#1E3A8A",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },
  confirmBox: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "rgba(239, 68, 68, 0.28)",
    backgroundColor: "rgba(254, 242, 242, 0.75)",
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: theme.red,
    backgroundColor: theme.red,
  },
  confirmCopy: {
    flex: 1,
  },
  confirmText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  confirmStrong: {
    color: "#E11D48",
    fontWeight: "900",
  },
  termsLink: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
  },
  requestHelpButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.red,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: theme.red,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  requestHelpButtonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  requestHelpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  timelineHero: {
    margin: 20,
    borderRadius: 28,
    padding: 26,
    alignItems: "center",
  },
  timelineTitle: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 10,
  },
  timelineSub: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 5,
  },
  timelineStep: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  timelineDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.red,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotText: {
    color: "#fff",
    fontWeight: "900",
  },
  timelineCopy: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  safeButton: {
    margin: 20,
    backgroundColor: theme.green,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },
  safeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  checkIntro: {
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 34,
    alignItems: "center",
  },
  checkInCenter: {
    flex: 1,
    paddingHorizontal: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIconSoft: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EAF2F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },
  checkIconSuccess: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#EAF8ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  checkTitle: {
    color: "#2D3748",
    fontSize: 31,
    fontWeight: "700",
    textAlign: "center",
  },
  checkSub: {
    color: "#7A8798",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 24,
    textAlign: "center",
    marginTop: 16,
  },
  startCheckButton: {
    width: "100%",
    minHeight: 88,
    borderRadius: 18,
    backgroundColor: "#2F6FBA",
    marginTop: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#1652B7",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 5,
  },
  startCheckText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  howItWorksCard: {
    width: "100%",
    marginTop: 32,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#D8DEE8",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  howItWorksTitle: {
    color: "#7A8798",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 16,
  },
  howRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 17,
  },
  howText: {
    flex: 1,
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  activeHeader: {
    backgroundColor: "#165FBA",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32,
    alignItems: "center",
  },
  activeEyebrow: {
    color: "#63D96A",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  activeTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  activeSub: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 7,
  },
  checkBody: {
    paddingHorizontal: 24,
    paddingTop: 94,
    paddingBottom: 26,
  },
  timerCard: {
    minHeight: 218,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: "#D8DEE8",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#14213D",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  timerLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  timerValue: {
    color: "#165FBA",
    fontSize: 66,
    fontWeight: "800",
    marginTop: 12,
  },
  timerCaption: {
    color: "#7A8798",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  buddyNotice: {
    width: "100%",
    minHeight: 58,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#B9E3C0",
    backgroundColor: "#EFFBEF",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  buddyNoticeText: {
    flex: 1,
    color: "#215C2A",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  checkAction: {
    minHeight: 72,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 18,
  },
  safeEndAction: {
    backgroundColor: "#2DBB2D",
  },
  sosAction: {
    backgroundColor: "#FF1744",
  },
  checkActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  checkReview: {
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 34,
    alignItems: "center",
  },
  reviewCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#D8DEE8",
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 24,
  },
  reviewTitle: {
    color: "#4B5563",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 24,
  },
  reviewInput: {
    minHeight: 126,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8DEE8",
    backgroundColor: "#F8FAFC",
    padding: 14,
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "600",
    textAlignVertical: "top",
    marginTop: 18,
  },
  submitReviewButton: {
    width: "100%",
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: "#2F6FBA",
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  submitReviewDisabled: {
    backgroundColor: "#CBD5E1",
  },
  submitReviewText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
  skipReview: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 22,
  },
  sosTriggeredScreen: {
    flex: 1,
    backgroundColor: "#F40012",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    overflow: "hidden",
  },
  sosPulseRing: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  sosPulseRingDelay: {
    width: 138,
    height: 138,
    borderRadius: 69,
    borderColor: "rgba(255,255,255,0.58)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  sosTriggeredIcon: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  sosTriggeredTitle: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 30,
  },
  sosTriggeredSub: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
    textAlign: "center",
    marginTop: 16,
    maxWidth: 320,
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
  },
  cardSub: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 4,
  },
  activityScroll: {
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 34,
  },
  activityTitle: {
    color: "#2D3748",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 20,
  },
  activityStatsCard: {
    minHeight: 128,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#14213D",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  activityStat: {
    flex: 1,
    alignItems: "center",
  },
  activityStatValue: {
    color: "#2D3748",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 9,
  },
  activityStatLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 5,
  },
  radiusCard: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 16,
  },
  radiusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  radiusTitle: {
    color: "#2D3748",
    fontSize: 15,
    fontWeight: "900",
  },
  radiusSub: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  radiusBadge: {
    minWidth: 58,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  radiusBadgeText: {
    color: "#1652B7",
    fontSize: 13,
    fontWeight: "900",
  },
  radiusOptions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 15,
  },
  radiusChip: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8DEE8",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  radiusChipActive: {
    backgroundColor: "#1652B7",
    borderColor: "#1652B7",
  },
  radiusChipText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
  },
  radiusChipTextActive: {
    color: "#FFFFFF",
  },
  activitySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 26,
    marginBottom: 12,
  },
  activitySectionTitle: {
    color: "#2D3748",
    fontSize: 20,
    fontWeight: "900",
  },
  activitySectionMeta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },
  missionHistoryCard: {
    minHeight: 112,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
    shadowColor: "#14213D",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  missionHistoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  missionHistoryCopy: {
    flex: 1,
  },
  missionHistoryCategory: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  missionHistoryTitle: {
    color: "#2D3748",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
  },
  missionHistoryMeta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  pointsBadge: {
    width: 58,
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: "#FFF2D8",
    alignItems: "center",
    justifyContent: "center",
  },
  pointsValue: {
    color: "#E86A2C",
    fontSize: 17,
    fontWeight: "900",
  },
  pointsLabel: {
    color: "#B45309",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 1,
  },
  emptyHistoryCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 24,
    alignItems: "center",
  },
  emptyHistoryTitle: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
  },
  emptyHistorySub: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 5,
  },
  helperStats: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  helperHero: {
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  helperHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  helperLogoBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  helperLogoImage: {
    width: 46,
    height: 46,
    resizeMode: "contain",
  },
  helperHeroCopy: {
    flex: 1,
  },
  helperEyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  helperHeroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  helperSwitchButton: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helperSwitchText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  helperSegment: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    padding: 5,
    gap: 6,
    marginTop: 22,
  },
  helperSegmentButton: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  helperSegmentActive: {
    backgroundColor: "#FFFFFF",
  },
  helperSegmentText: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    fontWeight: "900",
  },
  helperSegmentTextActive: {
    color: "#1E3A8A",
  },
  helperEmergencyLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  emergencyPulseWrap: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyPulseRing: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "rgba(255, 0, 0, 0.42)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  emergencyBlinkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF0000",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  helperListHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  helperListTitle: {
    color: "#2D3748",
    fontSize: 18,
    fontWeight: "900",
  },
  helperListSub: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  helperListContent: {
    paddingBottom: 28,
  },
  stat: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  statValue: {
    color: theme.green,
    fontSize: 24,
    fontWeight: "900",
  },
  statLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  requestCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    borderLeftWidth: 4,
    shadowColor: "#14213D",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  urgentCard: {
    borderColor: "rgba(255,23,68,0.35)",
  },
  urgentLabel: {
    color: theme.red,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 10,
  },
  requestRow: {
    flexDirection: "row",
    gap: 12,
  },
  requestIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  requestCopy: {
    flex: 1,
  },
  requestNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  requestUserName: {
    color: "#2D3748",
    fontSize: 18,
    fontWeight: "900",
  },
  urgentPill: {
    borderRadius: 9,
    backgroundColor: "#FFE2E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  urgentPillText: {
    color: theme.red,
    fontSize: 10,
    fontWeight: "900",
  },
  buddyRequestBadge: {
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: "#FFF2D8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 11,
  },
  buddyRequestText: {
    color: "#B45309",
    fontSize: 10,
    fontWeight: "900",
  },
  requestCategoryText: {
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
  },
  requestMessage: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  metaText: {
    color: theme.orange,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: "#075FBE",
    borderRadius: 15,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  communityScroll: {
    paddingHorizontal: 18,
    paddingTop: 34,
    paddingBottom: 34,
  },
  communityTitle: {
    color: "#2D3748",
    fontSize: 31,
    fontWeight: "800",
    marginBottom: 18,
  },
  communitySlider: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    flexDirection: "row",
    padding: 5,
    marginBottom: 18,
    position: "relative",
  },
  communitySliderThumb: {
    position: "absolute",
    left: 5,
    top: 5,
    bottom: 5,
    width: "49%",
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    shadowColor: "#14213D",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  communitySliderThumbRight: {
    left: "50%",
  },
  communitySliderOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  communitySliderText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "900",
  },
  communitySliderTextActive: {
    color: "#2D3748",
  },
  orgInfoCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 16,
    marginBottom: 16,
  },
  orgInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orgMark: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  orgInfoCopy: {
    flex: 1,
  },
  orgName: {
    color: "#2D3748",
    fontSize: 16,
    fontWeight: "900",
  },
  orgRole: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  orgTypePill: {
    borderRadius: 999,
    backgroundColor: "#EAF8ED",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  orgTypeText: {
    color: "#2E7D32",
    fontSize: 11,
    fontWeight: "900",
  },
  orgMetaGrid: {
    gap: 10,
    marginTop: 16,
  },
  orgMetaItem: {
    minHeight: 44,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  orgMetaLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "900",
    width: 82,
  },
  orgMetaValue: {
    flex: 1,
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },
  communityTrustCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 15,
    marginBottom: 14,
    gap: 13,
  },
  communityTrustLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  communityTrustText: {
    flex: 1,
    color: "#475569",
    fontSize: 13,
    fontWeight: "800",
  },
  communityPostCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 16,
    marginBottom: 14,
  },
  communityPostHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  communityAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  communityAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  communityPostCopy: {
    flex: 1,
  },
  communityNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  communityAuthor: {
    color: "#2D3748",
    fontSize: 15,
    fontWeight: "900",
  },
  communityRating: {
    color: theme.orange,
    fontSize: 12,
    fontWeight: "900",
  },
  communityTime: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  communityOrgPill: {
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 7,
  },
  communityOrgText: {
    color: "#1652B7",
    fontSize: 11,
    fontWeight: "900",
  },
  officialPill: {
    borderRadius: 10,
    backgroundColor: "#EAF2F8",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  officialText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "900",
  },
  communityMessage: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 16,
  },
  communityLikeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 18,
  },
  communityLikes: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
  },
  groupMissionCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
    padding: 16,
    marginBottom: 14,
  },
  groupMissionUrgent: {
    borderColor: "rgba(255, 23, 68, 0.3)",
  },
  groupMissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupMissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  groupMissionCopy: {
    flex: 1,
  },
  groupMissionTitle: {
    color: "#2D3748",
    fontSize: 15,
    fontWeight: "900",
  },
  groupMissionOrg: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  groupMissionNeed: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 14,
  },
  groupMissionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  groupMissionMeta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },
  groupMissionSlots: {
    color: "#1652B7",
    fontSize: 12,
    fontWeight: "900",
  },
  chatScreen: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },
  chatHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chatBackButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
  },
  chatAvatarText: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "900",
  },
  chatHeaderCopy: {
    flex: 1,
  },
  chatTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
  },
  chatSub: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
  },
  chatBubble: {
    maxWidth: "82%",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.08)",
  },
  chatBubbleMe: {
    alignSelf: "flex-end",
    backgroundColor: "#1652B7",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
    borderColor: "#1652B7",
  },
  chatBubbleSystem: {
    alignSelf: "center",
    backgroundColor: "#EAF2FF",
    borderBottomLeftRadius: 18,
    maxWidth: "92%",
  },
  chatBubbleText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  chatBubbleTextMe: {
    color: "#fff",
  },
  chatBubbleTextSystem: {
    color: "#1652B7",
    textAlign: "center",
  },
  presetPanel: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(22, 82, 183, 0.08)",
  },
  presetTitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  presetChip: {
    maxWidth: "100%",
    borderRadius: 14,
    backgroundColor: "#F1F5FF",
    borderWidth: 1,
    borderColor: "rgba(22, 82, 183, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  presetChipText: {
    color: "#1E3A8A",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  customChip: {
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.4,
    borderColor: "#1652B7",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  customChipText: {
    color: "#1652B7",
    fontSize: 12,
    fontWeight: "900",
  },
  customMessageBox: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  customMessageInput: {
    flex: 1,
    minHeight: 50,
    maxHeight: 104,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D8DEE8",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "700",
    textAlignVertical: "top",
  },
  customSendButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#1652B7",
    alignItems: "center",
    justifyContent: "center",
  },
  customSendDisabled: {
    backgroundColor: "#CBD5E1",
  },
  mapMock: {
    height: 360,
    margin: 20,
    borderRadius: 28,
    backgroundColor: "#EAF4EF",
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  mapPin: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  youPin: {
    position: "absolute",
    left: "48%",
    top: "52%",
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.teal,
    borderWidth: 3,
    borderColor: "#fff",
  },
});
