
import React, { useMemo } from 'react';
import { Habit } from '../types';
import { getDaysInMonth, formatDateForGrid, getTodayDateString } from '../utils';
import GrowthSuggestions from './GrowthSuggestions';
import { supabase } from '../lib/supabase';

interface AnalyticsDashboardProps {
  habits: Habit[];
  currentDate: Date;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ habits, currentDate }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const todayStr = getTodayDateString();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  const totalPossible = habits.length * daysInMonth;
  const totalCompletedInMonth = habits.reduce((acc, h) => {
    return acc + h.completedDates.filter(d => d.startsWith(monthPrefix)).length;
  }, 0);
  const monthlyConsistency = totalPossible > 0 ? Math.round((totalCompletedInMonth / totalPossible) * 100) : 0;

  const heatmapDays = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = formatDateForGrid(year, month, day);
      const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
      const intensity = habits.length > 0 ? completedCount / habits.length : 0;
      return { day, dateStr, intensity, completedCount };
    });
  }, [habits, daysInMonth, year, month]);

  const generatePath = () => {
    if (heatmapDays.length === 0) return "";
    const width = 1000;
    const height = 150;
    const padding = 20;
    const step = (width - padding * 2) / (daysInMonth - 1);
    let pathData = "";
    let isDrawing = false;
    heatmapDays.forEach((data, i) => {
      const x = padding + i * step;
      const y = height - padding - (data.intensity * (height - padding * 2));
      if (data.intensity > 0) {
        if (!isDrawing) {
          pathData += `M ${x} ${y}`;
          isDrawing = true;
        } else {
          const prevX = padding + (i - 1) * step;
          const prevY = height - padding - (heatmapDays[i-1].intensity * (height - padding * 2));
          const cpX = (prevX + x) / 2;
          pathData += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`;
        }
      } else { isDrawing = false; }
    });
    return pathData;
  };

  const ambientPath = useMemo(generatePath, [heatmapDays, daysInMonth]);

  const handleAddSuggested = async (name: string, goal: string) => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    // Choose a random color from the set for variety
    const colors = [
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-teal-100 text-teal-700 border-teal-200'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    await supabase.from('habits').insert([{ 
      name, 
      goal, 
      color, 
      completed_dates: [], 
      user_id: session.user.id 
    }]);
  };

  return (
    <div className="mt-12 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Insights & Growth</h2>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest">Visualizing your progress</p>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        <div className="relative pt-8 pb-4">
          <div className="flex justify-between items-baseline mb-8 px-2">
            <div>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter lowercase">{monthName} Flow</h3>
              <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.4em] mt-1 ml-1">The Rhythm of Ritual</p>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{monthlyConsistency}%</span>
              <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Consistency</span>
            </div>
          </div>

          <div className="relative h-[220px] w-full flex items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent blur-[100px] rounded-full opacity-60 pointer-events-none animate-pulse"></div>
            <svg viewBox="0 0 1000 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <style>{`@keyframes breathe { 0%, 100% { stroke-width: 2.5px; opacity: 0.8; } 50% { stroke-width: 3.5px; opacity: 1; } } .breathe-path { animation: breathe 4s ease-in-out infinite; }`}</style>
              </defs>
              <path d={ambientPath} fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" className="opacity-20 blur-md" />
              <path d={ambientPath} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" className="breathe-path transition-all duration-1000 ease-in-out" />
              {heatmapDays.map((data, i) => {
                const width = 1000;
                const height = 150;
                const padding = 20;
                const step = (width - padding * 2) / (daysInMonth - 1);
                const x = padding + i * step;
                const y = height - padding - (data.intensity * (height - padding * 2));
                const isToday = data.dateStr === todayStr;
                if (data.intensity <= 0) return null;
                return (
                  <g key={data.day} className="group cursor-help">
                    <circle cx={x} cy={y} r={isToday ? "6" : "4"} className={`transition-all duration-300 ${isToday ? 'fill-indigo-400' : 'fill-indigo-600 group-hover:fill-indigo-400'} drop-shadow-sm`} />
                    {isToday && <circle cx={x} cy={y} r="12" className="fill-indigo-500/10 animate-ping" />}
                    <title>{`${data.dateStr}: ${data.completedCount} habits`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 rounded-[40px] p-8 shadow-sm border border-gray-200 dark:border-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all hover:shadow-xl duration-300 overflow-hidden relative group">
          <div className="md:max-w-xs relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-6 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Density Map</h3>
            </div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">{monthName} Pulse</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">Observe your daily activity patterns. Darker squares represent higher completion across all habits.</p>
            <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-gray-500 dark:text-gray-600 uppercase tracking-tighter bg-gray-50 dark:bg-gray-800/50 w-fit px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700">
              <span>Less</span>
              <div className="flex gap-1.5">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-[4px]" />
                <div className="w-4 h-4 bg-emerald-200 dark:bg-emerald-900/50 rounded-[4px]" />
                <div className="w-4 h-4 bg-emerald-400 dark:bg-emerald-700 rounded-[4px]" />
                <div className="w-4 h-4 bg-emerald-600 dark:bg-emerald-500 rounded-[4px]" />
                <div className="w-4 h-4 bg-emerald-900 dark:bg-emerald-200 rounded-[4px]" />
              </div>
              <span>More</span>
            </div>
          </div>
          <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-7 lg:grid-cols-11 gap-2.5 p-8 bg-gray-100 dark:bg-gray-800/50 rounded-[32px] border border-gray-200 dark:border-gray-700/50 shadow-inner relative z-10">
            {heatmapDays.map((data) => {
              const isToday = data.dateStr === todayStr;
              let intensityClass = 'bg-gray-200 dark:bg-gray-700'; 
              if (data.intensity > 0) intensityClass = 'bg-emerald-200 dark:bg-emerald-900/50';
              if (data.intensity > 0.4) intensityClass = 'bg-emerald-400 dark:bg-emerald-700/60';
              if (data.intensity > 0.7) intensityClass = 'bg-emerald-600 dark:bg-emerald-500';
              if (data.intensity === 1) intensityClass = 'bg-emerald-900 dark:bg-emerald-300';
              return (
                <div key={data.day} title={`${data.dateStr}: ${data.completedCount} habits`} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer shadow-sm ${intensityClass} ${isToday ? 'ring-4 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-800' : ''}`} />
              );
            })}
          </div>
        </div>

        {/* AI Growth Section */}
        <GrowthSuggestions habits={habits} onAddSuggested={handleAddSuggested} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
