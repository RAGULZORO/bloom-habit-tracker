
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  created_at: string;
}

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Admin fetch error:", error);
        setError(error.message);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-[#fbfcf8] dark:bg-gray-950 p-6 md:p-12 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">User Management</p>
          </div>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
          >
            ← Back to Garden
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-[32px] border border-red-100 dark:border-red-900/50 text-center">
            <span className="text-4xl mb-4 block">🚫</span>
            <h3 className="text-xl font-black text-red-900 dark:text-red-400 mb-2">Access Denied</h3>
            <p className="text-red-700 dark:text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-black text-sm">
                            {user.display_name?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">{user.display_name || 'Anonymous Bloom'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-medium text-gray-500 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-400 dark:text-gray-500">
                        {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 dark:border-green-900/50">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold italic">
                        No users have bloomed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users: {users.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
