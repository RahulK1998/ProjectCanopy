import { Coordinate, SearchResult } from '../constants/types';

const BASE = 'https://nominatim.openstreetmap.org';

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

async function fetchNominatim(query: string, near?: Coordinate, bounded = false): Promise<SearchResult[]> {
  let url = `${BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=0`;
  if (near) {
    const d = 0.12; // ~8 miles box
    url += `&viewbox=${near.longitude - d},${near.latitude + d},${near.longitude + d},${near.latitude - d}`;
    if (bounded) url += '&bounded=1';
  }
  const res = await fetch(url, { headers: { 'User-Agent': 'CanopyApp/1.0' } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item: any) => ({
    name: item.display_name,
    coordinate: { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) },
  }));
}

export async function searchPlaces(query: string, near?: Coordinate): Promise<SearchResult[]> {
  if (query.length < 3) return [];

  // Try bounded local search first; fall back to global if nothing found
  let results = near ? await fetchNominatim(query, near, true) : [];
  if (results.length === 0) results = await fetchNominatim(query, near, false);

  // Sort by distance from user so nearest results appear first
  if (near) {
    results.sort((a, b) => haversineKm(near, a.coordinate) - haversineKm(near, b.coordinate));
  }

  return results.slice(0, 5);
}
