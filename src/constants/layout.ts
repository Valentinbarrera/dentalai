/** Constantes de layout compartidas para la nav bar flotante y el padding de las pantallas. */
export const FLOATING_TAB_BAR = {
  /** Alto visual de la barra */
  height: 64,
  /** Margen horizontal respecto a los bordes de pantalla */
  marginHorizontal: 16,
  /** Separación de la barra respecto al safe-area inferior */
  marginBottom: 12,
} as const;

/**
 * Espacio inferior que deben dejar las pantallas con scroll para que
 * el contenido no quede tapado por la nav bar flotante.
 */
export const CONTENT_BOTTOM_INSET =
  FLOATING_TAB_BAR.height + FLOATING_TAB_BAR.marginBottom + 24;
