/**
 * API pública del feature del catálogo de precios.
 * El resto de la app importa siempre desde acá (`@/features/procedures`).
 */
export {
  createProcedure,
  deleteProcedure,
  listActiveProcedures,
  listProcedures,
  updateProcedure,
} from './services/procedures-service';
export { useProcedures } from './hooks/use-procedures';
export type { UseProceduresResult } from './hooks/use-procedures';
export type { Procedure, UpsertProcedureInput } from './types';
