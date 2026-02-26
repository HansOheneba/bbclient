// lib/use-catalog.ts
"use client";

import { useState, useEffect } from "react";
import {
  fetchCatalog,
  type MenuItem,
  type Topping,
  type CatalogResponse,
} from "./menu-data";

interface UseCatalogResult {
  items: MenuItem[];
  toppings: Topping[];
  loading: boolean;
  error: string | null;
}

export function useCatalog(): UseCatalogResult {
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCatalog()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    items: data?.items ?? [],
    toppings: data?.toppings ?? [],
    loading,
    error,
  };
}
