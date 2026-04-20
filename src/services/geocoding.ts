import { Coordinate, SearchResult } from '../constants/types';

const BASE = 'https://nominatim.openstreetmap.org';

export async function searchPlaces(query: string, near?: Coordinate): Promise<SearchResult[]> {
  if (query.length < 3) return [];
  let url = `${BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`;
  if (near) {
    // Soft viewbox ~50km around current location — results outside still appear if nothing local matches
    const d = 0.45;
    url += `&viewbox=${near.longitude - d},${near.latitude + d},${near.longitude + d},${near.latitude - d}`;
  }
  const res = await fetch(url, { headers: { 'User-Agent': '10KWalkingApp/1.0' } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item: any) => ({
    name: item.display_name,
    coordinate: { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) },
  }));
}
