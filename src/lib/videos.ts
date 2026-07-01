/** Contenido de la biblioteca de videos educativos (mock para el demo). */

export type Video = {
  id: string;
  title: string;
  desc: string;
  duration: string;
  accent: [string, string];
  icon: string; // MaterialCommunityIcons name
  kids?: boolean;
};

export const FEATURED = {
  badge: 'Destacado • Animación IA',
  title: 'El Futuro de la Implantología',
  desc: 'Descubrí cómo el modelado predictivo con IA está cambiando la odontología reconstructiva.',
  duration: '8:30',
  accent: ['#0F766E', '#2563EB'] as [string, string],
};

export type VideoSection = { id: string; title: string; videos: Video[] };

export const VIDEO_SECTIONS: VideoSection[] = [
  {
    id: 'animacion',
    title: 'Animación IA',
    videos: [
      { id: 'v1', title: 'Diagnóstico Neuronal', desc: 'Cómo las redes neuronales reconocen patrones radiológicos.', duration: '12:45', accent: ['#2563EB', '#0EA5E9'], icon: 'brain' },
      { id: 'v2', title: 'Precisión y Ajuste', desc: 'Diseño y fabricación CAD/CAM automatizada de coronas.', duration: '5:30', accent: ['#6366F1', '#8B5CF6'], icon: 'cog-outline' },
      { id: 'v3', title: 'Prótesis Híbrida 3D', desc: 'Visualización del concepto y sus ventajas.', duration: '3:10', accent: ['#0D9488', '#14B8A6'], icon: 'cube-outline' },
    ],
  },
  {
    id: 'casos',
    title: 'Casos reales',
    videos: [
      { id: 'v4', title: 'Rehabilitación Full Arch', desc: 'Documentación paso a paso de un caso restaurativo complejo.', duration: '22:05', accent: ['#1E293B', '#334155'], icon: 'tooth-outline' },
      { id: 'v5', title: 'Implante Digital', desc: 'Flujo de trabajo y carga guiada por computadora.', duration: '8:15', accent: ['#0369A1', '#0EA5E9'], icon: 'medical-bag' },
      { id: 'v6', title: 'All-on-4 en quirófano', desc: 'Colocación completa filmada en vivo.', duration: '11:40', accent: ['#475569', '#64748B'], icon: 'hospital-box-outline' },
    ],
  },
];

/** Rincón de los Chicos: contenido infantil con la mascota Denti. */
export const KIDS_VIDEOS: Video[] = [
  { id: 'k1', title: 'Cepillate como un campeón', desc: 'Denti te enseña la técnica correcta.', duration: '3:20', accent: ['#F59E0B', '#FBBF24'], icon: 'toothbrush-paste', kids: true },
  { id: 'k2', title: 'La aventura contra las Caries', desc: '¡A vencer a los bichitos del azúcar!', duration: '4:10', accent: ['#EC4899', '#F472B6'], icon: 'bacteria-outline', kids: true },
  { id: 'k3', title: 'Amigos del hilo dental', desc: 'Jugando aprendemos a usar el hilo.', duration: '2:45', accent: ['#22D3EE', '#38BDF8'], icon: 'string-lights', kids: true },
  { id: 'k4', title: '¿Por qué se caen los dientes de leche?', desc: 'La historia del Ratón Pérez explicada.', duration: '3:30', accent: ['#8B5CF6', '#A78BFA'], icon: 'star-outline', kids: true },
];

export const KIDS_MASCOT = {
  name: 'Denti',
  greeting: '¡Hola! Soy Denti 🦷',
  message: '¿Aprendemos a cuidar tus dientes jugando?',
};
