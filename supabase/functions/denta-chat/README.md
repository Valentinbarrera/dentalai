# Edge Function `denta-chat` — asistente conversacional de salud bucal

Recibe el historial del chat y devuelve la próxima respuesta de **Denta**,
generada con Claude (texto). Acompaña, educa y deriva; **orientación preliminar,
no diagnóstico clínico** (ver `prompt.ts`).

## Secrets

Comparte la key con `analyze` (no hace falta setearla de nuevo si ya la pusiste):

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-tu-key   # una sola vez para ambas funciones
# (opcional) modelo del chat, por defecto claude-sonnet-5:
supabase secrets set DENTA_MODEL=claude-sonnet-5
```

## Deploy

```bash
supabase functions deploy denta-chat
```

## Notas

- No accede a la base ni a datos del usuario: funciona con o sin sesión (alcanza
  un JWT válido, que el cliente Supabase adjunta solo).
- Manda solo texto (las últimas ~20 vueltas del historial) para acotar costo.
- Ante una negativa del modelo o un error, la app muestra un mensaje amable de
  Denta (nunca una respuesta clínica inventada).
- Se prueba en **web o device** (no necesita cámara): escribí en el input o tocá
  un chip; deberías ver "Denti está escribiendo…" y la respuesta real.
