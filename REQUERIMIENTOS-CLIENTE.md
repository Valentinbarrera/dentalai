# DentalAI — Requerimientos del cliente (reunión jul-2026)

> **Estado: NADA DE ESTO ESTÁ EMPEZADO.** Este documento es sólo la captura de lo pedido,
> ordenado por tema, para no perderlo. Antes de codear hay que cerrar las preguntas marcadas con ❓.
> Backlog técnico anterior: `PENDIENTES.md`.

---

## 1. Home y acceso al presupuesto — ✅ HECHO (jul-22-2026)

- ~~**Botón directo a presupuestos en el home**~~ → card **"Mi presupuesto"** en el home, con el total del
  plan recomendado, "otras opciones desde $X" y link directo al comparador de los 3 planes.
  Además se sumó **"Mi presupuesto"** al Acceso Rápido (reemplaza "Ver tratamientos", que iba al mismo lado
  que la card de Salud Dental).
- ~~**Rediseñar el home**~~ → se eliminó la card **"Último Diagnóstico"**, que duplicaba a "Salud Dental"
  (mismo dato, mismo destino); su información de estado (subiendo / procesando / error) ahora vive dentro
  de "Salud Dental". Eso liberó el lugar para el presupuesto.
  ❓ Si querías un rediseño visual más profundo (no sólo la jerarquía), hay que definir la dirección.

## 2. Flujo del presupuesto

- El **presupuesto se presenta después del análisis** (es el cierre natural del flujo, no una pantalla suelta).
- Si el paciente quiere saber más, tiene que poder ver:
  - **cómo se cobra** (formas de pago, financiación, qué incluye cada plan),
  - **el flujo completo** de lo que sigue (qué pasa después de aceptar),
  - **qué turnos hay disponibles** en la agenda del odontólogo → engancha el presupuesto con la reserva.

> Ojo: hoy los horarios que se ofrecen al reservar son **inventados** (mock). Para esto hace falta
> disponibilidad real del profesional (ver punto 3).

## 3. Turnos, agenda y recordatorios

- **Disponibilidad real** del odontólogo (su agenda define los horarios que se ofrecen).
- **Guardar el turno en el calendario** del paciente (iOS / Google Calendar) además de en la base de datos.
- **Recordatorios** del turno.
- **Automatización por WhatsApp:**
  - aviso **24 h antes** del turno,
  - el paciente **reconfirma**,
  - si no reconfirma → **se libera el turno y se le ofrece a otro** ("le ponés a otro").
  - ❓ proveedor (WhatsApp Business API / Twilio / 360dialog) y quién paga los mensajes.
  - ❓ ventana de reconfirmación (¿cuántas horas antes se libera?).

## 4. Precios y cotización

- **"¿Me podés decir cuánto vale?" sin foto ni video**: poder dar una estimación de precio a partir de
  una consulta (chat / preguntas), sin pasar por la captura de imágenes.
  ❓ ¿es una estimación por rango, o el mismo motor de presupuesto con menos certeza? Encuadre legal.
- **El odontólogo tiene que saber de antemano cuánto sale la consulta** → precio de consulta definido y
  visible (por profesional o global). ❓ ¿lo fija cada odontólogo o el admin, junto al catálogo de precios?

## 5. Captura ampliada (más insumos para la IA)

- Sumar **fotos y videos panorámicos**.
- Permitir subir **radiografía panorámica** (y que la IA la tome en cuenta en el análisis).
  ❓ formato (foto de la placa, archivo, DICOM) y si el modelo de visión da un resultado útil sobre una Rx.

## 6. Historia clínica

- **Historia clínica del paciente**, y **que el paciente la pueda ver** (no sólo el odontólogo).
- ❓ qué entra: análisis previos, turnos, tratamientos hechos, notas del profesional, presupuestos aceptados.

## 7. Datos del paciente

- **Sumar datos de contacto del paciente** (teléfono, etc. — necesario para el WhatsApp del punto 3).
- ❓ **cuándo se piden**: antes de entrar a la app (en el registro/onboarding) o después, al sacar el turno.

---

## Dependencias entre puntos

- El **WhatsApp 24 h antes (3)** necesita el **teléfono del paciente (7)**.
- El **presupuesto que muestra turnos disponibles (2)** necesita la **agenda real del odontólogo (3)**.
- La **cotización sin fotos (4)** y la **Rx panorámica (5)** tocan el prompt y el pipeline de la
  Edge Function `analyze` → conviene definirlas juntas antes de tocar la IA.
