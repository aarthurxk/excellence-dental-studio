import { Calendar, Facebook, Instagram } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function parseHourRange(text: string | null | undefined): [number, number] | null {
  if (!text) return null;
  const match = text.match(/(\d{1,2})h?\s*[–-]\s*(\d{1,2})h?/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2])];
}

function isClinicOpen(weekday?: string | null, saturday?: string | null): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  if (day >= 1 && day <= 5) {
    const range = parseHourRange(weekday);
    if (range) return hour >= range[0] && hour < range[1];
    return hour >= 9 && hour < 19;
  }
  if (day === 6) {
    const range = parseHourRange(saturday);
    if (range) return hour >= range[0] && hour < range[1];
    return hour >= 9 && hour < 17;
  }
  return false;
}

const TopBar = () => {
  const { data: settings } = useSiteSettings();
  const open = isClinicOpen(settings?.hours_weekday, settings?.hours_saturday);
  const now = new Date();
  const dateStr = format(now, "dd/MM/yy");
  const dayName = format(now, "EEEE", { locale: ptBR });
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  return (
    <div className="bg-secondary text-primary-foreground py-2.5 text-sm hidden md:block">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-3 text-primary-foreground/80">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{dateStr} - {capitalizedDay}</span>
          <Badge
            className={
              open
                ? "bg-green-600 text-white border-green-600 hover:bg-green-600"
                : "bg-destructive text-white border-destructive hover:bg-destructive"
            }
          >
            {open ? "ABERTO" : "FECHADO"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <a href={settings?.facebook_url || "#"} className="text-primary-foreground/70 hover:text-primary transition-colors"><Facebook className="h-4 w-4" /></a>
          <a href={settings?.instagram_url || "#"} className="text-primary-foreground/70 hover:text-primary transition-colors"><Instagram className="h-4 w-4" /></a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
