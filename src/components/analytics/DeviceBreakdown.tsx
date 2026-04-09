import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e", "#64748b"];

export default function DeviceBreakdown() {
  const { data = [] } = useQuery({
    queryKey: ["analytics_device_breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_device_breakdown" as any);
      if (error) throw error;
      // Group by OS
      const osMap = new Map<string, number>();
      (data as any[]).forEach((d: any) => {
        const os = d.device_os || "Outro";
        osMap.set(os, (osMap.get(os) || 0) + Number(d.session_count));
      });
      return Array.from(osMap.entries()).map(([name, value]) => ({ name, value }));
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-4">Dispositivos (30d)</h3>
      <div className="h-56">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
