import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AuthUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<AuthUser>(null);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error loading auth session", error);
        }

        setUser(session?.user ?? null);
        setInitialising(false);
      } catch (error) {
        console.error("Unexpected error loading auth session", error);
        setInitialising(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (event === "SIGNED_IN" && nextUser && !user) {
        setInitialising(false);
      } else if (event === "SIGNED_OUT" && !nextUser && user) {
        setInitialising(false);
      }
    });

    loadUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

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
