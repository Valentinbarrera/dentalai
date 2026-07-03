/**
 * Capa de datos de credenciales: funciones puras contra Supabase.
 * No conoce React. El hook las orquesta y las expone como estado.
 */
import { supabase } from '@/services/supabase';

import type { CredentialInput, VerificationStatus } from '../types';

/**
 * Sube el título del odontólogo al bucket privado `credentials` (en su carpeta
 * `${userId}/...`) y guarda matrícula/universidad en su perfil, dejando la
 * verificación en `pendiente`.
 *
 * En React Native no hay `File`/`Blob` como en el navegador: leemos la URI local
 * con `fetch(...).arrayBuffer()` y subimos ese ArrayBuffer.
 *
 * TODO(wiring): conectar esto con `src/app/portal-credentials.tsx`. Hoy esa
 * pantalla guarda solo la URI local (`setDiploma`) y no sube nada; su botón
 * "Guardar credenciales" deberá llamar a `uploadCredential(userId, { diplomaUri,
 * matricula, university })` en vez de `setSaved(true)`.
 */
export async function uploadCredential(
  userId: string,
  input: CredentialInput,
): Promise<{ error: string | null }> {
  try {
    // 1) Leer el archivo local del título como binario (patrón RN).
    const response = await fetch(input.diplomaUri);
    const arrayBuffer = await response.arrayBuffer();

    // Deducir extensión y contentType desde la URI (default: jpg).
    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const extension = extensionFor(input.diplomaUri, contentType);
    const path = `${userId}/diploma.${extension}`;

    // 2) Subir al bucket privado, dentro de la carpeta del propio usuario.
    const { error: uploadError } = await supabase.storage
      .from('credentials')
      .upload(path, arrayBuffer, { contentType, upsert: true });
    if (uploadError) return { error: mapCredentialError(uploadError.message) };

    // 3) Guardar los datos de la matrícula y dejar la verificación en pendiente.
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        matricula: input.matricula.trim(),
        university: input.university?.trim() ?? null,
        verified: 'pendiente' satisfies VerificationStatus,
      })
      .eq('id', userId);
    if (updateError) return { error: mapCredentialError(updateError.message) };

    return { error: null };
  } catch (e) {
    return { error: mapCredentialError(e instanceof Error ? e.message : String(e)) };
  }
}

/** Lee el estado de verificación del perfil del usuario. */
export async function getMyVerification(userId: string): Promise<VerificationStatus> {
  const { data, error } = await supabase
    .from('profiles')
    .select('verified')
    .eq('id', userId)
    .single();

  if (error || !data) return 'pendiente';
  return (data.verified as VerificationStatus) ?? 'pendiente';
}

/** Elige la extensión del archivo a partir de la URI o del contentType. */
function extensionFor(uri: string, contentType: string): string {
  const fromUri = uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (fromUri && /^(jpg|jpeg|png|webp|heic|pdf)$/.test(fromUri)) return fromUri;
  if (/png/.test(contentType)) return 'png';
  if (/webp/.test(contentType)) return 'webp';
  if (/pdf/.test(contentType)) return 'pdf';
  return 'jpg';
}

/** Traduce los mensajes de Supabase a algo entendible en español. */
export function mapCredentialError(msg: string): string {
  if (/network|fetch/i.test(msg)) return 'Sin conexión. Revisá tu internet.';
  if (/exceeded|too large|size/i.test(msg)) return 'El archivo es demasiado grande.';
  if (/not authorized|permission|rls|policy/i.test(msg))
    return 'No tenés permiso para subir estas credenciales.';
  return 'No pudimos guardar tus credenciales. Probá de nuevo.';
}
