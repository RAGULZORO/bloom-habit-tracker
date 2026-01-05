
import React from 'react';
import { Habit } from '../types';
import { calculateStreak, getTodayDateString } from '../utils';

interface HabitCardProps {
  habit: Habit;
  currentDate: Date;
  onToggle: (id: string, date?: string) => void;
  onDelete: (id: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, currentDate, onToggle, onDelete }) => {
  const { currentStreak, isCompletedToday } = calculateStreak(habit.completedDates);
  const today = getTodayDateString();
  
  // Count completions for the currently viewed month
  const monthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM
  const monthCompletions = habit.completedDates.filter(d => d.startsWith(monthStr)).length;

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 ${isCompletedToday ? 'bg-white shadow-sm border-gray-100 opacity-90' : 'bg-white shadow-md border-transparent hover:shadow-lg'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onToggle(habit.id, today)}
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              isCompletedToday 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'bg-white border-gray-200 text-transparent hover:border-green-400'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          
          <div>
            <h3 className={`font-semibold text-lg transition-all ${isCompletedToday ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                {monthCompletions} this month
              </span>
              {habit.goal && (
                <span className="text-[10px] text-gray-300">•</span>
              )}
              {habit.goal && (
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{habit.goal}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            <span className="text-orange-500 text-sm">🔥</span>
            <span className="text-orange-700 font-bold text-sm">{currentStreak}</span>
          </div>
          <button 
            onClick={() => onDelete(habit.id)}
            className="text-gray-300 hover:text-red-400 transition-colors p-1"
            title="Delete Habit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
