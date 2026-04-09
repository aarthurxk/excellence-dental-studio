import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadRow {
  id: string;
  click_timestamp: string;
  button_id: string;
  geo_city: string | null;
  geo_state: string | null;
  ip_isp: string | null;
  time_on_site_seconds: number;
  max_scroll_depth: number;
  // joined from session
  utm_source?: string | null;
  utm_campaign?: string | null;
  browser?: string | null;
  browser_in_app?: boolean;
}

const BUTTON_LABELS: Record<string, string> = {
  "btn-flutuante": "Flutuante",
  "btn-hero": "Hero",
  "btn-cta-banner": "CTA Banner",
  "btn-faq": "FAQ",
  "btn-antes-depois": "Antes/Depois",
};

export default function LeadsDataGrid() {
  const { data: leads = [] } = useQuery({
    queryKey: ["analytics_leads_grid"],
    queryFn: async () => {
      // Get leads
      const { data: leadsData, error: leadsErr } = await supabase
        .from("whatsapp_leads")
        .select("*")
        .order("click_timestamp", { ascending: false })
        .limit(200);
      if (leadsErr) throw leadsErr;

      // Get sessions for these leads
      const sessionIds = [...new Set((leadsData || []).map((l: any) => l.session_id))];
      const { data: sessions } = await supabase
        .from("traffic_sessions")
        .select("session_id, utm_source, utm_campaign, browser, browser_in_app")
        .in("session_id", sessionIds);

      const sessMap = new Map((sessions || []).map((s: any) => [s.session_id, s]));

      return (leadsData || []).map((l: any) => {
        const sess = sessMap.get(l.session_id) || {};
        return { ...l, ...sess } as LeadRow;
      });
    },
    refetchInterval: 15_000,
  });

  const exportCSV = () => {
    const headers = ["Data", "Botão", "Cidade", "Estado", "ISP", "Origem", "Campanha", "Navegador", "In-App", "Tempo (s)", "Scroll (%)"];
    const rows = leads.map((l) => [
      format(new Date(l.click_timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      BUTTON_LABELS[l.button_id] || l.button_id,
      l.geo_city || "—",
      l.geo_state || "—",
      l.ip_isp || "—",
      l.utm_source || "direto",
      l.utm_campaign || "—",
      l.browser || "—",
      l.browser_in_app ? "Sim" : "Não",
      l.time_on_site_seconds,
      l.max_scroll_depth,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-slate-400 uppercase tracking-wider">Últimos Leads</h3>
        <Button size="sm" variant="outline" onClick={exportCSV} className="text-xs border-white/20 text-slate-300 hover:bg-white/10">
          <Download className="h-3 w-3 mr-1" /> CSV
        </Button>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-slate-400">Data</TableHead>
              <TableHead className="text-slate-400">Botão</TableHead>
              <TableHead className="text-slate-400">Cidade</TableHead>
              <TableHead className="text-slate-400">ISP</TableHead>
              <TableHead className="text-slate-400">Origem</TableHead>
              <TableHead className="text-slate-400">Navegador</TableHead>
              <TableHead className="text-slate-400">Tempo</TableHead>
              <TableHead className="text-slate-400">Scroll</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-slate-500 py-8">Nenhum lead registrado ainda</TableCell></TableRow>
            ) : (
              leads.map((l) => (
                <TableRow key={l.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-slate-300 text-xs whitespace-nowrap">
                    {format(new Date(l.click_timestamp), "dd/MM HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-slate-300 text-xs">{BUTTON_LABELS[l.button_id] || l.button_id}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{l.geo_city || "—"}{l.geo_state ? `, ${l.geo_state}` : ""}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{l.ip_isp || "—"}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{l.utm_source || "direto"}</TableCell>
                  <TableCell className="text-slate-300 text-xs">
                    {l.browser || "—"}{l.browser_in_app ? " 📱" : ""}
                  </TableCell>
                  <TableCell className="text-slate-300 text-xs">{l.time_on_site_seconds}s</TableCell>
                  <TableCell className="text-slate-300 text-xs">{l.max_scroll_depth}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
