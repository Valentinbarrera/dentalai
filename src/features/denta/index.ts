/**
 * API pública del feature del chat "Denta".
 * El resto de la app importa siempre desde acá (`@/features/denta`).
 */
export { sendDentaMessage } from './services/denta-service';
export type { DentaTurn } from './services/denta-service';
