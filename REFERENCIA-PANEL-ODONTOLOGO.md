# Referencia para el panel del odontólogo (capturas jul-22-2026)

> El user pasó 8 capturas de una plataforma de gestión para psicólogos y dijo:
> *"eso deberíamos copiar en el panel del odontólogo, pero en otra ocasión"*.
> **NADA DE ESTO ESTÁ EMPEZADO.** Este documento es el análisis de la referencia para cuando se retome.
>
> Capturas originales (no se copiaron al repo: es público y las pantallas tienen nombre, email y
> teléfono de una persona):
> `C:\Users\barre\OneDrive\Imágenes\Capturas de pantalla\Captura de pantalla 2026-07-22 1405*.png`

---

## 1. Lo que hace la referencia

**Layout maestro.** Breadcrumb `Dashboard > Consultantes > Cecilia Key`. Pantalla partida en dos:
a la izquierda un **sidebar fijo del paciente** y a la derecha el contenido de la sección elegida.

El sidebar tiene, de arriba a abajo:
- **Tarjeta de identidad**: avatar con iniciales, nombre, pastilla de estado ("Activo").
- **Botón de WhatsApp** destacado, en color sólido de marca — el contacto es acción de primer nivel.
- **Navegación por secciones del paciente**: Resumen · Ficha · Historia clínica · **Análisis clínico
  `IA`** · Estadísticas · Notificaciones · Configuración.

**Las secciones:**

| Sección | Qué tiene |
|---|---|
| **Ficha** | Acordeones: Información del Consultante, Riesgos Psicológicos, Información Adicional. Botón "Guardar información". Abajo, **Consentimiento Informado**. |
| **Historia clínica** | Contador ("14 registros totales"), botón **"+ Evolucionar historia"**, **filtros por tipo** (Entrada manual / Resumen de sesión con IA / Estudio médico) y un **timeline** de entradas: tipo + badge, fecha y hora, autor, origen ("Creado manualmente"), el texto en formato **SOAP** ("**S: Subjetivo**…"), y acciones ver / editar. |
| **Análisis clínico (IA)** | "Análisis del caso" en prosa + **"Diagnósticos posibles"**: nombre, **código normalizado** (CIE-11 / DSM-5), **barra de confianza**, y links "Ver detalles" y "Recomendaciones". |
| **Estadísticas** | Fila de KPIs (Total Sesiones 27 · Horas Totales 19h · Promedio Semanal 2.4 · Estado Principal) + gráficos: barras de sesiones por estado y torta de modalidad (presencial / remoto). Rango "últimos 3 meses". |
| **Configuración** | Datos personales del paciente: nombre, apellido, email, **teléfono con selector de país** y **zona horaria** — con la nota de que se usa para mandarle notificaciones y recordatorios en su hora local. |

**El flujo de carga (lo más interesante):**
1. "Evolucionar historia clínica" abre un selector de **dos tipos**: *Historia Clínica Manual*
   (observaciones, adjuntos, etiquetas) o *Estudio Médico* (resultados de laboratorio y diagnósticos).
2. El editor manual tiene fecha y hora de la sesión, un campo de observaciones con **rich text**
   (negrita, itálica, tachado, listas) y **tres herramientas de IA en la barra**:
   - **Voz a texto** — dictás y lo transcribe al editor (habla → procesa → escribe).
   - **Imagen a texto** — subís una foto con texto y lo extrae (OCR). "Perfecto para transcribir notas."
   - **Enriquecer** — mejora y estructura lo escrito.

**La estética** (aparte, sirve para `DISENO-PENDIENTE.md`): **un solo color** de marca (violeta) usado
con criterio, fondo gris muy claro, cards blancas de borde sutil, **cero degradados**, iconos lineales
sobre color plano, badges pill, y casi ninguna decoración. Es lo opuesto a lo que tenemos hoy.

---

## 2. Qué copiar y a dónde va en DentalAI

- **Ficha del paciente con sidebar de secciones** → reemplaza la pantalla actual `src/app/patient/[id].tsx`,
  que hoy es una sola vista con historial de turnos + scans.
- **Historia clínica con timeline, filtros y tipos de entrada** → cubre el **punto 6** de
  `REQUERIMIENTOS-CLIENTE.md` ("historia clínica, que el paciente la vea"). El formato SOAP y el
  "quién y cuándo lo cargó" son exactamente lo que le falta a nuestro modelo.
- **Estudio médico como tipo de entrada** → es el lugar natural de la **radiografía panorámica**
  (punto 5 de los requerimientos).
- **Análisis clínico IA dentro de la ficha** → ya lo tenemos (`diagnosis`), pero el odontólogo lo ve
  suelto; acá vive dentro del paciente. Lo que sí habría que sumar es el **código normalizado** y la
  **barra de confianza**.
- **Botón de WhatsApp de primer nivel** + **teléfono y zona horaria del paciente** → enganchan directo
  con el **punto 3** (recordatorio 24 h antes y reconfirmación) y el **punto 7** (datos de contacto).
- **Estadísticas del paciente** → nuevo, y también sirve como base para las métricas del panel.
- **Voz a texto / imagen a texto / enriquecer** → las tres se resuelven con Claude (la de imagen con
  visión, que ya usamos en `analyze`). Es lo que más ahorra tiempo al profesional en la consulta.

---

## 3. El problema a resolver antes de copiar

La referencia es una **web de escritorio de dos columnas**. Nuestro panel del odontólogo es una **app
móvil** (Expo/React Native, grupo de rutas `src/app/dentist/` con barra de tabs), y en web hoy se
renderiza dentro de un marco de celular. Un sidebar fijo no entra tal cual.

Hay que decidir:
- **(a)** Adaptarlo a mobile: el sidebar pasa a ser un menú de secciones dentro de la ficha del paciente
  (tabs superiores o lista de accesos). Un solo código para todo. *Es lo más barato.*
- **(b)** Hacer un **layout web propio de escritorio** para el profesional (el odontólogo trabaja en la
  compu del consultorio) y dejar el mobile como está. Se parece mucho más a la referencia, pero es
  mantener dos layouts y sacar el panel del marco de celular en web.

Mi recomendación: **(b)** para el profesional y **(a)** para el paciente — el odontólogo carga historia
clínica y lee estudios, eso se hace en pantalla grande; el paciente vive en el celular.

También hay que definir: **modelo de datos de la historia clínica** (tabla nueva, tipos de entrada,
autor, adjuntos, RLS para que el paciente lea la suya) y el equivalente odontológico del código
CIE-11/DSM-5.
