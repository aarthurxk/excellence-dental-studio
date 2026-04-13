import { getAnalyticsData, getTimeOnSite } from "@/hooks/useAnalytics";
import { getMaxScrollDepth } from "@/hooks/useScrollDepth";
import { getDeviceInfo } from "@/hooks/useDeviceInfo";

/**
 * Universal tracked WhatsApp opener.
 * Uses sendBeacon (fire-and-forget) when available, fetch+keepalive as fallback.
 * NEVER blocks navigation.
 */
export function openTrackedWhatsApp(buttonId: string, url: string): void {
  // Fire tracking first, then open immediately
  try {
    const analytics = getAnalyticsData();
    const device = getDeviceInfo();

    const payload = {
      session: {
        session_id: analytics.session_id,
        referrer: analytics.referrer,
        utm_source: analytics.utm_source || null,
        utm_medium: analytics.utm_medium || null,
        utm_campaign: analytics.utm_campaign || null,
        utm_content: analytics.utm_content || null,
        utm_term: analytics.utm_term || null,
        gclid: analytics.gclid || null,
        fbclid: analytics.fbclid || null,
        ttclid: analytics.ttclid || null,
        device_os: device.device_os,
        browser: device.browser,
        browser_in_app: device.browser_in_app,
        screen_resolution: device.screen_resolution,
        network_type: device.network_type,
        user_timezone: device.user_timezone,
        user_language: device.user_language,
      },
      lead: {
        session_id: analytics.session_id,
        button_id: buttonId,
        time_on_site_seconds: getTimeOnSite(),
        max_scroll_depth: getMaxScrollDepth(),
        user_timezone: device.user_timezone,
        user_language: device.user_language,
      },
    };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const endpoint = `${supabaseUrl}/functions/v1/track-lead`;
    const body = JSON.stringify(payload);

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
      },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never block WhatsApp
  }

  // Open WhatsApp immediately — no waiting
  window.open(url, "_blank", "noopener,noreferrer");
}
