import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const BUTTON_LABELS: Record<string, string> = {
  "btn-flutuante": "Botão Flutuante",
  "btn-hero": "Hero (Topo)",
  "btn-cta-banner": "CTA Banner",
  "btn-faq": "FAQ",
  "btn-antes-depois": "Antes e Depois",
};

export default function ButtonConversion() {
  const { data = [] } = useQuery({
    queryKey: ["analytics_leads_by_button"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_leads_by_button" as any);
      if (error) throw error;
      return (data as any[]).map((d: any) => ({
        name: BUTTON_LABELS[d.button_id] || d.button_id,
        leads: Number(d.lead_count),
      }));
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="rounded-2xl bg-gray-100 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] p-5">
      <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-4">Conversão por Botão (30d)</h3>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 12, color: "#374151", boxShadow: "4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff" }} />
              <Bar dataKey="leads" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
