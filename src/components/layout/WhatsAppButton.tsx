import { createPortal } from "react-dom";
import { MessageCircle } from "lucide-react";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";
import { openTrackedWhatsApp } from "@/lib/openTrackedWhatsApp";

const WhatsAppButton = () => {
  const { data: settings } = useSiteSettings();

  const url = getWhatsAppUrl(
    settings?.whatsapp_number || "5581991360132",
    settings?.whatsapp_message
  );

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openTrackedWhatsApp("btn-flutuante", url);
  };

  return createPortal(
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] group">
      <span className="absolute right-14 md:right-16 bottom-2 md:bottom-3 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Fale conosco
        <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        data-track-id="btn-flutuante"
        className="relative flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        aria-label="WhatsApp"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40 animate-pulse" />
        <MessageCircle className="h-6 w-6 md:h-7 md:w-7 relative z-10" />
      </a>
    </div>,
    document.body
  );
};

export default WhatsAppButton;
