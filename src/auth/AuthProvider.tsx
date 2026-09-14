import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../utils/supabaseClient";
import { AuthContext } from "./AuthContext";
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Legacy IDs are never accepted as authentication.
    ["user_id", "username", "guest_user_id"].forEach((key) =>
      localStorage.removeItem(key),
    );
    let active = true;
    let changed = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      changed = true;
      if (active) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });
    void supabase.auth
      .getUser()
      .then(({ data }) => {
        if (active && !changed) {
          setUser(data.user);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
