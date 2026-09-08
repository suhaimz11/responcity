import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializePersistentAuth } from "./persistence";

// Expo replaces direct EXPO_PUBLIC references at build time. These identifiers
// are public client configuration, never Admin SDK or service-account secrets.
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
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
