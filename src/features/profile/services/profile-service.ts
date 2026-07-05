/**
 * Capa de datos del feature de perfil: funciones puras contra Supabase.
 * No conoce React. Los hooks y las pantallas la orquestan.
 *
 * Lee y escribe la fila propia de la tabla `profiles` (RLS ya limita al
 * usuario autenticado). Mapea snake_case (DB) ↔ camelCase (dominio).
 */
import { supabase } from '@/services/supabase';

import type { Profile, ProfileRole, ProfileVerified, UpdateProfileInput } from '../types';

/** Columnas que seleccionamos siempre de `profiles`. */
const PROFILE_COLUMNS =
  'id, full_name, role, verified, matricula, university, specialty, bio, avatar_url';

/** Fila cruda tal como vuelve de la tabla `profiles` (snake_case). */
type ProfileRow = {
  id: string;
  full_name: string | null;
  role: ProfileRole;
  verified: ProfileVerified;
  matricula: string | null;
  university: string | null;
  specialty: string | null;
  bio: string | null;
  avatar_url: string | null;
};

/** Mapea la fila de la DB (snake_case) al contrato del dominio (camelCase). */
function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    verified: row.verified,
    matricula: row.matricula,
    university: row.university,
    specialty: row.specialty,
    bio: row.bio,
    avatarUrl: row.avatar_url,
  };
}

/** Devuelve el id del usuario autenticado o tira si no hay sesión. */
async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) throw new Error('No hay una sesión activa.');
  return userId;
}

/** Trae el perfil del usuario autenticado. */
export async function getMyProfile(): Promise<Profile> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single();

  if (error) throw new Error(`No pudimos leer tu perfil: ${error.message}`);
  return toProfile(data as ProfileRow);
}

/**
 * Actualiza el perfil propio con los campos provistos (update parcial: solo
 * las columnas presentes en `input` se envían a la DB). Devuelve el perfil
 * actualizado.
 */
export async function updateMyProfile(input: UpdateProfileInput): Promise<Profile> {
  const userId = await requireUserId();

  // Armamos el patch snake_case solo con las claves definidas en el input.
  const patch: Partial<ProfileRow> = {};
  if (input.fullName !== undefined) patch.full_name = input.fullName;
  if (input.specialty !== undefined) patch.specialty = input.specialty;
  if (input.matricula !== undefined) patch.matricula = input.matricula;
  if (input.university !== undefined) patch.university = input.university;
  if (input.bio !== undefined) patch.bio = input.bio;
  if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) throw new Error(`No pudimos guardar tu perfil: ${error.message}`);
  return toProfile(data as ProfileRow);
}
