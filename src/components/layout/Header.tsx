import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoQuadrado from "@/assets/logo-quadrado.png";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Equipe", href: "/equipe" },
  { label: "Tratamentos", href: "/tratamentos" },
  { label: "Depoimentos", href: "/depoimentos" },
  { label: "Vídeos", href: "/videos" },
  { label: "Eventos", href: "/eventos" },
  { label: "Contato", href: "/contato" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { data: settings } = useSiteSettings();

  const phoneSecondary = settings?.phone_secondary || "(81) 3299-3019";
  const phoneDigits = phoneSecondary.replace(/\D/g, "");
  const whatsappUrl = getWhatsAppUrl(
    settings?.whatsapp_number || "5581991360132",
    settings?.whatsapp_message
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoQuadrado} alt="Odonto Excellence" className="h-14 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary ${
                location.pathname === link.href ? "text-primary font-semibold" : "text-foreground/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a href={`tel:${phoneDigits}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Phone className="h-4 w-4" />
            {phoneSecondary}
          </a>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Agendar Consulta
            </a>
          </Button>
        </div>

        <button className="lg:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-in slide-in-from-top-2">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.href ? "text-primary bg-clinic-red-light font-semibold" : "text-foreground/70 hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
              <a href={`tel:${phoneDigits}`} className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> {phoneSecondary}
              </a>
              <Button asChild className="mx-4">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Agendar Consulta
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
