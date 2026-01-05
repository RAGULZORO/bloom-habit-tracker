
import React from 'react';
import { Habit } from '../types';
import { getCalendarGrid, getTodayDateString } from '../utils';
import { DAYS_OF_WEEK } from '../constants';

interface MonthlyCalendarProps {
  habits: Habit[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (date: string) => void;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ 
  habits, 
  currentDate, 
  onPrevMonth, 
  onNextMonth,
  onDateClick
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const grid = getCalendarGrid(year, month);
  const todayStr = getTodayDateString();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{monthName} <span className="text-gray-400 font-medium">{year}</span></h2>
        <div className="flex gap-2">
          <button onClick={onPrevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button onClick={onNextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            {day}
          </div>
        ))}
        {grid.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="aspect-square" />;

          const isToday = date === todayStr;
          const completedCount = habits.filter(h => h.completedDates.includes(date)).length;
          const totalCount = habits.length;
          const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          
          let bgColor = 'bg-gray-50';
          let textColor = 'text-gray-400';
          
          if (percentage > 0) {
            bgColor = 'bg-green-100';
            textColor = 'text-green-700';
          }
          if (percentage > 50) {
            bgColor = 'bg-green-200';
            textColor = 'text-green-800';
          }
          if (percentage === 100 && totalCount > 0) {
            bgColor = 'bg-green-400';
            textColor = 'text-white';
          }

          const dayNum = new Date(date).getDate();

          return (
            <button
              key={date}
              onClick={() => onDateClick(date)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative group
                ${bgColor} ${isToday ? 'ring-2 ring-blue-400 ring-offset-2 scale-105 z-10' : 'hover:scale-110 hover:shadow-md'}`}
            >
              <span className={`text-xs font-bold ${textColor}`}>
                {dayNum}
              </span>
              {totalCount > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {habits.slice(0, 3).map(h => (
                    <div 
                      key={h.id} 
                      className={`w-1 h-1 rounded-full ${h.completedDates.includes(date) ? 'bg-current opacity-60' : 'bg-gray-200'}`}
                    />
                  ))}
                  {habits.length > 3 && <div className="w-1 h-1 rounded-full bg-gray-300" />}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyCalendar;
