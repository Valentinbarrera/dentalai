# DentalAI

App móvil de **orientación dental preliminar con IA**, construida con Expo / React Native.
El paciente saca fotos de su boca, la app las analiza y devuelve una orientación con un
presupuesto estimado y la posibilidad de reservar un turno; los odontólogos cuentan con un
**portal** propio para gestionar su agenda y sus pacientes.

> **Aviso importante:** DentalAI da una **orientación preliminar**, **no** un diagnóstico
> clínico. No reemplaza la consulta con un profesional.

## Dos roles

La app funciona sobre un mismo sistema de autenticación con dos tipos de sesión (el rol se
guarda en la tabla `profiles`):

- **Paciente** — hace el análisis con la cámara, ve la orientación y el presupuesto estimado,
  y reserva turnos.
- **Odontólogo** — portal propio: turnos, gestión de pacientes y subida de título/matrícula
  para verificación.

## Cómo correr el proyecto

Requisitos: Node.js LTS y la app **Expo Go** (o un development build) en un **dispositivo
físico** — el análisis usa la cámara, que no funciona en emulador/simulador web.

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env` en la raíz con las credenciales de Supabase:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

   La `service_role` key y la contraseña de la base **nunca** van en el cliente.
   El paso a paso para crear el proyecto Supabase y correr las migraciones está en
   [`BACKEND-SETUP.md`](./BACKEND-SETUP.md).

3. Levantar el dev server:

   ```bash
   npx expo start
   ```

   Escaneá el QR con Expo Go en tu teléfono. Si cambiaste el `.env`, reiniciá con caché
   limpia: `npx expo start -c`.

## Arquitectura

Arquitectura **feature-first por capas**: cada dominio (`auth`, `analyses`, `appointments`,
`credentials`) vive aislado en `src/features/` y expone su API pública por un barrel; la UI
nunca habla directo con Supabase, siempre pasa por la capa de servicios. La dirección de
dependencias es `app → features → services`.

```
src/
  app/            Rutas (expo-router). Pantallas finas que componen features.
  features/       Módulos de dominio autocontenidos (types / services / hooks / components).
  services/       Infraestructura compartida (cliente Supabase).
  components/     UI compartida (ui/, denta/, analysis/…).
  theme/ constants/ hooks/ lib/   Utilidades transversales y design tokens.
```

El detalle completo (capas, reglas y cómo sumar un feature nuevo) está en
[`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Estado del backend (por fases)

El backend es **Supabase** (auth, Postgres, storage, Edge Functions) + **Claude Vision** como
motor del análisis. Se avanza por fases — ver [`BACKEND-SETUP.md`](./BACKEND-SETUP.md):

- **Fase 1 — Auth + roles** ✅ Cliente Supabase, `AuthProvider`/`useAuth` con sesión
  persistente, login/registro/logout reales, selector de rol y ruteo por rol, migración
  `0001_profiles.sql` con RLS.
- **Fase 2 — Storage + captura** — módulo `features/analyses/` y migración `0002_analyses.sql`
  (tabla + bucket privado `captures`) construidos; falta cablearlos a las pantallas de cámara.
- **Fase 3 — IA real** ⏳ Edge Function `diagnose` (Claude Vision) **pendiente**: requiere
  cargar la `ANTHROPIC_API_KEY` como secret server-side de la Edge Function.
- **Fase 4 — Odontólogo + turnos + credenciales** — rol paciente/odontólogo hecho; módulos
  `features/appointments/` y `features/credentials/` (con `0003`/`0004`) construidos y tipados,
  pendientes de cablear a las pantallas.

> Los módulos de las Fases 2–4 están construidos y tipados (capa de datos + SQL), pero todavía
> no están conectados a las pantallas ni probados contra un Supabase real.

## Stack

- **Expo** ~57 / **React Native** 0.86 / **React** 19
- **Expo Router** (ruteo por archivos, typed routes)
- **Supabase** (`@supabase/supabase-js`) + AsyncStorage para la sesión
- **expo-camera** / **expo-image-picker** para la captura
- **react-native-reanimated** + **react-native-worklets**, **react-native-svg**,
  **expo-linear-gradient**, **expo-image**, **expo-glass-effect** para la UI/animaciones
- **TypeScript**

## Antes de programar

Leé [`AGENTS.md`](./AGENTS.md): Expo cambió bastante, así que consultá la documentación
**versionada de Expo v57** (https://docs.expo.dev/versions/v57.0.0/) antes de escribir código.
