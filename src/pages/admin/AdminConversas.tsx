import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, MessagesSquare } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ConversasWhatsApp from "@/components/admin/ConversasWhatsApp";
import ConversasVera from "@/components/admin/ConversasVera";

export default function AdminConversas() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "vera" ? "vera" : "whatsapp";
  const initialPhone = searchParams.get("chat") || undefined;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <Tabs defaultValue={tab} className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-fit mb-3">
          <TabsTrigger value="whatsapp" className="gap-1.5">
            <MessagesSquare className="h-4 w-4" /> WhatsApp
          </TabsTrigger>
          <TabsTrigger value="vera" className="gap-1.5">
            <MessageSquare className="h-4 w-4" /> Vera (Site)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="whatsapp" className="flex-1 min-h-0 mt-0">
          <ConversasWhatsApp initialPhone={initialPhone} />
        </TabsContent>
        <TabsContent value="vera" className="flex-1 min-h-0 mt-0">
          <ConversasVera />
        </TabsContent>
      </Tabs>
    </div>
  );
}
