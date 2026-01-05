
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

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 z-40 bg-white/95 backdrop-blur-md p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] min-w-[220px]">
                Daily Rituals
              </th>
              {daysArray.map((day) => {
                const dateStr = formatDateForGrid(year, month, day);
                const isToday = dateStr === todayStr;
                const d = new Date(year, month, day);
                const dayName = DAYS_OF_WEEK[d.getDay()][0];

                return (
                  <th key={day} className={`p-3 min-w-[52px] relative ${isToday ? 'bg-bloom-50/80' : ''}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[10px] font-bold ${isToday ? 'text-bloom-600' : 'text-gray-400'}`}>{dayName}</span>
                      <span className={`text-xs font-black ${isToday ? 'text-bloom-700 underline decoration-2 underline-offset-4' : 'text-gray-500'}`}>{day}</span>
                    </div>
                    {isToday && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-bloom-500" />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const { currentStreak } = calculateStreak(habit.completedDates);
              
              return (
                <tr key={habit.id} className="group hover:bg-gray-50/30 transition-colors">
                  <td className="sticky left-0 z-30 bg-white p-6 group-hover:bg-gray-50 transition-colors border-r border-gray-50 shadow-[10px_0_15px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between gap-4">
                      <div 
                        className="flex flex-col gap-0.5 cursor-pointer flex-1 min-w-0"
                        onClick={() => onViewDetail(habit)}
                      >
                        <span className="text-sm font-black text-gray-900 tracking-tight group-hover:text-bloom-600 transition-colors truncate">{habit.name}</span>
                        <div className="flex items-center gap-2">
                          {currentStreak > 0 && (
                            <span className="text-[10px] font-bold text-orange-500 flex items-center gap-0.5 animate-pulse shrink-0">
                              🔥 {currentStreak}
                            </span>
                          )}
                          {habit.goal && (
                            <span className="text-[10px] font-medium text-gray-400 truncate max-w-[80px]">{habit.goal}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEditHabit(habit); }} 
                          className="p-2 text-gray-400 hover:text-bloom-600 transition-colors rounded-xl hover:bg-bloom-50"
                          title="Edit Habit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteHabit(habit.id); }} 
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                          title="Delete Habit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </td>
                  {daysArray.map((day) => {
                    const dateStr = formatDateForGrid(year, month, day);
                    const isDone = habit.completedDates.includes(dateStr);
                    const isToday = dateStr === todayStr;

                    return (
                      <td key={day} className={`p-2 text-center transition-colors relative ${isToday ? 'bg-bloom-50/80' : ''}`}>
                        <button
                          onClick={() => onToggle(habit.id, dateStr)}
                          className={`w-9 h-9 rounded-xl mx-auto transition-all duration-300 flex items-center justify-center border-2 ${
                            isDone 
                              ? `bg-bloom-500 border-bloom-400 shadow-lg shadow-bloom-500/30 scale-105` 
                              : `bg-gray-50 border-transparent hover:border-bloom-200`
                          } ${isToday && !isDone ? 'ring-2 ring-bloom-500/10' : ''} active:scale-90`}
                        >
                          {isDone ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-bloom-500 shadow-[0_0_8px_rgba(128,185,24,0.5)]' : 'bg-gray-200'} transition-all group-hover:scale-150`} />
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
