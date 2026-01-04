
import React from 'react';
import { Habit } from '../types';
import { getDaysInMonth, formatDateForGrid, getTodayDateString, calculateStreak } from '../utils';
import { DAYS_OF_WEEK } from '../constants';

interface MonthlyGridProps {
  habits: Habit[];
  currentDate: Date;
  onToggle: (id: string, date: string) => void;
  onDeleteHabit: (id: string) => void;
  onEditHabit: (habit: Habit) => void;
  onViewDetail: (habit: Habit) => void;
}

const MonthlyGrid: React.FC<MonthlyGridProps> = ({ habits, currentDate, onToggle, onDeleteHabit, onEditHabit, onViewDetail }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysCount = getDaysInMonth(year, month);
  const todayStr = getTodayDateString();
  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  // Helper to get high-contrast version of the habit's pastel color
  const getActiveColorClasses = (colorClass: string) => {
    // If the class is "bg-pink-100", we want "bg-pink-500" for the active state
    return colorClass.replace('-100', '-500').replace('text-pink-700', 'text-white').replace('border-pink-200', 'border-pink-400');
  };

  return (
    <div className="bg-white/80 dark:bg-[#0c0c14]/40 backdrop-blur-xl rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5">
              <th className="sticky left-0 z-40 bg-white/95 dark:bg-[#0c0c14]/95 backdrop-blur-md p-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] min-w-[220px]">
                Daily Rituals
              </th>
              {daysArray.map((day) => {
                const dateStr = formatDateForGrid(year, month, day);
                const isToday = dateStr === todayStr;
                const d = new Date(year, month, day);
                const dayName = DAYS_OF_WEEK[d.getDay()][0];

                return (
                  <th key={day} className={`p-3 min-w-[52px] relative ${isToday ? 'bg-indigo-500/5' : ''}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`}>{dayName}</span>
                      <span className={`text-xs font-black ${isToday ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>{day}</span>
                    </div>
                    {isToday && (
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500/50" />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const { currentStreak } = calculateStreak(habit.completedDates);
              const activeColor = getActiveColorClasses(habit.color);
              
              return (
                <tr key={habit.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                  <td className="sticky left-0 z-30 bg-white dark:bg-[#0c0c14] p-6 group-hover:bg-gray-50 dark:group-hover:bg-[#12121c] transition-colors border-r border-gray-50 dark:border-white/5 shadow-[10px_0_15px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between gap-4">
                      <div 
                        className="flex flex-col gap-0.5 cursor-pointer"
                        onClick={() => onViewDetail(habit)}
                      >
                        <span className="text-sm font-black text-gray-900 dark:text-gray-200 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{habit.name}</span>
                        <div className="flex items-center gap-2">
                          {currentStreak > 0 && (
                            <span className="text-[10px] font-bold text-orange-500 dark:text-orange-400 flex items-center gap-0.5 animate-pulse">
                              🔥 {currentStreak}
                            </span>
                          )}
                          {habit.goal && (
                            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-600 truncate max-w-[100px]">{habit.goal}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditHabit(habit)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:text-gray-600 dark:hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>
                    </div>
                  </td>
                  {daysArray.map((day) => {
                    const dateStr = formatDateForGrid(year, month, day);
                    const isDone = habit.completedDates.includes(dateStr);
                    const isToday = dateStr === todayStr;

                    return (
                      <td key={day} className={`p-2 text-center transition-colors ${isToday ? 'bg-indigo-500/5' : ''}`}>
                        <button
                          onClick={() => onToggle(habit.id, dateStr)}
                          className={`w-9 h-9 rounded-xl transition-all duration-300 flex items-center justify-center border-2 ${
                            isDone 
                              ? `${activeColor} shadow-lg shadow-current/10 scale-105` 
                              : `bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/20`
                          } ${isToday && !isDone ? 'ring-2 ring-indigo-500/20' : ''} active:scale-90`}
                        >
                          {isDone ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-indigo-400/50' : 'bg-gray-200 dark:bg-gray-800'} transition-all group-hover:scale-150`} />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyGrid;
