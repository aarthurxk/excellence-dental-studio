import { useEffect, useRef } from "react";

const MILESTONES = [25, 50, 75, 100] as const;
const STORAGE_KEY = "oe_scroll_depth";

/** Returns the maximum scroll depth reached (0-100) */
export function getMaxScrollDepth(): number {
  return parseInt(sessionStorage.getItem(STORAGE_KEY) || "0", 10);
}

/**
 * Passive scroll listener — stores max depth in sessionStorage.
 * Zero re-renders. Call once at App root.
 */
export function useScrollDepth() {
  const maxRef = useRef(0);

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const pct = Math.round((scrollTop / docHeight) * 100);
      const milestone = MILESTONES.reduce((prev, m) => (pct >= m ? m : prev), 0);

      if (milestone > maxRef.current) {
        maxRef.current = milestone;
        sessionStorage.setItem(STORAGE_KEY, String(milestone));
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
}
