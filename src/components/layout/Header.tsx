import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Phone, ChevronDown, Home, Smile, Users, Info, Star, Video, Calendar, Phone as PhoneIcon, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import logoQuadrado from "@/assets/logo-quadrado.png";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";

const mainLinks = [
  { label: "Início", href: "/" },
  { label: "Tratamentos", href: "/tratamentos" },
  { label: "Equipe", href: "/equipe" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

const moreLinks = [
  { label: "Depoimentos", href: "/depoimentos" },
  { label: "Vídeos", href: "/videos" },
  { label: "Eventos", href: "/eventos" },
];

const allMobileLinks = [
  { label: "Início", href: "/", icon: Home },
  { label: "Tratamentos", href: "/tratamentos", icon: Smile },
  { label: "Equipe", href: "/equipe", icon: Users },
  { label: "Sobre", href: "/sobre", icon: Info },
  { label: "Depoimentos", href: "/depoimentos", icon: Star },
  { label: "Vídeos", href: "/videos", icon: Video },
  { label: "Eventos", href: "/eventos", icon: Calendar },
  { label: "Contato", href: "/contato", icon: PhoneIcon },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const phoneSecondary = settings?.phone_secondary || "(81) 3299-3019";
  const phoneDigits = phoneSecondary.replace(/\D/g, "");
  const whatsappUrl = getWhatsAppUrl(
    settings?.whatsapp_number || "5581991360132",
    settings?.whatsapp_message
  );

  const isActive = (href: string) => location.pathname === href;
  const isMoreActive = moreLinks.some((l) => isActive(l.href));

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur transition-all duration-300 border-b border-border ${
        scrolled ? "bg-background/98 shadow-md h-16" : "bg-background/95 h-20"
      }`}
    >
      <div className="container flex h-full items-center justify-between">
        {/* Logo + clinic name */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logoQuadrado}
            alt="Odonto Excellence"
            className={`w-auto transition-all duration-300 ${scrolled ? "h-10" : "h-14"}`}
          />
          <div className="hidden sm:block leading-tight">
            <span className="block text-sm font-bold text-foreground">Odonto Excellence</span>
            <span className="block text-xs text-muted-foreground">Unidade Ipsep</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary ${
                isActive(link.href) ? "text-primary font-semibold" : "text-foreground/70"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* More dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`group flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary outline-none ${
                isMoreActive ? "text-primary font-semibold" : "text-foreground/70"
              }`}
            >
              Mais
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {moreLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    to={link.href}
                    className={`w-full ${isActive(link.href) ? "text-primary font-semibold" : ""}`}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`tel:${phoneDigits}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4" />
            {phoneSecondary}
          </a>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Agendar Consulta
            </a>
          </Button>
        </div>

        {/* Mobile trigger */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-72 flex flex-col">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-3">
              <img src={logoQuadrado} alt="Odonto Excellence" className="h-10 w-auto" />
              <div className="leading-tight">
                <span className="block text-sm font-bold text-foreground">Odonto Excellence</span>
                <span className="block text-xs text-muted-foreground">Unidade Ipsep</span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 mt-4 flex-1">
            {allMobileLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-foreground/70 hover:bg-muted"
                }`}
              >
                <link.icon className="h-4 w-4 flex-shrink-0" />
                {link.label}
              </Link>
            ))}

            <Separator className="my-3" />

            <Button
              asChild
              size="lg"
              className="w-full font-semibold text-white"
              style={{ backgroundColor: "#25D366" }}
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Agendar pelo WhatsApp
              </a>
            </Button>
          </nav>

          <div className="mt-auto pt-4 border-t border-border space-y-1 px-1">
            <p className="text-xs text-muted-foreground">
              {settings?.address || "Rua Jean Emile Favre, 1712 – Ipsep, Recife"}
            </p>
            <a href={`tel:${phoneDigits}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {phoneSecondary}
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
