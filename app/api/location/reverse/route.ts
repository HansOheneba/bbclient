import { NextRequest, NextResponse } from "next/server";
import type { ReverseGeocodeResult } from "@/lib/location-types";

// TomTom Reverse Geocode endpoint
const TOMTOM_REVERSE = "https://api.tomtom.com/search/2/reverseGeocode";

// TomTom Nearby Search (POIs close to the coordinates)
const TOMTOM_NEARBY = "https://api.tomtom.com/search/2/nearbySearch/.json";

// ── TomTom response types ────────────────────

type TomTomAddress = {
  streetName?: string;
  municipalitySubdivision?: string;
  municipality?: string;
  countrySubdivision?: string;
  country?: string;
  freeformAddress?: string;
  localName?: string;
};

type TomTomReverseResult = {
  address: TomTomAddress;
  position?: string; // "lat,lon"
};

type TomTomReverseResponse = {
  addresses: TomTomReverseResult[];
};

type TomTomNearbyResult = {
  id: string;
  poi?: { name: string };
  address: TomTomAddress;
  position: { lat: number; lon: number };
};

type TomTomNearbyResponse = {
  results: TomTomNearbyResult[];
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: "lat and lng query params are required" },
      { status: 400 },
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng must be valid numbers" },
      { status: 400 },
    );
  }

  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfiguration: missing TomTom API key" },
      { status: 500 },
    );
  }

  // ── Two parallel requests for maximum specificity ─────────
  // 1. Reverse geocode → street / area / municipality
  // 2. Nearby POI search → closest landmark name
  const [reverseRes, nearbyRes] = await Promise.all([
    fetch(`${TOMTOM_REVERSE}/${lat},${lng}.json?key=${apiKey}&language=en-US`, {
      cache: "no-store",
    }),
    fetch(
      `${TOMTOM_NEARBY}?key=${apiKey}&lat=${lat}&lon=${lng}&radius=500&limit=1&language=en-US&countrySet=GH`,
      { cache: "no-store" },
    ),
  ]);

  if (!reverseRes.ok && !nearbyRes.ok) {
    return NextResponse.json(
      { error: "TomTom reverse geocoding failed" },
      { status: 502 },
    );
  }

  // ── Parse reverse geocode ─────────────────────────────────
  const reverseData: TomTomReverseResponse = reverseRes.ok
    ? await reverseRes.json()
    : { addresses: [] };

  const addr = reverseData.addresses[0]?.address ?? null;
  const street = addr?.streetName ?? null;
  const subdivision = addr?.municipalitySubdivision ?? null; // e.g. "East Legon"
  const localName = addr?.localName ?? null; // e.g. "Osu"
  const municipality = addr?.municipality ?? null; // e.g. "Accra"

  // ── Parse nearby POI ──────────────────────────────────────
  const nearbyData: TomTomNearbyResponse = nearbyRes.ok
    ? await nearbyRes.json()
    : { results: [] };

  const nearestPoi = nearbyData.results[0] ?? null;
  const landmark = nearestPoi?.poi?.name ?? null;
  const poiId = nearestPoi?.id ?? null;

  // ── Determine area (most specific subdivision) ────────────
  const area = subdivision ?? localName ?? null;
  const city = municipality ?? null;

  // ── Build a readable label ────────────────────────────────
  // Goal: "Near A&C Mall, East Legon, Accra"
  //    or "Oxford St, Osu, Accra"
  const labelParts: string[] = [];

  if (landmark) {
    labelParts.push(`Near ${landmark}`);
  } else if (street) {
    labelParts.push(street);
  }

  if (area) labelParts.push(area);
  if (city && city !== area) labelParts.push(city);

  const label =
    labelParts.length > 0
      ? labelParts.join(", ")
      : (addr?.freeformAddress ?? `${lat}, ${lng}`);

  const result: ReverseGeocodeResult = {
    label,
    area,
    landmark,
    lat,
    lng,
    provider: "tomtom",
    providerPlaceId: poiId,
  };

  return NextResponse.json(result);
}
