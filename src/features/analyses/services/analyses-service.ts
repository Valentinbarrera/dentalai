/**
 * Capa de datos del feature de análisis: funciones puras contra Supabase.
 * No conoce React. Los hooks y las pantallas la orquestan.
 *
 * Cubre dos cosas: subir las capturas al bucket privado `captures` y
 * leer/escribir las filas de la tabla `analyses`.
 */
import { supabase } from '@/services/supabase';

import type { Analysis, AnalysisStatus, Capture } from '../types';

/** Estado con el que nace un análisis: todavía subiendo las capturas. */
const INITIAL_STATUS: AnalysisStatus = 'subiendo';

/** Nombre del bucket privado donde viven las fotos + video del scan. */
const BUCKET = 'captures';

/** Fila cruda tal como vuelve de la tabla `analyses` (snake_case). */
type AnalysisRow = {
  id: string;
  user_id: string;
  status: AnalysisStatus;
  result: Analysis['result'];
  created_at: string;
};

/** Mapea la fila de la DB (snake_case) al contrato del dominio (camelCase). */
function toAnalysis(row: AnalysisRow): Analysis {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    result: row.result,
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

/** Deriva el content-type a partir del tipo de captura. */
function contentTypeOf(capture: Capture): string {
  return capture.kind === 'video' ? 'video/mp4' : 'image/jpeg';
}

/** Extensión de archivo según el tipo de captura. */
function extensionOf(capture: Capture): string {
  return capture.kind === 'video' ? 'mp4' : 'jpg';
}

/**
 * Sube cada captura al bucket privado `captures`, bajo la carpeta del usuario:
 * `${userId}/${analysisId}/<nombre>.<ext>`. En RN no hay `File`/`Blob` fiable,
 * así que leemos la URI local con `fetch(...).arrayBuffer()` y subimos el buffer.
 *
 * Devuelve las rutas (paths) de storage de los archivos subidos, en orden.
 *
 * TODO(wiring): llamar desde `analysis/camera.tsx` al terminar la captura,
 * armando las `Capture[]` a partir de las 3 fotos + el video.
 */
export async function uploadCaptures(
  analysisId: string,
  captures: Capture[],
): Promise<string[]> {
  const userId = await requireUserId();
  const paths: string[] = [];

  for (let i = 0; i < captures.length; i++) {
    const capture = captures[i];
    // Leemos el archivo local (file:// o content://) como ArrayBuffer.
    const arrayBuffer = await fetch(capture.uri).then((r) => r.arrayBuffer());

    const name = `${capture.angle ?? capture.kind}-${i}.${extensionOf(capture)}`;
    const path = `${userId}/${analysisId}/${name}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
      contentType: contentTypeOf(capture),
      upsert: true,
    });
    if (error) throw new Error(`No pudimos subir la captura: ${error.message}`);

    paths.push(path);
  }

  return paths;
}

/**
 * Crea una fila nueva en `analyses` con el estado inicial (`subiendo`) y
 * devuelve su id. El `user_id` lo completa el default de la DB / RLS.
 *
 * TODO(wiring): invocar desde `analysis/camera.tsx` antes de `uploadCaptures`
 * para tener el `analysisId` con el que armar las rutas de storage.
 */
export async function createAnalysis(): Promise<string> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from('analyses')
    .insert({ user_id: userId, status: INITIAL_STATUS, result: null })
    .select('id')
    .single();

  if (error) throw new Error(`No pudimos crear el análisis: ${error.message}`);
  return data.id as string;
}

/** Trae un análisis puntual por id (o `null` si no existe / no es del usuario). */
export async function getAnalysis(id: string): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .select('id, user_id, status, result, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`No pudimos leer el análisis: ${error.message}`);
  return data ? toAnalysis(data as AnalysisRow) : null;
}

/**
 * Lista los análisis del usuario autenticado, del más nuevo al más viejo.
 * RLS ya limita las filas a las del propio usuario.
 *
 * TODO(wiring): `analysis/processing.tsx` guardará acá el diagnóstico devuelto
 * por la Edge Function (Fase 3) actualizando la fila a `status: 'listo'`.
 */
export async function listMyAnalyses(): Promise<Analysis[]> {
  const { data, error } = await supabase
    .from('analyses')
    .select('id, user_id, status, result, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`No pudimos listar los análisis: ${error.message}`);
  return (data as AnalysisRow[]).map(toAnalysis);
}
