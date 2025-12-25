'use client'

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  
  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.name || '',
    tier: session.user.tier || 'free',
    isPremium: ['starter', 'pro', 'premium'].includes(session.user.tier || 'free'),
  } : null;

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    signIn,
    signOut,
  };
}