import { SearchResult } from '../constants/types';

const BASE = 'https://nominatim.openstreetmap.org';

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  if (query.length < 3) return [];
  const url = `${BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`;
  const res = await fetch(url, { headers: { 'User-Agent': '10KWalkingApp/1.0' } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item: any) => ({
    name: item.display_name,
    coordinate: { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) },
  }));
}
