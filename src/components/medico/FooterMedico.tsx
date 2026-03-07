import { Phone, Mail, MapPin, Facebook, Linkedin, Instagram, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-recife.png";

const FooterMedico = () => {
  const { data: settings } = useSiteSettings();
  const { data: services } = useQuery({
    queryKey: ["footer_services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("title").eq("active", true).order("display_order").limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <footer className="bg-secondary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-3 inline-block"><img src={logo} alt="Logo" className="h-20" /></div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Cuidando do seu sorriso com excelência, tecnologia e atendimento humanizado.
            </p>
            <div className="flex gap-3">
              <a href={settings?.facebook_url || "#"} className="h-9 w-9 rounded bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="h-9 w-9 rounded bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href={settings?.instagram_url || "#"} className="h-9 w-9 rounded bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {[
                { label: "Home", href: "/" },
                { label: "Sobre", href: "/sobre" },
                { label: "Tratamentos", href: "/tratamentos" },
                { label: "Equipe", href: "/equipe" },
                { label: "Contato", href: "/contato" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-4">Tratamentos</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {(services && services.length > 0 ? services.map(s => s.title) : ["Implantes", "Ortodontia", "Clareamento", "Próteses", "Endodontia"]).map((s) => (
                <li key={s}>
                  <Link to="/tratamentos" className="hover:text-primary transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{settings?.address || "Rua Jean Emile Favre, 1712 – Ipsep, Recife – PE, 51190-450"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{settings?.phone || "(81) 3299-3019"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{settings?.email || "contato@odontoexcellence.com"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 py-5">
        <div className="container flex items-center justify-between text-sm text-primary-foreground/50">
          <span>© 2024 Odonto Excellence Recife. Todos os direitos reservados.</span>
          <Link to="/admin/login" className="text-primary-foreground/30 hover:text-primary-foreground/50 transition-colors">
            <Lock className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterMedico;
