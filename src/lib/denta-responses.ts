/**
 * Motor de respuestas de DENTA (mock local).
 *
 * IMPORTANTE: esto es un stand-in para el demo. La versión real debe llamar a
 * la API de Claude (Anthropic) desde un backend propio — nunca exponer la API key
 * en la app móvil. La firma `getDentaReply` está pensada para reemplazarse por una
 * llamada async al backend sin tocar la UI.
 */

export type ChatRole = 'denta' | 'user';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  time: string;
};

export type DentaReply = {
  text: string;
  /** Cuánto sube el nivel de confianza tras esta respuesta (0–100). */
  confidenceDelta: number;
};

export type Suggestion = {
  id: string;
  label: string;
  /** Texto que se envía como mensaje del usuario al tocar el chip. */
  message: string;
};

export const INITIAL_SUGGESTIONS: Suggestion[] = [
  { id: 'dolor', label: 'Tengo dolor', message: 'Tengo dolor' },
  { id: 'miedo', label: 'Tengo miedo', message: 'Tengo miedo' },
  { id: 'implantes', label: 'Quiero implantes', message: 'Quiero implantes' },
  { id: 'consulta', label: 'Quiero una consulta', message: 'Quiero una consulta' },
];

export const DENTA_WELCOME =
  '¿Qué te preocupa hoy sobre tu salud dental? Seleccioná una opción para empezar.';

const CANNED: Record<string, DentaReply> = {
  dolor: {
    text: 'Lamento que tengas dolor. Para ayudarte mejor: ¿es un dolor constante o aparece al masticar o con el frío/calor? Con un análisis visual puedo darte una orientación preliminar en segundos.',
    confidenceDelta: 12,
  },
  miedo: {
    text: 'Es totalmente normal sentir miedo, y está muy bien que lo cuentes. Vamos a ir a tu ritmo, sin apuros. Hoy la mayoría de los tratamientos son indoloros gracias a la anestesia moderna. ¿Querés que te cuente cómo sería el paso a paso?',
    confidenceDelta: 18,
  },
  implantes: {
    text: 'Los implantes son una gran opción a largo plazo. Puedo mostrarte 3 alternativas comparadas (implantes, prótesis híbrida y removible) con su durabilidad, estética e inversión estimada. ¿Arrancamos con un análisis visual?',
    confidenceDelta: 15,
  },
  consulta: {
    text: 'Perfecto. Puedo conectarte con un especialista verificado cerca tuyo según tu caso. Antes, un breve análisis visual me ayuda a orientar mejor la derivación. ¿Lo hacemos ahora?',
    confidenceDelta: 15,
  },
};

const FALLBACK: DentaReply = {
  text: 'Gracias por contarme. Recordá que mi orientación es preliminar: el especialista tendrá siempre la palabra final. ¿Querés que hagamos un análisis visual para avanzar?',
  confidenceDelta: 8,
};

/**
 * Devuelve la respuesta de DENTA para un mensaje del usuario.
 * (Reemplazar por `await fetch(backend, ...)` que llame a Claude.)
 */
export function getDentaReply(suggestionId?: string): DentaReply {
  if (suggestionId && CANNED[suggestionId]) return CANNED[suggestionId];
  return FALLBACK;
}

let counter = 0;
/** ID simple y estable para keys de lista (sin depender de Date/random). */
export function nextMessageId(): string {
  counter += 1;
  return `m${counter}`;
}

export function formatNow(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const hh = ((h + 11) % 12) + 1;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${hh}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}
