import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#0891b2", "#d1d5db"];

export default function LeadQuality() {
  const { data } = useQuery({
    queryKey: ["analytics_scroll_quality"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_scroll_quality" as any);
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row as { total_leads: number; high_scroll_leads: number; high_scroll_pct: number } | null;
    },
    refetchInterval: 30_000,
  });

  const chartData = data
    ? [
        { name: "Scroll ≥ 75%", value: Number(data.high_scroll_leads) },
        { name: "Scroll < 75%", value: Number(data.total_leads) - Number(data.high_scroll_leads) },
      ]
    : [];

  return (
    <div className="rounded-2xl bg-gray-100 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] p-5">
      <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-4">Qualidade de Lead (30d)</h3>
      <div className="h-56">
        {!data || data.total_leads === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 12, color: "#374151" }} />
              <Legend wrapperStyle={{ color: "#6b7280", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {data && data.total_leads > 0 && (
        <p className="text-center text-xs text-gray-500 mt-2">{data.high_scroll_pct}% dos leads exploraram a página a fundo</p>
      )}
    </div>
  );
}
