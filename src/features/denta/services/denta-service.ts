/**
 * Capa de datos del chat "Denta": función pura contra la Edge Function.
 * No conoce React. La pantalla la orquesta.
 */
import { supabase } from '@/services/supabase';

/** Un turno del chat tal como lo maneja la UI. */
export type DentaTurn = { role: 'user' | 'denta'; text: string };

/**
 * Manda el historial del chat a la Edge Function `denta-chat` y devuelve la
 * próxima respuesta de Denta (texto). La IA vive en el servidor; la API key
 * nunca toca el cliente.
 */
export async function sendDentaMessage(history: DentaTurn[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke('denta-chat', {
    body: { messages: history },
  });
  if (error) throw new Error(`Denta no pudo responder: ${error.message}`);

  const reply = (data as { reply?: string } | null)?.reply?.trim();
  if (!reply) throw new Error('Denta no devolvió respuesta.');
  return reply;
}
