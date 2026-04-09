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
    <div className="rounded-2xl bg-gray-100 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] p-5">
      <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-4">Atribuição por Canal (30d)</h3>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={100} />
              <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 12, color: "#374151", boxShadow: "4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff" }} />
              <Bar dataKey="leads" fill="#0891b2" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
