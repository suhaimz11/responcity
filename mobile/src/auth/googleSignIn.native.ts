import Constants from "expo-constants";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

const webClientId = "154033445433-2vvbp9q5dc41cectkpgc11gg2d5no7ek.apps.googleusercontent.com";
let configured = false;

export const googleSignInAvailable = Constants.appOwnership !== "expo";

export async function signInWithGoogle(): Promise<void> {
  if (!googleSignInAvailable) throw { code: "auth/google-native-not-configured" };

  const { GoogleSignin, isSuccessResponse } = await import("@react-native-google-signin/google-signin");
  if (!configured) {
    GoogleSignin.configure({ webClientId });
    configured = true;
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) throw { code: "auth/popup-closed-by-user" };
  if (!response.data.idToken) throw { code: "auth/google-missing-id-token" };

  const credential = GoogleAuthProvider.credential(response.data.idToken);
  await signInWithCredential(getFirebaseAuth(), credential);
}
