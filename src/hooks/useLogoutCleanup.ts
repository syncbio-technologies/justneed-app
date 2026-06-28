import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to handle cleanup when user logs out
 * Useful for clearing component state, canceling requests, etc.
 */
export const useLogoutCleanup = (cleanupFn: () => void) => {
  const { user } = useAuth();
  const previousUser = useRef(user);

  useEffect(() => {
    // If user was logged in but now is null (logout occurred)
    if (previousUser.current && !user) {
      console.log('[useLogoutCleanup] User logged out, running cleanup...');
      cleanupFn();
    }
    previousUser.current = user;
  }, [user, cleanupFn]);
};