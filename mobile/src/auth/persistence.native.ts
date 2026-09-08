import type { FirebaseApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// Firebase exports this in its React Native entry point, but omits it from
// the shared web declarations used by TypeScript. Metro resolves it on native.
// @ts-expect-error React Native-only Firebase export.
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function initializePersistentAuth(app: FirebaseApp) {
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}
