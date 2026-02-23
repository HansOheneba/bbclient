import { NextRequest, NextResponse } from "next/server";
import type { AutocompleteResponse } from "@/lib/location-types";

// TomTom Search endpoint (typeahead / autocomplete)
const TOMTOM_SEARCH = "https://api.tomtom.com/search/2/search";

// ── TomTom response types ────────────────────

type TomTomPoi = {
  name: string;
};

type TomTomAddress = {
  freeformAddress?: string;
  municipalitySubdivision?: string;
  municipality?: string;
  country?: string;
};

type TomTomPosition = {
  lat: number;
  lon: number;
};

type TomTomSearchResult = {
  id: string;
  type: string;
  poi?: TomTomPoi;
  address: TomTomAddress;
  position: TomTomPosition;
};

type TomTomSearchResponse = {
  results: TomTomSearchResult[];
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] } satisfies AutocompleteResponse);
  }

  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfiguration: missing TomTom API key" },
      { status: 500 },
    );
  }

  // Optional proximity bias
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const locationParams = lat && lng ? `&lat=${lat}&lon=${lng}` : "";

  const url = `${TOMTOM_SEARCH}/${encodeURIComponent(q)}.json?key=${apiKey}&limit=6&typeahead=true&countrySet=GH&language=en-US${locationParams}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json(
      { error: "TomTom search failed" },
      { status: 502 },
    );
  }

  const data: TomTomSearchResponse = await res.json();

  const results = data.results.map((r) => {
    const landmark = r.poi?.name ?? null;

    // Build a readable label from address parts
    const parts: string[] = [];
    if (landmark) parts.push(landmark);
    if (r.address.municipalitySubdivision)
      parts.push(r.address.municipalitySubdivision);
    if (
      r.address.municipality &&
      r.address.municipality !== r.address.municipalitySubdivision
    ) {
      parts.push(r.address.municipality);
    }
    const label =
      parts.length > 0 ? parts.join(", ") : (r.address.freeformAddress ?? q);

    return {
      id: r.id,
      label,
      landmark,
      lat: r.position.lat,
      lng: r.position.lon,
      provider: "tomtom" as const,
    };
  });

  return NextResponse.json({ results } satisfies AutocompleteResponse);
}
