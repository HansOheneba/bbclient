"use client";

import * as React from "react";
import { MapPin, Navigation, Search, Loader2, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  DeliveryLocationPayload,
  AutocompleteSuggestion,
  ReverseGeocodeResult,
} from "@/lib/location-types";

// ── Props ────────────────────────────────────
type LocationPickerProps = {
  value: DeliveryLocationPayload | null;
  onChange: (location: DeliveryLocationPayload) => void;
};

export default function LocationPicker({
  value,
  onChange,
}: LocationPickerProps) {
  // ── Search state ──────────────────────────
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<
    AutocompleteSuggestion[]
  >([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [searching, setSearching] = React.useState(false);

  // ── GPS state ─────────────────────────────
  const [locating, setLocating] = React.useState(false);
  const [geoError, setGeoError] = React.useState<string | null>(null);

  // ── Extra directions ──────────────────────
  const [notes, setNotes] = React.useState(value?.notes ?? "");

  // ── Refs ──────────────────────────────────
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Sync notes back to parent when they change
  React.useEffect(() => {
    if (value && notes !== (value.notes ?? "")) {
      onChange({ ...value, notes: notes || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  // ── Autocomplete fetch ────────────────────
  function handleQueryChange(q: string) {
    setQuery(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({ q });
        if (value?.lat != null && value?.lng != null) {
          params.set("lat", String(value.lat));
          params.set("lng", String(value.lng));
        }
        const res = await fetch(`/api/location/autocomplete?${params}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("autocomplete failed");
        const data: { results: AutocompleteSuggestion[] } = await res.json();
        setSuggestions(data.results);
        setShowDropdown(data.results.length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  // ── Select suggestion ─────────────────────
  function selectSuggestion(s: AutocompleteSuggestion) {
    const payload: DeliveryLocationPayload = {
      label: s.label,
      area: null,
      landmark: s.landmark,
      notes: notes || null,
      lat: s.lat,
      lng: s.lng,
      provider: "tomtom",
      providerPlaceId: s.id,
    };
    onChange(payload);
    setQuery(s.label);
    setShowDropdown(false);
    setSuggestions([]);
  }

  // ── Use my location (GPS) ─────────────────
  function handleUseMyLocation() {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `/api/location/reverse?lat=${latitude}&lng=${longitude}`,
            { cache: "no-store" },
          );
          if (!res.ok) throw new Error("reverse geocoding failed");
          const data: ReverseGeocodeResult = await res.json();

          const payload: DeliveryLocationPayload = {
            label: data.label,
            area: data.area,
            landmark: data.landmark,
            notes: notes || null,
            lat: data.lat,
            lng: data.lng,
            provider: "tomtom",
            providerPlaceId: data.providerPlaceId,
          };
          onChange(payload);
          setQuery(data.label);
        } catch {
          setGeoError(
            "We could not resolve your location. Please search for a nearby place instead.",
          );
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError("Location permission denied. Please allow access.");
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError("Position unavailable. Try again.");
            break;
          case err.TIMEOUT:
            setGeoError("Location request timed out. Try again.");
            break;
          default:
            setGeoError("Could not get your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  // ── Clear selection ───────────────────────
  function handleClear() {
    onChange({
      label: "",
      area: null,
      landmark: null,
      notes: notes || null,
      lat: null,
      lng: null,
      provider: "manual",
      providerPlaceId: null,
    });
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  }

  // ── Render ────────────────────────────────
  return (
    <div ref={containerRef} className="space-y-3">
      {/* GPS button */}
      <Button
        type="button"
        variant="secondary"
        className="w-full justify-start gap-2"
        disabled={locating}
        onClick={handleUseMyLocation}
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Navigation className="h-4 w-4" />
        )}
        {locating ? "Getting location…" : "Use my current location"}
      </Button>

      {geoError && <p className="text-xs text-destructive">{geoError}</p>}

      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search for an area, landmark, or nearby place…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            className="pl-9 pr-9"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showDropdown && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border bg-card shadow-lg overflow-hidden">
            {searching && (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Searching…
              </div>
            )}
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent/10 transition flex items-start gap-2"
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="leading-snug">{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Extra directions */}
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Extra directions{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          placeholder="Type a place that appears on the map (eg. a nearby landmark, school, junction)…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Preview of final delivery label */}
      {value && value.label && (
        <div className="rounded-xl border bg-card p-3 space-y-1">
          <p className="text-xs text-muted-foreground">Delivery location</p>
          <p className="text-sm font-medium flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            {value.label}
          </p>
          {value.notes && (
            <p className="text-xs text-muted-foreground ml-6 italic">
              📝 {value.notes}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Some areas in Accra do not show up clearly on the map. If your exact
            spot is not listed, type a nearby landmark or place name we can
            search on the map, then add a short direction (eg. “behind X”,
            “opposite Y”).
          </p>
        </div>
      )}
    </div>
  );
}
