/**
 * Capa de datos del feature de videos: funciones puras contra Supabase.
 * No conoce React. Los hooks y las pantallas la orquestan.
 *
 * Lee la tabla `videos` (biblioteca educativa de lectura general).
 */
import { supabase } from '@/services/supabase';

import type { Video } from '../types';

/** Fila cruda tal como vuelve de la tabla `videos` (snake_case). */
type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  duration: string | null;
  created_at: string;
};

/** Mapea la fila de la DB (snake_case) al contrato del dominio (camelCase). */
function toVideo(row: VideoRow): Video {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    thumbnailUrl: row.thumbnail_url,
    videoUrl: row.video_url,
    duration: row.duration,
    createdAt: row.created_at,
  };
}

/**
 * Lista todos los videos de la biblioteca, del más nuevo al más viejo.
 * La tabla arranca vacía: mientras no haya contenido real, devuelve `[]`.
 */
export async function listVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('id, title, description, category, thumbnail_url, video_url, duration, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`No pudimos listar los videos: ${error.message}`);
  return (data as VideoRow[]).map(toVideo);
}
