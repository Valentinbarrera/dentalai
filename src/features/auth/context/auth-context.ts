/** Definición del contexto de auth (separado del Provider para evitar ciclos). */
import type { Session, User } from '@supabase/supabase-js';
import { createContext } from 'react';

import type { SignInResult, SignUpResult, UserRole } from '../types';

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** Rol de la cuenta activa (`null` si no hay sesión). */
  role: UserRole | null;
  /** `true` mientras leemos la sesión guardada al abrir la app. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
