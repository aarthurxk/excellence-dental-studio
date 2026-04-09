import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Minus, Users, MousePointerClick } from "lucide-react";

type Period = "daily" | "weekly" | "monthly";
const PERIOD_LABELS: Record<Period, string> = { daily: "D/D-1", weekly: "S/S-1", monthly: "M/M-1" };

function useComparison(period: Period, type: "leads" | "sessions") {
  const fnMap: Record<Period, string> = {
    daily: "analytics_daily_comparison",
    weekly: "analytics_weekly_comparison",
    monthly: "analytics_monthly_comparison",
  };
  return useQuery({
    queryKey: ["analytics_comparison", period, type],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(fnMap[period] as any, { _type: type });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row as { current_count: number; previous_count: number; growth_percentage: number } | null;
    },
    refetchInterval: 30_000,
  });
}

function GrowthBadge({ pct }: { pct: number }) {
  if (pct === 0) return <span className="flex items-center gap-1 text-xs text-slate-400"><Minus className="h-3 w-3" /> 0%</span>;
  if (pct > 0) return <span className="flex items-center gap-1 text-xs text-emerald-400"><TrendingUp className="h-3 w-3" /> +{pct}%</span>;
  return <span className="flex items-center gap-1 text-xs text-red-400"><TrendingDown className="h-3 w-3" /> {pct}%</span>;
}

function KPICard({ title, icon: Icon, period, type }: { title: string; icon: any; period: Period; type: "leads" | "sessions" }) {
  const { data } = useComparison(period, type);
  return (
    <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 uppercase tracking-wider">{title}</span>
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <p className="text-3xl font-bold text-white">{data?.current_count ?? "—"}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">vs {data?.previous_count ?? "—"} ({PERIOD_LABELS[period]})</span>
        {data && <GrowthBadge pct={data.growth_percentage} />}
      </div>
    </div>
  );
}

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard title="Leads Hoje" icon={MousePointerClick} period="daily" type="leads" />
      <KPICard title="Sessões Hoje" icon={Users} period="daily" type="sessions" />
      <KPICard title="Leads Semana" icon={MousePointerClick} period="weekly" type="leads" />
      <KPICard title="Leads Mês" icon={MousePointerClick} period="monthly" type="leads" />
    </div>
  );
}
