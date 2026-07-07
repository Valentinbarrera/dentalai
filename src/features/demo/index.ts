/**
 * API pública del "modo demo" (usuario ficticio + datos de ejemplo).
 * Los `services/` de cada feature consultan `isDemoActive()` y, de estar activo,
 * devuelven los fixtures de acá en lugar de ir a Supabase.
 */
export { getDemoRole, isDemoActive, setDemoRole } from './demo-store';
export {
  demoActiveProcedures,
  demoAnalyses,
  demoAnalysisById,
  demoDentistAppointments,
  demoDentistPatients,
  demoDentists,
  demoMyVideos,
  demoPatientAppointments,
  demoProcedures,
  demoProfile,
  demoUserAnalyses,
  demoVideos,
} from './fixtures';
