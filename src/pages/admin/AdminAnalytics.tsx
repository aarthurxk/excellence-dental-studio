import KPICards from "@/components/analytics/KPICards";
import ChannelAttribution from "@/components/analytics/ChannelAttribution";
import LeadQuality from "@/components/analytics/LeadQuality";
import DeviceBreakdown from "@/components/analytics/DeviceBreakdown";
import ButtonConversion from "@/components/analytics/ButtonConversion";
import LeadsDataGrid from "@/components/analytics/LeadsDataGrid";
import GeoAccessChart from "@/components/analytics/GeoAccessChart";
import SectionEngagement from "@/components/analytics/SectionEngagement";
import DailyTrendChart from "@/components/analytics/DailyTrendChart";
import { BarChart3 } from "lucide-react";

export default function AdminAnalytics() {
  return (
    <div className="min-h-screen bg-gray-100 -m-6 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-100 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Analytics & BI</h2>
          <p className="text-xs text-gray-500">Dados em tempo real de tráfego e conversão</p>
        </div>
      </div>

      {/* KPIs */}
      <KPICards />

      {/* Daily Trend */}
      <DailyTrendChart />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChannelAttribution />
        <ButtonConversion />
      </div>

      {/* Geo Chart full width */}
      <GeoAccessChart />

      {/* Section Engagement */}
      <SectionEngagement />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeadQuality />
        <DeviceBreakdown />
      </div>

      {/* DataGrid */}
      <LeadsDataGrid />
    </div>
  );
}
