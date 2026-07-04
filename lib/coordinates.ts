export interface Coordinate {
  lat: number;
  lng: number;
}

export const COUNTRY_COORDINATES: Record<string, Coordinate> = {
  "argentina": { lat: -38.4161, lng: -63.6167 },
  "costa rica": { lat: 9.7489, lng: -83.7534 },
  "kenya": { lat: 0.0236, lng: 37.9062 },
  "maldives": { lat: 3.2028, lng: 73.2207 },
  "peru": { lat: -9.1900, lng: -75.0152 },
  "switzerland": { lat: 46.8182, lng: 8.2275 }
};

export function getCoordinatesForCountry(country: string): Coordinate {
  const normalized = country.toLowerCase().trim();
  return COUNTRY_COORDINATES[normalized] || { lat: 0, lng: 0 };
}
