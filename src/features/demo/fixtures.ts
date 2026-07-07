/**
 * Datos ficticios del "modo demo" para que la app se vea completa sin backend.
 *
 * Nada de esto toca Supabase: son objetos en memoria con la MISMA forma que los
 * contratos de cada feature. Los `services/` los devuelven cuando `isDemoActive()`.
 * Las fechas se calculan relativas a "ahora" para que los turnos siempre caigan
 * en el futuro/pasado correcto. Todo enmarcado como orientación, no clínico.
 */
import { DEMO_USERS } from '@/features/auth/services/demo-session';
import type { Analysis, DiagnosisResult } from '@/features/analyses';
import type { Appointment, DentistPatient } from '@/features/appointments';
import type { Dentist } from '@/features/dentists';
import type { Procedure } from '@/features/procedures';
import type { Profile } from '@/features/profile';
import type { Video } from '@/features/videos';
import { AFFECTED_ZONES, TREATMENT_OPTIONS } from '@/lib/diagnosis';

const PATIENT_ID = DEMO_USERS.paciente.id;
const DENTIST_ID = DEMO_USERS.odontologo.id;

/* ---------------- Helpers de fecha ---------------- */

/** ISO de hoy + `days`, fijando hora/minuto (hora local). */
function at(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** ISO de hace `days` días (a la hora actual). */
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/* ---------------- Odontólogos (para reservar) ---------------- */

export function demoDentists(): Dentist[] {
  return [
    { id: DENTIST_ID, fullName: 'Dr. Martín Demo', specialty: 'Implantología y estética', verified: true },
    { id: 'demo-dentist-2', fullName: 'Dra. Lucía Fernández', specialty: 'Ortodoncia', verified: true },
    { id: 'demo-dentist-3', fullName: 'Dr. Pablo Giménez', specialty: 'Endodoncia', verified: true },
    { id: 'demo-dentist-4', fullName: 'Dra. Sofía Herrera', specialty: 'Odontopediatría', verified: false },
  ];
}

/* ---------------- Diagnóstico (resultado de la IA, ficticio) ---------------- */

const DEMO_RESULT: DiagnosisResult = {
  summary:
    'Se observa ausencia de piezas en el sector inferior y acumulación de sarro. ' +
    'Sugerimos una limpieza profunda y evaluar la reposición de las piezas faltantes. ' +
    'Es una orientación preliminar y no reemplaza una consulta clínica.',
  healthScore: { general: 74, higiene: 66, encias: 81, alineacion: 72 },
  affectedZones: AFFECTED_ZONES,
  treatmentOptions: TREATMENT_OPTIONS,
  plans: [
    {
      id: 'A',
      title: 'Implantes fijos + coronas',
      description: 'La solución más duradera y estética: repone las piezas de forma fija.',
      recommended: true,
      currency: 'USD',
      items: [
        { procedureId: 'demo-consulta', name: 'Consulta y diagnóstico', qty: 1, unitPrice: 150, lineTotal: 150 },
        { procedureId: 'demo-tomografia', name: 'Tomografía 3D', qty: 1, unitPrice: 300, lineTotal: 300 },
        { procedureId: 'demo-implante', name: 'Implante de titanio', qty: 4, unitPrice: 1200, lineTotal: 4800 },
        { procedureId: 'demo-corona', name: 'Corona de zirconio', qty: 4, unitPrice: 900, lineTotal: 3600 },
      ],
      total: 8850,
    },
    {
      id: 'B',
      title: 'Prótesis híbrida',
      description: 'Rehabilitación fija sobre menos implantes: gran relación costo/beneficio.',
      currency: 'USD',
      items: [
        { procedureId: 'demo-consulta', name: 'Consulta y diagnóstico', qty: 1, unitPrice: 150, lineTotal: 150 },
        { procedureId: 'demo-tomografia', name: 'Tomografía 3D', qty: 1, unitPrice: 300, lineTotal: 300 },
        { procedureId: 'demo-implante', name: 'Implante de titanio', qty: 2, unitPrice: 1200, lineTotal: 2400 },
        { procedureId: 'demo-hibrida', name: 'Prótesis híbrida', qty: 1, unitPrice: 2200, lineTotal: 2200 },
      ],
      total: 5050,
    },
    {
      id: 'C',
      title: 'Prótesis removible',
      description: 'La opción más accesible y sin cirugía para recuperar la función.',
      currency: 'USD',
      items: [
        { procedureId: 'demo-consulta', name: 'Consulta y diagnóstico', qty: 1, unitPrice: 150, lineTotal: 150 },
        { procedureId: 'demo-extraccion', name: 'Extracción simple', qty: 2, unitPrice: 100, lineTotal: 200 },
        { procedureId: 'demo-removible', name: 'Prótesis removible', qty: 1, unitPrice: 1200, lineTotal: 1200 },
      ],
      total: 1550,
    },
  ],
  paymentPlans: [
    { id: 'full', title: 'Pago completo', highlight: '5% de descuento', total: '$8.400', primary: true },
    { id: 'bank', title: 'Cuotas bancarias', initial: '$1.000', monthly: '$220/mes', monthlyNote: '36 meses sin interés' },
    { id: 'clinic', title: 'Financiación de la clínica', initial: '$500', monthly: '$260/mes', monthlyNote: '24 meses' },
  ],
};

/* ---------------- Análisis / diagnósticos del paciente ---------------- */

const DEMO_ANALYSIS_MAIN: Analysis = {
  id: 'demo-analysis-1',
  userId: PATIENT_ID,
  status: 'listo',
  result: DEMO_RESULT,
  createdAt: daysAgo(2),
};

const DEMO_ANALYSIS_OLD: Analysis = {
  id: 'demo-analysis-2',
  userId: PATIENT_ID,
  status: 'listo',
  result: {
    summary: 'Control de rutina sin hallazgos de urgencia. Buena higiene general.',
    healthScore: { general: 88, higiene: 90, encias: 86, alineacion: 84 },
    affectedZones: [AFFECTED_ZONES[2]],
    treatmentOptions: [],
  },
  createdAt: daysAgo(48),
};

/** Análisis del usuario, del más nuevo al más viejo. */
export function demoAnalyses(): Analysis[] {
  return [DEMO_ANALYSIS_MAIN, DEMO_ANALYSIS_OLD];
}

/** Un análisis puntual por id (para las pantallas de diagnóstico). */
export function demoAnalysisById(id: string): Analysis | null {
  return demoAnalyses().find((a) => a.id === id) ?? DEMO_ANALYSIS_MAIN;
}

/* ---------------- Turnos ---------------- */

/** Turnos del paciente (próximos + histórico). */
export function demoPatientAppointments(): Appointment[] {
  return [
    {
      id: 'demo-appt-p1',
      patientId: PATIENT_ID,
      dentistId: DENTIST_ID,
      startsAt: at(3, 10, 0),
      durationMin: 30,
      type: 'Control y limpieza',
      patientName: 'Valentina Demo',
      status: 'confirmado',
      createdAt: daysAgo(5),
    },
    {
      id: 'demo-appt-p2',
      patientId: PATIENT_ID,
      dentistId: DENTIST_ID,
      startsAt: at(12, 16, 30),
      durationMin: 60,
      type: 'Colocación de implante',
      patientName: 'Valentina Demo',
      status: 'pendiente',
      note: 'Traer estudios previos.',
      createdAt: daysAgo(1),
    },
    {
      id: 'demo-appt-p3',
      patientId: PATIENT_ID,
      dentistId: DENTIST_ID,
      startsAt: daysAgo(20),
      durationMin: 45,
      type: 'Consulta inicial',
      patientName: 'Valentina Demo',
      status: 'completado',
      createdAt: daysAgo(25),
    },
  ];
}

/** Turnos del odontólogo (varios pacientes, incluye hoy). */
export function demoDentistAppointments(): Appointment[] {
  const mk = (
    id: string,
    startsAt: string,
    durationMin: number,
    type: string,
    patientName: string,
    status: Appointment['status'],
  ): Appointment => ({
    id,
    patientId: `demo-patient-${id}`,
    dentistId: DENTIST_ID,
    startsAt,
    durationMin,
    type,
    patientName,
    status,
    createdAt: daysAgo(6),
  });

  return [
    mk('d1', at(0, 9, 0), 30, 'Control y limpieza', 'Valentina Demo', 'confirmado'),
    mk('d2', at(0, 11, 30), 45, 'Endodoncia', 'Joaquín Ruiz', 'pendiente'),
    mk('d3', at(0, 16, 0), 60, 'Colocación de implante', 'Camila Torres', 'confirmado'),
    mk('d4', at(1, 10, 0), 30, 'Consulta', 'Mateo Álvarez', 'pendiente'),
    mk('d5', at(2, 15, 30), 45, 'Blanqueamiento', 'Valentina Demo', 'confirmado'),
    mk('d6', daysAgo(1), 30, 'Control', 'Joaquín Ruiz', 'completado'),
  ];
}

/** Pacientes del odontólogo (derivados de sus turnos). */
export function demoDentistPatients(): DentistPatient[] {
  return [
    { id: 'demo-patient-d1', name: 'Valentina Demo', lastVisitAt: at(0, 9, 0), lastStatus: 'confirmado' },
    { id: 'demo-patient-d2', name: 'Joaquín Ruiz', lastVisitAt: at(0, 11, 30), lastStatus: 'pendiente' },
    { id: 'demo-patient-d3', name: 'Camila Torres', lastVisitAt: at(0, 16, 0), lastStatus: 'confirmado' },
    { id: 'demo-patient-d4', name: 'Mateo Álvarez', lastVisitAt: at(1, 10, 0), lastStatus: 'pendiente' },
  ];
}

/* ---------------- Análisis de un paciente (ficha del odontólogo) ---------------- */

export function demoUserAnalyses(): Analysis[] {
  return demoAnalyses();
}

/* ---------------- Videos educativos ---------------- */

export function demoVideos(): Video[] {
  return [
    {
      id: 'demo-video-1',
      title: 'Cómo cepillarte correctamente',
      description: 'La técnica de Bass modificada, paso a paso.',
      category: 'Higiene',
      thumbnailUrl: null,
      videoUrl: null,
      duration: '4:20',
      authorId: DENTIST_ID,
      createdAt: daysAgo(10),
    },
    {
      id: 'demo-video-2',
      title: '¿Qué es un implante dental?',
      description: 'Todo lo que tenés que saber antes del tratamiento.',
      category: 'Tratamientos',
      thumbnailUrl: null,
      videoUrl: null,
      duration: '6:05',
      authorId: DENTIST_ID,
      createdAt: daysAgo(18),
    },
    {
      id: 'demo-video-3',
      title: 'El rincón de los chicos 🧒',
      description: 'Cuidar los dientes puede ser divertido.',
      category: 'Niños',
      thumbnailUrl: null,
      videoUrl: null,
      duration: '3:12',
      authorId: 'demo-dentist-2',
      createdAt: daysAgo(30),
    },
  ];
}

/** Videos cargados por el odontólogo demo (los que le pertenecen). */
export function demoMyVideos(): Video[] {
  return demoVideos().filter((v) => v.authorId === DENTIST_ID);
}

/* ---------------- Catálogo de precios (admin) ---------------- */

export function demoProcedures(): Procedure[] {
  const base = daysAgo(60);
  const p = (id: string, name: string, category: string, unitPrice: number, unit: string, active = true): Procedure => ({
    id,
    name,
    category,
    unitPrice,
    unit,
    active,
    createdAt: base,
  });
  return [
    p('demo-consulta', 'Consulta y diagnóstico', 'General', 150, 'sesión'),
    p('demo-tomografia', 'Tomografía 3D', 'Estudios', 300, 'estudio'),
    p('demo-limpieza', 'Limpieza profunda', 'General', 120, 'sesión'),
    p('demo-extraccion', 'Extracción simple', 'Cirugía', 100, 'pieza'),
    p('demo-implante', 'Implante de titanio', 'Implantes', 1200, 'pieza'),
    p('demo-corona', 'Corona de zirconio', 'Prótesis', 900, 'pieza'),
    p('demo-hibrida', 'Prótesis híbrida', 'Prótesis', 2200, 'unidad'),
    p('demo-removible', 'Prótesis removible', 'Prótesis', 1200, 'unidad'),
    p('demo-blanqueamiento', 'Blanqueamiento', 'Estética', 350, 'sesión', false),
  ];
}

export function demoActiveProcedures(): Procedure[] {
  return demoProcedures().filter((p) => p.active);
}

/* ---------------- Perfil profesional (odontólogo) ---------------- */

export function demoProfile(): Profile {
  return {
    id: DENTIST_ID,
    fullName: 'Dr. Martín Demo',
    role: 'odontologo',
    verified: 'verificado',
    matricula: 'MP 12345',
    university: 'Universidad de Buenos Aires',
    specialty: 'Implantología y estética',
    bio: 'Odontólogo con 12 años de experiencia en rehabilitación oral e implantes.',
    avatarUrl: null,
  };
}
