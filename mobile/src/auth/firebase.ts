import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializePersistentAuth } from "./persistence";

// Expo replaces direct EXPO_PUBLIC references at build time. These identifiers
// are public client configuration, never Admin SDK or service-account secrets.
// Public Firebase client defaults keep production sign-in configured when build
// overrides are absent. This key must be restricted to Firebase-related APIs.
// Never use this key for Gemini or put private/Admin credentials in client code.
// https://firebase.google.com/docs/projects/api-keys
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyB2Jh-ayFX6FcZnKapBkCR1dj_PGfd1-uA",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "emergeaid-e702f.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "emergeaid-e702f",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:154033445433:web:65250477ef1f76ef6a8be8",
};

export const firebaseConfigured = Object.values(config).every(value => Boolean(value?.trim()));
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!firebaseConfigured) throw new Error("Firebase configuration is missing.");
  if (auth) return auth;
  const app = getApps().length ? getApp() : initializeApp(config);
  try {
    auth = initializePersistentAuth(app);
  } catch (error) {
    // Fast Refresh may have already initialized this app's Auth instance.
    if ((error as { code?: string }).code !== "auth/already-initialized") throw error;
    auth = getAuth(app);
  }
  return auth;
}
