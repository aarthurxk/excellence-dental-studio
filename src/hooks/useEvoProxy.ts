import { supabase } from "@/integrations/supabase/client";

export type EvoAction =
  | "connectionState"
  | "findChats"
  | "findMessages"
  | "findContacts"
  | "sendText"
  | "connect"
  | "fetchInstances"
  | "logout"
  | "restart"
  | "pairingCode";

export async function evoProxy<T = unknown>(
  action: EvoAction,
  body?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("evo-proxy", {
    body: { action, body },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}
