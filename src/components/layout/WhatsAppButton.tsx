import { MessageCircle, Phone } from "lucide-react";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";

const WhatsAppButton = () => {
  const { data: settings } = useSiteSettings();

  const url = getWhatsAppUrl(
    settings?.whatsapp_number || "5581991360132",
    settings?.whatsapp_message
  );

  return (
    <>
      {/* Phone button — mobile only */}
      <a
        href={`tel:${(settings?.phone || "8132993019").replace(/\D/g, "")}`}
        className="md:hidden fixed bottom-24 right-6 z-50 flex items-center justify-center h-12 w-12 rounded-full bg-foreground text-background shadow-lg hover:scale-105 transition-transform"
        aria-label="Ligar"
      >
        <Phone className="h-5 w-5" />
      </a>

      {/* WhatsApp button with tooltip */}
      <div className="relative group fixed bottom-6 right-6 z-50">
        <span className="absolute right-16 bottom-3 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Fale conosco
          <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          aria-label="WhatsApp"
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60 animate-ping" />
          <MessageCircle className="h-7 w-7 relative z-10" />
        </a>
      </div>
    </>
  );
};

export default WhatsAppButton;
