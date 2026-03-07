import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import logoQuadrado from "@/assets/logo-quadrado.png";

const Footer = () => {
  return (
    <footer className="bg-clinic-dark text-clinic-gray">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & about */}
          <div className="space-y-4">
            <img src={logoQuadrado} alt="Odonto Excellence" className="h-16 w-auto brightness-0 invert" />
            <p className="text-sm text-clinic-gray/70 leading-relaxed">
              Clínica odontológica especializada em transformar sorrisos com excelência e tecnologia de ponta.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-primary-foreground mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {[
                { label: "Sobre", href: "/sobre" },
                { label: "Equipe", href: "/equipe" },
                { label: "Tratamentos", href: "/tratamentos" },
                { label: "Depoimentos", href: "/depoimentos" },
                { label: "Eventos", href: "/eventos" },
                { label: "Contato", href: "/contato" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-clinic-gray/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-display text-lg font-semibold text-primary-foreground mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-clinic-gray/70">
                <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p>(81) 99136-0132</p>
                  <p>(81) 3299-3019</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-clinic-gray/70">
                <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                contato@odontoexcellence.com.br
              </li>
              <li className="flex items-start gap-3 text-sm text-clinic-gray/70">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                Rua Exemplo, 123 – Ipsep, Recife – PE
              </li>
            </ul>
          </div>

          {/* Horários */}
          <div>
            <h4 className="font-display text-lg font-semibold text-primary-foreground mb-4">Horários</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-3 text-sm text-clinic-gray/70">
                <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p>Seg a Sex: 8h – 18h</p>
                  <p>Sáb: 8h – 12h</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-clinic-gray/10">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-clinic-gray/50">
            © {new Date().getFullYear()} Odonto Excellence – Unidade Ipsep. Todos os direitos reservados.
          </p>
          <p className="text-xs text-clinic-gray/50">
            Desenvolvido com ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
