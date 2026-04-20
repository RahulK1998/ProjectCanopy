import { Coordinate, Route } from '../constants/types';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/walking';

function geojsonToCoords(coords: number[][]): Coordinate[] {
  return coords.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
}

function haversineKm(a: Coordinate, b: Coordinate): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function polylineKm(coords: Coordinate[]): number {
  let d = 0;
  for (let i = 1; i < coords.length; i++) d += haversineKm(coords[i - 1], coords[i]);
  return d;
}

// Shift intermediate points by latOffset degrees to create a parallel mock route
function offsetPolyline(coords: Coordinate[], latOffset: number): Coordinate[] {
  return coords.map((c, i) =>
    i === 0 || i === coords.length - 1 ? c : { ...c, latitude: c.latitude + latOffset }
  );
}

export async function fetchRoutes(origin: Coordinate, destination: Coordinate): Promise<Route[]> {
  const url =
    `${OSRM_BASE}/${origin.longitude},${origin.latitude};` +
    `${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Routing request failed');
  const data = await res.json();
  if (!data.routes?.length) throw new Error('No route found');

  const osrm = data.routes[0];
  const fastestCoords = geojsonToCoords(osrm.geometry.coordinates);
  const fastestKm = osrm.distance / 1000;
  const fastestMin = Math.round(osrm.duration / 60);

  // Shade route: shift north ~300m, slightly longer → more shaded side streets
  const shadeCoords = offsetPolyline(fastestCoords, 0.003);
  const shadeKm = polylineKm(shadeCoords);

  // Scenic route: shift south ~300m, slightly longer → parks / waterfronts
  const scenicCoords = offsetPolyline(fastestCoords, -0.003);
  const scenicKm = polylineKm(scenicCoords);

  return [
    {
      id: 'fastest',
      type: 'fastest',
      name: 'Fastest',
      distanceKm: Math.round(fastestKm * 10) / 10,
      estimatedMinutes: fastestMin,
      shadeScore: 3,
      scenicScore: 4,
      polyline: fastestCoords,
    },
    {
      id: 'shade',
      type: 'shade',
      name: 'Most Shade',
      distanceKm: Math.round(shadeKm * 10) / 10,
      estimatedMinutes: Math.round((shadeKm / 5) * 60),
      shadeScore: 8,
      scenicScore: 5,
      polyline: shadeCoords,
    },
    {
      id: 'scenic',
      type: 'scenic',
      name: 'Most Scenic',
      distanceKm: Math.round(scenicKm * 10) / 10,
      estimatedMinutes: Math.round((scenicKm / 5) * 60),
      shadeScore: 5,
      scenicScore: 9,
      polyline: scenicCoords,
    },
  ];
}
