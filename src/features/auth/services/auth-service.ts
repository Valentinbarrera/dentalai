/**
 * Capa de datos de autenticación: funciones puras contra Supabase.
 * No conoce React. El Provider las orquesta y las expone como estado.
 */
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/services/supabase';

import type { SignInResult, SignUpParams, SignUpResult, UserRole } from '../types';

/** Lee el rol desde los metadatos del usuario, con paciente como default. */
export function roleOf(user: User | null | undefined): UserRole {
  const role = user?.user_metadata?.role;
  if (role === 'admin') return 'admin';
  if (role === 'odontologo') return 'odontologo';
  return 'paciente';
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
  // Logueamos el mensaje crudo para poder diagnosticar (visible en la consola).
  console.warn('[auth] error de Supabase:', msg);
  const m = msg.toLowerCase();
  if (/invalid login credentials/.test(m)) return 'Email o contraseña incorrectos.';
  if (/email not confirmed/.test(m))
    return 'Confirmá tu email antes de entrar (revisá tu bandeja de entrada).';
  if (/already registered|user already exists/.test(m)) return 'Ese email ya tiene una cuenta.';
  if (/password should be at least/.test(m))
    return 'La contraseña debe tener al menos 6 caracteres.';
  if (/unable to validate email|invalid email|invalid format/.test(m))
    return 'El email no es válido.';
  if (/signup.*(not allowed|disabled)|signups.*disabled/.test(m))
    return 'El registro de cuentas nuevas está deshabilitado en el servidor.';
  if (/invalid api key|no api key|api key found|project.*not found/.test(m))
    return 'Error de configuración del servidor (clave de API). Hay que revisar las variables de entorno.';
  if (/rate limit|too many requests|email rate/.test(m))
    return 'Demasiados intentos. Esperá un momento y probá de nuevo.';
  if (/network|fetch|failed to fetch|load failed/.test(m))
    return 'Sin conexión con el servidor. Revisá tu internet o la configuración.';
  return 'No pudimos completar la operación. Probá de nuevo.';
}
