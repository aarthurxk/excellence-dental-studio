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
    <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-4">Conversão por Botão (30d)</h3>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
              <Bar dataKey="leads" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
