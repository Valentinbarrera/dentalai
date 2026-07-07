/**
 * Usuarios ficticios ("modo demo") para explorar la app sin backend.
 *
 * NO tocan Supabase: se arma en memoria un objeto con la MISMA forma que una
 * `Session` de Supabase, para que el resto de la app (que lee `user`, `role`,
 * `user_metadata.full_name`, etc.) funcione igual que con una sesión real.
 *
 * Las llamadas a datos (turnos, análisis, catálogo…) siguen yendo a Supabase
 * con este id ficticio: como no hay filas, caen en sus estados vacíos. Sirve
 * para recorrer y mostrar la UI de los 3 roles sin credenciales reales.
 */
import type { Session, User } from '@supabase/supabase-js';

import type { UserRole } from '../types';

export type DemoProfile = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

/** Perfiles ficticios, uno por rol. Los ids son UUIDs válidos pero inexistentes. */
export const DEMO_USERS: Record<UserRole, DemoProfile> = {
  paciente: {
    id: '00000000-0000-4000-8000-0000000d3301',
    email: 'paciente.demo@dentalai.app',
    fullName: 'Valentina Demo',
    role: 'paciente',
  },
  odontologo: {
    id: '00000000-0000-4000-8000-0000000d3302',
    email: 'odontologo.demo@dentalai.app',
    fullName: 'Dr. Martín Demo',
    role: 'odontologo',
  },
  admin: {
    id: '00000000-0000-4000-8000-0000000d3303',
    email: 'admin.demo@dentalai.app',
    fullName: 'Admin Demo',
    role: 'admin',
  },
};

/** Clave de AsyncStorage donde persiste el rol demo activo (sobrevive recargas). */
export const DEMO_STORAGE_KEY = 'dentalai.demo.role';

/** `true` si el string guardado es un rol válido. */
export function isDemoRole(value: string | null): value is UserRole {
  return value === 'paciente' || value === 'odontologo' || value === 'admin';
}

/**
 * Construye una `Session` ficticia con forma de Supabase para el rol dado.
 * Solo para el front: los tokens son de mentira y no autentican nada.
 */
export function buildDemoSession(role: UserRole): Session {
  const profile = DEMO_USERS[role];
  const now = new Date().toISOString();
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;

  const user = {
    id: profile.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: profile.email,
    email_confirmed_at: now,
    phone: '',
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: 'demo', providers: ['demo'] },
    user_metadata: {
      full_name: profile.fullName,
      role: profile.role,
      demo: true,
    },
    identities: [],
    created_at: now,
    updated_at: now,
  } as unknown as User;

  return {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    token_type: 'bearer',
    expires_in: 60 * 60 * 24 * 365,
    expires_at: expiresAt,
    user,
  } as unknown as Session;
}
