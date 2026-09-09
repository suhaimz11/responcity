# Connect Firebase Authentication

The app now requires real Firebase authentication. Without configuration it
shows a setup notice and disables sign-in; there is no demo bypass.

## Create the free development project

1. Open https://console.firebase.google.com/ and create a development project
   for Emerge Aid. Stay on Spark; this email/password setup does not require
   billing, Analytics, or the optional Identity Platform upgrade.
2. In **Build > Authentication > Get started > Sign-in method**, enable
   **Email/Password**. Leave email-link sign-in disabled.
3. Under **Project settings > General > Your apps**, register a **Web app**.
   The Firebase JavaScript SDK uses this configuration for web, Android, and
   iOS, including Expo Go. Firebase Hosting is not needed for this step.
4. The Emerge Aid Firebase web configuration is included in the app because
   Firebase client identifiers are public. To connect a different staging
   project, copy `mobile/.env.example` to `mobile/.env.local` and fill in its
   four values. Do not paste an Admin SDK key, private key, or service-account
   JSON. Authorization belongs in Firebase rules and trusted server code.
5. In Authentication settings, configure a minimum password length of eight
   characters. Enable email enumeration protection if it is not already on.
6. Review the verification and reset email templates. Add the actual web
   deployment domain to **Authorized domains**, and add `localhost` for local
   web testing if it is absent. The default Firebase-hosted email action pages
   work for this flow: users open the link, then return to the app.
7. Restart Expo from `mobile` with `npx expo start --clear`. When working without
   network access to Expo services, set `EXPO_OFFLINE=1`; Firebase auth itself
   still requires internet access.

For staging, supply these four environment variables in the corresponding EAS
or Vercel build environment. Production builds use the checked-in Emerge Aid
client configuration by default. Editing local configuration does not update a
bundle that has already been built.

For Vercel, copy the hostname only (for example `your-app.vercel.app`) from the
deployment URL and add it under **Firebase Console > Authentication > Settings
> Authorized domains**. Add every production custom domain that serves the app.
After changing code or build variables, trigger a new Vercel deployment because
Expo embeds client configuration when it creates the web bundle.

## Verify the flow with your project

- Create an account with a test email you control. The app opens verification
  rather than the authenticated screens.
- Send the verification email. Resend is limited to once per minute in the UI;
  Firebase also enforces its own quotas. Open the link and tap **I've verified
  my email** to refresh the user and token.
- Confirm both requester and helper modes are available with one account.
- Restart the app and reload the web preview: the session should restore.
- Log out; navigating back must not reveal the authenticated screens.
- Try a wrong password, reset the password, then sign in with the new one.
- Test offline sign-in and failed requests, and verify the UI allows retry.
- Test Android and iOS on physical devices, including restart persistence.

Run `npm run typecheck` and `npm run test:auth` from `mobile` for local checks
(the test command requires Node 22.18+ or Node 24+). Export builds using
`npx expo export -p web --output-dir ../dist`.

For an account-lifecycle integration test without a Firebase project or real
emails, run `npm run test:auth:emulator`. This uses Firebase CLI's local Auth
emulator on `127.0.0.1:9099` and the demo project `demo-emerge-aid`. The first run
downloads Firebase CLI using npx. It checks account creation, wrong passwords,
email verification, password reset, and logout; it does not replace device UI
and persistence testing with your configured project.

## Admin access

There are no embedded admin passwords or client-side admin signup options.
The UI reads only the boolean `admin: true` custom claim in a Firebase ID token.
Assign it to a specific verified UID using the Firebase Admin SDK in a trusted
server environment, then have that user sign out and back in to refresh claims.
Never ship the Admin SDK credentials in the app or an EXPO_PUBLIC variable.

This is a UI access gate, not backend authorization. Request review and chat
still use demo data in memory. When they move to a database, enforce ownership,
verified-email status, and admin claims in Security Rules or server endpoints.
Authentication alone does not make SOS delivery or the rest of the demo live.

## References

- https://docs.expo.dev/guides/using-firebase/
- https://firebase.google.com/docs/auth/web/start
- https://firebase.google.com/docs/auth/web/manage-users
- https://firebase.google.com/docs/auth/admin/custom-claims
