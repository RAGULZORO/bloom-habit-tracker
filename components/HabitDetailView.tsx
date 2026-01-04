
import React, { useMemo } from 'react';
import { Habit } from '../types';
import { calculateStreak } from '../utils';

interface HabitDetailViewProps {
  habit: Habit;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const HabitDetailView: React.FC<HabitDetailViewProps> = ({ habit, onClose, onEdit, onDelete }) => {
  const { currentStreak, longestStreak } = useMemo(() => calculateStreak(habit.completedDates), [habit.completedDates]);
  
  const totalCompletions = habit.completedDates.length;
  const activeColor = habit.color.split(' ')[1]; // e.g., 'bg-pink-100' -> 'pink-100'
  const textColor = habit.color.split(' ')[2]; // e.g., 'text-pink-700'

  // Generate data for a 12-month heatmap
  const heatmapData = useMemo(() => {
    const today = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const month = d.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const days = Array.from({ length: daysInMonth }, (_, dayIdx) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayIdx + 1).padStart(2, '0')}`;
        return {
          date: dateStr,
          isCompleted: habit.completedDates.includes(dateStr)
        };
      });
      
      months.push({ label: monthLabel, year, days });
    }
    return months;
  }, [habit.completedDates]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0c0c14] w-full max-w-5xl max-h-[90vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-white/5 animate-in zoom-in slide-in-from-bottom-8 duration-500">
        
        {/* Header Section */}
        <div className={`p-8 md:p-12 relative overflow-hidden ${habit.color.split(' ')[0]} dark:bg-opacity-10 transition-colors`}>
          <div className="absolute top-0 right-0 p-8 flex gap-3">
            <button onClick={onEdit} className="p-3 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-2xl transition-all">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button onClick={onClose} className="p-3 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-2xl transition-all">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">{habit.name}</h1>
            <p className="text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 opacity-80">{habit.goal || 'No specific goal set'}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[32px] border border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Current Streak</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-orange-500">🔥 {currentStreak}</span>
                <span className="text-sm font-bold text-gray-400">days</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[32px] border border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Longest Streak</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-indigo-500">👑 {longestStreak}</span>
                <span className="text-sm font-bold text-gray-400">days</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[32px] border border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Total Blooms</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-emerald-500">✨ {totalCompletions}</span>
                <span className="text-sm font-bold text-gray-400">times</span>
              </div>
            </div>
          </div>

          {/* Granular Calendar Heatmap */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Growth History</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Last 12 months of ritual</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {heatmapData.map((month, mIdx) => (
                <div key={mIdx} className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{month.label} {month.year}</span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {month.days.filter(d => d.isCompleted).length} active
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                    {month.days.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        title={day.date}
                        className={`aspect-square rounded-[4px] transition-all duration-300 ${
                          day.isCompleted 
                            ? habit.color.split(' ')[0].replace('-100', '-500')
                            : 'bg-gray-200 dark:bg-gray-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Action */}
          <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={onDelete}
              className="flex items-center gap-2 text-red-400 hover:text-red-500 font-bold text-sm transition-colors px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Permanently Remove Habit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitDetailView;
