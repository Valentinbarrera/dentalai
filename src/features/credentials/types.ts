/** Contratos del dominio de credenciales (verificación de la matrícula del odontólogo). */

// El estado de verificación vive en el módulo de auth: lo reutilizamos, no lo redefinimos.
export type { VerificationStatus } from '@/features/auth';

/** Datos que carga el odontólogo para pedir la verificación de su matrícula. */
export type CredentialInput = {
  /** URI local (galería o cámara) de la foto/escaneo del título. */
  diplomaUri: string;
  /** Número de matrícula profesional (ej: "MP 12345"). */
  matricula: string;
  /** Universidad donde se recibió (opcional). */
  university?: string;
};
