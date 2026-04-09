import { useEffect, useRef } from "react";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const CLICK_IDS = ["gclid", "fbclid", "ttclid"] as const;
const STORAGE_KEY = "oe_analytics";
const COOKIE_NAME = "oe_analytics";
const SESSION_KEY = "oe_session_id";
const COOKIE_DAYS = 90;

function generateSessionId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export interface AnalyticsData {
  session_id: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  entry_timestamp: number;
}

function getOrCreateSession(): AnalyticsData {
  // Try localStorage first, then cookie
  const stored = localStorage.getItem(STORAGE_KEY) || getCookie(COOKIE_NAME);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { /* rebuild */ }
  }

  const params = new URLSearchParams(window.location.search);
  const data: AnalyticsData = {
    session_id: sessionStorage.getItem(SESSION_KEY) || generateSessionId(),
    referrer: document.referrer || "",
    entry_timestamp: Date.now(),
  };

  UTM_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) (data as any)[k] = v;
  });

  CLICK_IDS.forEach((k) => {
    const v = params.get(k);
    if (v) (data as any)[k] = v;
  });

  // Persist
  const json = JSON.stringify(data);
  localStorage.setItem(STORAGE_KEY, json);
  setCookie(COOKIE_NAME, json, COOKIE_DAYS);
  sessionStorage.setItem(SESSION_KEY, data.session_id);

  return data;
}

/** Returns current analytics data without re-initializing */
export function getAnalyticsData(): AnalyticsData {
  return getOrCreateSession();
}

/** Returns seconds spent on page since entry */
export function getTimeOnSite(): number {
  const data = getAnalyticsData();
  return Math.round((Date.now() - data.entry_timestamp) / 1000);
}

/**
 * Silent hook — call once at App root.
 * Captures UTMs, referrer, session ID on mount. No re-renders.
 */
export function useAnalytics() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    getOrCreateSession();
  }, []);
}
