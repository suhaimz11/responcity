# Responcity

React + Vite prototype for the Responcity emergency response web app.

## Run Web App

```bash
npm install
npm run dev
```

## Build Web App

```bash
npm run build
```

## Deploy To Vercel

This app is ready for Vercel as a Vite project.

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Use these settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Notes

- `src/App.tsx` currently contains the standalone interactive demo.
- Production emergency features will need real integrations for location, Firebase, responder verification, notifications, and emergency-service escalation.
