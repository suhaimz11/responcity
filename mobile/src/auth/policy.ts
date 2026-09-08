export type AppUser = {
  uid: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: "user" | "admin";
};

export function roleFromClaims(claims: Record<string, unknown>): AppUser["role"] {
  return claims.admin === true ? "admin" : "user";
}

export function validateCredentials(email: string, password: string, name?: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
  if (name !== undefined && !name.trim()) return "Enter your full name.";
  if (!password) return "Enter your password.";
  if (name !== undefined && password.length < 8) return "Use at least 8 characters for your password.";
  return null;
}

export function authErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found": return "We couldn’t sign you in. Check your email and password.";
    case "auth/invalid-email": return "Enter a valid email address.";
    case "auth/email-already-in-use": return "Unable to create this account. Try signing in or resetting your password.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements": return "Choose a stronger password that meets the account password policy.";
    case "auth/too-many-requests": return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed": return "Couldn’t connect. Check your connection and try again.";
    case "auth/user-disabled": return "This account is unavailable. Contact support for help.";
    case "auth/requires-recent-login": return "Please sign in again to continue.";
    case "auth/operation-not-allowed": return "Email sign-in is not available yet. Please contact support.";
    case "auth/invalid-api-key":
    case "auth/configuration-not-found": return "Sign-in is not configured correctly. Please contact support.";
    default: return "Something went wrong. Please try again.";
  }
}
