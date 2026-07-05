/**
 * API pública del feature de videos educativos.
 * El resto de la app importa siempre desde acá (`@/features/videos`),
 * nunca de los archivos internos.
 */
export { listVideos, createVideo, listMyVideos, deleteVideo } from './services/videos-service';
export { useVideos, useMyVideos } from './hooks/use-videos';
export type { UseVideosResult, UseMyVideosResult } from './hooks/use-videos';
export type { Video, CreateVideoInput } from './types';
