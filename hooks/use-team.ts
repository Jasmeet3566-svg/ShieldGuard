import { useState, useEffect, useCallback } from 'react';

/**
 * Types for team and user management.
 */
export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TeamState {
  users: TeamUser[];
  usedSeats: number;
  totalSeats: number;
  isLoading: boolean;
}

/**
 * A mock useTeam hook to manage a list of users and seat-based subscription logic.
 */
export function useTeam() {
  const [state, setState] = useState<TeamState>({
    users: [],
    usedSeats: 0,
    totalSeats: 10, // Default seat limit
    isLoading: true,
  });

  // Mock initial data fetch
  useEffect(() => {
    const fetchTeamData = async () => {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const initialUsers: TeamUser[] = [
        { id: '1', name: 'Alice Admin', email: 'alice@example.com', role: 'Admin' },
        { id: '2', name: 'Bob Member', email: 'bob@example.com', role: 'Member' },
        { id: '3', name: 'Charlie User', email: 'charlie@example.com', role: 'User' },
        { id: '4', name: 'David Guest', email: 'david@example.com', role: 'Guest' },
      ];

      setState({
        users: initialUsers,
        usedSeats: initialUsers.length,
        totalSeats: 10,
        isLoading: false,
      });
    };

    fetchTeamData();
  }, []);

  /**
   * Mock API call to add a new user.
   */
  const addUser = useCallback(async (newUser: Omit<TeamUser, 'id'>) => {
    setState(prev => {
      if (prev.usedSeats >= prev.totalSeats) return prev;
      
      const userWithId = { ...newUser, id: Math.random().toString(36).substr(2, 9) };
      return {
        ...prev,
        users: [...prev.users, userWithId],
        usedSeats: prev.usedSeats + 1,
      };
    });
  }, []);

  /**
   * Mock API call to remove a user.
   */
  const removeUser = useCallback(async (userId: string) => {
    setState(prev => {
      const updatedUsers = prev.users.filter(u => u.id !== userId);
      return {
        ...prev,
        users: updatedUsers,
        usedSeats: updatedUsers.length,
      };
    });
  }, []);

  const isAtLimit = state.usedSeats >= state.totalSeats;

  return {
    ...state,
    addUser,
    removeUser,
    isAtLimit,
  };
}
