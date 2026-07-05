/**
 * Edge Function `denta-chat` — asistente conversacional de salud bucal.
 *
 * Recibe el historial del chat y devuelve la próxima respuesta de "Denta",
 * generada con Claude (texto). La API key va como SECRET de la función
 * (`ANTHROPIC_API_KEY`, compartida con `analyze`), NUNCA en el cliente.
 * Modelo por defecto `claude-sonnet-5` (override con secret `DENTA_MODEL`).
 *
 * No accede a datos del usuario: el chat no lee ni escribe la base, así que
 * funciona con o sin sesión (alcanza con un JWT válido, que el cliente adjunta).
 *
 * ENMARCADO LEGAL: orientación preliminar, no diagnóstico clínico (ver prompt.ts).
 */
import { SYSTEM_PROMPT } from './prompt.ts';

const DEFAULT_MODEL = 'claude-sonnet-5';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MAX_HISTORY = 20; // últimas N vueltas, para acotar tokens/costo

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

type Incoming = { role: 'user' | 'denta'; text: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  const model = Deno.env.get('DENTA_MODEL') ?? DEFAULT_MODEL;
  if (!anthropicKey) return json({ error: 'Falta ANTHROPIC_API_KEY en la función.' }, 500);

  let incoming: Incoming[];
  try {
    const body = await req.json();
    incoming = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return json({ error: 'Body inválido.' }, 400);
  }

  // Mapeamos al formato de Anthropic (denta → assistant, user → user),
  // tomamos solo texto no vacío y recortamos a las últimas MAX_HISTORY vueltas.
  const mapped = incoming
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({
      role: m.role === 'denta' ? 'assistant' : 'user',
      content: m.text.trim(),
    }))
    .slice(-MAX_HISTORY);

  // La API exige que el historial arranque con un turno de 'user'.
  while (mapped.length && mapped[0].role !== 'user') mapped.shift();
  if (mapped.length === 0) {
    return json({ error: 'No hay mensaje del usuario para responder.' }, 400);
  }

  try {
    const aiRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        thinking: { type: 'disabled' },
        system: SYSTEM_PROMPT,
        messages: mapped,
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      throw new Error(`Claude respondió ${aiRes.status}: ${detail.slice(0, 200)}`);
    }

    const aiJson = await aiRes.json();
    if (aiJson.stop_reason === 'refusal') {
      return json({
        reply:
          'Perdón, con eso no te puedo ayudar por acá. Si querés, contame qué te preocupa de tu salud bucal.',
      });
    }
    const textBlock = (aiJson.content ?? []).find(
      (b: Record<string, unknown>) => b.type === 'text',
    );
    const reply = textBlock?.text?.trim();
    if (!reply) throw new Error('Respuesta vacía del modelo.');

    return json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido.';
    return json({ error: message }, 500);
  }
});
