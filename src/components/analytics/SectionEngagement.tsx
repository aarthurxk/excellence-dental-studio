import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Eye } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  sobre: "Sobre",
  tratamentos: "Tratamentos",
  equipe: "Equipe",
  depoimentos: "Depoimentos",
  "antes-depois": "Antes/Depois",
  videos: "Vídeos",
  eventos: "Eventos",
  faq: "FAQ",
  localizacao: "Localização",
};

export default function SectionEngagement() {
  const { data = [] } = useQuery({
    queryKey: ["analytics_section_engagement"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_section_engagement" as any);
      if (error) throw error;
      return (data as any[]).map((d: any) => ({
        section: SECTION_LABELS[d.section_name] || d.section_name,
        Visualizações: Number(d.views),
        Cliques: Number(d.clicks),
      }));
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="rounded-2xl bg-gray-100 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium">
          Engajamento por Seção (30d)
        </h3>
      </div>
      <div className="h-80">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Sem dados ainda
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="section" stroke="#9ca3af" fontSize={11} angle={-30} textAnchor="end" height={60} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  color: "#374151",
                  boxShadow: "4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff",
                }}
              />
              <Legend />
              <Bar dataKey="Visualizações" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cliques" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
