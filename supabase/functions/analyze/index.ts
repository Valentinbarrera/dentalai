/**
 * Edge Function `analyze` — IA de diagnóstico dental (Fase 3).
 *
 * Flujo:
 *  1. Recibe { analysisId } y el JWT del usuario (lo adjunta el cliente Supabase).
 *  2. Verifica que el análisis sea del usuario y lo pasa a estado `procesando`.
 *  3. Baja las fotos del scan del bucket privado `captures`.
 *  4. Las manda a Claude Vision con un prompt estructurado y conservador.
 *  5. Guarda el `result` (DiagnosisResult) y pasa el estado a `listo` (o `error`).
 *
 * La API key de Anthropic va como SECRET de la función (`ANTHROPIC_API_KEY`),
 * NUNCA en el cliente. El modelo se puede cambiar con el secret `ANALYZE_MODEL`
 * (por defecto `claude-sonnet-5`: buena visión y económico).
 *
 * ENMARCADO LEGAL: todo lo que produce es ORIENTACIÓN PRELIMINAR, no un
 * diagnóstico clínico. Ver `prompt.ts`.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

import { SYSTEM_PROMPT, USER_INSTRUCTIONS } from './prompt.ts';

const BUCKET = 'captures';
const DEFAULT_MODEL = 'claude-sonnet-5';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

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

/** Codifica bytes a base64 en chunks (evita desbordar el stack con imágenes). */
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

type Severity = 'high' | 'medium' | 'low';

/** Ajusta un número al rango [0, 100]; devuelve `fallback` si no es válido. */
function clampScore(n: unknown, fallback = 50): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
}

/** Normaliza la respuesta de la IA a un `DiagnosisResult` con severidades válidas. */
function normalize(raw: Record<string, unknown>): Record<string, unknown> {
  const validSeverity = (s: unknown): Severity =>
    s === 'high' || s === 'medium' || s === 'low' ? s : 'low';

  const zones = Array.isArray(raw.affectedZones) ? raw.affectedZones : [];
  const affectedZones = zones.map((z: Record<string, unknown>, i: number) => ({
    id: String(z?.id ?? `zona-${i}`),
    zone: String(z?.zone ?? 'Zona'),
    status: String(z?.status ?? 'Sin datos'),
    severity: validSeverity(z?.severity),
  }));

  const hs = (raw.healthScore ?? {}) as Record<string, unknown>;
  const healthScore = {
    general: clampScore(hs.general),
    higiene: clampScore(hs.higiene),
    encias: clampScore(hs.encias),
    alineacion: clampScore(hs.alineacion),
  };

  return {
    summary: typeof raw.summary === 'string' ? raw.summary : undefined,
    healthScore,
    affectedZones,
    treatmentOptions: Array.isArray(raw.treatmentOptions) ? raw.treatmentOptions : [],
    budget: raw.budget ?? undefined,
    paymentPlans: Array.isArray(raw.paymentPlans) ? raw.paymentPlans : undefined,
  };
}

/** Extrae el JSON del texto de Claude (tolera fences ```json … ```). */
function parseJson(text: string): Record<string, unknown> {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end !== -1) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  const model = Deno.env.get('ANALYZE_MODEL') ?? DEFAULT_MODEL;

  if (!supabaseUrl || !serviceKey) return json({ error: 'Backend mal configurado.' }, 500);
  if (!anthropicKey) return json({ error: 'Falta ANTHROPIC_API_KEY en la función.' }, 500);

  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'Falta la sesión del usuario.' }, 401);

  const admin = createClient(supabaseUrl, serviceKey);

  // Identificamos al usuario a partir de su JWT.
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  const userId = userData?.user?.id;
  if (userErr || !userId) return json({ error: 'Sesión inválida.' }, 401);

  let analysisId: string | undefined;
  try {
    ({ analysisId } = await req.json());
  } catch {
    return json({ error: 'Body inválido.' }, 400);
  }
  if (!analysisId) return json({ error: 'Falta analysisId.' }, 400);

  // El análisis tiene que existir y ser del usuario.
  const { data: analysis, error: readErr } = await admin
    .from('analyses')
    .select('id, user_id')
    .eq('id', analysisId)
    .maybeSingle();
  if (readErr || !analysis || analysis.user_id !== userId) {
    return json({ error: 'Análisis no encontrado.' }, 404);
  }

  const setStatus = (status: string, result: unknown = undefined) =>
    admin
      .from('analyses')
      .update(result === undefined ? { status } : { status, result })
      .eq('id', analysisId);

  try {
    await setStatus('procesando');

    // 1) Bajamos las fotos del scan (sólo imágenes; el video 360° no va a Vision).
    const folder = `${userId}/${analysisId}`;
    const { data: files, error: listErr } = await admin.storage.from(BUCKET).list(folder);
    if (listErr) throw new Error(`No pudimos listar las capturas: ${listErr.message}`);

    const photos = (files ?? []).filter((f) => /\.(jpe?g|png)$/i.test(f.name));
    if (photos.length === 0) throw new Error('No hay fotos para analizar.');

    const images: { type: 'image'; source: Record<string, string> }[] = [];
    for (const file of photos.slice(0, 6)) {
      const { data: blob, error: dlErr } = await admin.storage
        .from(BUCKET)
        .download(`${folder}/${file.name}`);
      if (dlErr || !blob) continue;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const mediaType = /\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg';
      images.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: toBase64(bytes) },
      });
    }
    if (images.length === 0) throw new Error('No pudimos leer las fotos del scan.');

    // 2) Llamamos a Claude Vision.
    // `thinking: disabled` acelera/abarata la extracción, pero Claude Fable 5
    // rechaza el disabled explícito → en ese caso omitimos el parámetro.
    const requestBody: Record<string, unknown> = {
      model,
      // Holgura para que el JSON (zonas + tratamientos + presupuesto + planes)
      // no se trunque; por debajo de ~16k no hay riesgo de timeout.
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [...images, { type: 'text', text: USER_INSTRUCTIONS }],
        },
      ],
    };
    if (!model.startsWith('claude-fable')) requestBody.thinking = { type: 'disabled' };

    const aiRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      // Log del detalle del proveedor del lado servidor; al cliente, mensaje genérico.
      console.error(`[analyze] Anthropic ${aiRes.status}: ${detail.slice(0, 500)}`);
      throw new Error(`El servicio de IA respondió ${aiRes.status}.`);
    }

    const aiJson = await aiRes.json();
    if (aiJson.stop_reason === 'refusal') {
      throw new Error('El modelo no pudo analizar estas imágenes.');
    }
    if (aiJson.stop_reason === 'max_tokens') {
      throw new Error('La respuesta de la IA quedó incompleta. Reintentá el análisis.');
    }
    const textBlock = (aiJson.content ?? []).find(
      (b: Record<string, unknown>) => b.type === 'text',
    );
    if (!textBlock?.text) throw new Error('Respuesta vacía del modelo.');

    // 3) Parseamos, normalizamos y guardamos.
    const result = normalize(parseJson(textBlock.text));
    await setStatus('listo', result);

    return json({ status: 'listo', analysisId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido.';
    await setStatus('error').catch(() => {});
    return json({ error: message }, 500);
  }
});
