import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AuthUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<AuthUser>(null);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error loading auth session", error);
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setInitialising(false);
        }
      } catch (err) {
        console.error("Unexpected error loading auth session", err);
        if (mounted) setInitialising(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setInitialising(false);
    });

    loadUser();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    initialising,
    signInWithGoogle,
    signOut,
  };
}
