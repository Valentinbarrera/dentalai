/**
 * Estado global (módulo, sin React) del "modo demo".
 *
 * Lo setea el `AuthProvider` de forma síncrona al entrar/salir del modo demo,
 * y lo leen los `services/` de cada feature para devolver datos ficticios en vez
 * de consultar Supabase. Vive fuera de React para que la capa de datos (pura)
 * pueda consultarlo sin depender del árbol de componentes.
 */
import type { UserRole } from '@/features/auth/types';

let activeRole: UserRole | null = null;

/** Marca el rol demo activo (o `null` para desactivar el modo demo). */
export function setDemoRole(role: UserRole | null): void {
  activeRole = role;
}

/** Rol demo activo, o `null` si no estamos en modo demo. */
export function getDemoRole(): UserRole | null {
  return activeRole;
}

/** `true` si hay un usuario ficticio activo (los services devuelven fixtures). */
export function isDemoActive(): boolean {
  return activeRole !== null;
}
