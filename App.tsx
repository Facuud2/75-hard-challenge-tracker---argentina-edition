
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChallengeState, INITIAL_TASKS } from './types';
import { getArgentinaDateString, getDaysDifference } from './utils/time';
import TaskItem from './components/TaskItem';
import Timer from './components/Timer';
import { Icon } from './components/Icons';

const LOCAL_STORAGE_KEY = '75hard_argentina_state_v2';

const App: React.FC = () => {
  const [state, setState] = useState<ChallengeState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    const todayStr = getArgentinaDateString();
    
    // Default initial state
    const defaultState: ChallengeState = {
      currentDay: 1,
      startDate: todayStr,
      history: [{ dateString: todayStr, tasks: INITIAL_TASKS }],
      lastVisitedDate: todayStr
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChallengeState;
        
        // If it's the same day, return state as is
        if (parsed.lastVisitedDate === todayStr) {
          return parsed;
        }

        // --- NEW DAY LOGIC (Reset/Continue) ---
        const daysDiff = getDaysDifference(parsed.lastVisitedDate, todayStr);
        let newCurrentDay = 1;
        let isStreakBroken = false;

        const lastDayData = parsed.history.find(h => h.dateString === parsed.lastVisitedDate);
        const wasCompleted = lastDayData?.tasks.every(t => t.completed) ?? false;

        if (daysDiff === 1) {
          if (wasCompleted) {
            newCurrentDay = parsed.currentDay + 1;
          } else {
            isStreakBroken = true;
          }
        } else {
          isStreakBroken = true;
        }

        return {
          ...parsed,
          currentDay: newCurrentDay,
          lastVisitedDate: todayStr,
          startDate: isStreakBroken ? todayStr : parsed.startDate,
          history: [
            ...parsed.history,
            { dateString: todayStr, tasks: INITIAL_TASKS.map(t => ({ ...t, completed: false })) }
          ]
        };
      } catch (e) {
        console.error("Error parsing storage", e);
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Sync day change every 10 seconds to handle midnight rollover
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDayStr = getArgentinaDateString();
      if (state.lastVisitedDate !== currentDayStr) {
        window.location.reload(); 
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [state.lastVisitedDate]);

  const toggleTask = useCallback((taskId: string) => {
    setState(prev => {
      const todayStr = getArgentinaDateString();
      const updatedHistory = prev.history.map(day => {
        if (day.dateString === todayStr) {
          return {
            ...day,
            tasks: day.tasks.map(task => 
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          };
        }
        return day;
      });
      return { ...prev, history: updatedHistory };
    });
  }, []);

  const resetChallenge = () => {
    if (confirm("¿Estás seguro? Esto reiniciará tu progreso al Día 1.")) {
      const todayStr = getArgentinaDateString();
      setState({
        currentDay: 1,
        startDate: todayStr,
        history: [{ dateString: todayStr, tasks: INITIAL_TASKS.map(t => ({...t})) }],
        lastVisitedDate: todayStr
      });
    }
  };

  const todayData = useMemo(() => 
    state.history.find(h => h.dateString === state.lastVisitedDate),
    [state.history, state.lastVisitedDate]
  );

  const currentTasks = todayData?.tasks || INITIAL_TASKS;
  const completedCount = currentTasks.filter(t => t.completed).length;
  const totalCount = INITIAL_TASKS.length;
  const dailyProgress = (completedCount / totalCount) * 100;
  
  // Overall progress calc
  const overallProgress = (state.currentDay / 75) * 100;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-900 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="flame" className="text-pink-400 w-5 h-5 fill-pink-400" />
            <h1 className="text-lg font-oswald font-bold tracking-tight italic">75 HARD</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:block">
                <Timer />
             </div>
             <div className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center border border-white/10">
                <span className="text-xs font-bold text-zinc-400">AR</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:p-6 pb-32">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          
          {/* Left Column: Stats & Info (Sticky on desktop) */}
          <aside className="space-y-6">
            
            {/* Main Day Card */}
            <div className="bg-[#1C1C1E] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <div className="relative z-10">
                <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Día Actual</span>
                <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-7xl font-oswald font-bold text-white tracking-tighter">{state.currentDay}</span>
                    <span className="text-2xl font-oswald text-zinc-600 font-medium">/ 75</span>
                </div>
                
                <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-400">Progreso Total</span>
                        <span className="text-white">{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#2C2C2E] rounded-full overflow-hidden">
                        <div className="h-full bg-pink-400 rounded-full" style={{ width: `${overallProgress}%` }} />
                    </div>
                </div>
              </div>
              
              {/* Subtle background glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-400/5 blur-[80px] rounded-full pointer-events-none" />
            </div>

            {/* Daily Status Card */}
            <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5 flex flex-col justify-between min-h-[160px]">
                <div>
                   <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Estado Diario</span>
                   <h3 className="text-2xl font-oswald font-bold mt-1 text-white">
                     {completedCount === totalCount ? "COMPLETADO" : "EN PROGRESO"}
                   </h3>
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                     <div className="relative w-16 h-16">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className={`${completedCount === totalCount ? 'text-green-500' : 'text-pink-400'} transition-all duration-1000`} strokeDasharray={`${dailyProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold">{Math.round(dailyProgress)}%</span>
                        </div>
                     </div>
                     <p className="text-sm text-zinc-400 leading-snug">
                       {completedCount === totalCount 
                         ? "¡Gran trabajo! Has cumplido todos los objetivos."
                         : `${totalCount - completedCount} tareas restantes para terminar el día.`}
                     </p>
                </div>
            </div>

            {/* Mobile Timer (Visible only on mobile/tablet) */}
            <div className="sm:hidden flex justify-center py-2">
                <Timer />
            </div>

            <button 
                onClick={resetChallenge}
                className="w-full py-4 rounded-xl border border-zinc-800 text-zinc-600 hover:text-pink-400 hover:border-pink-900/50 hover:bg-pink-900/10 transition-all text-xs font-bold uppercase tracking-widest"
            >
                Reiniciar Reto
            </button>
          </aside>

          {/* Right Column: Task List */}
          <section className="space-y-4">
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Tareas de Hoy</h2>
                <span className="text-zinc-500 text-sm font-medium">
                    {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
             </div>
             
             <div className="grid gap-3">
                {currentTasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
             </div>
          </section>

        </div>
      </main>

      {/* Mobile Bottom Bar (Optional, keeps mobile app feel) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-white/5 p-4 z-50 pb-safe">
        <div className="flex justify-around items-center max-w-md mx-auto">
            <button className="flex flex-col items-center gap-1 text-pink-400">
                <Icon name="flame" className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase">Progreso</span>
            </button>
            <div className="w-px h-8 bg-white/10" />
            <button className="flex flex-col items-center gap-1 text-zinc-600" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                <span className="text-lg font-oswald font-bold text-white leading-none">{state.currentDay}</span>
                <span className="text-[10px] font-bold uppercase">Día</span>
            </button>
            <div className="w-px h-8 bg-white/10" />
            <button className="flex flex-col items-center gap-1 text-zinc-600 hover:text-pink-400 transition-colors" onClick={resetChallenge}>
                <Icon name="refresh" className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Reiniciar</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default App;
