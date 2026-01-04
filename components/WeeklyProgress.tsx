
import React from 'react';
import { Habit } from '../types';
import { getWeekDays } from '../utils';
import { DAYS_OF_WEEK } from '../constants';

interface WeeklyProgressProps {
  habits: Habit[];
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ habits }) => {
  const weekDates = getWeekDays();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800/50 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-5 bg-indigo-500 rounded-full" />
        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Weekly Flow</h2>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {weekDates.map((date) => {
          const isToday = date === todayStr;
          const completedCount = habits.filter(h => h.completedDates.includes(date)).length;
          const totalCount = habits.length;
          const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          
          // Determine color intensity based on completion for light/dark
          let bgColor = 'bg-gray-50 dark:bg-gray-800/50';
          let borderColor = 'border-transparent';
          
          if (percentage > 0) {
            bgColor = 'bg-emerald-50 dark:bg-emerald-950/20';
            borderColor = 'border-emerald-100 dark:border-emerald-900/30';
          }
          if (percentage > 50) {
            bgColor = 'bg-emerald-100 dark:bg-emerald-900/40';
            borderColor = 'border-emerald-200 dark:border-emerald-800/40';
          }
          if (percentage === 100 && totalCount > 0) {
            bgColor = 'bg-emerald-500 dark:bg-emerald-500';
            borderColor = 'border-emerald-400 dark:border-emerald-400';
          }

          const dayIdx = new Date(date).getDay();
          const dayName = DAYS_OF_WEEK[dayIdx];

          return (
            <div key={date} className="flex flex-col items-center">
              <span className={`text-[10px] font-black uppercase tracking-[0.25em] mb-3 transition-colors ${
                isToday 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-400 dark:text-gray-600'
              }`}>
                {dayName}
              </span>
              
              <div className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 border-2 ${bgColor} ${borderColor} ${
                isToday ? 'ring-4 ring-indigo-500/10 dark:ring-indigo-500/5' : ''
              } group relative overflow-hidden`}>
                <span className={`text-[11px] font-black transition-colors ${
                  percentage === 100 
                    ? 'text-white' 
                    : percentage > 0 
                      ? 'text-emerald-700 dark:text-emerald-400' 
                      : 'text-gray-300 dark:text-gray-700'
                }`}>
                  {completedCount}
                </span>
                
                <div className={`w-1 h-1 rounded-full mt-1 ${
                   percentage === 100 
                    ? 'bg-white/50' 
                    : 'bg-gray-200 dark:bg-gray-800'
                }`} />

                {isToday && (
                  <div className="absolute bottom-1 w-4 h-0.5 bg-indigo-500/30 rounded-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyProgress;
