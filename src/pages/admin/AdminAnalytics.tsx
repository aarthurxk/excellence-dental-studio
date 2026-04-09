import KPICards from "@/components/analytics/KPICards";
import ChannelAttribution from "@/components/analytics/ChannelAttribution";
import LeadQuality from "@/components/analytics/LeadQuality";
import DeviceBreakdown from "@/components/analytics/DeviceBreakdown";
import ButtonConversion from "@/components/analytics/ButtonConversion";
import LeadsDataGrid from "@/components/analytics/LeadsDataGrid";
import { BarChart3 } from "lucide-react";

export default function AdminAnalytics() {
  return (
    <div className="min-h-screen bg-slate-950 -m-6 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Analytics & BI</h2>
          <p className="text-xs text-slate-400">Dados em tempo real de tráfego e conversão</p>
        </div>
      </div>

      {/* KPIs */}
      <KPICards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChannelAttribution />
        <ButtonConversion />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeadQuality />
        <DeviceBreakdown />
      </div>

      {/* DataGrid */}
      <LeadsDataGrid />
    </div>
  );
}
