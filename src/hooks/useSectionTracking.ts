import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAnalyticsData } from "@/hooks/useAnalytics";

const TRACKED_VIEWS = new Set<string>();

function getSessionId(): string {
  return getAnalyticsData().session_id;
}

async function insertEvent(sectionName: string, eventType: "view" | "click") {
  try {
    await supabase.from("section_events" as any).insert({
      session_id: getSessionId(),
      event_type: eventType,
      section_name: sectionName,
    });
  } catch {
    // silent
  }
}

/** Track a click on a section CTA */
export function trackSectionClick(sectionName: string) {
  insertEvent(sectionName, "click");
}

/**
 * Hook that sets up IntersectionObserver for all elements with data-section.
 * Call once at root (e.g. in AnalyticsProvider or Index page).
 */
export function useSectionTracking() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const section = (entry.target as HTMLElement).dataset.section;
          if (!section || TRACKED_VIEWS.has(section)) return;
          TRACKED_VIEWS.add(section);
          insertEvent(section, "view");
        });
      },
      { threshold: 0.5 }
    );

    // Observe all elements with data-section
    const elements = document.querySelectorAll("[data-section]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Re-observe when DOM might have changed (e.g. after data loads)
  const reobserve = useCallback(() => {
    if (!observerRef.current) return;
    const elements = document.querySelectorAll("[data-section]");
    elements.forEach((el) => observerRef.current?.observe(el));
  }, []);

  return { reobserve };
}
