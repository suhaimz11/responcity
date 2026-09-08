import assert from "node:assert/strict";
import { test } from "node:test";
import { initializeApp, deleteApp } from "firebase/app";
import { connectAuthEmulator, initializeAuth, inMemoryPersistence, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, sendEmailVerification, applyActionCode,
  reload, sendPasswordResetEmail, confirmPasswordReset, updateProfile, getIdTokenResult,
} from "firebase/auth";
import { roleFromClaims } from "../src/auth/policy.ts";

// Explicitly refuse any non-local target. No real accounts or emails are used.
const host = process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (host !== "127.0.0.1:9099") throw new Error("Run with the local Auth emulator on 127.0.0.1:9099.");
const projectId = "demo-emerge-aid";
const origin = `http://${host}`;

test("local email/password lifecycle: verification, roles, reset, and sign-out", async () => {
  const app = initializeApp({ apiKey: "emulator-only-key", projectId }, `test-${Date.now()}`);
  const auth = initializeAuth(app, { persistence: inMemoryPersistence });
  connectAuthEmulator(auth, origin, { disableWarnings: true });
  const email = `member-${Date.now()}@example.test`;
  const password = "Test-password-123!";
  async function emailCode(type) {
    const response = await fetch(`${origin}/emulator/v1/projects/${projectId}/oobCodes`);
    assert.equal(response.ok, true);
    const body = await response.json();
    const entry = body.oobCodes.filter(item => item.email === email && item.requestType === type).at(-1);
    assert.ok(entry, `Expected ${type} email in emulator`);
    return entry.oobCode;
  }
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    assert.equal(user.emailVerified, false);
    assert.equal(roleFromClaims((await getIdTokenResult(user)).claims), "user");
    await updateProfile(user, { displayName: "Test Member" });
    await sendEmailVerification(user);
    await applyActionCode(auth, await emailCode("VERIFY_EMAIL"));
    await reload(user);
    await user.getIdToken(true);
    assert.equal(user.emailVerified, true);
    assert.equal(user.displayName, "Test Member");
    await signOut(auth);
    assert.equal(auth.currentUser, null);
    await assert.rejects(signInWithEmailAndPassword(auth, email, "wrong-password"));
    assert.equal(auth.currentUser, null);
    await signInWithEmailAndPassword(auth, email, password);
    assert.equal(auth.currentUser.emailVerified, true);
    await sendPasswordResetEmail(auth, email);
    await confirmPasswordReset(auth, await emailCode("PASSWORD_RESET"), "New-password-456!");
    await signOut(auth);
    await assert.rejects(signInWithEmailAndPassword(auth, email, password));
    await signInWithEmailAndPassword(auth, email, "New-password-456!");
    assert.equal(auth.currentUser.email, email);
    await signOut(auth);
    assert.equal(auth.currentUser, null);
  } finally { await deleteApp(app); }
});
