/** Contratos del dominio de odontólogos (dentists). */

/**
 * Un odontólogo elegible al reservar un turno. Es un usuario real de
 * `auth.users` con rol `odontologo` en `public.profiles`.
 */
export type Dentist = {
  /** Usuario odontólogo (`auth.users.id` / `profiles.id`). Sirve como `dentistId` real del turno. */
  id: string;
  /** Nombre completo, tal como lo cargó al registrarse. Puede faltar si no lo completó. */
  fullName: string | null;
  /** Especialidad declarada. Puede faltar si todavía no la cargó. */
  specialty: string | null;
  /** `true` si su matrícula fue verificada por el equipo. */
  verified: boolean;
};
