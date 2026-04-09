import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ChannelAttribution() {
  const { data = [] } = useQuery({
    queryKey: ["analytics_leads_by_source"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_leads_by_source" as any);
      if (error) throw error;
      return (data as any[]).map((d: any) => ({
        name: `${d.source}${d.campaign !== "(sem campanha)" ? ` / ${d.campaign}` : ""}`,
        leads: Number(d.lead_count),
      }));
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-4">Atribuição por Canal (30d)</h3>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={100} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
              <Bar dataKey="leads" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
