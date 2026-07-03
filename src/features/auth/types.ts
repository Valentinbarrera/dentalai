/** Contratos del dominio de autenticación. */

/** Los dos tipos de cuenta de la app. */
export type UserRole = 'paciente' | 'odontologo';

/** Estado de verificación de la matrícula (solo aplica a odontólogos). */
export type VerificationStatus = 'pendiente' | 'verificado' | 'rechazado';

/** Resultado base de una operación de auth. */
export type AuthResult = {
  /** Mensaje de error listo para mostrar, o `null` si salió bien. */
  error: string | null;
  role: UserRole;
};

export type SignInResult = AuthResult;

export type SignUpResult = AuthResult & {
  /** `true` si el proyecto exige confirmar el email antes de iniciar sesión. */
  needsConfirmation: boolean;
};

/** Datos para registrar una cuenta nueva. */
export type SignUpParams = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};
