import { useState, useCallback } from 'react';

/**
 * Types for our mock authentication.
 */
export type UserRole = 'Admin' | 'Super Admin' | 'User';

export interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  isLoading: boolean;
}

/**
 * A mock useAuth hook to simulate user roles and authentication state.
 * This can be easily swapped for a real auth provider (like Firebase, Clerk, or Supabase).
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Admin',
    },
    isLoading: false,
  });

  const login = useCallback((role: UserRole = 'Admin') => {
    setState({
      user: {
        id: '1',
        name: `${role} User`,
        email: `${role.toLowerCase()}@example.com`,
        role,
      },
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, isLoading: false });
  }, []);

  const isAdmin = state.user?.role === 'Admin' || state.user?.role === 'Super Admin';

  return {
    ...state,
    isAdmin,
    login,
    logout,
  };
}
