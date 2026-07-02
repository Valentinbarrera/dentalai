/**
 * Flujo de captura del análisis visual de DENTA IA.
 * Primero 3 fotos guiadas por ángulo, luego un video corto (selfie al espejo)
 * para reconstruir un modelo 3D de la sonrisa y diagnosticar con más precisión.
 */

export type PhotoAngle = {
  id: string;
  /** Etiqueta corta del indicador de pasos */
  short: string;
  /** Instrucción grande (uppercase) durante la captura */
  instruction: string;
  /** Sugerencia amable debajo de la guía */
  hint: string;
};

export const PHOTO_ANGLES: PhotoAngle[] = [
  {
    id: 'frente',
    short: 'Frente',
    instruction: 'SONRISA DE FRENTE',
    hint: 'Sonreí mostrando bien los dientes',
  },
  {
    id: 'lat_der',
    short: 'Perfil Der.',
    instruction: 'GIRÁ HACIA LA DERECHA',
    hint: 'Perfil derecho de tu sonrisa',
  },
  {
    id: 'lat_izq',
    short: 'Perfil Izq.',
    instruction: 'GIRÁ HACIA LA IZQUIERDA',
    hint: 'Perfil izquierdo de tu sonrisa',
  },
];

/** Paso final: video 360° para la reconstrucción 3D. */
export const VIDEO_CAPTURE = {
  short: 'Video 3D',
  /** Duración máxima del clip, en segundos. */
  maxDuration: 8,
  instruction: 'FILMÁ TU SONRISA EN 360°',
  hint: 'Frente al espejo, movés el celular lento de lado a lado',
} as const;

/** Total de capturas del flujo (fotos + video). */
export const TOTAL_CAPTURES = PHOTO_ANGLES.length + 1;
