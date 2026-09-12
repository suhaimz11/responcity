import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "./AuthProvider";
import { authErrorMessage, validateCredentials } from "./policy";
import { Ionicons } from "@expo/vector-icons";

export function AuthScreen({ dark = false }: { dark?: boolean }) {
  const auth = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(Date.now());
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const text = dark ? "#F8FAFC" : "#203B36";
  const muted = dark ? "#A6B4C8" : "#64748B";
  const verifying = Boolean(auth.user && !auth.user.emailVerified);
  const remaining = Math.max(0, Math.ceil((auth.verificationSentAt + 60_000 - now) / 1000));

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!auth.verificationSentAt) return;
    setNow(Date.now());
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= auth.verificationSentAt + 60_000) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [auth.verificationSentAt]);

  function changeMode(next: typeof mode) {
    if (inFlight.current) return;
    setMode(next);
    setError("");
    setMessage("");
    setPassword("");
    setVisiblePassword(false);
  }

  async function run(action: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try { await action(); }
    catch (failure) { if (mounted.current) setError(authErrorMessage(failure)); }
    finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  function submit() {
    if (!auth.configured || inFlight.current) return;
    const validation = validateCredentials(email, mode === "reset" ? "unused" : password, mode === "signup" ? name : undefined);
    if (validation) { setError(validation); setMessage(""); return; }
    void run(async () => {
      if (mode === "reset") {
        await auth.resetPassword(email);
        if (mounted.current) setMessage("If an account exists for that address, you’ll receive a password reset email. Check your inbox and spam folder.");
      } else if (mode === "signup") {
        await auth.signup(name, email, password);
      } else {
        await auth.login(email, password);
      }
    });
  }

  const inputStyle = [styles.input, { color: text, backgroundColor: dark ? "#081321" : "#F8FAFC", borderColor: dark ? "#344155" : "#D8DEE8" }];
  const button = (label: string, action: () => void, secondary = false, disabled = busy) => (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled, busy }} disabled={disabled} onPress={action}
      style={({ pressed }) => [styles.button, secondary && styles.secondary, (disabled || pressed) && styles.dimmed]}>
      <Text style={[styles.buttonText, secondary && { color: dark ? "#8AD9C5" : "#147D73" }]}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
      <View style={[styles.logoPlate, dark && { backgroundColor: "#F8FAFC", borderRadius: 20 }]}>
        <Image source={require("../../assets/emerge-aid-logo-transparent-balanced.png")} style={styles.logo} />
      </View>
      <Text style={[styles.title, { color: text }]}>{verifying ? "Verify your email" : mode === "reset" ? "Reset your password" : "Good to have you here."}</Text>
      <Text style={[styles.subtitle, { color: muted }]}>{verifying ? `Confirm ${auth.user?.email} to finish setting up your account.` : mode === "reset" ? "Enter your account email and we’ll send a reset link." : "A connected community. A helping hand, closer to home."}</Text>
      <View style={[styles.card, { backgroundColor: dark ? "#142724" : "#FFFFFF", borderColor: dark ? "#283549" : "#E6EBF2" }]}>
        {!auth.configured ? <Text accessibilityRole="alert" style={[styles.notice, { color: muted }]}>Sign-in isn’t available yet. The app’s Firebase connection still needs to be set up.</Text> : null}
        {auth.sessionError ? <>
          <Text accessibilityRole="alert" style={styles.error}>{auth.sessionError}</Text>
          {button("Retry connection", auth.retrySession, true)}
        </> : null}
        {verifying ? <>
          <Text style={[styles.body, { color: muted }]}>Send a verification email, open its link, then return here and check your verification.</Text>
          {auth.verificationSentAt > 0 ? <Text accessibilityLiveRegion="polite" style={[styles.notice, { color: muted }]}>Verification email sent. Check your inbox and spam folder.</Text> : null}
          {button(remaining > 0 ? `Resend in ${remaining}s` : auth.verificationSentAt ? "Resend verification email" : "Send verification email", () => { void run(auth.sendVerification); }, false, busy || remaining > 0)}
          {button("I’ve verified my email", () => { void run(async () => {
            const verified = await auth.refreshVerification();
            if (!verified && mounted.current) setMessage("Your email isn’t verified yet. Open the link in your inbox, then try again.");
          }); }, true)}
          {button("Use a different account", () => { void run(auth.logout); }, true)}
        </> : <>
          {mode !== "reset" ? <View accessibilityRole="tablist" style={[styles.tabs, dark && { backgroundColor: "#081321" }]}>
            {(["login", "signup"] as const).map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: mode === item, disabled: busy }} disabled={busy} onPress={() => changeMode(item)} style={[styles.tab, mode === item && { backgroundColor: dark ? "#24344C" : "#FFFFFF" }]}>
              <Text style={{ color: mode === item ? (dark ? "#8AD9C5" : "#147D73") : muted, fontWeight: "600" }}>{item === "login" ? "Sign in" : "Sign up"}</Text>
            </Pressable>)}
          </View> : null}
          {mode === "signup" ? <>
            <Text style={[styles.label, { color: text }]}>Full name</Text>
            <TextInput accessibilityLabel="Full name" autoComplete="name" value={name} onChangeText={setName} editable={!busy} placeholder="Your name" placeholderTextColor={muted} style={inputStyle} maxLength={100} />
          </> : null}
          <Text style={[styles.label, { color: text }]}>Email address</Text>
          <TextInput accessibilityLabel="Email address" autoComplete="email" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={email} onChangeText={setEmail} editable={!busy} placeholder="you@example.com" placeholderTextColor={muted} style={inputStyle} onSubmitEditing={mode === "reset" ? submit : undefined} />
          {mode !== "reset" ? <>
            <Text style={[styles.label, { color: text }]}>Password</Text>
            <TextInput accessibilityLabel="Password" autoComplete={mode === "signup" ? "new-password" : "current-password"} autoCapitalize="none" autoCorrect={false} value={password} onChangeText={setPassword} editable={!busy} secureTextEntry={!visiblePassword} placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} placeholderTextColor={muted} style={inputStyle} returnKeyType="go" onSubmitEditing={submit} />
            <Pressable accessibilityRole="button" accessibilityLabel={visiblePassword ? "Hide password" : "Show password"} disabled={busy} onPress={() => setVisiblePassword(value => !value)} style={styles.passwordToggle}>
              <Text style={{ color: dark ? "#8AD9C5" : "#147D73" }}>{visiblePassword ? "Hide password" : "Show password"}</Text>
            </Pressable>
          </> : null}
          {button(busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in", submit, false, busy || !auth.configured)}
          {mode !== "reset" && auth.googleSignInAvailable ? <>
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: dark ? "#344155" : "#D8DEE8" }]} />
              <Text style={[styles.dividerText, { color: muted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: dark ? "#344155" : "#D8DEE8" }]} />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Continue with Google" accessibilityState={{ disabled: busy, busy }} disabled={busy || !auth.configured} onPress={() => { void run(auth.loginWithGoogle); }}
              style={({ pressed }) => [styles.googleButton, { borderColor: dark ? "#46556D" : "#CBD5E1" }, (busy || pressed) && styles.dimmed]}>
              <Ionicons name="logo-google" size={19} color={dark ? "#F8FAFC" : "#203B36"} />
              <Text style={[styles.googleButtonText, { color: text }]}>Continue with Google</Text>
            </Pressable>
          </> : null}
          {button(mode === "reset" ? "Back to sign in" : "Forgot password?", () => changeMode(mode === "reset" ? "login" : "reset"), true)}
        </>}
        {busy ? <ActivityIndicator accessibilityLabel="Working" color={dark ? "#8AD9C5" : "#147D73"} style={styles.activity} /> : null}
        {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.error, dark && { color: "#FDA4AF" }]}>{error}</Text> : null}
        {message ? <Text accessibilityLiveRegion="polite" style={[styles.notice, { color: muted }]}>{message}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 52, paddingBottom: 32 },
  logoPlate: { width: 108, height: 88, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  logo: { width: 96, height: 78, resizeMode: "contain" },
  title: { fontSize: 34, fontWeight: "700", letterSpacing: -1.2, textAlign: "center" },
  subtitle: { fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 8, marginBottom: 24, maxWidth: 360 },
  card: { width: "100%", maxWidth: 440, padding: 28, borderWidth: 1, borderRadius: 26 },
  tabs: { flexDirection: "row", padding: 4, backgroundColor: "#E7F2EE", borderRadius: 14, marginBottom: 20 },
  tab: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input: { minHeight: 52, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderRadius: 12, fontSize: 16, marginBottom: 16 },
  button: { minHeight: 52, padding: 12, borderRadius: 12, backgroundColor: "#147D73", alignItems: "center", justifyContent: "center", marginTop: 8 },
  secondary: { backgroundColor: "transparent" },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600", textAlign: "center" },
  dimmed: { opacity: 0.55 },
  passwordToggle: { minHeight: 44, justifyContent: "center", alignSelf: "flex-end", marginTop: -12, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  notice: { fontSize: 14, lineHeight: 21, marginVertical: 12 },
  error: { color: "#BE123C", fontSize: 14, lineHeight: 21, marginTop: 12 },
  activity: { marginTop: 12 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, marginBottom: 12 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontSize: 13 },
  googleButton: { minHeight: 52, borderWidth: 1, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 16 },
  googleButtonText: { fontSize: 14, fontWeight: "600" },
});
