/**
 * Provider de autenticación: mantiene el estado de sesión (React) y delega
 * las operaciones a la capa de servicios (`auth-service`).
 */
import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { supabase } from '@/services/supabase';

import {
  roleOf,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '../services/auth-service';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Sesión persistida (si el usuario ya entró antes).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 2) Cambios de sesión (login, logout, refresh de token).
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    // 3) Refresco de token solo con la app en primer plano (recomendado en RN).
    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });

    return () => {
      authSub.subscription.unsubscribe();
      appSub.remove();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role: session ? roleOf(session.user) : null,
      loading,
      signIn: signInWithEmail,
      signUp: (name, email, password, role) =>
        signUpWithEmail({ name, email, password, role }),
      signOut: signOutUser,
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
