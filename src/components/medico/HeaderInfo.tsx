import { Phone, Mail, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logo from "@/assets/logo-recife.png";

const HeaderInfo = () => {
  const { data: settings } = useSiteSettings();

  const infoBlocks = [
    {
      icon: Phone,
      lines: [settings?.phone || "(81) 3299-3019", settings?.phone_secondary || "(81) 99136-0132"],
    },
    {
      icon: Mail,
      lines: [settings?.email || "contato@odontoexcellence.com", "atendimento@odontoexcellence.com"],
    },
    {
      icon: MapPin,
      lines: [settings?.address?.split(",")[0] || "Rua Jean Emile Favre", settings?.address?.split(",").slice(1).join(",").trim() || "1712 – Ipsep, Recife – PE, 51190-450"],
    },
  ];

  return (
    <div className="bg-background py-5 hidden lg:block border-b border-border">
      <div className="container flex justify-between items-center">
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-14" />
        </a>
        <div className="flex items-center gap-10">
          {infoBlocks.map((block, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded bg-primary flex items-center justify-center">
                <block.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="text-sm">
                {block.lines.map((line, j) => (
                  <p key={j} className="text-muted-foreground">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeaderInfo;
