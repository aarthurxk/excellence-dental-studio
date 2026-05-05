import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller } } = await supabaseUser.auth.getUser();
    if (!caller) throw new Error("Not authenticated");

    const { data: isAdmin } = await supabaseUser.rpc("is_admin", { _user_id: caller.id });
    if (!isAdmin) throw new Error("Not authorized");

    const body = await req.json();
    const { user_id, action, profile, role, password, email, active } = body;
    if (!user_id) throw new Error("Missing user_id");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "reset_password") {
      if (!password || password.length < 6) throw new Error("Senha inválida");
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { password });
      if (error) throw error;
    }

    if (action === "update_email" && email) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { email });
      if (error) throw error;
    }

    if (action === "delete_user") {
      // Remove role and profile first
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      await supabaseAdmin.from("user_profiles").delete().eq("user_id", user_id);
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;
    }

    if (profile) {
      await supabaseAdmin.from("user_profiles").upsert({
        user_id,
        ...profile,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    if (role) {
      // Replace role
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id, role });
      if (error) throw error;
    }

    if (typeof active === "boolean") {
      await supabaseAdmin.from("user_profiles").update({ active }).eq("user_id", user_id);
      // Ban/unban via auth admin
      await supabaseAdmin.auth.admin.updateUserById(user_id, {
        ban_duration: active ? "none" : "876000h",
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
