import React, { useState } from 'react';
import { Target, Activity, Flame, Utensils, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CHALLENGE_PLANS } from '../PlanSelector';
import { Icon } from '../Icons';

interface OnboardingFlowProps {
    theme?: 'dark' | 'light';
    onComplete: () => void;
    onSelectPlan?: (plan: any) => void;
}

const OPTIONAL_ACTIVITIES = [
    { id: 'cardio', title: 'Cardio Intenso', description: 'Rutina de 45 mins', icon: <Activity size={24} /> },
    { id: 'dieta', title: 'Dieta Estricta', description: 'Sin azúcares ni alcohol', icon: <Utensils size={24} /> },
    { id: 'lectura', title: 'Lectura Diaria', description: '10 páginas de no ficción', icon: <BookOpen size={24} /> },
    { id: 'meditacion', title: 'Meditación', description: '15 mins de mindfulness', icon: <Flame size={24} /> },
];

export default function OnboardingFlow({ theme = 'dark', onComplete, onSelectPlan }: OnboardingFlowProps) {
    const { updateProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [error, setError] = useState('');
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [customTasks, setCustomTasks] = useState<string[]>([]);
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [customTaskDefinitions, setCustomTaskDefinitions] = useState([
        { id: 'custom-diet', label: 'Dieta Personalizada', description: 'Define tus propias reglas alimenticias', icon: 'utensils' },
        { id: 'custom-workout', label: 'Ejercicio Personalizado', description: 'Establece tu rutina de entrenamiento', icon: 'dumbbell' },
        { id: 'custom-water', label: 'Hidratación Personalizada', description: 'Define tu meta de consumo de agua', icon: 'droplet' },
        { id: 'custom-reading', label: 'Lectura Personalizada', description: 'Establece tu meta de lectura', icon: 'book-open' },
        { id: 'custom-meditation', label: 'Meditación', description: 'Práctica de mindfulness o meditación', icon: 'heart' },
        { id: 'custom-sleep', label: 'Descanso', description: 'Controla tus horas de sueño', icon: 'moon' }
    ]);

    const availableIcons = ['utensils', 'dumbbell', 'droplet', 'book-open', 'heart', 'moon', 'star', 'target', 'zap', 'shield'];

    // Load selected tasks from localStorage on mount
    React.useEffect(() => {
        try {
            const savedSelectedTasks = localStorage.getItem('75hard_selected_custom_tasks');
            if (savedSelectedTasks) {
                const selectedTasks = JSON.parse(savedSelectedTasks);
                setCustomTasks(selectedTasks);
            }

            const savedCustomDefinitions = localStorage.getItem('75hard_custom_task_definitions');
            if (savedCustomDefinitions) {
                const definitions = JSON.parse(savedCustomDefinitions);
                setCustomTaskDefinitions(definitions);
            }
        } catch (e) {
            console.error('Error loading custom tasks state:', e);
        }
    }, []);

    // Save selected tasks to localStorage when they change
    React.useEffect(() => {
        try {
            localStorage.setItem('75hard_selected_custom_tasks', JSON.stringify(customTasks));
            localStorage.setItem('75hard_custom_task_definitions', JSON.stringify(customTaskDefinitions));
        } catch (e) {
            console.error('Error saving custom tasks state:', e);
        }
    }, [customTasks, customTaskDefinitions]);

    // Handle Enter key to confirm editing
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && editingTask) {
                event.preventDefault();
                setEditingTask(null);
            }
        };

        if (editingTask) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editingTask]);

    const toggleCustomTask = (taskId: string) => {
        setCustomTasks(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const updateTaskDefinition = (taskId: string, field: 'label' | 'description', value: string) => {
        setCustomTaskDefinitions(prev =>
            prev.map(task =>
                task.id === taskId ? { ...task, [field]: value } : task
            )
        );
    };

    const deleteCustomTask = (taskId: string) => {
        setCustomTaskDefinitions(prev => prev.filter(task => task.id !== taskId));
        setCustomTasks(prev => prev.filter(id => id !== taskId));
    };

    const addNewCustomTask = () => {
        const newTask = {
            id: `custom-${Date.now()}`,
            label: 'Nueva Tarea',
            description: 'Describe tu nueva tarea personalizada',
            icon: 'star'
        };
        setCustomTaskDefinitions(prev => [...prev, newTask]);
        setCustomTasks(prev => [...prev, newTask.id]);
        setEditingTask(newTask.id);
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (!height || !weight) {
                setError('Por favor, ingresa tu altura y peso para continuar.');
                return;
            }

            const numHeight = parseFloat(height);
            const numWeight = parseFloat(weight);

            if (isNaN(numHeight) || numHeight <= 0 || numHeight > 300) {
                setError('Por favor, ingresa una altura válida en cm.');
                return;
            }
            if (isNaN(numWeight) || numWeight <= 0 || numWeight > 500) {
                setError('Por favor, ingresa un peso válido en kg.');
                return;
            }

            setError('');
            setStep(2);
        }
    };

    const handleComplete = () => {
        // Save onboarding data to profile
        updateProfile({
            height: parseFloat(height),
            weight: parseFloat(weight),
            onboardingCompleted: true,
            // We could save selectedActivities to the profile as well if the UserData interface supported it, 
            // but for now the main requirement is the boolean flag and required metrics.
        });
        onComplete();
        if (selectedPlanId && onSelectPlan) {
            const plan = CHALLENGE_PLANS.find(p => p.id === selectedPlanId);
            if (plan) {
                if (plan.id === 'custom') {
                    // Inject custom configured tasks
                    const customPlan = {
                        ...plan,
                        tasks: customTaskDefinitions.filter(task => customTasks.includes(task.id))
                    };
                    onSelectPlan(customPlan);
                } else {
                    onSelectPlan(plan);
                }
            }
        }
    };

    const toggleActivity = (id: string) => {
        setSelectedActivities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const inputClass = `w-full p-4 rounded-xl border text-lg transition-all focus:ring-2 focus:ring-opacity-50 outline-none ${theme === 'dark'
        ? 'bg-gray-800/80 border-gray-700 text-white focus:border-pink-500 focus:ring-pink-500/20'
        : 'bg-white border-pink-200 text-gray-900 focus:border-pink-500 focus:ring-pink-500/20'
        }`;

    return (
        <div className={`w-full max-w-2xl mx-auto p-4 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl border ${theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900/90 to-black/95 border-gray-800'
            : 'bg-gradient-to-br from-pink-50/95 to-white border-pink-100'
            }`}>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Paso {step} de 3
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`}>
                        {step === 1 ? 'Métricas Base' : step === 2 ? 'Actividades Extra' : 'Tu Desafío'}
                    </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-pink-100'}`}>
                    <div
                        className="h-full bg-gradient-to-r from-pink-600 to-pink-400 transition-all duration-500"
                        style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
                    />
                </div>
            </div>

            {step === 1 ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-10">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg ${theme === 'dark' ? 'bg-pink-900/30 shadow-pink-900/20 text-pink-400' : 'bg-pink-100 shadow-pink-200/50 text-pink-600'
                            }`}>
                            <Target size={32} />
                        </div>
                        <h2 className={`text-3xl sm:text-4xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Establece tu Base
                        </h2>
                        <p className={`text-lg max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Para registrar tu progreso en el desafío 75 Hard, necesitamos tus métricas iniciales.
                        </p>
                    </div>

                    <div className="space-y-6 max-w-md mx-auto">
                        {error && (
                            <div className="flex items-center gap-2 p-4 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <AlertCircle size={20} />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <div className={`p-4 sm:p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${theme === 'dark' ? 'bg-pink-900/10 border-pink-600/20' : 'bg-pink-50/60 border-pink-200'}`}>
                            <div className="flex items-center gap-3">
                                <Activity className={`w-6 h-6 ${theme === 'dark' ? 'text-pink-500' : 'text-pink-600'}`} />
                                <div>
                                    <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-pink-200' : 'text-pink-800'}`}>
                                        Altura (cm) *
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>
                                        Selecciona tu altura
                                    </div>
                                </div>
                            </div>
                            <select
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className={`w-full sm:w-32 px-3 py-2 rounded-lg text-lg font-semibold outline-none focus:ring-2 focus:ring-pink-300 transition-all duration-150 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
                            >
                                <option value="">--</option>
                                {Array.from({ length: 250 - 120 + 1 }, (_, i) => 250 - i).map((h) => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                        </div>

                        <div className={`p-4 sm:p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${theme === 'dark' ? 'bg-pink-900/10 border-pink-600/20' : 'bg-pink-50/60 border-pink-200'}`}>
                            <div className="flex items-center gap-3">
                                <Icon name="dumbbell" className={`w-6 h-6 ${theme === 'dark' ? 'text-pink-500' : 'text-pink-600'}`} />
                                <div>
                                    <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-pink-200' : 'text-pink-800'}`}>
                                        Peso Inicial (kg) *
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>
                                        Selecciona kilos y décimas
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                                <select
                                    value={weight ? Math.floor(parseFloat(weight)).toString() : ''}
                                    onChange={(e) => {
                                        const kgVal = e.target.value;
                                        const kgNum = kgVal === '' ? 0 : parseInt(kgVal, 10);
                                        const decNum = weight && !isNaN(parseFloat(weight)) ? Math.round((parseFloat(weight) - Math.floor(parseFloat(weight))) * 10) : 0;
                                        if (kgVal === '' && decNum === 0) setWeight('');
                                        else setWeight((kgNum + decNum / 10).toString());
                                    }}
                                    className={`w-full sm:w-28 px-3 py-2 rounded-lg text-lg font-semibold outline-none focus:ring-2 focus:ring-pink-300 transition-all duration-150 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
                                >
                                    <option value="">--</option>
                                    {Array.from({ length: 210 - 40 + 1 }, (_, i) => 210 - i).map((w) => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                </select>

                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <span className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-pink-200' : 'text-pink-800'}`}>.</span>
                                    <select
                                        value={weight && !isNaN(parseFloat(weight)) ? Math.round((parseFloat(weight) - Math.floor(parseFloat(weight))) * 10).toString() : ''}
                                        onChange={(e) => {
                                            const decVal = e.target.value;
                                            const decNum = decVal === '' ? 0 : parseInt(decVal, 10);
                                            const kgNum = weight && !isNaN(parseFloat(weight)) ? Math.floor(parseFloat(weight)) : 0;
                                            if (decVal === '' && kgNum === 0) setWeight('');
                                            else setWeight((kgNum + decNum / 10).toString());
                                        }}
                                        className={`w-full sm:w-20 px-3 py-2 rounded-lg text-lg font-semibold outline-none focus:ring-2 focus:ring-pink-300 transition-all duration-150 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
                                    >
                                        <option value="">--</option>
                                        {Array.from({ length: 10 }, (_, i) => i).map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleNextStep}
                            className={`w-full py-4 mt-8 rounded-xl font-bold uppercase tracking-widest transition-transform active:scale-95 shadow-xl ${theme === 'dark'
                                ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:from-pink-500 hover:to-pink-400 shadow-pink-900/50'
                                : 'bg-gradient-to-r from-pink-500 to-pink-400 text-white hover:from-pink-600 hover:to-pink-500 shadow-pink-200'
                                }`}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            ) : step === 2 ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-8">
                        <h2 className={`text-3xl font-black mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Actividades Recientes
                        </h2>
                        <p className={`text-base max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            ¿Quieres unirte a alguna de estas actividades extra? (Opcional)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-10">
                        {OPTIONAL_ACTIVITIES.map((activity) => {
                            const isSelected = selectedActivities.includes(activity.id);
                            return (
                                <button
                                    key={activity.id}
                                    onClick={() => toggleActivity(activity.id)}
                                    className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                        ? theme === 'dark'
                                            ? 'bg-pink-900/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.1)] scale-[1.02]'
                                            : 'bg-pink-50 border-pink-500 shadow-md scale-[1.02]'
                                        : theme === 'dark'
                                            ? 'bg-gray-800/40 border-gray-700 hover:border-gray-500'
                                            : 'bg-white border-pink-100 hover:border-pink-300 shadow-sm'
                                        }`}
                                >
                                    <div className={`mb-4 p-3 rounded-full ${isSelected
                                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40'
                                        : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-pink-50 text-pink-400'
                                        }`}>
                                        {activity.icon}
                                    </div>
                                    <h3 className={`font-bold text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activity.title}</h3>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{activity.description}</p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-4 max-w-md mx-auto">
                        <button
                            onClick={() => setStep(1)}
                            className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest transition-colors ${theme === 'dark'
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                }`}
                        >
                            Atrás
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            className={`flex-[2] py-4 rounded-xl font-bold uppercase tracking-widest transition-transform active:scale-95 shadow-xl ${theme === 'dark'
                                ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:from-pink-500 hover:to-pink-400 shadow-pink-900/50'
                                : 'bg-gradient-to-r from-pink-500 to-pink-400 text-white hover:from-pink-600 hover:to-pink-500 shadow-pink-200'
                                }`}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-8">
                        <h2 className={`text-3xl font-black mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Elige tu Desafío
                        </h2>
                        <p className={`text-base max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Activa el plan con el que deseas comenzar tu viaje.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10 h-64 overflow-y-auto scrollbar-thin pr-2">
                        {CHALLENGE_PLANS.map((plan) => {
                            const isSelected = selectedPlanId === plan.id;
                            return (
                                <button
                                    key={plan.id}
                                    onClick={() => {
                                        setSelectedPlanId(plan.id);
                                        if (plan.id === 'custom') {
                                            setIsCustomizing(true);
                                        } else {
                                            setIsCustomizing(false);
                                        }
                                    }}
                                    className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                        ? theme === 'dark'
                                            ? 'bg-pink-900/40 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)] scale-[1.02]'
                                            : 'bg-pink-50 border-pink-500 shadow-md scale-[1.02]'
                                        : theme === 'dark'
                                            ? 'bg-gray-800/40 border-gray-700 hover:border-gray-500'
                                            : 'bg-white border-pink-100 hover:border-pink-300 shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-pink-50'}`}>
                                            <Icon name="target" className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-500'}`} />
                                        </div>
                                        <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                                    </div>
                                    <p className={`text-xs flex-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
                                </button>
                            );
                        })}
                    </div>

                    {selectedPlanId === 'custom' && isCustomizing && (
                        <div className="space-y-4 max-w-2xl mx-auto mb-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto scrollbar-thin pr-2">
                                {customTaskDefinitions.map((task) => (
                                    <div key={task.id} className="relative">
                                        <div
                                            onClick={() => toggleCustomTask(task.id)}
                                            className={`relative rounded-2xl border-2 p-3 sm:p-4 cursor-pointer transition-all duration-300 ${customTasks.includes(task.id)
                                                ? 'border-green-500 bg-green-500/10'
                                                : theme === 'dark'
                                                    ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                                                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                                                }`}
                                        >
                                            {/* Selection Indicator */}
                                            {customTasks.includes(task.id) && (
                                                <div className="absolute top-2 left-2">
                                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                        <Icon name="check" className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Task Content */}
                                            <div className="pr-0 sm:pr-8 pl-8">
                                                <div className="flex items-start gap-2">
                                                    <Icon
                                                        name={task.icon}
                                                        className={`w-4 h-4 mt-0.5 ${customTasks.includes(task.id)
                                                            ? 'text-green-500'
                                                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                            }`}
                                                    />
                                                    <div className="flex-1 text-left">
                                                        {editingTask === task.id ? (
                                                            <div className="space-y-1">
                                                                <input
                                                                    type="text"
                                                                    value={task.label}
                                                                    onChange={(e) => updateTaskDefinition(task.id, 'label', e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className={`w-full px-2 py-1 rounded text-sm font-medium border ${theme === 'dark'
                                                                        ? 'bg-gray-700 border-gray-600 text-white'
                                                                        : 'bg-white border-gray-300 text-gray-900'
                                                                        }`}
                                                                />
                                                                <textarea
                                                                    value={task.description}
                                                                    onChange={(e) => updateTaskDefinition(task.id, 'description', e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    rows={2}
                                                                    className={`w-full px-2 py-1 rounded text-sm border resize-none ${theme === 'dark'
                                                                        ? 'bg-gray-700 border-gray-600 text-white'
                                                                        : 'bg-white border-gray-300 text-gray-900'
                                                                        }`}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <select
                                                                        value={task.icon}
                                                                        onChange={(e) => {
                                                                            const updatedTask = { ...task, icon: e.target.value };
                                                                            setCustomTaskDefinitions(prev =>
                                                                                prev.map(t => t.id === task.id ? updatedTask : t)
                                                                            );
                                                                        }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className={`flex-1 px-2 py-1 rounded text-xs border ${theme === 'dark'
                                                                            ? 'bg-gray-700 border-gray-600 text-white'
                                                                            : 'bg-white border-gray-300 text-gray-900'
                                                                            }`}
                                                                    >
                                                                        {availableIcons.map(icon => (
                                                                            <option key={icon} value={icon}>{icon}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingTask(null);
                                                                    }}
                                                                    className={`w-full px-3 py-1 mt-1 rounded text-xs font-medium transition-all duration-200 ${theme === 'dark'
                                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                                        : 'bg-green-500 text-white hover:bg-green-600'
                                                                        }`}
                                                                >
                                                                    Confirmar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                                    {task.label}
                                                                </p>
                                                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                    {task.description}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingTask(editingTask === task.id ? null : task.id);
                                                }}
                                                className={`p-1.5 rounded-lg transition-all duration-200 transform hover:scale-110 ${editingTask === task.id
                                                    ? 'bg-blue-500 text-white shadow-lg'
                                                    : theme === 'dark'
                                                        ? 'hover:bg-blue-600/20 text-gray-400 hover:text-blue-400'
                                                        : 'hover:bg-blue-100 text-gray-500 hover:text-blue-600'
                                                    }`}
                                                title="Editar tarea"
                                            >
                                                <Icon name="edit-3" className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteCustomTask(task.id);
                                                }}
                                                className={`p-1.5 rounded-lg transition-all duration-200 transform hover:scale-110 ${theme === 'dark'
                                                    ? 'hover:bg-red-600/20 text-gray-400 hover:text-red-400'
                                                    : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                                                    }`}
                                                title="Eliminar tarea"
                                            >
                                                <Icon name="trash-2" className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div
                                    onClick={() => addNewCustomTask()}
                                    className={`relative rounded-2xl border-2 border-dashed p-3 sm:p-4 cursor-pointer transition-all duration-300 ${theme === 'dark'
                                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30 hover:bg-gray-800/50'
                                        : 'border-gray-300 hover:border-gray-400 bg-gray-50/30 hover:bg-gray-50/50'
                                        }`}
                                >
                                    <div className="flex flex-col items-center justify-center h-full min-h-[80px]">
                                        <Icon name="plus" className={`w-6 h-6 mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Agregar Tarea
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 max-w-md mx-auto">
                        <button
                            onClick={() => setStep(2)}
                            className={`flex-[1] py-4 rounded-xl font-bold uppercase tracking-widest transition-colors ${theme === 'dark'
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                }`}
                        >
                            Atrás
                        </button>
                        <button
                            onClick={handleComplete}
                            disabled={!selectedPlanId || (selectedPlanId === 'custom' && customTasks.length === 0)}
                            className={`flex-[2] py-4 rounded-xl font-bold uppercase tracking-widest transition-transform shadow-xl ${(!selectedPlanId || (selectedPlanId === 'custom' && customTasks.length === 0))
                                ? theme === 'dark' ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : theme === 'dark'
                                    ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:from-pink-500 hover:to-pink-400 shadow-pink-900/50 active:scale-95'
                                    : 'bg-gradient-to-r from-pink-500 to-pink-400 text-white hover:from-pink-600 hover:to-pink-500 shadow-pink-200 active:scale-95'
                                }`}
                        >
                            Comenzar Reto
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
