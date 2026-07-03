# DentalAI — Qué falta hacer (backlog detallado)

Documento de trabajo para dividir el desarrollo con el socio. Estado: julio 2026.
Leer junto con: `ARCHITECTURE.md` (organización del código) y `BACKEND-SETUP.md` (backend por fases).

---

## 0. Contexto general del proyecto

**Qué es:** app móvil de **diagnóstico dental orientativo con IA** + portal para odontólogos.
El paciente se saca fotos de la boca, la IA le da una **orientación preliminar** (no es diagnóstico
clínico) con zonas a revisar, tratamientos sugeridos y presupuesto, y puede **reservar un turno** con un
odontólogo. El odontólogo tiene su **portal** para ver su agenda y sus pacientes.

**Stack técnico:**
- **Frontend:** Expo + React Native + TypeScript, navegación con expo-router (file-based). Animaciones con reanimated, gráficos con react-native-svg.
- **Backend:** **Supabase** (todo en una plataforma): base de datos Postgres, autenticación, storage de archivos, y Edge Functions (para la IA, todavía por hacer).
- **Arquitectura:** *feature-first por capas* — cada dominio es un módulo aislado en `src/features/<nombre>/` (auth, analyses, appointments, credentials, dentists, videos), y la infraestructura vive en `src/services/supabase/`. **La UI nunca habla con la base directo**: siempre pasa por el módulo. Esto permite repartir el trabajo sin pisarse.

**Regla de oro del proyecto:** cero datos ficticios. Todo sale de la base de datos real; si no hay datos, se muestra un estado vacío honesto.

---

## 1. Estado real de cada parte (qué anda y qué no)

| Parte | Estado | Detalle |
|---|---|---|
| **Login / registro / roles** | ✅ Funciona | Probado end-to-end. Paciente y odontólogo, con ruteo automático. Sesión persistente. |
| **Base de datos** | ✅ Real | 7 migraciones (perfiles, análisis, turnos, credenciales, dentistas, videos) con seguridad RLS. |
| **Captura del análisis (cámara 3D)** | 🟡 Cableado, sin probar en celu | La cámara toma 3 fotos + video y (debería) subirlas al storage. Falta probarlo en un dispositivo físico real. |
| **Diagnóstico / presupuesto** | 🟡 Vacío hasta la IA | Las pantallas leen el resultado real del análisis; como todavía no hay IA, muestran estado vacío. |
| **Reserva de turno** | 🟡 Casi | El flujo elige odontólogo real → día/hora → confirma. Falta un odontólogo registrado para probar que el turno se guarde de verdad. |
| **Portal del odontólogo** | 🟡 Básico | Muestra agenda y pacientes reales, pero es de solo lectura y le falta mucho (ver bloque 4). |
| **Videos educativos** | 🟡 Tabla vacía | La pantalla lee de una tabla real; hay que cargar el contenido. |
| **IA de diagnóstico** | 🔴 No existe | Es el corazón del producto y está por hacer (bloque 3). |
| **Cobros** | 🔴 Solo visual | La pantalla de pago no cobra nada real. |

---

## 2. Acciones inmediatas (destrabar lo que ya está listo) — 30 min

1. **Correr las migraciones en Supabase** → SQL Editor → pegar `supabase/migrations/_ALL_combined.sql` → Run. Crea/actualiza todas las tablas. Es idempotente (se puede re-correr sin romper nada).
2. **Crear cuenta en Anthropic** (console.anthropic.com) → cargar ~USD 5-10 de saldo → generar la **API key** (`sk-ant-...`). Sin esto la IA no funciona. Costo por análisis: **~3 centavos de dólar** (modelo recomendado: Claude Sonnet 5).
3. **Registrar un odontólogo de prueba** en la app (rol odontólogo) para que aparezca al reservar turno y poder probar todo el flujo.

---

## 3. 🔴 PRIORIDAD ALTA — el corazón del producto

### 3.1 IA real de diagnóstico (Fase 3) — *lo más importante y el diferencial*

**Contexto:** hoy el paciente se saca las fotos pero no hay nada que las analice. Todo el valor de la app
depende de esto. Sin IA, es una app de reserva de turnos común.

**Qué implica técnicamente:**
- Crear una **Edge Function** en Supabase (corre en el servidor, en TypeScript/Deno) que:
  1. Recibe el id del análisis, baja las fotos del bucket `captures`.
  2. Las manda a la **API de Claude (Claude Vision)** con un *prompt estructurado* que pide un JSON con: zonas afectadas + severidad, tratamientos sugeridos, **score de salud** (higiene / encías / alineación / general), **presupuesto** (ítems, total, financiación) y planes de pago.
  3. Guarda ese resultado en la tabla `analyses` y marca el estado como "listo".
- **Ampliar el modelo de datos:** hoy el resultado del diagnóstico solo tiene "zonas afectadas" y "opciones de tratamiento". **Falta agregar** el score, el presupuesto y los planes de pago (está marcado en el código con `// TODO(Fase 3)` en las pantallas de presupuesto y pago).
- La **API key va como secreto de la Edge Function** (`supabase secrets set`), nunca dentro de la app.
- Conectar la pantalla de "procesando" para que llame a la función, espere el resultado y muestre el diagnóstico real.
- **Chat "Denta" con IA real:** hoy es un asistente sin cerebro; conectarlo a Claude para que responda dudas de salud bucal.
- **Encuadre legal (obligatorio):** siempre visible "orientación preliminar, NO diagnóstico clínico". El prompt de la IA tiene que ser conservador (recomendar ir al profesional, no afirmar diagnósticos).

**Depende de:** tener la API key (acción inmediata #2).
**Complejidad:** Alta. Es lo más importante; conviene que lo agarre quien tenga más experiencia con backend/IA.

---

### 3.2 Cobros reales

**Contexto:** la pantalla de pago muestra métodos (tarjeta, transferencia, cripto) y un monto, pero **no cobra nada** — es una maqueta. Sin cobros no hay negocio.

**Qué implica:**
- Elegir pasarela: **MercadoPago** (natural para Argentina/LatAm) o **Stripe** (internacional).
- Integrar el checkout (SDK o checkout web dentro de la app), un **webhook** que confirme el pago del lado del servidor, y guardar el estado del pago vinculado al turno / análisis.
- Definir qué se cobra: la consulta, el análisis con IA, o un abono.
- (Opcional) **Suscripciones** si va el modelo de abono mensual.

**Complejidad:** Media-Alta.

---

### 3.3 Probar los flujos completos en un celular físico

**Contexto:** varias cosas están cableadas pero nunca se probaron en un dispositivo real (la cámara y el
storage no andan en el navegador).

**Qué implica:**
- Probar la **captura 3D** real (3 fotos + video) subiendo de verdad al storage de Supabase.
- Probar la **reserva de turno de punta a punta** con un odontólogo registrado, y verificar que el turno se guarde y aparezca en el portal del odontólogo.

**Complejidad:** Baja-Media (es sobre todo testing y ajustes).

---

## 4. 🟧 PRIORIDAD MEDIA — completar la experiencia

### 4.1 Experiencia completa del ODONTÓLOGO

**Contexto:** el portal del odontólogo hoy es de solo lectura y básico (ve su agenda y una lista de
pacientes). Para que un profesional lo use de verdad, le falta bastante.

**Qué implica (pantallas y funciones nuevas):**
- **Agenda completa:** filtrar por día/semana, ver el detalle de cada turno, **confirmar o cancelar** turnos.
- **Gestión de pacientes:** abrir la ficha de un paciente, ver su historial, y **ver los scans y diagnósticos** que ese paciente se hizo.
- **Perfil profesional editable:** especialidad, bio, foto, matrícula.
- **Cargar contenido:** que el odontólogo suba videos educativos desde la app.
- **Verificación de matrícula:** el odontólogo ya puede subir su título (está cableado); falta el flujo de **revisión/aprobación** (quién y cómo lo valida).

**Depende de:** varias cosas ya existen (tablas de turnos, credenciales); es sobre todo construir pantallas y queries nuevas + permisos (RLS).
**Complejidad:** Media.

---

### 4.2 Concepto de CLÍNICA

**Contexto:** hoy un odontólogo es un usuario suelto. Una **clínica** agruparía a varios odontólogos bajo
una misma administración (ej: "Clínica DentalAI Central" con 5 profesionales).

**Qué implica:**
- **Modelo de datos nuevo:** tabla `clinics` (nombre, admin, datos) + una relación `clinica ↔ odontólogos` (qué profesionales pertenecen a cada clínica).
- **Rol / cuenta de clínica** (un administrador que gestiona la clínica).
- **Asignar turnos** a los distintos profesionales de la clínica.
- **Vista de clínica:** dashboard con los varios odontólogos y una **agenda conjunta**.
- Ajustar los permisos (RLS) para que la clínica vea/gestione a sus profesionales y sus turnos, pero no los de otras clínicas.

**Depende de:** decidir bien el modelo de datos antes de empezar (toca la base y los permisos).
**Complejidad:** Alta (es una capa nueva sobre el modelo de usuarios).

---

### 4.3 Notificaciones push

**Contexto:** no hay notificaciones. Son clave para retención (recordatorios, avisos).

**Qué implica:**
- Integrar `expo-notifications`, guardar el token de push de cada usuario.
- Disparar notificaciones en eventos: recordatorio de turno, "tu diagnóstico está listo", turno confirmado/cancelado. (Se puede hacer con una Edge Function o un trigger de la base.)

**Complejidad:** Media.

---

### 4.4 Cargar contenido real

- Cargar **videos educativos** reales en la tabla `videos`.
- **Onboarding de odontólogos** reales (que se registren, o cargarlos).

**Complejidad:** Baja (es carga de datos / operación).

---

## 5. 🟨 PRIORIDAD BAJA — pulido y lanzamiento

- **Ajuste técnico pendiente:** el nombre del paciente en los turnos del portal podría no aparecer por cómo está la relación en la base (`appointments.patient_id` apunta a la tabla de usuarios de auth, no directo a `profiles`). Si al probar no sale el nombre, hay que agregar esa relación. Ya hay un *fallback* que no rompe nada mientras tanto.
- **Legal:** términos y condiciones + política de privacidad. Ojo que son **datos de salud** (sensibles) — revisar normativa (Argentina y, si escala, GDPR/otros).
- **Publicación** en App Store y Play Store (cuentas de desarrollador, íconos, capturas, revisión).
- **QA general** en varios dispositivos (Android/iOS, distintos tamaños).

---

## 6. ⏱️ Estimación de tiempos — ¿cuándo estaría?

> Estimaciones **de tiempo de desarrollo enfocado** (una persona con experiencia, trabajando concentrada en ese bloque). A validar según quién lo haga. Si es **part-time / a ratos, multiplicá por ~2-3**.

| Bloque | Qué incluye | Estimado (full-time) |
|---|---|---|
| **Acciones inmediatas** | Migraciones + API key + odontólogo de prueba | **30 min – 1 h** |
| **3.1 IA real (diagnóstico)** 🔴 | Edge Function + prompt + ampliar modelo + wiring + chat | **1 – 2 semanas** |
| **3.2 Cobros reales** 🔴 | Pasarela (MercadoPago/Stripe) + webhook + wiring | **1 semana** |
| **3.3 Probar en celular** 🔴 | Cámara/storage + reserva end-to-end + fixes | **2 – 3 días** |
| **4.1 Portal completo del odontólogo** 🟧 | Agenda, gestión de pacientes, perfil, verificación | **1 – 2 semanas** |
| **4.2 Clínicas** 🟧 | Modelo de datos + rol + pantallas + permisos | **1 – 2 semanas** |
| **4.3 Notificaciones push** 🟧 | expo-notifications + disparadores | **3 – 5 días** |
| **4.4 Contenido real** 🟧 | Cargar videos + onboarding odontólogos | **1 – 2 días** |
| **5. Pulido / legal / tiendas** 🟨 | Ajustes, T&C, publicación, QA | **1 – 2 semanas** (+ tiempo de revisión de las tiendas, que no depende de nosotros) |

### ¿Cuándo estaría el producto?

- **MVP vendible** (acciones inmediatas + IA + cobros + probado en celu → bloques 3.1, 3.2, 3.3):
  **~3 – 4 semanas** de trabajo enfocado. Con esto ya cobra y da valor real.
- **Producto más completo** (MVP + portal completo del odontólogo + clínicas + notificaciones → bloques 4.x):
  **~2 – 3 meses** en total.
- **Listo para tiendas** (todo + legal + publicación): sumar **2 – 4 semanas** más (parte es espera de la revisión de Apple/Google, no desarrollo).

> **Aceleradores:** si se reparte entre los dos (uno IA, otro cobros/portal), los tiempos se solapan y el MVP puede caer en **~2 semanas**. La arquitectura modular está pensada justo para eso.

---

## 7. Resumen para arrancar

**Lo mínimo para tener un producto vendible:**
1. Correr migraciones + conseguir la API key (30 min).
2. **IA real de diagnóstico** (3.1) — el diferencial.
3. **Cobros reales** (3.2) — para facturar.
4. Probar todo en un celular (3.3).

Con eso ya hay un MVP que cobra y da valor real. El resto (portal completo del odontólogo, clínicas,
notificaciones) se suma después, en orden de prioridad.

**Cómo repartirse el trabajo:** el código es modular, así que se puede dividir por bloques sin conflictos.
Sugerencia: uno agarra el backend/IA (3.1) y el otro el frontend del odontólogo/clínica (4.1, 4.2), o
uno la IA y el otro los cobros (3.2). Cada `feature` es independiente.
