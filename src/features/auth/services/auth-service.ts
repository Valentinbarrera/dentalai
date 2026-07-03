/**
 * Capa de datos de autenticación: funciones puras contra Supabase.
 * No conoce React. El Provider las orquesta y las expone como estado.
 */
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/services/supabase';

import type { SignInResult, SignUpParams, SignUpResult, UserRole } from '../types';

/** Lee el rol desde los metadatos del usuario, con paciente como default. */
export function roleOf(user: User | null | undefined): UserRole {
  return user?.user_metadata?.role === 'odontologo' ? 'odontologo' : 'paciente';
}

export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  return {
    error: error ? mapAuthError(error.message) : null,
    role: roleOf(data.user),
  };
}

export async function signUpWithEmail({
  name,
  email,
  password,
  role,
}: SignUpParams): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: name.trim(), role } },
  });
  return {
    error: error ? mapAuthError(error.message) : null,
    // Si el proyecto exige confirmar email, no hay sesión todavía.
    needsConfirmation: !error && !data.session,
    role,
  };
}

export async function signOutUser(): Promise<void> {
  await supabase.auth.signOut();
}

/** Traduce los mensajes de Supabase a algo entendible en español. */
export function mapAuthError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'Email o contraseña incorrectos.';
  if (/already registered/i.test(msg)) return 'Ese email ya tiene una cuenta.';
  if (/password should be at least/i.test(msg)) return 'La contraseña debe tener al menos 6 caracteres.';
  if (/unable to validate email|invalid email/i.test(msg)) return 'El email no es válido.';
  if (/network|fetch/i.test(msg)) return 'Sin conexión. Revisá tu internet.';
  return 'No pudimos completar la operación. Probá de nuevo.';
}
