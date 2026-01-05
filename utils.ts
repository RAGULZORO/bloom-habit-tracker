
import { Habit, StreakData } from './types';

export const getTodayDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const formatDateForGrid = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Added getCalendarGrid to fix module error in MonthlyCalendar.tsx
/**
 * Generates an array representing a calendar grid for a given month.
 * Returns null for empty slots before the start of the month to align with weekdays.
 */
export const getCalendarGrid = (year: number, month: number): (string | null)[] => {
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysCount = getDaysInMonth(year, month);
  const grid: (string | null)[] = [];

  // Add leading empty slots
  for (let i = 0; i < firstDayOfMonth; i++) {
    grid.push(null);
  }

  // Add actual month dates
  for (let day = 1; day <= daysCount; day++) {
    grid.push(formatDateForGrid(year, month, day));
  }

  return grid;
};

export const getWeekDays = (): string[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
};

export const calculateStreak = (completedDates: string[]): StreakData => {
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isCompletedToday: false };
  }

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  
  let currentStreak = 0;
  const isCompletedToday = completedDates.includes(today);
  
  if (!isCompletedToday && !completedDates.includes(yesterday)) {
    currentStreak = 0;
  } else {
    let tempDate = isCompletedToday ? new Date() : new Date(yesterday);
    while (true) {
      const dateStr = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`;
      if (completedDates.includes(dateStr)) {
        currentStreak++;
        tempDate.setDate(tempDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let runningStreak = 0;
  // Ensure we sort dates correctly for the streak calculation
  const uniqueSortedDates = Array.from(new Set(completedDates)).sort();
  
  if (uniqueSortedDates.length > 0) {
    runningStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < uniqueSortedDates.length; i++) {
      const prev = new Date(uniqueSortedDates[i - 1]);
      const curr = new Date(uniqueSortedDates[i]);
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
      longestStreak = Math.max(longestStreak, runningStreak);
    }
  }

  return { currentStreak, longestStreak, isCompletedToday };
};

export const calculateMasterStreak = (habits: Habit[]): StreakData => {
  const allCompletedDates = Array.from(new Set(habits.flatMap(h => h.completedDates)));
  return calculateStreak(allCompletedDates);
};
