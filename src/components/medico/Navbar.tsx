import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl, useSiteSettings } from "@/hooks/useSiteSettings";
import logo from "@/assets/logo-recife.png";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Tratamentos", href: "/tratamentos", hasDropdown: true },
  { label: "Equipe", href: "/equipe", hasDropdown: true },
  { label: "Vídeos", href: "/videos" },
  { label: "Contato", href: "/contato" },
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

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 bg-background ${scrolled ? "shadow-lg" : "shadow-sm"}`}>
      <div className="container flex items-center justify-between h-16">
        {/* Mobile logo */}
        <a href="/" className="lg:hidden flex items-center">
          <img src={logo} alt="Logo" className="h-10" />
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

        <div className="flex items-center gap-3">
          
          <Button asChild className="rounded font-medium text-sm px-6">
            <a href={getWhatsAppUrl(settings?.whatsapp_number || "5581991360132", settings?.whatsapp_message)} target="_blank" rel="noopener noreferrer">
              AGENDAR
            </a>
          </Button>
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-background border-t border-border overflow-hidden"
          >
            <ul className="p-4 space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded text-sm font-medium ${
                      location.pathname === item.href ? "text-primary bg-clinic-red-light" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
