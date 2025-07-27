import { useEffect, useState } from 'react';

export function useGuestAuth() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check for regular user first
    let storedId = localStorage.getItem('user_id');
    
    // If no regular user, check for guest user
    if (!storedId) {
      storedId = localStorage.getItem('guest_user_id');
    }
    
    // If no user at all, create guest user
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem('guest_user_id', storedId);
      localStorage.setItem('username', 'Guest User');
    }
    
    setUserId(storedId);
  }, []);

  return userId;
}