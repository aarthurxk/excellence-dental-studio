import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#0891b2", "#7c3aed", "#f59e0b", "#ef4444", "#22c55e", "#6b7280"];

export default function DeviceBreakdown() {
  const { data = [] } = useQuery({
    queryKey: ["analytics_device_breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_device_breakdown" as any);
      if (error) throw error;
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
    <div className="rounded-2xl bg-gray-100 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] p-5">
      <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-4">Dispositivos (30d)</h3>
      <div className="h-56">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 12, color: "#374151" }} />
              <Legend wrapperStyle={{ color: "#6b7280", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
