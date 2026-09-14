import { useAuth } from "../auth/AuthContext";
// Kept as a compatibility hook; identity now comes exclusively from Supabase Auth.
export function useGuestAuth() {
  return useAuth().user?.id ?? null;
}
