/**
 * API pública del feature de credenciales (verificación de la matrícula).
 * El resto de la app importa siempre desde acá (`@/features/credentials`),
 * nunca de los archivos internos.
 */
export { uploadCredential, getMyVerification } from './services/credentials-service';
export { useVerification } from './hooks/use-verification';
export type { CredentialInput, VerificationStatus } from './types';
