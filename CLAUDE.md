# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- Never delete any file in this repository without explicitly asking the user for confirmation first.

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
2. User sees a two-field search panel: From (defaults to "Your location") + To
3. Tapping From switches to origin search mode — same autocomplete as To, resets to GPS on clear
4. User types in To field → debounced call to `geocoding.ts` (Nominatim, bounded to ~8 miles) → dropdown of `SearchResult[]`
5. User selects a destination → `fetchRoutes()` in `routing.ts` calls OSRM for the real walking polyline, derives two mock variants by offsetting intermediate coords ±0.003° latitude
6. Routes render as `<Polyline>` on the map (tappable — selects that route); route cards shown in bottom-sheet overlay
7. Tapping the map collapses the overlay to a mini bar (emoji + destination); tapping the mini bar or a polyline re-expands it
8. Report FAB drops an emoji `<Marker>` at the user's current GPS coord — stored in local state only (no backend)

**External APIs (no keys required):**
- Nominatim `https://nominatim.openstreetmap.org/search` — place autocomplete, bounded to ~8-mile viewbox around user, falls back to global if no local results, sorted by distance
- OSRM `https://router.project-osrm.org/route/v1/walking` — returns GeoJSON (lon/lat order — must flip to `{ latitude, longitude }` for react-native-maps). Public server is driving-only, so walking time is calculated from distance at 5 km/h, not from OSRM duration.

**Mock route strategy:** Shade = intermediate polyline points shifted +0.003° lat (~300m north); Scenic = −0.003°. Endpoints pinned to real origin/destination. Scores (shadeScore, scenicScore 0–10) are hardcoded — structured to be replaced with real scoring later.

**SearchBar:** Uses `forwardRef` + `useImperativeHandle` to expose a `dismiss()` method (clears suggestions + hides keyboard). Called by `index.tsx` on map tap. Accepts `placeholder` and `autoFocus` props so it can be reused for both From and To fields.

**RouteResultsOverlay:** Has three visual states driven by a single `Animated.Value` — offscreen (initial), expanded (translateY=0), collapsed (translateY = containerHeight − 68px mini bar). Uses `onLayout` to measure actual height before collapsing.

## Key constraints

- `react-native-maps` requires a real device or emulator — does not render in Expo web.
- OSRM GeoJSON coordinates are `[longitude, latitude]` — flip to `{ latitude, longitude }` on ingest.
- All walking times use Haversine distance ÷ 5 km/h (OSRM public server returns driving duration).
- TypeScript strict mode is on (`tsconfig.json` extends `expo/tsconfig.base` with `"strict": true`).
- Default map region is Philadelphia (39.9526, -75.1652).

## What's not built yet

- Per-segment shade coloring (needs `RouteSegment` model with per-point `shadeScore`)
- Scenic POI markers on the map
- Shade scoring from real signals (time of day, street orientation, tree cover)
- Any backend — reports are lost on app restart
