
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Habit } from '../types';

interface GrowthSuggestionsProps {
  habits: Habit[];
  onAddSuggested: (name: string, goal: string) => void;
}

const GrowthSuggestions: React.FC<GrowthSuggestionsProps> = ({ habits, onAddSuggested }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{ advice: string; suggestedHabits: { name: string; reason: string }[] } | null>(null);

  const getInsights = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const habitSummary = habits.map(h => `- ${h.name} (${h.completedDates.length} completions)`).join('\n');
      
      const prompt = `You are the 'Bloom Botanist', a world-class life coach. 
      Analyze these habits:
      ${habitSummary}
      
      Provide:
      1. A short (20 words) motivational 'Botanist's Note' on their current progress.
      2. 3 new habits to add that would complement this routine.
      
      Return the response in JSON format:
      {
        "advice": "string",
        "suggestedHabits": [{"name": "string", "reason": "string"}]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const data = JSON.parse(response.text || '{}');
      setSuggestion(data);
    } catch (error) {
      console.error("AI Insight failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-indigo-500/[0.03] to-purple-500/[0.03] dark:from-indigo-500/[0.05] dark:to-purple-500/[0.05] rounded-[40px] p-8 border border-indigo-100/50 dark:border-indigo-500/10 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✨</span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Botanist's Insights</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium max-w-md">Let our AI analyze your garden and suggest the next seeds for your growth.</p>
          </div>
          
          <button 
            onClick={getInsights}
            disabled={loading}
            className={`px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 disabled:opacity-50`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Analyzing Soil...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" /></svg>
                Generate Plan
              </>
            )}
          </button>
        </div>

        {suggestion && !loading && (
          <div className="mt-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 rounded-3xl border border-white dark:border-white/5 mb-8">
              <p className="italic text-gray-700 dark:text-gray-300 font-medium leading-relaxed">"{suggestion.advice}"</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestion.suggestedHabits.map((h, i) => (
                <div key={i} className="bg-white dark:bg-gray-800/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between group/card hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all">
                  <div>
                    <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-full mb-4">Recommended Seed</span>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-tight">{h.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{h.reason}</p>
                  </div>
                  <button 
                    onClick={() => onAddSuggested(h.name, "Recommended by Botanist")}
                    className="mt-6 w-full py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 text-gray-900 dark:text-gray-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    Plant This
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrowthSuggestions;
