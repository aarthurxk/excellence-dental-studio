import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SiteSettings = Tables<"site_settings">;

const fallback: SiteSettings = {
  id: "",
  hero_title: "Seu Sorriso Merece Excelência",
  hero_subtitle: "Tratamentos odontológicos com tecnologia de ponta",
  phone: "(81) 99136-0132",
  phone_secondary: "(81) 3299-3019",
  email: "adm@odontoexcellencerecife.com.br",
  address: "Rua Jean Emile Favre, 1712 – Ipsep, Recife – PE, 51190-450",
  hours_weekday: "Seg a Sex: 8h – 18h",
  hours_saturday: "Sáb: 8h – 12h",
  whatsapp_number: "5581991360132",
  whatsapp_message: "Olá! Gostaria de mais informações.",
  instagram_url: "",
  facebook_url: "",
  google_maps_embed_url: "",
  hero_bg_image: "",
  hero_doctor_image: "",
  about_image: "",
  created_at: "",
  updated_at: "",
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ?? fallback;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: fallback,
  });
}

export function getWhatsAppUrl(number: string, message?: string | null) {
  const encoded = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${number}${encoded ? `?text=${encoded}` : ""}`;
}
