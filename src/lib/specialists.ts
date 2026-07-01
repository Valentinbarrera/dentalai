/** Datos de especialistas, reseñas y disponibilidad (mock para el demo). */

export type Specialist = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  distanceKm: number;
  clinic: string;
  consulta: number;
  tags: string[];
  experienceYears: number;
  university: string;
  patients: string;
  about: string;
  online?: boolean;
};

export const SPECIALISTS: Specialist[] = [
  {
    id: 'elena',
    name: 'Dra. Elena Santos',
    specialty: 'Ortodoncista Especialista',
    rating: 4.9,
    reviews: 128,
    distanceKm: 1.2,
    clinic: 'Centro Médico Sur',
    consulta: 60,
    tags: ['Ortodoncia Invisible', 'Brackets Zafiro', 'Estética Dental'],
    experienceYears: 8,
    university: 'UBA',
    patients: '2k+',
    about:
      'Especialista en ortodoncia invisible y diseño de sonrisa. Mi enfoque combina la última tecnología DentalAI con una atención personalizada y cercana, asegurando tratamientos eficaces y cómodos para cada paciente.',
    online: true,
  },
  {
    id: 'martin',
    name: 'Dr. Martín Torres',
    specialty: 'Cirujano Maxilofacial',
    rating: 4.8,
    reviews: 85,
    distanceKm: 2.5,
    clinic: 'DentalCorp',
    consulta: 80,
    tags: ['Implantes', 'Cirugía Oral', 'All-on-4'],
    experienceYears: 12,
    university: 'UNLP',
    patients: '3k+',
    about:
      'Cirujano maxilofacial con amplia experiencia en implantología y rehabilitación oral compleja. Priorizo procedimientos mínimamente invasivos y una recuperación cómoda.',
    online: false,
  },
  {
    id: 'sofia',
    name: 'Dra. Sofía Reyes',
    specialty: 'Odontopediatría',
    rating: 5.0,
    reviews: 210,
    distanceKm: 0.8,
    clinic: 'Clínica Sonrisas',
    consulta: 50,
    tags: ['Odontopediatría', 'Prevención', 'Ortopedia'],
    experienceYears: 10,
    university: 'UBA',
    patients: '4k+',
    about:
      'Odontopediatra dedicada a que los más chicos vivan la consulta sin miedo. Combino juego, contención y tecnología para cuidar su salud bucal desde temprano.',
    online: true,
  },
];

export function getSpecialist(id?: string): Specialist {
  return SPECIALISTS.find((s) => s.id === id) ?? SPECIALISTS[0];
}

export const SPECIALTY_FILTERS = ['Todos', 'Ortodoncia', 'Implantes', 'Cercanos', 'Mejor puntuados'];

export type Review = { id: string; name: string; initial: string; rating: number; text: string };

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Martín S.',
    initial: 'M',
    rating: 5,
    text: 'Excelente profesional. Muy clara explicando el tratamiento de ortodoncia invisible. El consultorio es de primera.',
  },
  {
    id: 'r2',
    name: 'Lucía P.',
    initial: 'L',
    rating: 5,
    text: 'Muy atenta y súper cómoda la consulta. Me sentí totalmente acompañada en todo el proceso.',
  },
];

export type QuickSlot = { id: string; day: string; dateNum: string; time: string };

export const QUICK_SLOTS: QuickSlot[] = [
  { id: 'q1', day: 'Lun 14', dateNum: '14', time: '09:00' },
  { id: 'q2', day: 'Mar 15', dateNum: '15', time: '14:30' },
  { id: 'q3', day: 'Mié 16', dateNum: '16', time: '11:00' },
];

export type CalendarDay = { id: string; day: string; date: number; available: boolean };

export const CALENDAR_DAYS: CalendarDay[] = [
  { id: 'd16', day: 'LUN', date: 16, available: false },
  { id: 'd17', day: 'MAR', date: 17, available: true },
  { id: 'd18', day: 'MIÉ', date: 18, available: true },
  { id: 'd19', day: 'JUE', date: 19, available: true },
  { id: 'd20', day: 'VIE', date: 20, available: true },
  { id: 'd23', day: 'LUN', date: 23, available: true },
];

export type TimeSlotStatus = 'available' | 'full';
export type TimeSlot = { id: string; label: string; period: 'morning' | 'afternoon'; status: TimeSlotStatus };

export const TIME_SLOTS: TimeSlot[] = [
  { id: 't1', label: '09:00 AM', period: 'morning', status: 'full' },
  { id: 't2', label: '09:30 AM', period: 'morning', status: 'available' },
  { id: 't3', label: '10:00 AM', period: 'morning', status: 'available' },
  { id: 't4', label: '10:30 AM', period: 'morning', status: 'available' },
  { id: 't5', label: '11:00 AM', period: 'morning', status: 'available' },
  { id: 't6', label: '11:30 AM', period: 'morning', status: 'full' },
  { id: 't7', label: '01:00 PM', period: 'afternoon', status: 'available' },
  { id: 't8', label: '01:30 PM', period: 'afternoon', status: 'available' },
  { id: 't9', label: '02:00 PM', period: 'afternoon', status: 'available' },
];
