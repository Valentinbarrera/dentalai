/** Datos del diagnóstico y opciones de tratamiento (mock para el demo). */

export type Severity = 'high' | 'medium' | 'low';

export type AffectedZone = {
  id: string;
  zone: string;
  status: string;
  severity: Severity;
};

export const AFFECTED_ZONES: AffectedZone[] = [
  { id: 'inf_der', zone: 'Cuadrante Inferior Derecho', status: 'Ausencia severa', severity: 'high' },
  { id: 'inf_izq', zone: 'Cuadrante Inferior Izquierdo', status: 'Ausencia moderada', severity: 'medium' },
  { id: 'sup_der', zone: 'Cuadrante Superior Derecho', status: 'Sin hallazgos', severity: 'low' },
];

export type TreatmentOption = {
  id: string;
  name: string;
  description: string;
  recommended?: boolean;
  inversion: string;
  cuota: string;
  tiempo: string;
  cirugia: string;
  durabilidad: string;
  /** Colores del degradado para el placeholder de imagen */
  accent: [string, string];
};

export const TREATMENT_OPTIONS: TreatmentOption[] = [
  {
    id: 'implantes',
    name: 'Implantes + Coronas',
    description: 'Solución permanente de alta estética y funcionalidad máxima.',
    recommended: true,
    inversion: '$4,500',
    cuota: '$187/mo',
    tiempo: '3-6 meses',
    cirugia: 'Sí',
    durabilidad: '15+ años (Alta)',
    accent: ['#0D9488', '#2563EB'],
  },
  {
    id: 'hibrida',
    name: 'Prótesis Híbrida',
    description: 'Rehabilitación fija con menor complejidad quirúrgica y muy buena estética.',
    inversion: '$3,200',
    cuota: '$133/mo',
    tiempo: '2-4 meses',
    cirugia: 'Mínima',
    durabilidad: '10-15 años (Media)',
    accent: ['#6366F1', '#8B5CF6'],
  },
  {
    id: 'removible',
    name: 'Prótesis Removible',
    description: 'Opción accesible y sin cirugía para recuperar la función masticatoria.',
    inversion: '$1,200',
    cuota: '$60/mo',
    tiempo: '4-8 semanas',
    cirugia: 'No',
    durabilidad: '5-8 años (Media)',
    accent: ['#0EA5E9', '#22D3EE'],
  },
];
