/**
 * API pública del feature de odontólogos (dentists).
 * El resto de la app importa siempre desde acá (`@/features/dentists`),
 * nunca de los archivos internos.
 */
export { listDentists } from './services/dentists-service';
export { useDentists } from './hooks/use-dentists';
export type { DentistsState } from './hooks/use-dentists';
export type { Dentist } from './types';
