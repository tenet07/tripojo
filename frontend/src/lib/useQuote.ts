import { useEffect, useRef, useState } from "react";
import { tripsApi } from "./tripojoApi";
import type { Quote, Selections } from "../types/addons";

/**
 * Keeps a server-priced basket in sync with what the traveler has picked.
 *
 * Two things this has to get right:
 *
 *  - Tapping "+" four times quickly should cost one request, not four, so
 *    changes are debounced.
 *  - Responses can come back out of order. Only the newest request is
 *    allowed to write to state, otherwise a slow earlier reply can land
 *    last and show a total for a basket the traveler has moved on from.
 */
export function useQuote(slug: string | undefined, travelers: number, selections: Selections) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestRequest = useRef(0);
  const serialised = JSON.stringify(selections);

  useEffect(() => {
    if (!slug) return undefined;

    const requestId = ++latestRequest.current;
    setPending(true);

    const timer = setTimeout(() => {
      tripsApi
        .quote(slug, travelers, JSON.parse(serialised) as Selections)
        .then((res) => {
          if (requestId !== latestRequest.current) return; // superseded
          setQuote(res.quote);
          setError(null);
        })
        .catch((err: Error) => {
          if (requestId !== latestRequest.current) return;
          setError(err.message);
        })
        .finally(() => {
          if (requestId === latestRequest.current) setPending(false);
        });
    }, 180);

    return () => clearTimeout(timer);
  }, [slug, travelers, serialised]);

  return { quote, pending, error };
}
