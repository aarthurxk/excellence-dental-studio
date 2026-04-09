import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

export default function DailyTrendChart() {
  const { data = [] } = useQuery({
    queryKey: ["analytics_daily_trend"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();

      const [leadsRes, sessionsRes] = await Promise.all([
        supabase
          .from("whatsapp_leads")
          .select("created_at")
          .gte("created_at", since),
        supabase
          .from("traffic_sessions")
          .select("created_at")
          .gte("created_at", since),
      ]);

      const bucket: Record<string, { leads: number; sessions: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().slice(5, 10); // MM-DD
        bucket[key] = { leads: 0, sessions: 0 };
      }

      (leadsRes.data ?? []).forEach((r) => {
        const key = r.created_at.slice(5, 10);
        if (bucket[key]) bucket[key].leads++;
      });

      (sessionsRes.data ?? []).forEach((r) => {
        const key = r.created_at.slice(5, 10);
        if (bucket[key]) bucket[key].sessions++;
      });

      return Object.entries(bucket).map(([date, v]) => ({
        date,
        Leads: v.leads,
        Sessões: v.sessions,
      }));
    },
    refetchInterval: 60_000,
  });

  return (
    <div className="rounded-2xl bg-gray-100 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium">
          Tendência Diária (30d)
        </h3>
      </div>
      <div className="h-72">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
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
              <Line type="monotone" dataKey="Leads" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Sessões" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
