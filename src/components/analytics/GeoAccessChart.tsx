import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

type GeoGroup = "city" | "state";

export default function GeoAccessChart() {
  const [groupBy, setGroupBy] = useState<GeoGroup>("city");

  const { data = [] } = useQuery({
    queryKey: ["analytics_leads_by_geo", groupBy],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_leads_by_geo" as any, { _group_by: groupBy });
      if (error) throw error;
      return (data as any[]).map((d: any) => ({
        name: d.location_name,
        leads: Number(d.lead_count),
      }));
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="rounded-2xl bg-gray-100 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium">Acessos por Localização (30d)</h3>
        </div>
        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GeoGroup)}>
          <SelectTrigger className="w-32 h-8 text-xs bg-gray-100 border-none shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] rounded-lg text-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="city">Cidade</SelectItem>
            <SelectItem value="state">Estado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-72">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={120} />
              <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 12, color: "#374151", boxShadow: "4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff" }} />
              <Bar dataKey="leads" fill="#0d9488" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
