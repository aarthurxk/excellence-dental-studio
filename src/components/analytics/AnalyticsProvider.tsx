import { useAnalytics } from "@/hooks/useAnalytics";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

/**
 * Invisible component — renders nothing.
 * Activates all tracking hooks at the root level.
 */
const AnalyticsProvider = () => {
  useAnalytics();
  useScrollDepth();
  useDeviceInfo();
  return null;
};

export default AnalyticsProvider;
