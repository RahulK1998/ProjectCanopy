import { Route } from '../constants/types';

// Mock routes around SF downtown — swap polylines for real routing API later
export const mockRoutes: Route[] = [
  {
    id: 'fastest',
    type: 'fastest',
    name: 'Fastest',
    distanceKm: 1.4,
    estimatedMinutes: 17,
    shadeScore: 3,
    scenicScore: 4,
    polyline: [
      { latitude: 37.7749, longitude: -122.4194 },
      { latitude: 37.7769, longitude: -122.4174 },
      { latitude: 37.7789, longitude: -122.4154 },
      { latitude: 37.7809, longitude: -122.4134 },
      { latitude: 37.7829, longitude: -122.4114 },
      { latitude: 37.7849, longitude: -122.4094 },
    ],
  },
  {
    id: 'shade',
    type: 'shade',
    name: 'Most Shade',
    distanceKm: 1.8,
    estimatedMinutes: 22,
    shadeScore: 8,
    scenicScore: 5,
    polyline: [
      { latitude: 37.7749, longitude: -122.4194 },
      { latitude: 37.7739, longitude: -122.4164 },
      { latitude: 37.7749, longitude: -122.4124 },
      { latitude: 37.7779, longitude: -122.4104 },
      { latitude: 37.7819, longitude: -122.4099 },
      { latitude: 37.7849, longitude: -122.4094 },
    ],
  },
  {
    id: 'scenic',
    type: 'scenic',
    name: 'Most Scenic',
    distanceKm: 2.1,
    estimatedMinutes: 26,
    shadeScore: 5,
    scenicScore: 9,
    polyline: [
      { latitude: 37.7749, longitude: -122.4194 },
      { latitude: 37.7779, longitude: -122.4224 },
      { latitude: 37.7819, longitude: -122.4204 },
      { latitude: 37.7849, longitude: -122.4164 },
      { latitude: 37.7859, longitude: -122.4124 },
      { latitude: 37.7849, longitude: -122.4094 },
    ],
  },
];
