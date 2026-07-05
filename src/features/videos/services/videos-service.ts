/**
 * Capa de datos del feature de videos: funciones puras contra Supabase.
 * No conoce React. Los hooks y las pantallas la orquestan.
 *
 * Lee la tabla `videos` (biblioteca educativa de lectura general).
 */
import { supabase } from '@/services/supabase';

import type { CreateVideoInput, Video } from '../types';

/** Columnas que seleccionamos siempre de la tabla `videos`. */
const VIDEO_COLUMNS =
  'id, title, description, category, thumbnail_url, video_url, duration, author_id, created_at';

/** Fila cruda tal como vuelve de la tabla `videos` (snake_case). */
type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  duration: string | null;
  author_id: string | null;
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
    authorId: row.author_id,
    createdAt: row.created_at,
  };
}

/** Devuelve el id del usuario autenticado o tira si no hay sesión. */
async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) throw new Error('No hay una sesión activa.');
  return userId;
}

/** Normaliza un texto opcional del form: recorta y convierte vacío en `null`. */
function optional(value?: string): string | null {
  const clean = value?.trim();
  return clean ? clean : null;
}

/**
 * Lista todos los videos de la biblioteca, del más nuevo al más viejo.
 * La tabla arranca vacía: mientras no haya contenido real, devuelve `[]`.
 */
export async function listVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select(VIDEO_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`No pudimos listar los videos: ${error.message}`);
  return (data as VideoRow[]).map(toVideo);
}

/**
 * Publica un video nuevo (cargado por URL). El `author_id` se completa con el
 * usuario autenticado; RLS exige que sea odontólogo y que coincida con `auth.uid()`.
 * Devuelve el video ya creado, mapeado al contrato del dominio.
 */
export async function createVideo(input: CreateVideoInput): Promise<Video> {
  const authorId = await requireUserId();

  const { data, error } = await supabase
    .from('videos')
    .insert({
      title: input.title.trim(),
      description: optional(input.description),
      category: optional(input.category),
      video_url: optional(input.videoUrl),
      thumbnail_url: optional(input.thumbnailUrl),
      duration: optional(input.duration),
      author_id: authorId,
    })
    .select(VIDEO_COLUMNS)
    .single();

  if (error) throw new Error(`No pudimos publicar el video: ${error.message}`);
  return toVideo(data as VideoRow);
}

/** Lista los videos cargados por un odontólogo, del más nuevo al más viejo. */
export async function listMyVideos(authorId: string): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select(VIDEO_COLUMNS)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`No pudimos listar tus videos: ${error.message}`);
  return (data as VideoRow[]).map(toVideo);
}

/** Borra un video por id. RLS sólo permite borrar los del propio autor. */
export async function deleteVideo(id: string): Promise<void> {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) throw new Error(`No pudimos borrar el video: ${error.message}`);
}
