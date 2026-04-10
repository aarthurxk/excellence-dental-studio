import { useEffect, useRef } from "react";
import { getDeviceInfo } from "@/hooks/useDeviceInfo";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const CLICK_IDS = ["gclid", "fbclid", "ttclid"] as const;
const STORAGE_KEY = "oe_analytics";
const COOKIE_NAME = "oe_analytics";
const SESSION_KEY = "oe_session_id";
const SESSION_TRACKED_KEY = "oe_session_tracked";
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

/** Check if the current URL has UTM or click-ID params */
function urlHasTrackingParams(): boolean {
  const params = new URLSearchParams(window.location.search);
  return [...UTM_KEYS, ...CLICK_IDS].some((k) => params.has(k));
}

function getOrCreateSession(): AnalyticsData {
  const params = new URLSearchParams(window.location.search);
  const hasNewParams = urlHasTrackingParams();

  // If new tracking params arrive, always create a fresh session
  if (!hasNewParams) {
    const stored = localStorage.getItem(STORAGE_KEY) || getCookie(COOKIE_NAME);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch { /* rebuild */ }
    }
  }

  const data: AnalyticsData = {
    session_id: hasNewParams ? generateSessionId() : (sessionStorage.getItem(SESSION_KEY) || generateSessionId()),
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

  // Reset tracked flag so a new session record is sent
  if (hasNewParams) {
    sessionStorage.removeItem(SESSION_TRACKED_KEY);
  }

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

/** Fire-and-forget: send session to track-session edge function */
function trackSessionOnServer(data: AnalyticsData) {
  // Only track once per browser tab
  if (sessionStorage.getItem(SESSION_TRACKED_KEY)) return;
  sessionStorage.setItem(SESSION_TRACKED_KEY, "1");

  try {
    const device = getDeviceInfo();

    const payload = {
      session_id: data.session_id,
      referrer: data.referrer,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      utm_content: data.utm_content || null,
      utm_term: data.utm_term || null,
      gclid: data.gclid || null,
      fbclid: data.fbclid || null,
      ttclid: data.ttclid || null,
      device_os: device.device_os,
      browser: device.browser,
      browser_in_app: device.browser_in_app,
      screen_resolution: device.screen_resolution,
      network_type: device.network_type,
      user_timezone: device.user_timezone,
      user_language: device.user_language,
    };

    const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;
    if (!projectId) return;

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 500);

    fetch(`https://${projectId}.supabase.co/functions/v1/track-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // never block
  }
}

/**
 * Silent hook — call once at App root.
 * Captures UTMs, referrer, session ID on mount and sends session to server.
 */
export function useAnalytics() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const data = getOrCreateSession();
    trackSessionOnServer(data);
  }, []);
}
