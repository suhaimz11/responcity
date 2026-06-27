import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
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
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  Mode: undefined;
  RequesterTabs: undefined;
  HelperTabs: undefined;
  Timeline: undefined;
  RequestDetails: { categoryId: string };
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

type LegalSection = {
  title: string;
  body: string[];
  accent?: string;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const responcityLogo = require("../assets/responcity-logo.jpg");
const responcitySplash = require("../assets/responcity-splash.png");

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
  { id: "transport", label: "Transport", icon: "navigate", color: "#1565C0", bg: "#EEF4FF" },
];

const nearbyRequests: Request[] = [
  {
    id: "r1",
    user: "Priya S.",
    category: "medical",
    message: "Chest pain near Indiranagar. Needs immediate support.",
    distance: "0.4 km",
    eta: "3 min",
    urgent: true,
  },
  {
    id: "r2",
    user: "Rahul M.",
    category: "accident",
    message: "Bike accident. First aid needed until ambulance arrives.",
    distance: "0.8 km",
    eta: "5 min",
    urgent: true,
  },
  {
    id: "r3",
    user: "Aisha K.",
    category: "mental",
    message: "Panic attack. Needs a verified calm responder.",
    distance: "1.1 km",
    eta: "7 min",
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

const aboutSections: LegalSection[] = [
  {
    title: "Who We Are",
    body: [
      "Responcity is a one-tap emergency response platform connecting people in crisis to nearby verified community responders within seconds.",
      "We are building the missing coordination layer between \"I need help\" and \"help has arrived\" - city by city, country by country.",
      "We are not a government service or a helpline. We are the network that fills the gap before official help arrives, powered by people nearby.",
    ],
    accent: "#2563EB",
  },
  {
    title: "Why We Exist",
    body: [
      "The problem is not a lack of willing helpers. It is a lack of coordination.",
      "The trained nurse two buildings away or the off-duty paramedic around the corner may never know someone needs help. Responcity closes that connection gap.",
    ],
    accent: "#F97316",
  },
  {
    title: "What We Do",
    body: [
      "When you tap SOS, Responcity alerts the nearest verified responder with your live location and medical profile.",
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
      "Responcity is operated by Responcity Technologies Private Limited, registered and operating in Bengaluru, Karnataka, India.",
      "This Privacy Policy applies to citizens, verified responders, and B2B clients using our mobile app and web dashboard.",
      "Contact for privacy: imailresponcity@gmail.com.",
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
      "During SOS events, your real-time GPS location is shared only with your assigned responder and Responcity operations team for the active incident.",
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
      "To exercise your rights, contact imailresponcity@gmail.com. We aim to respond within 30 days.",
    ],
  },
  {
    title: "Children, Tracking, and Third Parties",
    body: [
      "Responcity is not intended for children under 18 without parent or guardian consent.",
      "The mobile app does not use browser cookies, but may use device identifiers, analytics SDKs, and crash reporting tools for app operation and improvement.",
      "Third-party services such as cloud hosting, maps, payments, and messaging are used only as needed to operate the platform.",
    ],
  },
];

function categoryFor(id: string) {
  return categories.find(cat => cat.id === id) ?? categories[0];
}

function Screen({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={styles.safe}>{children}</SafeAreaView>;
}

function BrandHeader({ mode, onSwitch }: { mode?: string; onSwitch?: () => void }) {
  return (
    <LinearGradient colors={[theme.orange, theme.red]} style={styles.hero}>
      <View style={styles.heroRow}>
        <View style={styles.logoMark}>
          <Image source={responcityLogo} style={styles.logoImage} />
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.brand}>Responcity</Text>
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
  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.homeContent}>
        <Image source={responcityLogo} style={styles.homeLogo} />
        <Text style={styles.homeTitle}>How can Responcity help?</Text>
        <Text style={styles.homeSubtitle}>Community emergency assistance - available now</Text>
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
        <View style={styles.homeStatsCard}>
          <HomeStat icon="people" value="2,841" label="Helpers" />
          <HomeStat icon="checkmark-done-circle" value="14,920" label="Missions" />
          <HomeStat icon="navigate" value="80 km" label="Coverage" />
        </View>
        <Text style={styles.homeContact}>
          For collaboration/business inquiries contact{" "}
          <Text style={styles.homeContactEmail}>imailresponcity@gmail.com</Text>
        </Text>
        <View style={styles.homeLegalLinks}>
          <Pressable style={({ pressed }) => [styles.homeLegalButton, pressed && styles.categoryPressed]} onPress={() => navigation.navigate("AboutUs")}>
            <Ionicons name="information-circle" size={16} color="#1652B7" />
            <Text style={styles.homeLegalText}>About Us</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.homeLegalButton, pressed && styles.categoryPressed]} onPress={() => navigation.navigate("PrivacyPolicy")}>
            <Ionicons name="shield-checkmark" size={16} color="#1652B7" />
            <Text style={styles.homeLegalText}>Privacy Policy</Text>
          </Pressable>
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
  return (
    <View style={styles.homeStat}>
      <Ionicons name={icon} size={17} color={theme.teal} />
      <Text style={styles.homeStatValue}>{value}</Text>
      <Text style={styles.homeStatLabel}>{label}</Text>
    </View>
  );
}

function RequesterTabs({ navigation }: any) {
  const [session, setSession] = useState<EmergencySession>(defaultEmergencySession);

  function unlockCheckIn() {
    setSession({
      unlocked: true,
      buddiesNotified: true,
      buddyCount: 2,
      elapsedSeconds: 0,
      status: "ready",
    });
  }

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
      <Tab.Screen name="History" component={EmergencyContacts} options={{ tabBarIcon: tabIcon("time") }} />
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
      <Tab.Screen name="Map" component={ResponderMap} options={{ tabBarIcon: tabIcon("map") }} />
      <Tab.Screen name="Stats" component={ResponderStats} options={{ tabBarIcon: tabIcon("trophy") }} />
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
    await requestLocation();
    onEmergencyRequest?.();
    setSosLaunching(true);
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

  return (
    <Screen>
      {sosLaunching ? (
        <View style={styles.sosLaunchOverlay}>
          <Animated.View pointerEvents="none" style={[styles.sosLaunchRing, { opacity: launchPulseOpacity, transform: [{ scale: launchPulseScale }] }]} />
          <Animated.View pointerEvents="none" style={[styles.sosLaunchRing, styles.sosLaunchRingSmall, { opacity: launchPulseOpacity, transform: [{ scale: launchPulseScale }] }]} />
          <Animated.View style={[styles.sosLaunchIcon, { transform: [{ scale: launchIconScale }] }]}>
            <Ionicons name="radio" size={58} color="#fff" />
          </Animated.View>
          <Text style={styles.sosLaunchTitle}>Sending SOS...</Text>
          <Text style={styles.sosLaunchSub}>Notifying your selected buddies and preparing Safe Check-In.</Text>
        </View>
      ) : null}
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
            <Pressable style={({ pressed }) => [styles.sosButton, pressed && styles.pressed]} onPress={sendSos}>
              <LinearGradient colors={[theme.orange, theme.red]} style={styles.sosGradient}>
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.sosSmallText}>Press for help</Text>
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
                rootNavigation.navigate("RequestDetails", { categoryId: cat.id, unlockCheckIn: onEmergencyRequest });
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
  const [description, setDescription] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Screen>
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
            <Ionicons name="camera-outline" size={34} color="#9CA3AF" />
            <Text style={styles.proofText}>Use your camera to capture proof</Text>
            <View style={styles.proofActions}>
              <Pressable style={[styles.proofButton, styles.photoButton]}>
                <Ionicons name="camera" size={17} color="#fff" />
                <Text style={styles.proofButtonText}>Take Photo</Text>
              </Pressable>
              <Pressable style={[styles.proofButton, styles.videoButton]}>
                <Ionicons name="videocam" size={17} color="#fff" />
                <Text style={styles.proofButtonText}>Record Video</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.detailLabel}>Describe Your Situation <Text style={styles.required}>*</Text></Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={300}
            placeholder="Briefly explain what you need help with, where you are, and any important details..."
            placeholderTextColor="#8B95A1"
            style={styles.detailInput}
          />
          <Text style={styles.charCount}>{description.length}/300</Text>

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
              (!confirmed || description.trim().length === 0) && styles.requestHelpButtonDisabled,
              pressed && confirmed && description.trim().length > 0 && styles.pressed,
            ]}
            disabled={!confirmed || description.trim().length === 0}
            onPress={() => {
              route.params?.unlockCheckIn?.();
              navigation.navigate("RequesterTabs", { screen: "Check In" });
            }}
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
        <Image source={responcityLogo} style={styles.requesterHeaderLogoImage} />
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
          <Text style={styles.checkSub}>Session lasted {formatElapsed(session.elapsedSeconds)}. How would you rate your experience with Responcity?</Text>
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

function HelperHome({ navigation, route }: any) {
  const rootNavigation = route.params?.rootNavigation ?? navigation;
  const [activeChatRequest, setActiveChatRequest] = useState<Request | null>(null);

  function acceptRequest(req: Request) {
    setActiveChatRequest(req);
  }

  if (activeChatRequest) {
    return <MissionChat request={activeChatRequest} onBack={() => setActiveChatRequest(null)} />;
  }

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={
          <>
            <BrandHeader mode="Responder mode" onSwitch={() => rootNavigation.navigate("Mode")} />
            <View style={styles.helperStats}>
              <Stat label="Open" value="3" />
              <Stat label="Online" value="27" />
              <Stat label="Avg ETA" value="4m" />
            </View>
            <SectionTitle title="Nearby requests" />
          </>
        }
        data={nearbyRequests}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <RequestCard request={item} onAccept={() => acceptRequest(item)} />}
      />
    </Screen>
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
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandHeader mode="Responder map" />
        <View style={styles.mapMock}>
          {nearbyRequests.map((req, index) => {
            const cat = categoryFor(req.category);
            return (
              <View
                key={req.id}
                style={[
                  styles.mapPin,
                  {
                    left: `${22 + index * 26}%`,
                    top: `${28 + (index % 2) * 34}%`,
                    backgroundColor: cat.color,
                  },
                ]}
              >
                <Ionicons name={cat.icon} color="#fff" size={18} />
              </View>
            );
          })}
          <View style={styles.youPin}>
            <Ionicons name="person" color="#fff" size={18} />
          </View>
        </View>
        <Text style={styles.helpText}>Map is mocked for demo. Later we connect Google Maps/Mapbox and live Firebase locations.</Text>
      </ScrollView>
    </Screen>
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
          <Image source={responcitySplash} style={styles.legalLogo} />
          <Text style={styles.legalEyebrow}>RESPONCITY</Text>
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
          <Text style={styles.legalFooterTitle}>Responcity</Text>
          <Text style={styles.legalFooterText}>Help is just a tap away</Text>
          <Text style={styles.legalFooterEmail}>imailresponcity@gmail.com</Text>
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
      subtitle="How Responcity collects, uses, protects, and shares data while operating emergency response services."
      sections={privacySections}
      updated="Effective January 1, 2025 - Responcity Technologies Private Limited"
    />
  );
}

export default function App() {
  const [showStartup, setShowStartup] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowStartup(false), 1400);
    return () => clearTimeout(timeout);
  }, []);

  if (showStartup) {
    return <StartupScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Mode" component={ModeScreen} />
        <Stack.Screen name="RequesterTabs" component={RequesterTabs} />
        <Stack.Screen name="HelperTabs" component={HelperTabs} />
        <Stack.Screen name="Timeline" component={TimelineScreen} />
        <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
        <Stack.Screen name="AboutUs" component={AboutUsScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
        <Image source={responcitySplash} style={styles.startupLogo} />
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
    width: 170,
    height: 170,
    resizeMode: "contain",
  },
  safe: {
    flex: 1,
    backgroundColor: "#FAFCFF",
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
    width: 52,
    height: 52,
    resizeMode: "cover",
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
  homeLogo: {
    width: 112,
    height: 112,
    resizeMode: "contain",
    marginBottom: 28,
  },
  homeTitle: {
    color: "#192238",
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 9,
  },
  homeSubtitle: {
    color: "#7A8798",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
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
  homeStatLabel: {
    color: "#718096",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 3,
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
    width: 86,
    height: 86,
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
    width: 46,
    height: 46,
    resizeMode: "cover",
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
  charCount: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 18,
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
  helperStats: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 18,
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
  metaText: {
    color: theme.orange,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: theme.green,
    borderRadius: 15,
    padding: 13,
    alignItems: "center",
    marginTop: 14,
  },
  acceptButtonText: {
    color: "#fff",
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
