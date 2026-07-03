/** Contratos del dominio de videos educativos. */

/**
 * Un video de la biblioteca educativa: una fila de la tabla `videos`,
 * ya mapeada al contrato del dominio (camelCase).
 */
export type Video = {
  id: string;
  title: string;
  /** Descripción corta, o `null` si no se cargó. */
  description: string | null;
  /** Categoría con la que se agrupa en secciones, o `null` si no tiene. */
  category: string | null;
  /** URL de la miniatura, o `null` (la tarjeta cae a un fondo de marca). */
  thumbnailUrl: string | null;
  /** URL del video a reproducir, o `null` si todavía no está disponible. */
  videoUrl: string | null;
  /** Duración legible (ej. "8:30"), o `null`. */
  duration: string | null;
  createdAt: string;
};
