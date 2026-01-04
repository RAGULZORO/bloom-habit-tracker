
export interface Habit {
  id: string;
  name: string;
  goal: string;
  color: string;
  completedDates: string[]; // ISO YYYY-MM-DD
  createdAt: string;
}

export interface DayProgress {
  date: string;
  dayName: string;
  isToday: boolean;
  isCompleted: boolean;
}

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
};
