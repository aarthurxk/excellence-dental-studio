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

    const { email, password, role, full_name, phone, job_title, department, notes, avatar_url } = await req.json();
    if (!email || !password || !role) throw new Error("Missing fields");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name ?? "" },
    });
    if (createError) throw createError;

    const userId = newUser.user.id;

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (roleError) throw roleError;

    // Profile is auto-created by trigger; upsert to set extra fields
    await supabaseAdmin.from("user_profiles").upsert({
      user_id: userId,
      full_name: full_name ?? "",
      phone: phone ?? "",
      job_title: job_title ?? "",
      department: department ?? "",
      notes: notes ?? "",
      avatar_url: avatar_url ?? "",
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
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
