/** Los 6 ángulos que DENTA IA guía al capturar durante el análisis visual. */
export type AnalysisStep = {
  id: string;
  /** Etiqueta corta del indicador inferior */
  short: string;
  /** Instrucción grande (uppercase) que se muestra durante la captura */
  instruction: string;
};

export const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: 'frente', short: 'Frente', instruction: 'ALINEE LA ARCADA FRONTAL' },
  { id: 'lat_der', short: 'Lat. Der', instruction: 'GIRE HACIA EL LADO DERECHO' },
  { id: 'lat_izq', short: 'Lat. Izq', instruction: 'GIRE HACIA EL LADO IZQUIERDO' },
  { id: 'superior', short: 'Superior', instruction: 'MUESTRE LA ARCADA SUPERIOR' },
  { id: 'inferior', short: 'Inferior', instruction: 'MUESTRE LA ARCADA INFERIOR' },
  { id: 'oclusal', short: 'Oclusal', instruction: 'VISTA OCLUSAL DE LA MORDIDA' },
];
