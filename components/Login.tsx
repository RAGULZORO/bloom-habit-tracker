import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              display_name: displayName,
            }
          }
        });
        if (error) throw error;
        setMessage("Success! Check your email for a confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-6xl font-black text-bloom-500 tracking-tighter mb-2">Bloom.</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Cultivate your daily rhythm</p>
      </div>

      <div className="w-full max-w-md bg-white p-10 rounded-[48px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-500">
        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Display Name</label>
              <input
                type="text"
                required={isSignUp}
                placeholder="How should we call you?"
                className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-2 border-transparent focus:border-bloom-500 focus:bg-white outline-none transition-all font-semibold text-gray-900"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="hello@example.com"
              className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-2 border-transparent focus:border-bloom-500 focus:bg-white outline-none transition-all font-semibold text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-2 border-transparent focus:border-bloom-500 focus:bg-white outline-none transition-all font-semibold text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 rounded-2xl bg-bloom-50 text-bloom-600 text-xs font-bold border border-bloom-100">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-bloom-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-bloom-500/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              isSignUp ? 'Join Bloom' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm font-medium">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-bloom-500 font-black hover:underline underline-offset-4"
            >
              {isSignUp ? 'Sign In' : 'Create One'}
            </button>
          </p>
        </div>
      </div>

      <div className="mt-12 text-gray-300 font-bold text-[10px] uppercase tracking-widest flex items-center gap-4">
        <span>Cloud Sync</span>
        <span>•</span>
        <span>Privacy First</span>
        <span>•</span>
        <span>Aesthetic Design</span>
      </div>
    </div>
  );
};

export default Login;