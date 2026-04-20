export type RouteType = 'fastest' | 'shade' | 'scenic';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Route {
  id: string;
  type: RouteType;
  name: string;
  distanceKm: number;
  estimatedMinutes: number;
  shadeScore: number;
  scenicScore: number;
  polyline: Coordinate[];
}

export interface SearchResult {
  name: string;
  coordinate: Coordinate;
}

export type ReportType = 'nice_spot' | 'hazard' | 'no_shade' | 'construction';

export interface Report {
  id: string;
  type: ReportType;
  location: Coordinate;
  timestamp: number;
  note?: string;
}
