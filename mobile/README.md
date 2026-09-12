# Emerge Aid Mobile

Expo React Native demo app for Emerge Aid.

## Development With Expo Go

This project targets Expo SDK 57. Use the matching Expo Go version on your phone.
After an SDK upgrade, stop the old Metro server before starting a fresh session.

Set up Firebase Authentication using [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
before signing in. Copy `.env.example` to `.env.local` and add your Firebase
web app configuration. Demo credentials no longer grant access.

```bash
cd mobile
npm install
npx expo start --clear
```

Scan the QR code with Expo Go on Android or iPhone.

## Android APK Demo Build

```bash
cd mobile
npx eas login
npx eas build:configure
npx eas build -p android --profile preview
```

The `preview` profile creates a standalone APK for demos.

## iOS Demo Path

- Use Expo Go for early testing.
- Use TestFlight later with an Apple Developer account.

## Environment configuration

The app includes public Firebase client defaults so production sign-in works
without build overrides. To use another Firebase project, set all four variables
from `.env.example` in `mobile/.env.local` or your Vercel/EAS build environment.
Restrict the default key to Firebase APIs; never allow Gemini or unrelated APIs.
See https://firebase.google.com/docs/projects/api-keys.
Never put Admin SDK or private credentials in
`EXPO_PUBLIC_` variables: these values are embedded in the client bundle.

For Android builds, download your Firebase Android app configuration as
`mobile/google-services.json`. This file is ignored by Git. For remote builds,
provide the file through your build environment and set `GOOGLE_SERVICES_JSON`
to its path. The Expo config uses that path when supplied.

If a credential alert was raised, review the exact key in Google Cloud, its API
and application restrictions, and its usage. Ignoring files does not remove
previous commits or revoke keys. Rotate/revoke any credential confirmed to be
secret or misused, and update the local and hosted build environments.
