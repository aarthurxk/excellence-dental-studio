import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
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

const PER_PAGE = 10;

export default function LeadsDataGrid() {
  const [page, setPage] = useState(1);

  const { data: leads = [] } = useQuery({
    queryKey: ["analytics_leads_grid"],
    queryFn: async () => {
      const { data: leadsData, error: leadsErr } = await supabase
        .from("whatsapp_leads")
        .select("*")
        .eq("is_bot", false)
        .order("click_timestamp", { ascending: false })
        .limit(30);
      if (leadsErr) throw leadsErr;

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

  const totalPages = Math.ceil(leads.length / PER_PAGE);
  const paginatedLeads = leads.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
    a.download = `cliques_whatsapp_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-gray-100 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium">Últimos 30 Cliques WhatsApp</h3>
        <Button size="sm" variant="outline" onClick={exportCSV} className="text-xs border-gray-300 text-gray-600 hover:bg-gray-200 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] bg-gray-100">
          <Download className="h-3 w-3 mr-1" /> CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="text-gray-500 text-xs">Data</TableHead>
              <TableHead className="text-gray-500 text-xs">Botão</TableHead>
              <TableHead className="text-gray-500 text-xs">Cidade</TableHead>
              <TableHead className="text-gray-500 text-xs">ISP</TableHead>
              <TableHead className="text-gray-500 text-xs">Origem</TableHead>
              <TableHead className="text-gray-500 text-xs">Navegador</TableHead>
              <TableHead className="text-gray-500 text-xs">Tempo</TableHead>
              <TableHead className="text-gray-500 text-xs">Scroll</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-gray-400 py-8">Nenhum clique registrado ainda</TableCell></TableRow>
            ) : (
              paginatedLeads.map((l) => (
                <TableRow key={l.id} className="border-gray-200 hover:bg-gray-200/50">
                  <TableCell className="text-gray-700 text-xs whitespace-nowrap">
                    {format(new Date(l.click_timestamp), "dd/MM HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-gray-700 text-xs">{BUTTON_LABELS[l.button_id] || l.button_id}</TableCell>
                  <TableCell className="text-gray-700 text-xs">{l.geo_city || "—"}{l.geo_state ? `, ${l.geo_state}` : ""}</TableCell>
                  <TableCell className="text-gray-700 text-xs">{l.ip_isp || "—"}</TableCell>
                  <TableCell className="text-gray-700 text-xs">{l.utm_source || "direto"}</TableCell>
                  <TableCell className="text-gray-700 text-xs">
                    {l.browser || "—"}{l.browser_in_app ? " 📱" : ""}
                  </TableCell>
                  <TableCell className="text-gray-700 text-xs">{l.time_on_site_seconds}s</TableCell>
                  <TableCell className="text-gray-700 text-xs">{l.max_scroll_depth}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-400">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs text-gray-600 h-8 px-3 bg-gray-100 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] disabled:opacity-40"
            >
              <ChevronLeft className="h-3 w-3 mr-1" /> Anterior
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs text-gray-600 h-8 px-3 bg-gray-100 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] disabled:opacity-40"
            >
              Próximo <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
