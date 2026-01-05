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
    <div className="mt-8 bg-gradient-to-br from-bloom-500/[0.03] to-bloom-500/[0.08] rounded-[40px] p-8 border border-bloom-100 relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-bloom-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-bloom-500/20 transition-all duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✨</span>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Botanist's Insights</h3>
            </div>
            <p className="text-sm text-gray-600 font-medium max-w-md">Let our AI analyze your garden and suggest the next seeds for your growth.</p>
          </div>
          
          <button 
            onClick={getInsights}
            disabled={loading}
            className={`px-8 py-4 bg-bloom-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-bloom-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 disabled:opacity-50`}
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
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-bloom-100 mb-8">
              <p className="italic text-gray-700 font-medium leading-relaxed">"{suggestion.advice}"</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestion.suggestedHabits.map((h, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col justify-between group/card hover:border-bloom-300 transition-all">
                  <div>
                    <span className="inline-block px-3 py-1 bg-bloom-50 text-bloom-600 text-[8px] font-black uppercase tracking-widest rounded-full mb-4">Recommended Seed</span>
                    <h4 className="text-lg font-black text-gray-900 mb-2 leading-tight">{h.name}</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{h.reason}</p>
                  </div>
                  <button 
                    onClick={() => onAddSuggested(h.name, "Recommended by Botanist")}
                    className="mt-6 w-full py-3 bg-gray-50 hover:bg-bloom-500 hover:text-white text-gray-900 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
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