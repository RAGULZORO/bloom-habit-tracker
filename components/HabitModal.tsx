
import React, { useState, useEffect } from 'react';
import { PASTEL_COLORS } from '../constants';
import { Habit } from '../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, goal: string, color: string) => void;
  onUpdate: (id: string, name: string, goal: string, color: string) => void;
  habitToEdit: Habit | null;
}

const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, onAdd, onUpdate, habitToEdit }) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [selectedColor, setSelectedColor] = useState(PASTEL_COLORS[0]);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setGoal(habitToEdit.goal);
      setSelectedColor(habitToEdit.color);
    } else {
      setName('');
      setGoal('');
      setSelectedColor(PASTEL_COLORS[0]);
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (habitToEdit) {
      onUpdate(habitToEdit.id, name, goal, selectedColor);
    } else {
      onAdd(name, goal, selectedColor);
    }
    
    onClose();
  };

  const isEditMode = !!habitToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-900 rounded-[40px] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300 border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {isEditMode ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-300 mb-2 uppercase tracking-widest">Habit Name</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g., Morning Meditation"
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none transition-all font-semibold"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-300 mb-2 uppercase tracking-widest">Goal (optional)</label>
            <input
              type="text"
              placeholder="e.g., 10 minutes"
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none transition-all font-semibold"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-300 mb-2 uppercase tracking-widest">Visual Tag</label>
            <div className="flex flex-wrap gap-3 p-1">
              {PASTEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-2xl border-4 transition-all shadow-sm ${color.split(' ')[0]} ${
                    selectedColor === color ? 'border-gray-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  aria-label="Select color"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-950 rounded-[24px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mt-2"
          >
            {isEditMode ? 'Save Changes' : 'Create Habit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HabitModal;
