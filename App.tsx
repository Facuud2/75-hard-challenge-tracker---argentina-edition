
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
import DayModal from './components/moduleC/DayModal';
import PlanSelector from './components/PlanSelector';
import { CHALLENGE_PLANS } from './components/PlanSelector';
import Achievements from './components/Achievements';
import Profile from './components/Profile/Profile';
import { useAchievementsSimple, ACHIEVEMENTS } from './hooks/useAchievementsSimple';
import { useModuleC } from './hooks/useModuleC';

const LOCAL_STORAGE_KEY = '75hard_argentina_state_v2';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const moduleC = useModuleC();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModalDate, setSelectedModalDate] = useState<string | null>(null);
  const [isPlanSelectorOpen, setIsPlanSelectorOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const SELECTED_PLAN_KEY = '75hard_selected_plan';
  const [activePlanId, setActivePlanId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_PLAN_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed.id;
      }
    } catch (e) { /* ignore */ }
    return 'hard';
  });
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

  // Lock body scroll when profile modal is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isProfileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return;
  }, [isProfileOpen]);

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

  const calculateCurrentStreak = () => {
    let streak = 0;
    for (let i = state.history.length - 1; i >= 0; i--) {
      const day = state.history[i];
      if (day.tasks.every(t => t.completed)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Initialize achievements hook
  const userProgress = useMemo(() => ({
    currentDay: state.currentDay,
    currentStreak: calculateCurrentStreak(),
    totalDaysCompleted: state.history.filter(h => 
      h.tasks.some(t => t.completed)
    ).length,
    perfectDays: state.history.filter(h => 
      h.tasks.every(t => t.completed)
    ).length,
    achievements: [] // Will be loaded from localStorage in the hook
  }), [state]);

  const achievements = useAchievementsSimple(theme, userProgress);

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
      const newState = { ...prev, history: updatedHistory };
      
      // Calculate updated progress immediately
      const updatedProgress = {
        currentDay: newState.currentDay,
        currentStreak: calculateCurrentStreakFromState(newState),
        totalDaysCompleted: newState.history.filter(h => 
          h.tasks.some(t => t.completed)
        ).length,
        perfectDays: newState.history.filter(h => 
          h.tasks.every(t => t.completed)
        ).length,
        achievements: [] // Will be loaded from localStorage in the hook
      };
      
      // Check achievements immediately with updated progress
      // Use a direct call to the achievements checking logic
      setTimeout(() => {
        // Get the current unlocked achievements from localStorage
        try {
          const saved = localStorage.getItem('75hard_achievements');
          const currentUnlocked = saved ? JSON.parse(saved) : [];
          
          // Check each achievement manually
          ACHIEVEMENTS.forEach(achievement => {
            if (!currentUnlocked.includes(achievement.id)) {
              const isUnlocked = checkIfAchievementUnlocked(achievement, updatedProgress);
              if (isUnlocked) {
                // Unlock the achievement
                const newUnlocked = [...currentUnlocked, achievement.id];
                localStorage.setItem('75hard_achievements', JSON.stringify(newUnlocked));
                
                // Show notification
                const achievementData = ACHIEVEMENTS.find(a => a.id === achievement.id);
                if (achievementData) {
                  showAchievementNotification(achievementData);
                }
              }
            }
          });
        } catch (e) {
          console.error('Error checking achievements:', e);
        }
      }, 50);
      
      return newState;
    });
  }, []);

  // Helper function to check if an achievement is unlocked
  const checkIfAchievementUnlocked = useCallback((achievement: any, progress: any) => {
    const { type, value } = achievement.requirement;
    
    switch (type) {
      case 'days':
        return progress.currentDay >= value;
      case 'streak':
        return progress.currentStreak >= value;
      case 'perfect_day':
        return progress.perfectDays >= value;
      case 'total_days':
        return progress.totalDaysCompleted >= value;
      case 'special':
        return value === '75_hard_complete' && progress.currentDay >= 75;
      default:
        return false;
    }
  }, []);

  // Helper function to show achievement notification
  const showAchievementNotification = useCallback((achievement: any) => {
    try {
      // Check if notification was already shown
      const shownNotifications = JSON.parse(localStorage.getItem('75hard_shown_notifications') || '[]');
      if (shownNotifications.includes(achievement.id)) {
        return;
      }

      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 z-[100] animate-in slide-in-from-right-2 fade-in duration-500';
      notification.innerHTML = `
        <div class="relative bg-gradient-to-br bg-yellow-500/20 border-2 border-yellow-500 rounded-2xl p-4 shadow-2xl backdrop-blur-sm max-w-sm">
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-yellow-400">✦</span>
                <span class="text-sm font-bold text-yellow-400">¡LOGRO DESBLOQUEADO!</span>
              </div>
              <span class="text-xs font-bold text-yellow-400">+${achievement.points || 50} pts</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-2xl">${achievement.icon}</span>
              <div>
                <div class="font-bold text-white">${achievement.title}</div>
                <div class="text-sm text-gray-300">${achievement.description}</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Mark as shown
      shownNotifications.push(achievement.id);
      localStorage.setItem('75hard_shown_notifications', JSON.stringify(shownNotifications));
      
      // Play sound
      try {
        const audio = new Audio('/effectsound.mp4');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Audio creation failed:', e);
      }
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);
      
    } catch (e) {
      console.error('Error showing notification:', e);
    }
  }, []);

  // Helper function to calculate streak from a given state
  const calculateCurrentStreakFromState = (state: ChallengeState) => {
    let streak = 0;
    for (let i = state.history.length - 1; i >= 0; i--) {
      const day = state.history[i];
      if (day.tasks.every(t => t.completed)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Function to get tasks for the currently selected plan
  const getTasksForCurrentPlan = useCallback(() => {
    try {
      const saved = localStorage.getItem(SELECTED_PLAN_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          // If it's the custom plan, try to load saved custom tasks
          if (parsed.id === 'custom') {
            const savedCustomTasks = localStorage.getItem('75hard_custom_tasks');
            if (savedCustomTasks) {
              const customTasks = JSON.parse(savedCustomTasks);
              if (customTasks.length > 0) {
                return customTasks;
              }
            }
            
            // Also try to load selected tasks from PlanSelector state
            const savedSelectedTasks = localStorage.getItem('75hard_selected_custom_tasks');
            if (savedSelectedTasks) {
              const selectedTasks = JSON.parse(savedSelectedTasks);
              if (selectedTasks.length > 0) {
                // Load all custom task definitions
                const savedCustomDefinitions = localStorage.getItem('75hard_custom_task_definitions');
                if (savedCustomDefinitions) {
                  const customDefinitions = JSON.parse(savedCustomDefinitions);
                  // Filter only selected tasks
                  const selectedDefinitions = customDefinitions.filter((task: any) => 
                    selectedTasks.includes(task.id)
                  );
                  
                  if (selectedDefinitions.length > 0) {
                    const mapTaskType = (taskId: string) => {
                      if (taskId.includes('workout') || taskId.includes('exercise')) return 'exercise';
                      if (taskId.includes('water')) return 'water';
                      if (taskId.includes('read') || taskId.includes('reading')) return 'reading';
                      if (taskId.includes('photo') || taskId.includes('progress')) return 'progress';
                      if (taskId.includes('diet')) return 'diet';
                      return undefined;
                    };

                    return selectedDefinitions.map((t: any) => ({
                      id: t.id,
                      label: t.label,
                      description: t.description,
                      completed: false,
                      icon: t.icon || 'target',
                      type: mapTaskType(t.id)
                    }));
                  }
                }
              }
            }
            
            // If no saved custom tasks, fall back to default custom tasks
            return [
              { id: 'custom-diet', label: 'Dieta Personalizada', description: 'Define tus propias reglas alimenticias', completed: false, icon: 'utensils', type: 'diet' },
              { id: 'custom-workout', label: 'Ejercicio Personalizado', description: 'Establece tu rutina de entrenamiento', completed: false, icon: 'dumbbell', type: 'exercise' },
              { id: 'custom-water', label: 'Hidratación Personalizada', description: 'Define tu meta de consumo de agua', completed: false, icon: 'droplet', type: 'water' },
              { id: 'custom-reading', label: 'Lectura Personalizada', description: 'Establece tu meta de lectura', completed: false, icon: 'book-open', type: 'reading' },
              { id: 'custom-meditation', label: 'Meditación', description: 'Práctica de mindfulness o meditación', completed: false, icon: 'heart', type: undefined },
              { id: 'custom-sleep', label: 'Descanso', description: 'Controla tus horas de sueño', completed: false, icon: 'moon', type: undefined }
            ];
          }
          
          // Find the plan in CHALLENGE_PLANS for non-custom plans
          const plan = CHALLENGE_PLANS.find(p => p.id === parsed.id);
          if (plan) {
            // Map plan tasks to app Task shape
            const mapTaskType = (taskId: string) => {
              if (taskId.includes('workout') || taskId.includes('exercise')) return 'exercise';
              if (taskId.includes('water')) return 'water';
              if (taskId.includes('read') || taskId.includes('reading')) return 'reading';
              if (taskId.includes('photo') || taskId.includes('progress')) return 'progress';
              if (taskId.includes('diet')) return 'diet';
              return undefined;
            };

            return plan.tasks.map((t: any) => ({
              id: t.id,
              label: t.label,
              description: t.description,
              completed: false,
              icon: t.icon || 'target',
              type: mapTaskType(t.id)
            }));
          }
        }
      }
    } catch (e) {
      console.error('Error getting current plan tasks:', e);
    }
    // Fallback to INITIAL_TASKS if plan not found
    return INITIAL_TASKS.map(t => ({...t}));
  }, []);

  const resetChallenge = () => {
    if (confirm("¿Estás seguro? Esto reiniciará tu progreso al Día 1.")) {
      const todayStr = getArgentinaDateString();
      const currentPlanTasks = getTasksForCurrentPlan();
      
      setState({
        currentDay: 1,
        startDate: todayStr,
        history: [{ dateString: todayStr, tasks: currentPlanTasks }],
        lastVisitedDate: todayStr
      });
      
      // Clear shown notifications when resetting challenge
      achievements.clearShownNotifications();
    }
  };

  const handleSelectPlan = (plan: any) => {
    console.log('Plan seleccionado:', plan);
    
    // Apply same effect as resetChallenge
    if (confirm(`¿Estás seguro? Esto reiniciará tu progreso al Día 1 y activará el plan "${plan.name}".`)) {
      const todayStr = getArgentinaDateString();

      const mapTaskType = (taskId: string) => {
        if (taskId.includes('workout') || taskId.includes('exercise')) return 'exercise';
        if (taskId.includes('water')) return 'water';
        if (taskId.includes('read') || taskId.includes('reading')) return 'reading';
        if (taskId.includes('photo') || taskId.includes('progress')) return 'progress';
        if (taskId.includes('diet')) return 'diet';
        return undefined;
      };

      const newTasks = plan.tasks.map((t: any) => ({
        id: t.id,
        label: t.label,
        description: t.description,
        completed: false,
        icon: t.icon || 'target',
        type: mapTaskType(t.id)
      }));

      // Save custom tasks to localStorage if it's a custom plan
      if (plan.id === 'custom') {
        try {
          // Save the selected tasks (filtered from all custom definitions)
          localStorage.setItem('75hard_custom_tasks', JSON.stringify(newTasks));
          console.log('Custom tasks saved:', newTasks);
          
          // Also save the selected task IDs and definitions for future filtering
          const selectedTaskIds = newTasks.map(t => t.id);
          localStorage.setItem('75hard_selected_custom_tasks', JSON.stringify(selectedTaskIds));
          
          // Save all custom task definitions (including unselected ones)
          // This allows users to modify their selection later
          const allCustomDefinitions = plan.tasks.map((t: any) => ({
            id: t.id,
            label: t.label,
            description: t.description,
            icon: t.icon || 'target'
          }));
          localStorage.setItem('75hard_custom_task_definitions', JSON.stringify(allCustomDefinitions));
          
          console.log('Selected task IDs saved:', selectedTaskIds);
          console.log('All custom definitions saved:', allCustomDefinitions);
        } catch (e) {
          console.error('Error saving custom tasks:', e);
        }
      }

      // Reset state completely (same as resetChallenge)
      setState({
        currentDay: 1,
        startDate: todayStr,
        history: [{ dateString: todayStr, tasks: newTasks }],
        lastVisitedDate: todayStr
      });

      // Save to localStorage
      const newState = {
        currentDay: 1,
        startDate: todayStr,
        history: [{ dateString: todayStr, tasks: newTasks }],
        lastVisitedDate: todayStr
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));

      // Clear shown notifications when changing plan
      achievements.clearShownNotifications();

      // persist active plan id and update header
      try {
        const planId = plan?.id || 'custom';
        setActivePlanId(planId);
        localStorage.setItem(SELECTED_PLAN_KEY, JSON.stringify({ id: planId }));
      } catch (e) {
        // ignore
      }
    }
  };

  const todayData = useMemo(() => 
    state.history.find(h => h.dateString === state.lastVisitedDate),
    [state.history, state.lastVisitedDate]
  );

  const currentTasks = todayData?.tasks || INITIAL_TASKS;
  const completedCount = currentTasks.filter(t => t.completed).length;
  const totalCount = currentTasks.length;
  const dailyProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // If there are many tasks, allow the TaskList to scroll vertically
  const TASKS_SCROLL_THRESHOLD = 6;
  const shouldScrollTasks = currentTasks.length > TASKS_SCROLL_THRESHOLD;
  
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
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
            <Icon name="flame" className={`w-4 h-4 sm:w-5 sm:h-5 fill-current transition-colors duration-300 ${
              theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
            }`} />
            <h1 className={`text-sm sm:text-lg font-oswald font-bold tracking-tight italic transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="mr-1 sm:mr-2">75 DAYS</span>
              <span className={`${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'} font-oswald font-bold uppercase text-xs sm:text-sm`}>
                {activePlanId ? activePlanId.toUpperCase() : 'HARD'}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="hidden lg:block">
                <Timer theme={theme} />
             </div>
             {/* Debug Button - Plan Selector */}
             <button
               onClick={() => setIsPlanSelectorOpen(true)}
               className={`px-3 py-2 sm:px-3 sm:py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                 theme === 'dark'
                   ? 'bg-pink-600/20 text-pink-300 hover:bg-pink-600/30 border border-pink-500/30'
                   : 'bg-pink-100 text-pink-600 hover:bg-pink-200 border border-pink-300'
               }`}
               title="Planes"
             >
               <Icon name="target" className="w-4 h-4 sm:w-4 sm:h-4" />
               <span className="hidden sm:inline ml-1">Planes</span>
             </button>
             
             {/* Achievements Button */}
             <button
               onClick={() => setIsAchievementsOpen(true)}
               className={`px-3 py-2 sm:px-3 sm:py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                 theme === 'dark'
                   ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30'
                   : 'bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-300'
               }`}
               title="Logros"
             >
               <Icon name="trophy" className="w-4 h-4 sm:w-4 sm:h-4" />
               <span className="hidden sm:inline ml-1">Logros</span>
             </button>
             {/* Profile Button */}
             <button
               onClick={() => setIsProfileOpen(true)}
               title="Ver Perfil"
               className={`px-3 py-2 sm:px-3 sm:py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                 theme === 'dark'
                   ? 'bg-slate-800/20 text-slate-200 hover:bg-slate-800/30 border border-slate-700/30'
                   : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
               }`}
             >
               <Icon name="user" className="w-4 h-4 sm:w-4 sm:h-4" />
               <span className="hidden sm:inline ml-1">Perfil</span>
             </button>

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
             
             <div className={`${shouldScrollTasks ? 'max-h-[50vh] overflow-y-auto pr-2' : ''}`}>
               <div className="grid gap-3">
                 {currentTasks.map(task => (
                   <TaskItem key={task.id} task={task} onToggle={toggleTask} theme={theme} />
                 ))}
               </div>
             </div>
          </section>

        </div>

        {/* Modal para día seleccionado */}
        {isModalOpen && selectedModalDate && (
          <DayModal
            theme={theme}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            date={selectedModalDate}
            dailyLog={moduleC.getDailyLog(selectedModalDate)}
            onSave={moduleC.saveDailyLog}
            photos={moduleC.getPhotosForDate(selectedModalDate)}
            onPhotoUpload={moduleC.uploadPhoto}
            onPhotoDelete={moduleC.deletePhoto}
          />
        )}

        {/* Plan Selector Modal */}
        <PlanSelector
          theme={theme}
          isOpen={isPlanSelectorOpen}
          onClose={() => setIsPlanSelectorOpen(false)}
          onSelectPlan={handleSelectPlan}
        />

        {/* Achievements Modal */}
        <Achievements
          theme={theme}
          isOpen={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
          userProgress={{
            currentDay: state.currentDay,
            currentStreak: calculateCurrentStreak(),
            totalDaysCompleted: state.history.filter(h => 
              h.tasks.some(t => t.completed)
            ).length,
            perfectDays: state.history.filter(h => 
              h.tasks.every(t => t.completed)
            ).length,
            achievements: [] // TODO: Load from localStorage
          }}
        />

        {/* Profile Modal (renders Profile inside a centered modal card) */}
        {isProfileOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)} />
            <div className="relative w-full max-w-4xl h-[90vh] max-h-[90vh] overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-300">
              <Profile isModal theme={theme} onClose={() => setIsProfileOpen(false)} />
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
    
    {/* Achievement Notifications */}
    <achievements.AchievementNotificationComponent />
    </div>
    
  );
};

export default App;
