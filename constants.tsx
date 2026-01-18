
import { PeriodType } from './types';

export const PERIOD_CONFIG: Record<PeriodType, { color: string; bg: string; icon: string }> = {
  [PeriodType.WARMUP]: {
    color: 'text-yellow-400',
    bg: 'bg-blue-900',
    icon: '🔥'
  },
  [PeriodType.EXERCISE]: {
    color: 'text-white',
    bg: 'bg-blue-800',
    icon: '💪'
  },
  [PeriodType.REST]: {
    color: 'text-yellow-500',
    bg: 'bg-blue-950',
    icon: '🧘'
  },
  [PeriodType.COOLDOWN]: {
    color: 'text-yellow-200',
    bg: 'bg-blue-900',
    icon: '❄️'
  },
  [PeriodType.PREPARE]: {
    color: 'text-yellow-400',
    bg: 'bg-slate-900',
    icon: '🕒'
  }
};

export const PRESET_EXERCISES = [
  "Burpees", "Flexiones", "Sentadillas", "Plancha", "Saltos de tijera",
  "Escaladores", "Zancadas", "Abdominales", "Dips de tríceps", "Skipping",
  "Puente de glúteo", "Flexiones diamante", "Sentadilla isométrica",
  "Superman", "V-ups", "Rusa (Twist)", "Flexiones de hombro", "Burpees con salto",
  "Dominadas", "Peso Muerto", "Zancadas con salto", "Plancha lateral",
  "Giro ruso", "Patada de glúteo", "Tijeras de piernas", "Bicicleta",
  "Fondos", "Press militar", "Curl de bíceps", "Remo", "Elevación de talones",
  "Estiramiento de cobra", "Perro boca abajo", "Zancada lateral",
  "Saltos al cajón", "Kettlebell Swing", "Thrusters", "Wall Ball", 
  "Battle Ropes", "Slam Ball", "Bear Crawl", "Bird Dog", "Dead Bug",
  "Turkish Get Up", "Boxeo", "Sombra de boxeo", "Ganchos", "Jabs"
];

export const getEmojiForExercise = (name: string, type: PeriodType): string => {
  const n = name.toLowerCase();
  if (type === PeriodType.REST) return '🧘';
  if (type === PeriodType.WARMUP) return '🔥';
  if (type === PeriodType.COOLDOWN) return '❄️';
  if (type === PeriodType.PREPARE) return '🕒';
  
  if (n.includes('burpee') || n.includes('sapo')) return '🐸';
  if (n.includes('flexion') || n.includes('push') || n.includes('fondo') || n.includes('dip') || n.includes('pecho')) return '💪';
  if (n.includes('sentadilla') || n.includes('squat') || n.includes('gluteo') || n.includes('talon') || n.includes('pierna')) return '🦵';
  if (n.includes('plancha') || n.includes('plank') || n.includes('isomet')) return '🧱';
  if (n.includes('abdominal') || n.includes('crunch') || n.includes('rusa') || n.includes('giro') || n.includes('v-up') || n.includes('tijera') || n.includes('core')) return '🍫';
  if (n.includes('salto') || n.includes('jump') || n.includes('box jump')) return '🦘';
  if (n.includes('correr') || n.includes('run') || n.includes('skip') || n.includes('escalador') || n.includes('mountain')) return '🏃';
  if (n.includes('zancada') || n.includes('lunge') || n.includes('estocada')) return '🧗‍♂️';
  if (n.includes('boxeo') || n.includes('punch') || n.includes('golpe') || n.includes('jab') || n.includes('gancho') || n.includes('cross') || n.includes('sombra')) return '🥊';
  if (n.includes('pesas') || n.includes('mancuerna') || n.includes('press') || n.includes('muerto') || n.includes('kettlebell') || n.includes('swing')) return '🏋️';
  if (n.includes('bici') || n.includes('bike')) return '🚴';
  if (n.includes('estira') || n.includes('cobra') || n.includes('perro') || n.includes('yoga')) return '🧘‍♂️';
  if (n.includes('soga') || n.includes('cuerda') || n.includes('rope')) return '🪢';
  if (n.includes('bola') || n.includes('ball') || n.includes('thruster')) return '☄️';
  
  return '💪';
};

export const INITIAL_WORKOUTS: any[] = [
  {
    id: '1',
    name: 'Tabata Boca 12',
    description: 'Rutina clásica de 4 minutos intensa.',
    periods: [
      { id: 'p0', name: 'Prepararse', type: PeriodType.PREPARE, duration: 10 },
      { id: 'p1', name: 'Burpees', type: PeriodType.EXERCISE, duration: 20 },
      { id: 'p2', name: 'Descanso', type: PeriodType.REST, duration: 10 },
      { id: 'p3', name: 'Flexiones', type: PeriodType.EXERCISE, duration: 20 },
      { id: 'p4', name: 'Descanso', type: PeriodType.REST, duration: 10 },
      { id: 'p5', name: 'Sentadillas', type: PeriodType.EXERCISE, duration: 20 },
      { id: 'p6', name: 'Descanso', type: PeriodType.REST, duration: 10 },
      { id: 'p7', name: 'Plancha', type: PeriodType.EXERCISE, duration: 20 },
      { id: 'p8', name: 'Estiramiento', type: PeriodType.COOLDOWN, duration: 30 }
    ]
  }
];
