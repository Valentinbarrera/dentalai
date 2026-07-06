# Edge Function `analyze` — IA de diagnóstico (Fase 3)

Recibe un `analysisId`, baja las fotos del scan del bucket `captures`, se las manda
a **Claude Vision** con un prompt conservador y guarda el `result` en la tabla
`analyses`, pasando el estado a `procesando` → `listo` (o `error`).

> **Encuadre legal:** todo lo que produce es **orientación preliminar**, NO un
> diagnóstico clínico. El prompt (`prompt.ts`) es deliberadamente prudente.

## Requisitos

- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado y logueado
  (`supabase login`).
- Una API key de Anthropic (`sk-ant-...`) con saldo. Costo aprox. por análisis:
  ~3 centavos de USD con el modelo por defecto (Claude Sonnet 5).

## 1. Secrets (se setean una vez)

La API key **nunca** va en el cliente: va como secret de la función.

```bash
# Desde la raíz del repo (donde está supabase/)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-tu-key-aca

# (Opcional) cambiar el modelo. Por defecto: claude-sonnet-5.
# Alternativas: claude-opus-4-8 (mejor, más caro) | claude-haiku-4-5 (más barato).
supabase secrets set ANALYZE_MODEL=claude-sonnet-5
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya los inyecta Supabase
automáticamente en las Edge Functions; no hace falta setearlos.

## 2. Deploy

```bash
supabase functions deploy analyze
```

`verify_jwt` queda activado (por defecto): la función exige un JWT válido, y el
cliente Supabase de la app lo adjunta solo. La función además verifica que el
análisis pertenezca al usuario del token.

## 3. Probar

En la app (con sesión iniciada): hacé un análisis con fotos reales de la boca.
El flujo es: cámara → sube capturas → `processing.tsx` invoca `analyze` →
la pantalla espera el estado `listo` y navega al diagnóstico con el `result` real.

Para probar la función suelta desde la terminal necesitás un `analysisId` que ya
tenga capturas subidas en `captures/<userId>/<analysisId>/` y un access token del
usuario:

```bash
curl -i -X POST "https://<TU-PROJECT-REF>.supabase.co/functions/v1/analyze" \
  -H "Authorization: Bearer <ACCESS_TOKEN_DEL_USUARIO>" \
  -H "Content-Type: application/json" \
  -d '{"analysisId":"<UUID_DEL_ANALISIS>"}'
```

## Notas

- Solo se mandan a Vision las **fotos** (jpg/png); el video 360° no va al modelo.
- Ante fotos ilegibles / falla temporal, la función deja el estado en `error` y la
  app muestra una vista de error con "Reintentar".
- El modelo devuelve JSON: resumen, puntajes de salud, zonas y **3 planes**
  (A/B/C) que eligen ítems del **catálogo de precios** (`procedures`) por `id`.
  La IA NO pone montos: el backend (`index.ts`) multiplica cantidad × precio
  unitario del catálogo y **calcula** los totales (Fase B). Requiere haber
  corrido la migración `0009` y cargado precios en el panel `/admin`; si el
  catálogo está vacío, los planes salen sin ítems/total.
