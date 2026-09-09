// Native Google sign-in requires a custom development build and platform OAuth
// credentials. Keeping this adapter dependency-free preserves Expo Go support.
export const googleSignInAvailable = false;

export async function signInWithGoogle(): Promise<void> {
  throw { code: "auth/google-native-not-configured" };
}
