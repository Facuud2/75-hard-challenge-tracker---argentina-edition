
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChallengeState, INITIAL_TASKS } from './types';
import { getArgentinaDateString, getDaysDifference } from './utils/time';
import TaskItem from './components/TaskItem';
import Timer from './components/Timer';
import { Icon } from './components/Icons';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import InstallPWA from './components/InstallPWA';
import CalendarioInteligente from './components/moduleC/CalendarioInteligente';
import { useModuleC } from './hooks/useModuleC';

const LOCAL_STORAGE_KEY = '75hard_argentina_state_v2';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const moduleC = useModuleC();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModalDate, setSelectedModalDate] = useState<string | null>(null);
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
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-black text-white selection:bg-pink-900 selection:text-white' 
        : 'bg-white text-gray-900 selection:bg-pink-100 selection:text-pink-900'
    }`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-black/80 border-pink-500/20'
          : 'bg-white/80 border-pink-200/50'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="flame" className={`w-5 h-5 fill-current transition-colors duration-300 ${
              theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
            }`} />
            <h1 className={`text-lg font-oswald font-bold tracking-tight italic transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>75 HARD</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:block">
                <Timer theme={theme} />
             </div>
             <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:p-6 pb-32">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          
          {/* Left Column: Stats & Info (Sticky on desktop) */}
          <aside className="space-y-6">
            
            {/* Main Day Card */}
            <div className={`rounded-3xl p-8 border relative overflow-hidden group backdrop-blur-sm transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-pink-950/50 to-black/50 border-pink-500/20'
                : 'bg-gradient-to-br from-pink-50 to-white border-pink-200'
            }`}>
              <div className="relative z-10">
                <span className={`font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${
                  theme === 'dark' ? 'text-pink-400' : 'text-pink-600'
                }`}>Día Actual</span>
                <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-7xl font-oswald font-bold tracking-tighter transition-colors duration-300 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{state.currentDay}</span>
                    <span className={`text-2xl font-oswald font-medium transition-colors duration-300 ${
                      theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
                    }`}>/ 75</span>
                </div>
                
                <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                          theme === 'dark' ? 'text-pink-300' : 'text-pink-600'
                        }`}>Progreso Total</span>
                        <span className={`transition-colors duration-300 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{Math.round(overallProgress)}%</span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden border transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'bg-black/50 border-pink-500/20'
                        : 'bg-pink-100 border-pink-200'
                    }`}>
                        <div className={`h-full rounded-full transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-pink-400' : 'bg-pink-500'
                        }`} style={{ width: `${overallProgress}%` }} />
                    </div>
                </div>
              </div>
              
              {/* Subtle background glow */}
              <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-opacity duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-pink-400/20 to-pink-600/10'
                  : 'bg-gradient-to-br from-pink-200/15 to-pink-300/10'
              }`} />
            </div>

            {/* Daily Status Card */}
            <div className={`bg-gradient-to-br rounded-3xl p-6 border flex flex-col justify-between min-h-[160px] backdrop-blur-sm transition-colors duration-300 ${
              theme === 'dark'
                ? 'from-pink-950/30 to-black/30 border-pink-500/15'
                : 'from-pink-50 to-white border-pink-200'
            }`}>
                <div>
                   <span className={`font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${
                     theme === 'dark' ? 'text-pink-400' : 'text-pink-600'
                   }`}>Estado Diario</span>
                   <h3 className={`text-2xl font-oswald font-bold mt-1 transition-colors duration-300 ${
                     theme === 'dark' ? 'text-white' : 'text-gray-900'
                   }`}>
                     {completedCount === totalCount ? "COMPLETADO" : "EN PROGRESO"}
                   </h3>
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                     <div className="relative w-16 h-16">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className={`transition-colors duration-300 ${
                              theme === 'dark' ? 'text-black/50' : 'text-gray-200'
                            }`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className={`${completedCount === totalCount ? 'text-green-500' : (theme === 'dark' ? 'text-pink-400' : 'text-pink-500')} transition-all duration-1000`} strokeDasharray={`${dailyProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xs font-bold transition-colors duration-300 ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>{Math.round(dailyProgress)}%</span>
                        </div>
                     </div>
                     <p className={`text-sm leading-snug transition-colors duration-300 ${
                       theme === 'dark' ? 'text-pink-300' : 'text-pink-600'
                     }`}>
                       {completedCount === totalCount 
                         ? "¡Gran trabajo! Has cumplido todos los objetivos."
                         : `${totalCount - completedCount} tareas restantes para terminar el día.`}
                     </p>
                </div>
            </div>

            {/* Mobile Timer (Visible only on mobile/tablet) */}
            <div className="sm:hidden flex justify-center py-2">
                <Timer theme={theme} />
            </div>

            {/* Calendar */}
            <CalendarioInteligente
              theme={theme}
              challengeHistory={state.history}
              onDateSelect={(date) => {
                setSelectedModalDate(date);
                setIsModalOpen(true);
              }}
              selectedDate={selectedModalDate}
            />

            <button 
                onClick={resetChallenge}
                className={`w-full py-4 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest backdrop-blur-sm ${
                  theme === 'dark'
                    ? 'border-pink-500/30 text-pink-300 hover:text-white hover:border-pink-400 hover:bg-pink-950/50'
                    : 'border-pink-200 text-pink-600 hover:text-white hover:border-pink-400 hover:bg-pink-500'
                }`}
            >
                Reiniciar Reto
            </button>
          </aside>

          {/* Right Column: Task List */}
          <section className="space-y-4">
             <div className="flex items-center justify-between mb-2">
                <h2 className={`text-xl font-bold transition-colors duration-300 ${
                  theme === 'dark' ? 'text-pink-300' : 'text-pink-600'
                }`}>Tareas de Hoy</h2>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
                }`}>
                    {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
             </div>
             
             <div className="grid gap-3">
                {currentTasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} theme={theme} />
                ))}
             </div>
          </section>

        </div>

        {/* Modal para día seleccionado */}
        {isModalOpen && selectedModalDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-pink-950/95 to-black/95 border-pink-500/20'
                : 'bg-gradient-to-br from-pink-50/95 to-white/95 border-pink-200'
            }`}>
              <div className={`absolute -top-40 -right-40 w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-opacity duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-pink-400/20 to-pink-600/10'
                  : 'bg-gradient-to-br from-pink-200/15 to-pink-300/10'
              }`} />

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-pink-500/20">
                  <div className="flex items-center gap-3">
                    <Icon name="calendar" className="w-6 h-6 text-pink-500" />
                    <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {new Date(selectedModalDate).toLocaleDateString('es-AR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h2>
                  </div>
                  
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'hover:bg-pink-950/50 text-pink-300 hover:text-pink-200 border border-pink-500/20' 
                        : 'hover:bg-pink-100 text-pink-600 hover:text-pink-500 border border-pink-200'
                    }`}
                  >
                    <Icon name="x" className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Icon name="edit" className="w-5 h-5 text-pink-500" />
                        📝 Journaling del Día
                      </h3>
                      <textarea
                        placeholder="¿Cómo te sentiste hoy? ¿Qué aprendiste? ¿Qué desafíos enfrentaste?"
                        className={`w-full px-4 py-3 rounded-xl border text-sm resize-none ${
                          theme === 'dark' 
                            ? 'bg-gray-800/50 border-gray-600 text-white' 
                            : 'bg-gray-50/50 border-gray-300 text-gray-900'
                        }`}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Tareas del Día
                      </h3>
                      
                      {INITIAL_TASKS.map(task => (
                        <div key={task.id} className="space-y-3 p-4 rounded-xl border border-pink-500/10">
                          <div className="flex items-center gap-2 mb-2">
                            <task.icon className="w-5 h-5 text-pink-500" />
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {task.label}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            {task.type === 'reading' && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Páginas leídas"
                                  className={`w-24 px-2 py-1 rounded border text-sm ${
                                    theme === 'dark' 
                                      ? 'bg-gray-800 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  páginas
                                </span>
                              </div>
                            )}

                            {task.type === 'exercise' && (
                              <textarea
                                placeholder="¿Qué ejercicio hiciste? (Ej: 45 min cardio + pesas)"
                                className={`w-full px-3 py-2 rounded border text-sm resize-none ${
                                  theme === 'dark' 
                                    ? 'bg-gray-800 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                rows={2}
                              />
                            )}

                            {task.type === 'water' && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  placeholder="0"
                                  className={`w-16 px-2 py-1 rounded border text-sm ${
                                    theme === 'dark' 
                                      ? 'bg-gray-800 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  vasos (1 galón = ~10 vasos)
                                </span>
                              </div>
                            )}

                            {task.type === 'diet' && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                                />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  No cumplí la dieta hoy
                                </span>
                              </div>
                            )}

                            {task.type === 'progress' && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                                />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Sin foto de progreso
                                </span>
                              </div>
                            )}
                          </div>

                          <textarea
                            placeholder={`Notas sobre ${task.label.toLowerCase()}...`}
                            className={`w-full px-3 py-2 rounded-lg border text-sm resize-none mt-2 ${
                              theme === 'dark' 
                                ? 'bg-gray-800/30 border-gray-600 text-white' 
                                : 'bg-gray-50/30 border-gray-300 text-gray-900'
                            }`}
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 border-t border-pink-500/20">
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {moduleC.getPhotosForDate(selectedModalDate).length} foto{moduleC.getPhotosForDate(selectedModalDate).length !== 1 ? 's' : ''} guardada{moduleC.getPhotosForDate(selectedModalDate).length !== 1 ? 's' : ''}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                        theme === 'dark' 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      Cerrar
                    </button>
                    
                    <button
                      onClick={() => {
                        // Aquí iría la lógica de guardar
                        setIsModalOpen(false);
                      }}
                      className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 font-medium"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Bar (Optional, keeps mobile app feel) */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t p-4 z-50 pb-safe transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-t from-black/90 to-pink-950/80 border-pink-500/20'
          : 'bg-gradient-to-t from-white/90 to-pink-50/80 border-pink-200'
      }`}>
        <div className="flex justify-around items-center max-w-md mx-auto">
            <button className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
              theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
            }`}>
                <Icon name="flame" className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase">Progreso</span>
            </button>
            <div className={`w-px h-8 transition-colors duration-300 ${
              theme === 'dark' ? 'bg-pink-500/20' : 'bg-pink-200'
            }`} />
            <button className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
              theme === 'dark' ? 'text-pink-300' : 'text-pink-600'
            }`} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                <span className="text-lg font-oswald font-bold text-white leading-none">{state.currentDay}</span>
                <span className="text-[10px] font-bold uppercase">Día</span>
            </button>
            <div className={`w-px h-8 transition-colors duration-300 ${
              theme === 'dark' ? 'bg-pink-500/20' : 'bg-pink-200'
            }`} />
            <button className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
              theme === 'dark' ? 'text-pink-300 hover:text-pink-400' : 'text-pink-600 hover:text-pink-500'
            }`} onClick={resetChallenge}>
                <Icon name="refresh" className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Reiniciar</span>
            </button>
        </div>
      </div>
    
    <InstallPWA />
    </div>
    
  );
};

export default App;
