/**
 * Provider de autenticación: mantiene el estado de sesión (React) y delega
 * las operaciones a la capa de servicios (`auth-service`).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { setDemoRole as setDemoStoreRole } from '@/features/demo';
import { supabase } from '@/services/supabase';

import {
  roleOf,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '../services/auth-service';
import {
  DEMO_STORAGE_KEY,
  buildDemoSession,
  isDemoRole,
} from '../services/demo-session';
import type { UserRole } from '../types';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [demoRole, setDemoRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 0) Leemos EN PARALELO la sesión demo persistida (usuario ficticio) y la
    //    sesión real, y recién ahí quitamos el splash. Así el store demo queda
    //    seteado antes de que monten las pantallas (y sus hooks de datos).
    (async () => {
      const [stored, sessionRes] = await Promise.all([
        AsyncStorage.getItem(DEMO_STORAGE_KEY),
        supabase.auth.getSession(),
      ]);
      if (!mounted) return;
      if (isDemoRole(stored)) {
        setDemoStoreRole(stored); // store de módulo (síncrono, lo leen los services)
        setDemoRole(stored); // estado de React (dispara el re-render)
      }
      setSession(sessionRes.data.session);
      setLoading(false);
    })();

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
      mounted = false;
      authSub.subscription.unsubscribe();
      appSub.remove();
    };
  }, []);

  // La sesión demo tiene prioridad y no la pisa `onAuthStateChange`.
  const demoSession = useMemo(
    () => (demoRole ? buildDemoSession(demoRole) : null),
    [demoRole],
  );
  const activeSession = demoSession ?? session;

  const enterDemo = useCallback(async (role: UserRole) => {
    await AsyncStorage.setItem(DEMO_STORAGE_KEY, role);
    setDemoStoreRole(role); // síncrono: activo ANTES de navegar/montar pantallas
    setDemoRole(role);
  }, []);

  const signOut = useCallback(async () => {
    if (demoRole) {
      await AsyncStorage.removeItem(DEMO_STORAGE_KEY);
      setDemoStoreRole(null);
      setDemoRole(null);
    }
    await signOutUser();
  }, [demoRole]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: activeSession,
      user: activeSession?.user ?? null,
      role: activeSession ? roleOf(activeSession.user) : null,
      loading,
      isDemo: demoSession != null,
      signIn: signInWithEmail,
      signUp: (name, email, password, role) =>
        signUpWithEmail({ name, email, password, role }),
      signOut,
      enterDemo,
    }),
    [activeSession, demoSession, loading, signOut, enterDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
