# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start          # Start Metro bundler + dev server
npx expo start --tunnel # Use Expo tunnel (for restricted networks)
npx expo install <pkg>  # Install Expo-compatible package version
```

There is no test runner or linter configured yet.

## Architecture

Single-screen Expo Router app. All navigation state lives in `app/index.tsx` — there are no other routes.

**Data flow:**
1. `useLocation` hook acquires GPS coords on mount
2. User types in `SearchBar` → debounced call to `geocoding.ts` (Nominatim) → dropdown of `SearchResult[]`
3. User selects a result → `fetchRoutes()` in `routing.ts` calls OSRM for the real walking polyline, then derives two mock variants by offsetting intermediate coordinates ±0.003° latitude
4. Routes are rendered as `<Polyline>` on the map; route cards shown in the bottom-sheet overlay
5. Report taps create a `Report` object at the user's current GPS coord and render as emoji `<Marker>` — stored in local state only (no backend)

**External APIs (no keys required):**
- Nominatim `https://nominatim.openstreetmap.org/search` — place autocomplete
- OSRM `https://router.project-osrm.org/route/v1/walking` — walking directions, returns GeoJSON (lon/lat order — convert to {latitude, longitude} on ingest)

**Mock route strategy:** Shade route = all intermediate polyline points shifted +0.003° lat (~300m north); Scenic = −0.003°. Endpoints are always pinned to real origin/destination. Scores (shadeScore, scenicScore 0–10) are hardcoded constants — structured to be replaced with real scoring later.

## Key constraints

- `react-native-maps` requires a real device or emulator — it does not render in Expo web.
- OSRM GeoJSON coordinates are `[longitude, latitude]` — must be flipped to `{ latitude, longitude }` for react-native-maps.
- Shade/scenic `estimatedMinutes` is calculated from polyline distance (Haversine) at 5 km/h; fastest uses OSRM's actual `duration` field.
- TypeScript strict mode is on (`tsconfig.json` extends `expo/tsconfig.base` with `"strict": true`).

## What's not built yet

- Per-segment shade coloring (needs `RouteSegment` model with per-point `shadeScore`)
- Scenic POI markers on the map
- Shade scoring from real signals (time of day, street orientation, tree cover)
- Any backend — reports are lost on app restart
