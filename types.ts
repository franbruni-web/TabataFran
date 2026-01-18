
export enum PeriodType {
  WARMUP = 'CALENTAMIENTO',
  EXERCISE = 'EJERCICIO',
  REST = 'DESCANSO',
  COOLDOWN = 'ENFRIAMIENTO',
  PREPARE = 'PREPARACION'
}

export interface Period {
  id: string;
  name: string;
  type: PeriodType;
  duration: number; // en segundos
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  periods: Period[];
}
