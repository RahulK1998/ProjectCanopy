# 10K — Walking Navigation App

## What this is
A frictionless pedestrian navigation app (React Native + Expo). Opens to a map instantly, no login required. Helps users find walking routes optimized for speed, shade, or scenery.

## Stack
- React Native 0.81 + Expo SDK 54 + TypeScript
- Expo Router (file-based routing, single screen: `app/index.tsx`)
- `react-native-maps` for the map
- `expo-location` for GPS
- Nominatim (OpenStreetMap) for place search/geocoding — no API key needed
- OSRM public API for walking routing — no API key needed

## Current state (MVP working)
- Map opens centered on user GPS location
- Search bar with live autocomplete dropdown (Nominatim)
- Selecting a destination fetches a real walking route via OSRM
- 3 routes shown: Fastest (real OSRM), Shade (offset +0.003° lat), Scenic (offset -0.003° lat)
- Route cards show time, distance, shade score, scenic score
- Report FAB drops an emoji pin at user's current location (stored in local state only)
- No backend/database yet — all state is in-memory

## Key files
- `app/index.tsx` — main screen, all state lives here
- `src/services/routing.ts` — OSRM fetch + shade/scenic offset logic
- `src/services/geocoding.ts` — Nominatim place search
- `src/components/SearchBar.tsx` — search input with debounced autocomplete
- `src/components/RouteResultsOverlay.tsx` — animated bottom sheet
- `src/components/RouteCard.tsx` — individual route card with score bars
- `src/components/ReportModal.tsx` — report type picker, emits Report with GPS coords
- `src/constants/types.ts` — all TypeScript types
- `src/constants/colors.ts` — color palette + route colors
- `src/hooks/useLocation.ts` — GPS permission + location hook

## What's NOT built yet (next priorities)
1. Per-segment shade coloring on polylines (needs RouteSegment model)
2. Scenic markers/POI icons on map
3. Shade score based on real logic (time of day, street orientation)
4. Backend / database for persisting reports
5. Social/user features (deliberately deferred)

## Running the app
```bash
npx expo start
```
Scan QR with Expo Go on iPhone (same Wi-Fi). Use `--tunnel` if on restricted network.

## Design principles
- No signup, no onboarding
- Open app → see map immediately
- 3 route buttons only (no sliders)
- Mock data is fine for now — structure code to swap in real APIs later
