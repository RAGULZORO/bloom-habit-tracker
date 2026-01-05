
import React from 'react';
import { Habit } from '../types';
import { getDaysInMonth, formatDateForGrid, getTodayDateString } from '../utils';

interface ProgressGraphProps {
  habits: Habit[];
  currentDate: Date;
}

const ProgressGraph: React.FC<ProgressGraphProps> = ({ habits, currentDate }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysCount = getDaysInMonth(year, month);
  const todayStr = getTodayDateString();

  const daysData = Array.from({ length: daysCount }, (_, i) => {
    const day = i + 1;
    const dateStr = formatDateForGrid(year, month, day);
    const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
    const totalCount = habits.length;
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    // Format a nice date for the tooltip
    const dateObj = new Date(year, month, day);
    const formattedDate = dateObj.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });

    return {
      day,
      percentage,
      completedCount,
      totalCount,
      formattedDate,
      isToday: dateStr === todayStr,
      isFuture: new Date(dateStr) > new Date(todayStr)
    };
  });

  const maxPercentage = 100;
  const chartHeight = 120;

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mt-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-800 mb-1">Consistency Trend</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily success rate for this month</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-blue-600">
            {habits.length > 0 
              ? Math.round(daysData.reduce((acc, d) => acc + d.percentage, 0) / daysCount) 
              : 0}%
          </span>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg. Score</span>
        </div>
      </div>

      <div className="relative h-[160px] flex items-end gap-1 sm:gap-2 px-2">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-bold text-gray-300 pointer-events-none">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-[2px] opacity-20">
          <div className="w-full border-t border-dashed border-gray-300"></div>
          <div className="w-full border-t border-dashed border-gray-300"></div>
          <div className="w-full border-t border-dashed border-gray-300"></div>
        </div>

        {/* Bars */}
        {daysData.map((data) => {
          const barHeight = (data.percentage / maxPercentage) * chartHeight;
          
          let barColor = 'bg-gray-100';
          if (!data.isFuture) {
            if (data.percentage >= 100) barColor = 'bg-green-400';
            else if (data.percentage >= 50) barColor = 'bg-blue-400';
            else if (data.percentage > 0) barColor = 'bg-orange-300';
          }

          return (
            <div 
              key={data.day} 
              className="flex-1 group relative flex flex-col items-center justify-end h-full"
            >
              {/* Enhanced Tooltip */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10 whitespace-nowrap pointer-events-none shadow-xl scale-95 group-hover:scale-100 flex flex-col items-center gap-1 border border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{data.formattedDate}</span>
                <span className="text-sm font-black">{Math.round(data.percentage)}%</span>
                <span className="text-[10px] font-medium text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">
                  {data.completedCount}/{data.totalCount} Habits
                </span>
                {/* Tooltip arrow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-800"></div>
              </div>

              <div 
                className={`w-full rounded-t-md transition-all duration-500 ease-out hover:brightness-95 cursor-default ${barColor} ${data.isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                style={{ height: `${Math.max(barHeight, 4)}px` }}
              />
              
              <span className={`mt-2 text-[10px] font-bold ${data.isToday ? 'text-blue-500' : 'text-gray-300'}`}>
                {data.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressGraph;
