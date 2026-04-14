import { supabase } from "@/integrations/supabase/client";

export type EvoAction =
  | "connectionState"
  | "findChats"
  | "findMessages"
  | "findContacts"
  | "sendText"
  | "connect"
  | "fetchInstances";

export async function evoProxy<T = unknown>(
  action: EvoAction,
  body?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("evo-proxy", {
    body: { action, body },
  });
  if (error) throw new Error(error.message);
  return data as T;
}
