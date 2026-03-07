import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  ogType?: string;
}

const BASE_URL = "https://odontoexcellencerecife.com.br";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  "name": "Odonto Excellence – Unidade Ipsep",
  "url": BASE_URL,
  "telephone": "+55 81 3299-3019",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua Jean Emile Favre, 1712",
    "addressLocality": "Recife",
    "addressRegion": "PE",
    "postalCode": "51190-450",
    "addressCountry": "BR",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -8.1130,
    "longitude": -34.9286,
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "19:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday"], "opens": "08:00", "closes": "12:00" },
  ],
  "priceRange": "$$",
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "200" },
};

export default function SEOHead({ title, description, path = "/", ogType = "website" }: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = path === "/" ? title : `${title} | Odonto Excellence Ipsep`;
    document.title = fullTitle;

    const setMeta = (property: string, content: string, isOg = false) => {
      const attr = isOg ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    setMeta("theme-color", "#e31c1c");
    setMeta("robots", "index, follow");
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("og:url", `${BASE_URL}${path}`, true);
    setMeta("og:locale", "pt_BR", true);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}${path}`;

    // JSON-LD structured data
    const scriptId = "ld-json-seo";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    return () => {
      document.title = "Odonto Excellence Ipsep | Dentista em Recife";
    };
  }, [title, description, path, ogType]);

  return null;
}
