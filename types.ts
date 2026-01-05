
export interface Task {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  icon: string;
}

export interface DailyData {
  dateString: string; // YYYY-MM-DD in Argentina Time
  tasks: Task[];
}

export interface ChallengeState {
  currentDay: number;
  startDate: string | null;
  history: DailyData[];
  lastVisitedDate: string; // YYYY-MM-DD
}

export const INITIAL_TASKS: Task[] = [
  { id: 'diet', label: 'Dieta Estricta', description: 'Seguir una dieta sin comidas trampa ni alcohol.', completed: false, icon: 'utensils' },
  { id: 'workout-1', label: 'Primer Entrenamiento', description: '45 minutos de actividad física.', completed: false, icon: 'dumbbell' },
  { id: 'workout-2', label: 'Segundo Entrenamiento', description: '45 minutos, debe ser al aire libre (O cumplir al menos 8000 pasos).', completed: false, icon: 'cloud-sun' },
  { id: 'water', label: 'Agua (3.7L)', description: 'Beber un galón (aprox. 3.7 litros) de agua.', completed: false, icon: 'droplet' },
  { id: 'reading', label: 'Lectura (10 págs)', description: 'Leer 10 páginas de un libro de no ficción.', completed: false, icon: 'book-open' },
  { id: 'photo', label: 'Foto de Progreso', description: 'Tomar una foto de progreso diaria.', completed: false, icon: 'camera' },
];
