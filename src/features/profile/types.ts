/**
 * Contratos del dominio del perfil profesional del odontólogo.
 * Espejo en camelCase de la tabla `public.profiles` de Supabase.
 */

/** Rol de la cuenta dentro de la app. */
export type ProfileRole = 'paciente' | 'odontologo';

/** Estado de verificación de las credenciales del profesional. */
export type ProfileVerified = 'pendiente' | 'verificado' | 'rechazado';

/**
 * Perfil del usuario tal como lo consume la UI (camelCase).
 * `id` coincide con `auth.users.id`.
 */
export type Profile = {
  id: string;
  fullName: string | null;
  role: ProfileRole;
  verified: ProfileVerified;
  matricula: string | null;
  university: string | null;
  specialty: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

/**
 * Campos editables por el propio usuario. Todos opcionales: solo se envían
 * a la DB los que vengan definidos (update parcial).
 */
export type UpdateProfileInput = {
  fullName?: string | null;
  specialty?: string | null;
  matricula?: string | null;
  university?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
};
