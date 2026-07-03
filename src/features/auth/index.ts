/**
 * API pública del feature de autenticación.
 * El resto de la app importa siempre desde acá (`@/features/auth`),
 * nunca de los archivos internos.
 */
export { AuthProvider } from './context/auth-provider';
export { useAuth } from './hooks/use-auth';
export { RoleSelector } from './components/role-selector';
export type { UserRole, VerificationStatus } from './types';
