import { useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import { supabase } from "../utils/supabaseClient";
export default function SessionTimeoutHandler() {
  const { user } = useAuth();
  const expire = useCallback(() => {
    if (user) void supabase.auth.signOut({ scope: "local" });
  }, [user]);
  useSessionTimeout(expire, 30 * 60 * 1000);
  return null;
}
