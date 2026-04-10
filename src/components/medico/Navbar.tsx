import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, Home, Info, Stethoscope, Users, Video, Mail, Phone, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getWhatsAppUrl, useSiteSettings } from "@/hooks/useSiteSettings";
import { openTrackedWhatsApp } from "@/lib/openTrackedWhatsApp";
import logo from "@/assets/logo-recife.png";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Sobre", href: "/sobre", icon: Info },
  { label: "Tratamentos", href: "/tratamentos", hasDropdown: true, icon: Stethoscope },
  { label: "Equipe", href: "/equipe", hasDropdown: true, icon: Users },
  { label: "Vídeos", href: "/videos", icon: Video },
  { label: "Contato", href: "/contato", icon: Mail },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const whatsappUrl = getWhatsAppUrl(settings?.whatsapp_number || "5581991360132", settings?.whatsapp_message);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 bg-background ${scrolled ? "shadow-lg" : "shadow-sm"}`}>
      <div className="container flex items-center justify-between h-14 md:h-16">
        {/* Mobile logo */}
        <a href="/" className="lg:hidden flex items-center">
          <img src={logo} alt="Logo" className="h-10 md:h-14" />
        </a>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href} className="relative">
                <Link
                  to={item.href}
                  className={`px-4 py-5 text-sm font-medium flex items-center gap-1 border-r border-border transition-colors ${
                    isActive ? "text-primary" : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Button asChild className="rounded font-medium text-xs md:text-sm px-4 md:px-6 h-9 md:h-10">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-track-id="btn-navbar" onClick={(e) => { e.preventDefault(); openTrackedWhatsApp("btn-navbar", whatsappUrl); }}>
              AGENDAR
            </a>
          </Button>
          <button
            className="lg:hidden flex items-center justify-center h-11 w-11 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
          <SheetHeader className="p-5 border-b border-border">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="h-12" />
            </div>
          </SheetHeader>

          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer with contact info & WhatsApp */}
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{settings?.phone || "(81) 3299-3019"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{settings?.hours_weekday || "Seg a Sex: 8h – 18h"}</span>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track-id="btn-navbar-mobile"
              onClick={(e) => { e.preventDefault(); openTrackedWhatsApp("btn-navbar-mobile", whatsappUrl); }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#25D366] text-white font-semibold text-sm hover:bg-[#22c55e] transition-colors min-h-[44px]"
            >
              <MessageCircle className="h-4 w-4" />
              Fale pelo WhatsApp
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
