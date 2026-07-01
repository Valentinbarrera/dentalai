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

/* ---------------- Presupuestador ---------------- */

export type BudgetItem = { id: string; label: string; price: string; note: string; qty?: string };

export const BUDGET_ITEMS: BudgetItem[] = [
  { id: 'b1', label: 'Consulta Inicial y Diagnóstico', price: '$150', note: 'Incluye radiografías' },
  { id: 'b2', label: 'Tomografía 3D', price: '$300', note: 'Para planificación' },
  { id: 'b3', label: 'Implantes Dentales (Titanio)', qty: '2x', price: '$2,000', note: 'Alta calidad' },
  { id: 'b4', label: 'Coronas de Zirconio', qty: '2x', price: '$1,800', note: 'Estética superior' },
  { id: 'b5', label: 'Procedimiento Quirúrgico', price: '$250', note: 'Incluye anestesia' },
];

export const BUDGET_SUMMARY = { subtotal: '$4,500', tax: '$0', total: '$4,500' };

export type FinancingOption = { id: string; months: string; monthly: string; note: string };

export const FINANCING_OPTIONS: FinancingOption[] = [
  { id: 'f12', months: '12 Meses', monthly: '$375/mo', note: 'Sin intereses' },
  { id: 'f24', months: '24 Meses', monthly: '$187.50/mo', note: 'Sin intereses' },
  { id: 'f36', months: '36 Meses', monthly: '$125/mo', note: 'Interés 5%' },
];

export type PaymentPlan = {
  id: string;
  title: string;
  highlight?: string;
  total?: string;
  totalOld?: string;
  initial?: string;
  monthly?: string;
  monthlyNote?: string;
  cta: string;
  primary?: boolean;
};

export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'full',
    title: 'Pago Completo',
    highlight: 'Descuento 5%',
    total: '$4,275',
    totalOld: '$4,500',
    cta: 'Pagar Ahora',
    primary: true,
  },
  {
    id: 'bank',
    title: 'Cuotas Bancarias',
    initial: '$1000',
    monthly: '$137/mo',
    monthlyNote: '36 meses',
    cta: 'Simular Crédito',
  },
  {
    id: 'clinic',
    title: 'Financiación Interna Clínica',
    initial: '$500',
    monthly: '$165/mo',
    monthlyNote: '24 meses',
    cta: 'Solicitar Financiación',
  },
];
