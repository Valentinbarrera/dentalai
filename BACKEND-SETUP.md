# DentalAI — Backend (Supabase + Claude Vision)

Guía de conexión del backend real. Se avanza por fases.

## Stack
- **Supabase** — auth, base de datos (Postgres), storage de fotos/video, Edge Functions.
- **Claude Vision** — motor del diagnóstico (orientación preliminar, **no** diagnóstico clínico).

## Dos roles de usuario
La app tiene **dos tipos de sesión** sobre el mismo sistema de auth:
- **Paciente** — hace el análisis, ve diagnóstico/presupuesto, reserva turnos.
- **Odontólogo** — portal propio: turnos del día, gestión de pacientes, sube título/matrícula (verificación), ve los scans de sus pacientes.

El rol se guarda en la tabla `profiles` (`role: 'paciente' | 'odontologo'`). El registro
del odontólogo entra por `portal-credentials.tsx` (subir título → estado *pendiente de verificación*).

---

## Fase 1 — Fundación + Auth ✅ (código listo)

### Qué se hizo en el código
- `src/lib/supabase.ts` — cliente Supabase (auth + storage), lee credenciales de `.env`.
- `src/lib/auth.tsx` — `AuthProvider` + `useAuth()` con sesión persistente (AsyncStorage).
- Login/registro/logout reales conectados en `login.tsx`, `index.tsx`, `profile.tsx`.
- Se eliminó el mock `src/lib/session.ts`.
- **Roles** (`paciente` / `odontologo`): selector en el registro; el rol viaja en los
  metadatos del usuario. El ruteo va por rol → odontólogo entra al **portal**, paciente al Home.
- `supabase/migrations/0001_profiles.sql` — tabla `profiles` (con `role` y `verified`),
  RLS, y trigger que crea el perfil solo al registrarse.

### Lo que falta hacer VOS (una vez)
1. **Crear el proyecto** en https://supabase.com → New project (`dentalai`).
2. **Project Settings → API** → copiar **Project URL** y **anon public key**.
3. Pegar esos dos valores en el archivo `.env` (en la raíz del proyecto):
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. **Authentication → Providers → Email**: para el demo, desactivar **"Confirm email"**
   así el registro entra directo sin tener que confirmar por mail.
5. **SQL Editor → New query** → correr **en orden** las migraciones de `supabase/migrations/`:
   `0001_profiles.sql`, `0002_analyses.sql`, `0003_appointments.sql`, `0004_credentials.sql`
   (perfiles/roles, análisis + bucket `captures`, turnos, y credenciales + bucket `credentials`).
   Todas son idempotentes (se pueden re-correr sin romper nada).
6. Reiniciar el dev server (`npx expo start -c`) para que tome el `.env`.

> La `service_role` key y la contraseña de la DB **nunca** van en `.env` ni en el cliente.

---

## Fase 2 — Storage + captura (módulo listo, falta cablear)
- Feature `src/features/analyses/` (types, services, hook, barrel) + `0002_analyses.sql`
  (tabla `analyses` + bucket privado `captures` + RLS). **Hecho.**
- **Falta (wiring):** llamar `createAnalysis` + `uploadCaptures` desde `analysis/camera.tsx`
  al terminar la captura, y leer el estado en `analysis/processing.tsx`. Buscar `// TODO(wiring):`.

## Fase 3 — IA real (pendiente)
- Edge Function `diagnose`: recibe las fotos, llama a Claude Vision con un prompt
  estructurado y devuelve el diagnóstico en el shape de `src/lib/diagnosis.ts`.
- La `ANTHROPIC_API_KEY` se guarda como secret de la Edge Function (server-side), nunca en el cliente.
- `analysis/processing.tsx` invoca la función y guarda el resultado.

## Fase 4 — Rol odontólogo + turnos + persistencia (parcial)
- **Rol `paciente`/`odontologo`** — ✅ hecho (selector en registro, `profiles.role`, ruteo por rol).
- **Turnos** — feature `src/features/appointments/` + `0003_appointments.sql` listos (tabla
  única compartida, RLS paciente↔odontólogo). **Falta cablear** `portal.tsx` (`APPTS`) y
  `booking/confirmation.tsx` a `createAppointment`/`listForDentist` (ver `// TODO(wiring):`).
- **Verificación de credenciales** — feature `src/features/credentials/` + `0004_credentials.sql`
  (bucket privado + `profiles.verified`) listos. **Falta cablear** `portal-credentials.tsx` a
  `uploadCredential` (hoy la pantalla guarda solo la URI local).
- **Pendiente sin empezar:** gestión real de pacientes (`portal.tsx` `PATIENTS`), historial
  clínico, presupuestos guardados.

> Los módulos de Fases 2–4 están **construidos y tipados** (capa de datos + SQL), pero todavía
> **no están conectados a las pantallas** ni probados contra un Supabase real (falta cargar keys).
