import type { FirebaseApp } from "firebase/app";
import { browserLocalPersistence, browserPopupRedirectResolver, initializeAuth } from "firebase/auth";

export function initializePersistentAuth(app: FirebaseApp) {
  return initializeAuth(app, {
    persistence: browserLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
}
