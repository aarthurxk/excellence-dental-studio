import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

const Location = () => {
  const { data: settings, isLoading } = useSiteSettings();

  return (
    <section className="py-12 md:py-20 bg-clinic-gray">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Nossa <span className="text-primary">Localização</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estamos no coração do Ipsep, com fácil acesso e estacionamento.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="rounded-2xl overflow-hidden border border-border bg-card aspect-[4/3]">
            {settings?.google_maps_embed_url ? (
              <iframe
                src={settings.google_maps_embed_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Odonto Excellence Ipsep"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Mapa em breve
              </div>
            )}
          </div>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">Endereço</h3>
                {isLoading ? <Skeleton className="h-4 w-48" /> : (
                  <p className="text-muted-foreground text-sm">{settings?.address}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">Telefone</h3>
                {isLoading ? <Skeleton className="h-4 w-32" /> : (
                  <>
                    <p className="text-muted-foreground text-sm">{settings?.phone}</p>
                    {settings?.phone_secondary && (
                      <p className="text-muted-foreground text-sm">{settings.phone_secondary}</p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">E-mail</h3>
                {isLoading ? <Skeleton className="h-4 w-48" /> : (
                  <p className="text-muted-foreground text-sm">{settings?.email}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">Horário de Funcionamento</h3>
                {isLoading ? <Skeleton className="h-4 w-40" /> : (
                  <>
                    <p className="text-muted-foreground text-sm">{settings?.hours_weekday}</p>
                    {settings?.hours_saturday && (
                      <p className="text-muted-foreground text-sm">{settings.hours_saturday}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
