import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword, getIdTokenResult, onIdTokenChanged,
  reload, sendEmailVerification, sendPasswordResetEmail,
  signInWithEmailAndPassword, signOut, updateProfile, type User,
} from "firebase/auth";
import { firebaseConfigured, getFirebaseAuth } from "./firebase";
import { authErrorMessage, roleFromClaims, type AppUser } from "./policy";
import { googleSignInAvailable, signInWithGoogle } from "./googleSignIn";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  configured: boolean;
  googleSignInAvailable: boolean;
  sessionError: string;
  verificationSentAt: number;
  retrySession: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  refreshVerification: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  const [sessionError, setSessionError] = useState("");
  const [retry, setRetry] = useState(0);
  const [verificationSentAt, setVerificationSentAt] = useState(0);
  const sendingVerification = useRef(false);
  const revision = useRef(0);
  const alive = useRef(true);

  async function publish(firebaseUser: User | null) {
    const currentRevision = ++revision.current;
    try {
      const token = firebaseUser ? await getIdTokenResult(firebaseUser) : null;
      if (!alive.current || currentRevision !== revision.current) return;
      setUser(firebaseUser ? {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Member",
        email: firebaseUser.email || "",
        emailVerified: firebaseUser.emailVerified,
        role: roleFromClaims(token?.claims || {}),
      } : null);
      setSessionError("");
      if (!firebaseUser) setVerificationSentAt(0);
    } catch (error) {
      if (!alive.current || currentRevision !== revision.current) return;
      setUser(null);
      setSessionError(authErrorMessage(error));
    } finally {
      if (alive.current && currentRevision === revision.current) setLoading(false);
    }
  }

  useEffect(() => {
    alive.current = true;
    if (!firebaseConfigured) return;
    setLoading(true);
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onIdTokenChanged(getFirebaseAuth(), next => { void publish(next); }, error => {
        ++revision.current;
        setUser(null);
        setLoading(false);
        setSessionError(authErrorMessage(error));
      });
    } catch (error) {
      setLoading(false);
      setSessionError(authErrorMessage(error));
    }
    return () => {
      alive.current = false;
      ++revision.current;
      unsubscribe?.();
    };
  }, [retry]);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  }

  async function signup(name: string, email: string, password: string) {
    const result = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    // Account creation is already successful even if the optional display-name
    // update fails. Do not tell users to create a duplicate account in that case.
    try { await updateProfile(result.user, { displayName: name.trim() }); } catch { /* Email remains the fallback name. */ }
    if (getFirebaseAuth().currentUser?.uid === result.user.uid) await publish(result.user);
  }

  async function logout() {
    await signOut(getFirebaseAuth());
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
    } catch (error) {
      // Keep the UI response the same for unknown and registered addresses.
      if ((error as { code?: string }).code !== "auth/user-not-found") throw error;
    }
  }

  async function sendVerification() {
    const current = getFirebaseAuth().currentUser;
    if (!current || current.emailVerified || sendingVerification.current || Date.now() - verificationSentAt < 60_000) return;
    sendingVerification.current = true;
    try {
      await sendEmailVerification(current);
      if (alive.current && getFirebaseAuth().currentUser?.uid === current.uid) setVerificationSentAt(Date.now());
    } finally { sendingVerification.current = false; }
  }

  async function refreshVerification() {
    const current = getFirebaseAuth().currentUser;
    if (!current) return false;
    await reload(current);
    await current.getIdToken(true);
    if (getFirebaseAuth().currentUser?.uid !== current.uid) return false;
    await publish(current);
    return current.emailVerified;
  }

  return <AuthContext.Provider value={{ user, loading, configured: firebaseConfigured, googleSignInAvailable, sessionError,
    verificationSentAt, retrySession: () => setRetry(value => value + 1),
    login, loginWithGoogle: signInWithGoogle, signup, logout, resetPassword, sendVerification, refreshVerification,
  }}>{children}</AuthContext.Provider>;
}
