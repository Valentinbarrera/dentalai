# DentalAI — Arquitectura

Arquitectura **feature-first por capas**. Pensada para evolucionar y escalar:
cada dominio (auth, análisis, turnos, pacientes) vive aislado y expone una API
pública; la infraestructura (Supabase) queda detrás de una capa de servicios.

## Capas

```
src/
  app/            Rutas (expo-router). Pantallas FINAS: componen features, no tienen lógica de datos.
  features/       Módulos de dominio, autocontenidos. Cada uno expone su API por index.ts (barrel).
    auth/
      types.ts          Contratos del dominio (UserRole, resultados…).
      services/         Capa de datos: funciones puras contra Supabase. Sin React.
      context/          Estado React (Context + Provider).
      hooks/            Hooks de consumo (useAuth).
      components/       UI propia del feature (RoleSelector).
      index.ts          API pública. El resto de la app importa SOLO de acá.
  services/       Infraestructura compartida (integraciones externas).
    supabase/           Cliente Supabase + barrel.
  components/     UI compartida y agnóstica de dominio (ui/, denta/, …).
  theme/          Design tokens.
  constants/ hooks/ lib/   Utilidades compartidas transversales.
```

## Reglas

1. **Dirección de dependencias:** `app → features → services`. Nunca al revés.
   Un feature puede usar `services/` y `components/`; `services/` no conoce features ni React.
2. **Barrels:** se importa `@/features/auth`, nunca `@/features/auth/context/auth-provider`.
   Los internos del módulo se pueden refactorizar sin romper a nadie.
3. **Separación datos / estado / UI dentro del feature:**
   `services/` (datos puros) → `context/` (estado React) → `components/`+`hooks/` (consumo).
4. **La UI nunca habla directo con Supabase.** Siempre a través del `service` del feature.
5. **Pantallas finas:** los archivos de `app/` solo orquestan; la lógica vive en el feature.

## Cómo sumar un feature nuevo (ej. `appointments`)

```
features/appointments/
  types.ts
  services/appointments-service.ts   ← consulta/escribe la tabla `appointments`
  hooks/use-appointments.ts
  components/…
  index.ts
```
Y su migración SQL en `supabase/migrations/000N_appointments.sql`.

## Backend
Ver `BACKEND-SETUP.md` para el estado por fases y los pasos de configuración de Supabase.
