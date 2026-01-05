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

  const graphData = useMemo(() => {
    const width = 1000;
    const height = 200;
    const padding = { top: 30, right: 40, bottom: 40, left: 60 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;
    const step = daysInMonth > 1 ? graphWidth / (daysInMonth - 1) : 0;
    const baselineY = padding.top + graphHeight;
    
    let pathData = "";
    let isDrawing = false;
    
    // Build line path (only for points with intensity > 0)
    heatmapDays.forEach((data, i) => {
      const x = padding.left + i * step;
      const y = padding.top + graphHeight - (data.intensity * graphHeight);
      
      if (data.intensity > 0) {
        if (!isDrawing) {
          pathData += `M ${x} ${y}`;
          isDrawing = true;
        } else {
          const prevY = padding.top + graphHeight - (heatmapDays[i-1].intensity * graphHeight);
          const cpX = (padding.left + (i - 1) * step + x) / 2;
          pathData += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`;
        }
      } else {
        isDrawing = false;
      }
    });
    
    // Build area path: baseline -> line path -> baseline
    let areaPath = "";
    if (pathData) {
      // Find first and last points with data
      const firstDataIndex = heatmapDays.findIndex(d => d.intensity > 0);
      const lastDataIndex = heatmapDays.length - 1 - [...heatmapDays].reverse().findIndex(d => d.intensity > 0);
      const firstX = padding.left + firstDataIndex * step;
      const lastX = padding.left + lastDataIndex * step;
      
      // Build area path: start at baseline -> line path -> back to baseline
      areaPath = `M ${firstX} ${baselineY} ` + pathData + ` L ${lastX} ${baselineY} Z`;
    }
    
    return { pathData, areaPath, padding, step, graphHeight, graphWidth };
  }, [heatmapDays, daysInMonth]);

  const handleAddSuggested = async (name: string, goal: string) => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    await supabase.from('habits').insert([{ 
      name, 
      goal, 
      color: 'bg-bloom-100 text-bloom-700 border-bloom-200', 
      completed_dates: [], 
      user_id: session.user.id 
    }]);
  };

  return (
    <div className="mt-12 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-bloom-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-bloom-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Insights & Growth</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Visualizing your progress</p>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        <div className="relative pt-8 pb-4">
          <div className="flex justify-between items-baseline mb-8 px-2">
            <div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter lowercase">{monthName} Flow</h3>
              <p className="text-[10px] font-black text-bloom-500 uppercase tracking-[0.4em] mt-1 ml-1">The Rhythm of Ritual</p>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black text-gray-900 tracking-tighter">{monthlyConsistency}%</span>
              <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Consistency</span>
            </div>
          </div>

          <div className="relative h-[280px] w-full bg-white rounded-[32px] border border-gray-100 p-6">
            <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#80b918" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#80b918" stopOpacity="1" />
                  <stop offset="100%" stopColor="#80b918" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#80b918" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#80b918" stopOpacity="0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {(() => {
                const width = 1000;
                const height = 200;
                const { padding, step, graphHeight, pathData, areaPath } = graphData;
                const gridLines = [0, 0.25, 0.5, 0.75, 1.0];
                
                return (
                  <>
                    {/* Y-axis grid lines */}
                    {gridLines.map((value) => {
                      const y = padding.top + graphHeight - (value * graphHeight);
                      return (
                        <g key={value}>
                          <line
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            opacity="0.5"
                          />
                          {/* Y-axis labels */}
                          <text
                            x={padding.left - 15}
                            y={y + 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="#9ca3af"
                            fontWeight="600"
                            fontFamily="system-ui, -apple-system, sans-serif"
                          >
                            {Math.round(value * 100)}%
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* X-axis */}
                    <line
                      x1={padding.left}
                      y1={height - padding.bottom}
                      x2={width - padding.right}
                      y2={height - padding.bottom}
                      stroke="#d1d5db"
                      strokeWidth="2"
                    />
                    
                    {/* Y-axis */}
                    <line
                      x1={padding.left}
                      y1={padding.top}
                      x2={padding.left}
                      y2={height - padding.bottom}
                      stroke="#d1d5db"
                      strokeWidth="2"
                    />
                    
                    {/* Area fill under the line */}
                    {areaPath && (
                      <path
                        d={areaPath}
                        fill="url(#areaGradient)"
                      />
                    )}
                    
                    {/* Background glow */}
                    {pathData && (
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#80b918"
                        strokeWidth="6"
                        strokeLinecap="round"
                        opacity="0.1"
                      />
                    )}
                    
                    {/* Main line */}
                    {pathData && (
                      <path
                        d={pathData}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        className="transition-all duration-1000 ease-in-out"
                      />
                    )}
                    
                    {/* Data points */}
                    {heatmapDays.map((data, i) => {
                      const x = padding.left + i * step;
                      const y = padding.top + graphHeight - (data.intensity * graphHeight);
                      const isToday = data.dateStr === todayStr;
                      
                      return (
                        <g key={data.day} className="group cursor-pointer">
                          {/* Hover indicator */}
                          <circle
                            cx={x}
                            cy={data.intensity > 0 ? y : padding.top + graphHeight}
                            r="8"
                            fill="transparent"
                            className="group-hover:fill-bloom-500/10 transition-all"
                          />
                          
                          {/* Data point */}
                          {data.intensity > 0 && (
                            <>
                              <circle
                                cx={x}
                                cy={y}
                                r={isToday ? "6" : "4"}
                                fill={isToday ? "#80b918" : "#65a30d"}
                                className="transition-all duration-300 group-hover:r-6 drop-shadow-sm"
                              />
                              {isToday && (
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="12"
                                  fill="#80b918"
                                  opacity="0.2"
                                  className="animate-ping"
                                />
                              )}
                            </>
                          )}
                          
                          {/* X-axis labels (every 5 days) */}
                          {i % 5 === 0 && (
                            <text
                              x={x}
                              y={height - padding.bottom + 20}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#6b7280"
                              fontWeight="600"
                              fontFamily="system-ui, -apple-system, sans-serif"
                            >
                              {data.day}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all hover:shadow-xl duration-300 overflow-hidden relative group">
          <div className="md:max-w-xs relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-6 bg-bloom-500 rounded-full" />
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Density Map</h3>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{monthName} Pulse</p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">Observe your daily activity patterns. Darker squares represent higher completion across all habits.</p>
            <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-tighter bg-gray-50 w-fit px-4 py-2 rounded-full border border-gray-100">
              <span>Less</span>
              <div className="flex gap-1.5">
                <div className="w-4 h-4 bg-gray-100 rounded-[4px]" />
                <div className="w-4 h-4 bg-bloom-100 rounded-[4px]" />
                <div className="w-4 h-4 bg-bloom-300 rounded-[4px]" />
                <div className="w-4 h-4 bg-bloom-500 rounded-[4px]" />
                <div className="w-4 h-4 bg-bloom-800 rounded-[4px]" />
              </div>
              <span>More</span>
            </div>
          </div>
          <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-7 lg:grid-cols-11 gap-2.5 p-8 bg-gray-50 rounded-[32px] border border-gray-100 shadow-inner relative z-10">
            {heatmapDays.map((data) => {
              const isToday = data.dateStr === todayStr;
              let intensityClass = 'bg-gray-200'; 
              if (data.intensity > 0) intensityClass = 'bg-bloom-100';
              if (data.intensity > 0.4) intensityClass = 'bg-bloom-300';
              if (data.intensity > 0.7) intensityClass = 'bg-bloom-500';
              if (data.intensity === 1) intensityClass = 'bg-bloom-800';
              return (
                <div key={data.day} title={`${data.dateStr}: ${data.completedCount} habits`} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer shadow-sm ${intensityClass} ${isToday ? 'ring-4 ring-bloom-500 ring-offset-2' : ''}`} />
              );
            })}
          </div>
        </div>

        <GrowthSuggestions habits={habits} onAddSuggested={handleAddSuggested} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;