import assert from "node:assert/strict";
import { test } from "node:test";
import { authErrorMessage, roleFromClaims, validateCredentials } from "../src/auth/policy.ts";

test("admin access requires a boolean claim, never a name or truthy string", () => {
  for (const claims of [{}, { admin: false }, { admin: "true" }, { admin: 1 }, { role: "admin" }, { email: "admin@example.com" }]) {
    assert.equal(roleFromClaims(claims), "user");
  }
  assert.equal(roleFromClaims({ admin: true }), "admin");
});

test("new accounts require a name and eight-character password", () => {
  assert.ok(validateCredentials("member@example.com", "12345678", " "));
  assert.ok(validateCredentials("member@example.com", "1234567", "Member"));
  assert.equal(validateCredentials(" member@example.com ", "12345678", "Member"), null);
});

test("login does not apply the new-account password policy to existing accounts", () => {
  assert.equal(validateCredentials("member@example.com", "older"), null);
  assert.ok(validateCredentials("member@example.com", ""));
});

test("malformed and missing emails are rejected", () => {
  for (const email of ["", "name", "name@", "name@example", "name @example.com"]) {
    assert.ok(validateCredentials(email, "password"));
  }
});

test("sign-in errors do not reveal whether an account exists", () => {
  const messages = ["auth/user-not-found", "auth/wrong-password", "auth/invalid-credential"].map(code => authErrorMessage({ code }));
  assert.equal(new Set(messages).size, 1);
});

test("network and throttling failures have actionable, distinct messages", () => {
  assert.match(authErrorMessage({ code: "auth/network-request-failed" }), /connection/);
  assert.match(authErrorMessage({ code: "auth/too-many-requests" }), /wait/);
});

test("Google sign-in failures give actionable messages", () => {
  assert.match(authErrorMessage({ code: "auth/popup-blocked" }), /popups/i);
  assert.match(authErrorMessage({ code: "auth/unauthorized-domain" }), /domain/i);
  assert.match(authErrorMessage({ code: "auth/account-exists-with-different-credential" }), /original method/i);
});
test("unknown errors never expose raw server details", () => {
  assert.equal(authErrorMessage({ message: "secret diagnostic", code: "unknown" }), "Authentication failed (unknown). Please try again.");
  assert.equal(authErrorMessage(null), "Something went wrong. Please try again.");
});
