import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  ogType?: string;
}

const BASE_URL = "https://odontoexcellence-ipsep.com.br";

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
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("og:url", `${BASE_URL}${path}`, true);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}${path}`;

    return () => {
      document.title = "Odonto Excellence Ipsep | Dentista em Recife";
    };
  }, [title, description, path, ogType]);

  return null;
}
