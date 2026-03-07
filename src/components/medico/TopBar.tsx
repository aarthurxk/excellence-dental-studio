import { Calendar, Facebook, Linkedin, Instagram } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function isClinicOpen(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  if (day >= 1 && day <= 5) return hour >= 9 && hour < 19;
  if (day === 6) return hour >= 9 && hour < 17;
  return false;
}

const TopBar = () => {
  const { data: settings } = useSiteSettings();
  const open = isClinicOpen();
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
          <a href="#" className="text-primary-foreground/70 hover:text-primary transition-colors"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
          <a href="#" className="text-primary-foreground/70 hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
          <a href={settings?.instagram_url || "#"} className="text-primary-foreground/70 hover:text-primary transition-colors"><Instagram className="h-4 w-4" /></a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
