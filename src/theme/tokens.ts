/**
 * DentalAI — Design tokens
 * Extraídos del diseño de Figma (Home Dashboard y pantallas del flujo).
 * Fuente única de verdad para colores, espaciados, radios, tipografía y sombras.
 */

export const palette = {
  // Azul primario (botones, tab activo, FAB DENTA)
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#DBEAFE',
  primarySoft: '#EFF4FF',

  // Teal / verde — identidad de marca DENTA y estados positivos
  teal: '#0D9488',
  tealDark: '#0F766E',
  tealLight: '#CCFBF1',
  tealSoft: '#E6FBF6',

  // Texto
  navy: '#15366B', // "Hola Juan" y acentos de marca
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Superficies
  background: '#F4F6FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  border: '#E9EEF5',

  // Semánticos
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  title: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  subtitle: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '700', lineHeight: 16, letterSpacing: 0.5 },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
} as const;

export const shadow = {
  // Sombra suave para cards (iOS + Android)
  card: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  // Sombra marcada para el FAB central y botones flotantes
  floating: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const theme = { palette, spacing, radius, typography, shadow } as const;
export type Theme = typeof theme;
