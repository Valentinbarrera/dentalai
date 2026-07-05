/**
 * API pública del feature de perfil.
 * El resto de la app importa siempre desde acá (`@/features/profile`),
 * nunca de los archivos internos.
 */
export { getMyProfile, updateMyProfile } from './services/profile-service';
export { useMyProfile } from './hooks/use-my-profile';
export type { UseMyProfileResult } from './hooks/use-my-profile';
export type {
  Profile,
  ProfileRole,
  ProfileVerified,
  UpdateProfileInput,
} from './types';
