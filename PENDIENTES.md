# DentalAI — Qué falta hacer (backlog)

Documento para dividir el trabajo. Estado a jul-2026.
Referencias técnicas: `ARCHITECTURE.md` (cómo está organizado el código) y `BACKEND-SETUP.md` (backend por fases).

---

## ✅ Lo que YA está hecho (para contexto)

- **App móvil** (Expo/React Native) con todas las pantallas navegables: home, chat, análisis (cámara 3D), diagnóstico, presupuesto, reserva de turnos, portal del odontólogo, videos, perfil, onboarding/login.
- **Backend real en Supabase**: auth (login/registro), base de datos Postgres, storage, seguridad (RLS). Probado y andando.
- **Dos roles**: paciente y odontólogo (con ruteo automático).
- **Todo data-driven, sin datos ficticios**: la app lee de la base de datos real; muestra estados vacíos honestos hasta que haya datos.
- **7 migraciones** de base de datos (perfiles, análisis, turnos, credenciales, dentistas, videos).

---

## 🔴 Acciones inmediatas (destrabar lo que ya está listo)

1. **Correr las migraciones nuevas en Supabase** (SQL Editor): `0005`, `0006_dentists`, `0007_videos`. (El archivo `_ALL_combined.sql` las tiene todas juntas y es seguro re-correr.)
2. **Crear cuenta en Anthropic** (console.anthropic.com), cargar saldo (~USD 5-10) y generar la **API key** (`sk-ant-...`). Es lo que destraba la IA. Costo estimado: ~3 centavos de dólar por análisis.
3. **Registrar al menos un odontólogo** en la app (o cargar uno) para que aparezcan profesionales al reservar.

---

## 🟥 PRIORIDAD ALTA — el corazón del producto

### 1. IA real de diagnóstico (Fase 3) — *lo más importante*
Hoy el diagnóstico está vacío hasta que se conecte la IA.
- [ ] Edge Function en Supabase que recibe las fotos del paciente y las manda a **Claude Vision**.
- [ ] Definir el resultado completo del diagnóstico: hoy solo tiene "zonas afectadas" y "opciones de tratamiento". **Falta agregar**: score de salud (higiene / encías / alineación / general), presupuesto (ítems + total + financiación) y planes de pago. *(marcado en el código con `// TODO(Fase 3)`)*.
- [ ] Guardar la API key como secreto de la Edge Function (nunca en la app).
- [ ] Conectar el flujo: al terminar la captura, se manda a la IA, se guarda el resultado y las pantallas de diagnóstico/presupuesto lo muestran.
- [ ] **Chat "Denta"** con IA real (hoy es un asistente sin IA).
- [ ] **Encuadre legal**: siempre mostrar "orientación preliminar, NO diagnóstico clínico".

### 2. Cobros reales
El flujo de pago hoy es visual (no cobra nada).
- [ ] Integrar pasarela de pago real (MercadoPago / Stripe) para cobrar consultas y análisis.
- [ ] Suscripciones (si va el modelo de abono).

### 3. Probar los flujos completos en un celular real
- [ ] Captura 3D real (cámara + video) subiendo a storage.
- [ ] Reserva de turno end-to-end con un odontólogo registrado (que el turno se guarde de verdad).

---

## 🟧 PRIORIDAD MEDIA — completar la experiencia

### 4. Experiencia completa del ODONTÓLOGO *(pedido)*
El portal actual es básico. Falta armar bien el lado del profesional:
- [ ] Agenda completa (filtrar por día/semana, ver detalle de cada turno, confirmar/cancelar).
- [ ] Gestión de pacientes: ficha del paciente, su historial, ver sus scans y diagnósticos.
- [ ] Perfil profesional editable (especialidad, bio, foto, matrícula).
- [ ] Cargar contenido (videos educativos) desde la app.
- [ ] Flujo de verificación de la matrícula (el odontólogo sube el título — ya cableado; falta la revisión/aprobación).

### 5. Concepto de CLÍNICA *(pedido)*
- [ ] Modelo de datos: tabla `clinics` + relación clínica ↔ odontólogos.
- [ ] Rol/cuenta de clínica (administrador de la clínica).
- [ ] Asignar turnos a los profesionales de la clínica.
- [ ] Vista de clínica: varios odontólogos, agenda conjunta.

### 6. Notificaciones
- [ ] Push notifications: recordatorio de turno, "tu diagnóstico está listo", etc. (expo-notifications).

### 7. Contenido real
- [ ] Cargar videos educativos reales en la base.
- [ ] Cargar/onboarding de odontólogos reales.

---

## 🟨 PRIORIDAD BAJA — pulido y lanzamiento

- [ ] Detalle técnico: el nombre del paciente en los turnos del portal puede necesitar un ajuste de base de datos (una relación entre `appointments` y `profiles`) si no aparece al probar.
- [ ] Términos y condiciones + política de privacidad (datos de salud = sensibles, revisar normativa).
- [ ] Publicación en **App Store** y **Play Store**.
- [ ] QA general en varios dispositivos.

---

## 📌 Notas para el socio

- La app está armada con **arquitectura escalable por módulos** (ver `ARCHITECTURE.md`): cada feature (auth, análisis, turnos, dentistas, videos) es un módulo independiente, así que se puede repartir el trabajo sin pisarse.
- Todo el backend es **Supabase** (una sola plataforma: base de datos + auth + storage + funciones).
- El costo de la IA es bajo (~centavos por análisis) y se puede trasladar al precio del servicio.
- Lo más urgente para tener un producto vendible: **la IA real (bloque 🔴 #1)** y **los cobros (#2)**.
