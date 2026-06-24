# Responcity Mobile

Expo React Native demo app for Responcity.

## Development With Expo Go

```bash
cd mobile
npm install
npx expo start
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
