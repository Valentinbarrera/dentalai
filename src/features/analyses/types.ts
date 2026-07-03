/** Contratos del dominio de análisis (capturas + diagnóstico persistido). */

import type { AffectedZone, TreatmentOption } from '@/lib/diagnosis';

/**
 * Una captura del flujo de análisis: una foto guiada por ángulo o el video 360°.
 * La `uri` es local (la produce `analysis/camera.tsx`) hasta que se sube al bucket.
 */
export type Capture = {
  uri: string;
  kind: 'photo' | 'video';
  /** Ángulo de la foto (ej. 'frente', 'lat_der'); no aplica al video. */
  angle?: string;
};

/** Estado del ciclo de vida de un análisis. */
export type AnalysisStatus = 'subiendo' | 'procesando' | 'listo' | 'error';

/**
 * Resultado del diagnóstico, con el shape de `lib/diagnosis.ts`.
 * Es `null` mientras el análisis todavía no terminó de procesarse.
 */
export type DiagnosisResult = {
  affectedZones: AffectedZone[];
  treatmentOptions: TreatmentOption[];
};

/** Una fila de la tabla `analyses`: un scan del paciente y su diagnóstico. */
export type Analysis = {
  id: string;
  userId: string;
  status: AnalysisStatus;
  /** Diagnóstico ya calculado, o `null` si aún no está listo. */
  result: DiagnosisResult | null;
  createdAt: string;
};
