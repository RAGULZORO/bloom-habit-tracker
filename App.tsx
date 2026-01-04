
import React, { useState, useEffect, useCallback } from 'react';
import { Habit } from './types';
import MonthlyGrid from './components/MonthlyGrid';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import HabitModal from './components/HabitModal';
import HabitDetailView from './components/HabitDetailView';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { getTodayDateString } from './utils';
import { MOTIVATIONAL_MESSAGES } from './constants';
import { supabase } from './lib/supabase';

const ADMIN_EMAIL = 'ragulzoro1@gmail.com';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<{ display_name: string } | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<{ message: string; isTableMissing: boolean } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [habitDetail, setHabitDetail] = useState<Habit | null>(null);
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'tracker' | 'admin'>('tracker');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('bloom_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setCurrentView('tracker');
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase || !session) return;
      const { data, error } = await supabase.from('profiles').select('display_name').eq('id', session.user.id).single();
      if (!error && data) setProfile(data);
      else setProfile({ display_name: session.user.email?.split('@')[0] || 'User' });
    };
    if (session) fetchProfile();
  }, [session]);

  const fetchHabits = useCallback(async () => {
    if (!supabase || !session) { setLoading(false); return; }
    try {
      setFetchError(null);
      const { data, error } = await supabase.from('habits').select('*').order('created_at', { ascending: false });
      if (error) {
        const isTableMissing = error.message.includes('schema cache') || error.code === '42P01';
        setFetchError({ message: error.message, isTableMissing });
        throw error;
      }
      if (data) {
        const habitData = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          goal: item.goal || '',
          color: item.color || '',
          completedDates: item.completed_dates || [],
          createdAt: item.created_at
        }));
        setHabits(habitData);
        // Sync detail view if it's open
        if (habitDetail) {
          const updated = habitData.find(h => h.id === habitDetail.id);
          if (updated) setHabitDetail(updated);
        }
      }
    } catch (e: any) { console.error("Fetch failed:", e); }
    finally { setLoading(false); }
  }, [session, habitDetail]);

  useEffect(() => {
    if (session) {
      fetchHabits();
      const channel = supabase!.channel('schema-db-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${session.user.id}` }, () => {
        fetchHabits();
      }).subscribe();
      return () => { supabase!.removeChannel(channel); };
    } else {
      setHabits([]);
      setLoading(false);
    }
  }, [fetchHabits, session]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#050508';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#fbfcf8';
    }
    localStorage.setItem('bloom_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const addHabit = async (name: string, goal: string, color: string) => {
    if (!supabase || !session) return;
    const { error } = await supabase.from('habits').insert([{ name, goal, color, completed_dates: [], user_id: session.user.id }]);
    if (error) alert(`Error: ${error.message}`);
  };

  const updateHabit = async (id: string, name: string, goal: string, color: string) => {
    if (!supabase || !session) return;
    await supabase.from('habits').update({ name, goal, color }).eq('id', id);
  };

  const toggleHabit = useCallback(async (id: string, dateStr: string) => {
    if (!supabase || !session) return;

    let isNowCompleted = false;
    let finalDates: string[] = [];

    setHabits(prevHabits => {
      return prevHabits.map(h => {
        if (h.id === id) {
          const isDone = h.completedDates.includes(dateStr);
          isNowCompleted = !isDone;
          finalDates = isDone 
            ? h.completedDates.filter(d => d !== dateStr) 
            : [...h.completedDates, dateStr];
          return { ...h, completedDates: finalDates };
        }
        return h;
      });
    });

    const { error } = await supabase.from('habits').update({ completed_dates: finalDates }).eq('id', id);
    
    if (error) {
      fetchHabits(); 
      return;
    }

    if (isNowCompleted && dateStr === getTodayDateString()) {
      const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      setMotivationalMessage(msg);
      setTimeout(() => setMotivationalMessage(null), 3000);
    }
  }, [supabase, session, fetchHabits]);

  const deleteHabit = async (id: string) => {
    if (!window.confirm("Delete this habit?")) return;
    if (!supabase || !session) return;
    await supabase.from('habits').delete().eq('id', id);
    if (habitDetail?.id === id) setHabitDetail(null);
  };

  const handleSignOut = async () => { if (supabase) await supabase.auth.signOut(); };
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  if (!session) return <Login />;
  if (currentView === 'admin' && isAdmin) return <AdminPanel onBack={() => setCurrentView('tracker')} />;

  return (
    <div className="min-h-screen pb-24 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {motivationalMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] transition-all">
          <div className="bg-white dark:bg-gray-900 px-6 py-3 rounded-full shadow-2xl border border-green-100 dark:border-green-900 flex items-center gap-3 animate-bounce">
            <span className="text-xl">✨</span>
            <span className="text-green-800 dark:text-green-400 font-bold">{motivationalMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">Bloom.</h1>
            <p className="text-gray-400 font-semibold text-sm uppercase tracking-widest">{profile?.display_name || 'Grower'}'s Garden</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {isAdmin && (
              <button onClick={() => setCurrentView('admin')} className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all text-sm border border-indigo-100 dark:border-indigo-900/50">🛠️ Admin Panel</button>
            )}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-105 transition-transform">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" /></svg>
              </button>
              <span className="text-lg font-black min-w-[140px] text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
              </button>
            </div>
            <button onClick={handleSignOut} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all text-sm">Sign Out</button>
          </div>
        </header>

        <main>
          {loading ? (
            <div className="flex items-center justify-center py-32"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : habits.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-800 transition-colors">
              <div className="text-6xl mb-6">🌱</div>
              <h3 className="text-2xl font-black mb-10 text-gray-900 dark:text-white">Your garden is empty</h3>
              <button onClick={() => setIsModalOpen(true)} className="px-10 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-bold shadow-xl transition-transform hover:-translate-y-1">Plant a Habit</button>
            </div>
          ) : (
            <div className="space-y-12">
              <MonthlyGrid 
                habits={habits} 
                currentDate={currentDate} 
                onToggle={toggleHabit} 
                onDeleteHabit={deleteHabit} 
                onEditHabit={(h) => { setHabitToEdit(h); setIsModalOpen(true); }}
                onViewDetail={(h) => setHabitDetail(h)}
              />
              <AnalyticsDashboard habits={habits} currentDate={currentDate} />
            </div>
          )}
        </main>
      </div>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 w-20 h-20 bg-gray-900 dark:bg-white dark:text-gray-950 text-white rounded-3xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
      </button>

      <HabitModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setHabitToEdit(null); }} onAdd={addHabit} onUpdate={updateHabit} habitToEdit={habitToEdit} />
      
      {habitDetail && (
        <HabitDetailView 
          habit={habitDetail} 
          onClose={() => setHabitDetail(null)} 
          onEdit={() => { setIsModalOpen(true); setHabitToEdit(habitDetail); }} 
          onDelete={() => deleteHabit(habitDetail.id)} 
        />
      )}
    </div>
  );
};

export default App;
