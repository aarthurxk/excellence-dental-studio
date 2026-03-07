import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase.rpc("is_admin", { _user_id: userId });
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        if (ignore) return;
        setSession(sess);
        setUser(sess?.user ?? null);

        if (sess?.user) {
          // Defer RPC call outside the Web Lock to avoid deadlock
          setTimeout(async () => {
            if (ignore) return;
            await checkAdmin(sess.user.id);
            if (!ignore) setLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (ignore) return;
      setSession(sess);
      setUser(sess?.user ?? null);

      if (sess?.user) {
        setTimeout(async () => {
          if (ignore) return;
          await checkAdmin(sess.user.id);
          if (!ignore) setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, isAdmin, signIn, signOut };
}
