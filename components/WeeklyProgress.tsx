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
    <div className="bg-white backdrop-blur-md rounded-[32px] p-8 shadow-sm border border-gray-100 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-5 bg-bloom-500 rounded-full" />
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Weekly Flow</h2>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {weekDates.map((date) => {
          const isToday = date === todayStr;
          const completedCount = habits.filter(h => h.completedDates.includes(date)).length;
          const totalCount = habits.length;
          const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          
          let bgColor = 'bg-gray-50';
          let borderColor = 'border-transparent';
          
          if (percentage > 0) {
            bgColor = 'bg-bloom-50';
            borderColor = 'border-bloom-100';
          }
          if (percentage > 50) {
            bgColor = 'bg-bloom-100';
            borderColor = 'border-bloom-200';
          }
          if (percentage === 100 && totalCount > 0) {
            bgColor = 'bg-bloom-500';
            borderColor = 'border-bloom-400';
          }

          const dayIdx = new Date(date).getDay();
          const dayName = DAYS_OF_WEEK[dayIdx];

          return (
            <div key={date} className="flex flex-col items-center">
              <span className={`text-[10px] font-black uppercase tracking-[0.25em] mb-3 transition-colors ${
                isToday 
                  ? 'text-bloom-600' 
                  : 'text-gray-400'
              }`}>
                {dayName}
              </span>
              
              <div className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 border-2 ${bgColor} ${borderColor} ${
                isToday ? 'ring-4 ring-bloom-500/10' : ''
              } group relative overflow-hidden`}>
                <span className={`text-[11px] font-black transition-colors ${
                  percentage === 100 
                    ? 'text-white' 
                    : percentage > 0 
                      ? 'text-bloom-700' 
                      : 'text-gray-300'
                }`}>
                  {completedCount}
                </span>
                
                <div className={`w-1 h-1 rounded-full mt-1 ${
                   percentage === 100 
                    ? 'bg-white/50' 
                    : 'bg-gray-200'
                }`} />

                {isToday && (
                  <div className="absolute bottom-1 w-4 h-0.5 bg-bloom-500/30 rounded-full" />
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