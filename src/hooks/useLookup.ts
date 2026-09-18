import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";

/** Fetches a read-only lookup list once on mount — for populating <select> dropdowns from the backend's lookup endpoints. */
export function useLookup<T>(path: string): { items: T[]; loading: boolean; error: string | null } {
  const { session } = useAuth();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setLoading(true);
    apiFetch<T[]>(session, path)
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError(`Could not load ${path}.`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, path]);

  return { items, loading, error };
}
