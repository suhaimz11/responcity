import React, { useMemo, useState } from "react";
import {
  Alert,
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

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const responcityLogo = require("../assets/responcity-logo.jpg");

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
  { id: "accident", label: "Accident", icon: "car-sport", color: "#FF6D00", bg: "#FFF7EC" },
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
      <StatusBar style="light" />
      <BrandHeader />
      <View style={styles.modeContent}>
        <Text style={styles.modeTitle}>How will you use Responcity today?</Text>
        <ModeCard
          title="I Need Help"
          subtitle="Send SOS, share live location, and reach nearby verified responders."
          icon="alert-circle"
          colors={[theme.orange, theme.red]}
          onPress={() => navigation.navigate("RequesterTabs")}
        />
        <ModeCard
          title="I'm Ready to Help"
          subtitle="See nearby emergency requests and accept responder missions."
          icon="people-circle"
          colors={[theme.green, theme.teal]}
          onPress={() => navigation.navigate("HelperTabs")}
        />
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

function RequesterTabs({ navigation }: any) {
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="SOS"
        component={RequesterHome}
        initialParams={{ rootNavigation: navigation }}
        options={{ tabBarIcon: tabIcon("alert-circle") }}
      />
      <Tab.Screen name="Profile" component={MedicalProfile} options={{ tabBarIcon: tabIcon("id-card") }} />
      <Tab.Screen name="Contacts" component={EmergencyContacts} options={{ tabBarIcon: tabIcon("call") }} />
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
  tabBarInactiveTintColor: theme.muted,
  tabBarStyle: {
    height: 68,
    paddingBottom: 10,
    paddingTop: 8,
    borderTopColor: theme.border,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: "800" as const,
  },
};

function RequesterHome({ navigation, route }: any) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(categories[0]);
  const [message, setMessage] = useState("");
  const [locationStatus, setLocationStatus] = useState("Location not shared yet");
  const rootNavigation = route.params?.rootNavigation ?? navigation;

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
    await requestLocation();
    rootNavigation.navigate("Timeline");
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandHeader mode="Requester mode" onSwitch={() => rootNavigation.navigate("Mode")} />
        <View style={styles.sosWrap}>
          <Pressable style={({ pressed }) => [styles.sosButton, pressed && styles.pressed]} onPress={sendSos}>
            <LinearGradient colors={[theme.orange, theme.red]} style={styles.sosGradient}>
              <Ionicons name="alert" color="#fff" size={46} />
              <Text style={styles.sosText}>SOS</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.helpText}>Tap once to alert nearby verified responders</Text>
          <Text style={styles.locationText}>{locationStatus}</Text>
        </View>

        <SectionTitle title="Choose emergency type" />
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryCard,
                { backgroundColor: cat.bg, borderColor: selectedCategory?.id === cat.id ? cat.color : theme.border },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Ionicons name={cat.icon} size={25} color={cat.color} />
              <Text style={[styles.categoryText, { color: cat.color }]}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle title="Add context" />
        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline
          placeholder="Example: chest pain, accident, feeling unsafe..."
          placeholderTextColor={theme.muted}
          style={styles.input}
        />
        <Pressable style={styles.primaryButton} onPress={sendSos}>
          <Text style={styles.primaryButtonText}>Send {selectedCategory?.label ?? "Emergency"} Request</Text>
        </Pressable>
      </ScrollView>
    </Screen>
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

function MedicalProfile() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandHeader mode="Medical profile" />
        <InfoCard title="Profile" lines={["Name: Demo User", "Blood group: O+", "Allergies: Penicillin", "Emergency note: Asthma inhaler in bag"]} />
        <InfoCard title="Responder visibility" lines={["Shared only after SOS", "Includes live location", "Can be expanded with Firebase later"]} />
      </ScrollView>
    </Screen>
  );
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

  function acceptRequest(req: Request) {
    Alert.alert("Mission accepted", `Navigate to ${req.user}. ETA ${req.eta}.`);
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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Mode" component={ModeScreen} />
        <Stack.Screen name="RequesterTabs" component={RequesterTabs} />
        <Stack.Screen name="HelperTabs" component={HelperTabs} />
        <Stack.Screen name="Timeline" component={TimelineScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.cream,
  },
  scroll: {
    paddingBottom: 28,
  },
  listContent: {
    paddingBottom: 28,
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
  modeContent: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 16,
  },
  modeTitle: {
    color: theme.text,
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 31,
    marginBottom: 6,
  },
  modeCardPress: {
    borderRadius: 24,
  },
  modeCard: {
    minHeight: 142,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  modeIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  modeCopy: {
    flex: 1,
  },
  modeCardTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "900",
  },
  modeCardSub: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 6,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  sosWrap: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  sosButton: {
    width: 176,
    height: 176,
    borderRadius: 88,
    shadowColor: theme.red,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  sosGradient: {
    flex: 1,
    borderRadius: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 3,
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
    marginTop: 8,
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
    gap: 10,
    paddingHorizontal: 20,
  },
  categoryCard: {
    width: "31%",
    minHeight: 88,
    borderWidth: 1.5,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "900",
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
