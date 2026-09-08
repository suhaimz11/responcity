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
