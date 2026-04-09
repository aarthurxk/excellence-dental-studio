import { useEffect, useRef } from "react";

const STORAGE_KEY = "oe_device_info";

export interface DeviceInfo {
  device_os: string;
  browser: string;
  browser_in_app: boolean;
  screen_resolution: string;
  network_type: string;
  user_timezone: string;
  user_language: string;
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/FBAN|FBAV/i.test(ua)) return "Facebook In-App";
  if (/Instagram/i.test(ua)) return "Instagram In-App";
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Firefox/i.test(ua)) return "Firefox";
  return "Other";
}

function isInAppBrowser(): boolean {
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|Line|Twitter|Snapchat/i.test(ua);
}

function getNetworkType(): string {
  const conn = (navigator as any).connection;
  return conn?.effectiveType || "unknown";
}

function collectDeviceInfo(): DeviceInfo {
  return {
    device_os: detectOS(),
    browser: detectBrowser(),
    browser_in_app: isInAppBrowser(),
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    network_type: getNetworkType(),
    user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    user_language: navigator.language || "unknown",
  };
}

export function getDeviceInfo(): DeviceInfo {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* recollect */ }
  }
  const info = collectDeviceInfo();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  return info;
}

/**
 * Collects device info once and stores in sessionStorage.
 * Zero re-renders. Call once at App root.
 */
export function useDeviceInfo() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    getDeviceInfo();
  }, []);
}
