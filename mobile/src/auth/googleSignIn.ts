import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const googleSignInAvailable = true;

export async function signInWithGoogle() {
  await signInWithPopup(getFirebaseAuth(), googleProvider);
}
