// ── Delivery location types (shared between client & server) ──

export type DeliveryLocationPayload = {
  label: string;
  area?: string | null;
  landmark?: string | null;
  notes?: string | null;
  lat?: number | null;
  lng?: number | null;
  provider?: "tomtom" | "manual";
  providerPlaceId?: string | null;
};

/** Shape returned by /api/location/reverse */
export type ReverseGeocodeResult = {
  label: string;
  area: string | null;
  landmark: string | null;
  lat: number;
  lng: number;
  provider: "tomtom";
  providerPlaceId: string | null;
};

/** Single suggestion from /api/location/autocomplete */
export type AutocompleteSuggestion = {
  id: string;
  label: string;
  landmark: string | null;
  lat: number;
  lng: number;
  provider: "tomtom";
};

/** Shape returned by /api/location/autocomplete */
export type AutocompleteResponse = {
  results: AutocompleteSuggestion[];
};
