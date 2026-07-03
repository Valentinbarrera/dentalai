/**
 * API pública del feature de videos educativos.
 * El resto de la app importa siempre desde acá (`@/features/videos`),
 * nunca de los archivos internos.
 */
export { listVideos } from './services/videos-service';
export { useVideos } from './hooks/use-videos';
export type { UseVideosResult } from './hooks/use-videos';
export type { Video } from './types';
