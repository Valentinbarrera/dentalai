# DentalAI — Rediseño visual (pendiente, para retomar)

> Motivo (el user, jul-22-2026): *"la plataforma parece diseñada muy que lo hizo la IA"*.
> Este documento deja anotado **por qué se ve así** y **qué hay que decidir** antes de tocar código.
> **Nada de esto está empezado.** Regla: el rediseño **no cambia funcionalidades**, sólo la piel.

---

## 1. Por qué se ve "hecha por IA" — síntomas concretos

Todos están identificados en el código, así que se pueden atacar uno por uno:

1. **El degradado azul→teal está en todos lados.** Banda del hero, card de videos, iconos de las
   InfoCard, tiles de acceso rápido, planes del comparador. Cuando todo es degradado, nada resalta:
   se pierde la jerarquía. (`home.tsx`, `ui/gradient-icon.tsx`, `ui/brand-band.tsx`, `comparador.tsx`)
2. **El "icono adentro de un cuadradito redondeado con degradado" es el patrón universal.** Se repite
   en cards, tiles, listas y encabezados. Es *la* firma visual de las UI autogeneradas.
3. **Emojis en los títulos** ("Hola Valentina 👋", "Rincón de los Chicos 🧒"). Da tono de plantilla.
4. **Decoración genérica de fondo**: blobs circulares translúcidos + textura de puntos
   (`blobA`/`blobB` en `home.tsx`, `ui/texture-grid.tsx`). No aportan significado.
5. **Todas las cards pesan lo mismo**: blancas, radio 16-20, borde gris claro, sombra suave. Sin
   contraste no hay jerarquía, y la pantalla se lee como una lista de cajas iguales.
6. **La grilla 2×2 de "Acceso Rápido"** es el patrón de dashboard más genérico que existe.
7. **Copys de asistente** ("DENTA está listo para ayudarte", "Preguntale lo que quieras…") y pastillas
   de estado por todos lados.
8. **Tipografía del sistema, una sola familia, escala corta** (`theme/tokens.ts`). Es lo que más barato
   sale de cambiar y lo que más carácter aporta.

---

## 2. Direcciones posibles (hay que elegir UNA)

**A. Clínico-editorial** — mucho blanco, tipografía con carácter (una serif o una grotesk de verdad),
**un solo** color de acento, números grandes, cero degradados. Se ve caro y serio; combina con que el
producto habla de salud y de plata. *Es la que recomiendo.*

**B. Data-cockpit** (tipo WHOOP / Oura) — fondo oscuro, métricas grandes, anillos y gráficos como
protagonistas, color sólo para el dato. Muy fuerte para el score de salud, pero pide contenido denso
que hoy la app no tiene en todas las pantallas.

**C. Consumer health cálida** — color de marca plano (sin degradados), ilustración propia en vez de
iconos genéricos, formas amables. Más cercana al paciente; depende de conseguir/ilustrar assets.

---

## 3. Decisiones que hacen falta antes de empezar

- **Tipografía**: qué familia (hay que sumar `expo-font` + los archivos). Es el cambio de mayor impacto.
- **Paleta**: ¿se mantiene el azul de marca? ¿un solo acento o dos? ¿se eliminan los degradados por completo?
- **Claro / oscuro**: hoy es sólo claro. ¿Se agrega oscuro?
- **La mascota DENTA**: ¿se queda, se rediseña o se retira? Hoy es un icono de robot genérico
  (`MaterialCommunityIcons "robot-happy"`), no un personaje propio.
- **Referencias**: 2 o 3 apps que te gusten, para no discutir en abstracto.

---

## 4. Cómo se ejecutaría (orden sugerido)

1. `src/theme/tokens.ts` — tipografía, paleta, radios, sombras. **Todo el resto cuelga de acá.**
2. Primitivos: `ui/card.tsx`, `ui/button.tsx`, `ui/badge.tsx`, `ui/gradient-icon.tsx`, `ui/brand-band.tsx`.
3. Home (`(tabs)/home.tsx`) — es la vidriera.
4. Diagnóstico + presupuesto + comparador — es donde se decide la venta.
5. El resto de las ~18 pantallas, incluido el panel del odontólogo y el admin.

Como los primitivos y los tokens están centralizados, los pasos 1 y 2 ya arrastran buena parte de la app.

---

## 5. Nota

El **marco de celular en web** (`ui/phone-frame.tsx`, tamaño de captura del App Store) es independiente
del rediseño y se queda como está.
