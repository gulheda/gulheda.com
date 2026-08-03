import { useEffect, useState } from "react";

/**
 * Probe a list of candidate asset URLs (FLUX renders dropped into /public)
 * and return the first one that actually exists, else null.
 * Lets the site upgrade itself as real imagery arrives — no code changes.
 */
export default function useAsset(candidates) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (function probe(i) {
      if (cancelled || i >= candidates.length) return;
      const img = new Image();
      img.onload = () => !cancelled && setUrl(candidates[i]);
      img.onerror = () => probe(i + 1);
      img.src = candidates[i];
    })(0);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.join("|")]);

  return url;
}
