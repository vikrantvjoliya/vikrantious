import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const LOCAL_STORAGE_KEY = 'guest_user_id';

export function useGuestAuth() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let storedId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedId) {
      // Create a new guest user in Supabase (or just generate a UUID)
      storedId = crypto.randomUUID();
      localStorage.setItem(LOCAL_STORAGE_KEY, storedId);
    }
    setUserId(storedId);
  }, []);

  // Optionally, you can sync with Supabase auth if needed
  return userId;
}
