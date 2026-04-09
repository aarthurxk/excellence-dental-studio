import { getAnalyticsData, getTimeOnSite } from "@/hooks/useAnalytics";
import { getMaxScrollDepth } from "@/hooks/useScrollDepth";
import { getDeviceInfo } from "@/hooks/useDeviceInfo";

const TIMEOUT_MS = 500;

/**
 * Tracks a WhatsApp button click by sending data to the edge function.
 * Returns a promise that resolves within 500ms regardless of outcome.
 * NEVER blocks navigation — always resolves.
 */
export async function trackWhatsAppClick(buttonId: string): Promise<void> {
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

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const url = `https://${projectId}.supabase.co/functions/v1/track-lead`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true,
    });

    clearTimeout(timer);
  } catch {
    // Silently fail — never block WhatsApp redirect
  }
}
