import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

interface ChallengePlan {
  id: 'soft' | 'medium' | 'hard' | 'custom';
  name: string;
  description: string;
  duration: number;
  tasks: {
    id: string;
    label: string;
    description: string;
    icon: string;
  }[];
  color: string;
}

interface PlanSelectorProps {
  theme: 'dark' | 'light';
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: ChallengePlan) => void;
}

const CHALLENGE_PLANS: ChallengePlan[] = [
  {
    id: 'soft',
    name: 'Soft Challenge',
    description: 'Versión suave para principiantes o recuperación',
    duration: 30,
    tasks: [
      { id: 'diet', label: 'Dieta Flexible', description: 'Comida saludable, 1 comida trampa por semana', icon: 'utensils' },
      { id: 'workout', label: 'Ejercicio Diario', description: '30 minutos de actividad física', icon: 'dumbbell' },
      { id: 'water', label: 'Hidratación', description: '2 litros de agua al día', icon: 'droplet' },
      { id: 'reading', label: 'Lectura', description: '5 páginas de un libro', icon: 'book-open' },
    ],
    color: 'blue'
  },
  {
    id: 'medium',
    name: 'Medium Challenge',
    description: 'Versión intermedia con desafíos balanceados',
    duration: 45,
    tasks: [
      { id: 'diet', label: 'Dieta Controlada', description: 'Sin comidas trampa, alcohol limitado', icon: 'utensils' },
      { id: 'workout-1', label: 'Primer Entrenamiento', description: '45 minutos de actividad física', icon: 'dumbbell' },
      { id: 'workout-2', label: 'Segundo Entrenamiento', description: '30 minutos al aire libre', icon: 'cloud-sun' },
      { id: 'water', label: 'Agua (2.5L)', description: '2.5 litros de agua al día', icon: 'droplet' },
      { id: 'reading', label: 'Lectura (10 págs)', description: '10 páginas de no ficción', icon: 'book-open' },
      { id: 'photo', label: 'Foto de Progreso', description: 'Foto cada 3 días', icon: 'camera' },
    ],
    color: 'purple'
  },
  {
    id: 'hard',
    name: 'Hard Challenge',
    description: 'El desafío completo 75 HARD original',
    duration: 75,
    tasks: [
      { id: 'diet', label: 'Dieta Estricta', description: 'Sin comidas trampa ni alcohol', icon: 'utensils' },
      { id: 'workout-1', label: 'Primer Entrenamiento', description: '45 minutos de actividad física', icon: 'dumbbell' },
      { id: 'workout-2', label: 'Segundo Entrenamiento', description: '45 minutos al aire libre (o 8000 pasos)', icon: 'cloud-sun' },
      { id: 'water', label: 'Agua (3.7L)', description: 'Un galón de agua al día', icon: 'droplet' },
      { id: 'reading', label: 'Lectura (10 págs)', description: '10 páginas de no ficción', icon: 'book-open' },
      { id: 'photo', label: 'Foto de Progreso', description: 'Foto diaria de progreso', icon: 'camera' },
    ],
    color: 'red'
  },
  {
    id: 'custom',
    name: 'Custom Challenge',
    description: 'Crea tu propio desafío personalizado',
    duration: 60,
    tasks: [
      { id: 'custom-diet', label: 'Dieta Personalizada', description: 'Define tus propias reglas alimenticias', icon: 'utensils' },
      { id: 'custom-workout', label: 'Ejercicio Personalizado', description: 'Establece tu rutina de entrenamiento', icon: 'dumbbell' },
      { id: 'custom-water', label: 'Hidratación Personalizada', description: 'Define tu meta de consumo de agua', icon: 'droplet' },
      { id: 'custom-reading', label: 'Lectura Personalizada', description: 'Establece tu meta de lectura', icon: 'book-open' },
      { id: 'custom-meditation', label: 'Meditación', description: 'Práctica de mindfulness o meditación', icon: 'heart' },
      { id: 'custom-sleep', label: 'Descanso', description: 'Controla tus horas de sueño', icon: 'moon' },
    ],
    color: 'green'
  }
];

const PlanSelector: React.FC<PlanSelectorProps> = ({ theme, isOpen, onClose, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<ChallengePlan | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customTasks, setCustomTasks] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [customTaskDefinitions, setCustomTaskDefinitions] = useState([
    { id: 'custom-diet', label: 'Dieta Personalizada', description: 'Define tus propias reglas alimenticias', icon: 'utensils' },
    { id: 'custom-workout', label: 'Ejercicio Personalizado', description: 'Establece tu rutina de entrenamiento', icon: 'dumbbell' },
    { id: 'custom-water', label: 'Hidratación Personalizada', description: 'Define tu meta de consumo de agua', icon: 'droplet' },
    { id: 'custom-reading', label: 'Lectura Personalizada', description: 'Establece tu meta de lectura', icon: 'book-open' },
    { id: 'custom-meditation', label: 'Meditación', description: 'Práctica de mindfulness o meditación', icon: 'heart' },
    { id: 'custom-sleep', label: 'Descanso', description: 'Controla tus horas de sueño', icon: 'moon' },
  ]);

  const availableIcons = ['utensils', 'dumbbell', 'droplet', 'book-open', 'heart', 'moon', 'star', 'target', 'zap', 'shield'];

  // Handle Enter key to confirm editing
  useEffect(() => {
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

  const handlePlanSelect = (plan: ChallengePlan) => {
    if (plan.id === 'custom') {
      setIsCustomizing(true);
      setSelectedPlan(plan);
    } else {
      setSelectedPlan(plan);
    }
  };

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

  const confirmCustomPlan = () => {
    if (selectedPlan && customTasks.length > 0) {
      const customPlan = {
        ...selectedPlan,
        tasks: customTaskDefinitions.filter(task => customTasks.includes(task.id))
      };
      onSelectPlan(customPlan);
      onClose();
    }
  };

  if (!isOpen) return null;

  const getPlanColor = (color: string) => {
    switch (color) {
      case 'blue':
        return theme === 'dark' 
          ? 'from-blue-900/80 to-blue-950/80 border-blue-500/40' 
          : 'from-blue-100/80 to-blue-50/80 border-blue-500/40';
      case 'purple':
        return theme === 'dark' 
          ? 'from-purple-900/80 to-purple-950/80 border-purple-500/40' 
          : 'from-purple-100/80 to-purple-50/80 border-purple-500/40';
      case 'red':
        return theme === 'dark' 
          ? 'from-red-900/80 to-red-950/80 border-red-500/40' 
          : 'from-red-100/80 to-red-50/80 border-red-500/40';
      case 'green':
        return theme === 'dark' 
          ? 'from-green-900/80 to-green-950/80 border-green-500/40' 
          : 'from-green-100/80 to-green-50/80 border-green-500/40';
      default:
        return theme === 'dark' 
          ? 'from-gray-900/80 to-gray-950/80 border-gray-500/40' 
          : 'from-gray-100/80 to-gray-50/80 border-gray-500/40';
    }
  };

  const getPlanTextColor = (color: string) => {
    switch (color) {
      case 'blue':
        return theme === 'dark' ? 'text-blue-300' : 'text-blue-800';
      case 'purple':
        return theme === 'dark' ? 'text-purple-300' : 'text-purple-800';
      case 'red':
        return theme === 'dark' ? 'text-red-300' : 'text-red-800';
      case 'green':
        return theme === 'dark' ? 'text-green-300' : 'text-green-800';
      default:
        return theme === 'dark' ? 'text-gray-300' : 'text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-pink-950/95 to-black/95 border-pink-500/20'
          : 'bg-gradient-to-br from-pink-50/95 to-white/95 border-pink-200'
      }`}>
        {/* Background Glow */}
        <div className={`absolute -top-40 -right-40 w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-opacity duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-pink-400/20 to-pink-600/10'
            : 'bg-gradient-to-br from-pink-200/15 to-pink-300/10'
        }`} />

        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-pink-500/20">
            <div className="flex items-center gap-3">
              <Icon name="target" className="w-6 h-6 text-pink-500" />
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Seleccionar Plan de Desafío
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className={`p-3 rounded-xl transition-all duration-300 ${
                theme === 'dark' 
                  ? 'hover:bg-pink-950/50 text-pink-300 hover:text-pink-200 border border-pink-500/20' 
                  : 'hover:bg-pink-100 text-pink-600 hover:text-pink-500 border border-pink-200'
              }`}
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 max-h-[calc(85vh-180px)] scrollbar-thin scrollbar-thumb-pink-500/20 scrollbar-track-transparent hover:scrollbar-thumb-pink-500/40">
            {!isCustomizing ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {CHALLENGE_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
                      selectedPlan?.id === plan.id 
                        ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-transparent scale-105' 
                        : 'hover:scale-102'
                    } ${getPlanColor(plan.color)}`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <div className="p-6 space-y-4">
                      {/* Plan Header */}
                      <div className="text-center">
                        <h3 className={`text-xl font-bold ${getPlanTextColor(plan.color)}`}>
                          {plan.name}
                        </h3>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {plan.description}
                        </p>
                        <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                          theme === 'dark' ? 'bg-black/30' : 'bg-white/30'
                        }`}>
                          <Icon name="calendar" className="w-3 h-3" />
                          {plan.duration} días
                        </div>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-2">
                        <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Tareas Diarias:
                        </h4>
                        <div className="space-y-2">
                          {plan.tasks.slice(0, 3).map((task) => (
                            <div key={task.id} className="flex items-start gap-2">
                              <Icon name={task.icon} className={`w-4 h-4 mt-0.5 ${getPlanTextColor(plan.color)}`} />
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {task.label}
                                </p>
                              </div>
                            </div>
                          ))}
                          {plan.tasks.length > 3 && (
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              +{plan.tasks.length - 3} más...
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {selectedPlan?.id === plan.id && (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                            <Icon name="check" className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Custom Task Selection View */
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Personaliza tu Desafío
                  </h3>
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Selecciona y edita las características que quieres incluir en tu plan personalizado
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {customTaskDefinitions.map((task) => (
                    <div key={task.id} className="relative">
                      {/* Task Card */}
                      <div
                        onClick={() => toggleCustomTask(task.id)}
                        className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300 ${
                          customTasks.includes(task.id)
                            ? 'border-green-500 bg-green-500/10'
                            : theme === 'dark'
                              ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                              : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                        }`}
                      >
                        {/* Selection Indicator */}
                        {customTasks.includes(task.id) && (
                          <div className="absolute top-3 left-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Icon name="check" className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Task Content */}
                        <div className="pr-20">
                          <div className="flex items-start gap-3">
                            <Icon 
                              name={task.icon} 
                              className={`w-5 h-5 mt-0.5 ${
                                customTasks.includes(task.id) 
                                  ? 'text-green-500' 
                                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`} 
                            />
                            <div className="flex-1">
                              {editingTask === task.id ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={task.label}
                                    onChange={(e) => updateTaskDefinition(task.id, 'label', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`w-full px-2 py-1 rounded text-sm font-medium border ${
                                      theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                  />
                                  <textarea
                                    value={task.description}
                                    onChange={(e) => updateTaskDefinition(task.id, 'description', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    rows={2}
                                    className={`w-full px-2 py-1 rounded text-sm border resize-none ${
                                      theme === 'dark'
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
                                      className={`flex-1 px-2 py-1 rounded text-xs border ${
                                        theme === 'dark'
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
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      theme === 'dark'
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                  >
                                    Confirmar Cambios
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {task.label}
                                  </p>
                                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {task.description}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Left side of card, completely outside */}
                      <div className="absolute -top-6 -left-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask(editingTask === task.id ? null : task.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                            editingTask === task.id
                              ? 'bg-blue-500 text-white shadow-lg'
                              : theme === 'dark'
                                ? 'hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 hover:shadow-md'
                                : 'hover:bg-blue-100 text-gray-500 hover:text-blue-600 hover:shadow-md'
                          }`}
                          title={editingTask === task.id ? "Guardando cambios..." : "Editar tarea"}
                        >
                          <Icon name="edit-3" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomTask(task.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                            theme === 'dark'
                              ? 'hover:bg-red-600/20 text-gray-400 hover:text-red-400 hover:shadow-md'
                              : 'hover:bg-red-50 text-gray-500 hover:text-red-600 hover:shadow-md'
                          }`}
                          title="Eliminar tarea"
                        >
                          <Icon name="trash-2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Task Button */}
                  <div
                    onClick={() => addNewCustomTask()}
                    className={`relative rounded-2xl border-2 border-dashed p-4 cursor-pointer transition-all duration-300 ${
                      theme === 'dark'
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30 hover:bg-gray-800/50'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50/30 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
                      <Icon name="plus" className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Agregar Nueva Tarea
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custom Plan Summary */}
                {customTasks.length > 0 && (
                  <div className={`p-4 rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-green-950/20 border-green-500/20' 
                      : 'bg-green-50/20 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                          Tu plan personalizado incluirá:
                        </p>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {customTasks.length} {customTasks.length === 1 ? 'tarea' : 'tareas'} seleccionadas
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        theme === 'dark' ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedPlan?.duration} días
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Selected Plan Details */}
            {selectedPlan && (
              <div className={`mt-6 p-6 rounded-2xl border ${
                theme === 'dark' 
                  ? 'bg-pink-950/30 border-pink-500/20' 
                  : 'bg-pink-50/30 border-pink-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Resumen del Plan Seleccionado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className={`block font-medium ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>
                      Duración
                    </span>
                    <span className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPlan.duration} días
                    </span>
                  </div>
                  <div>
                    <span className={`block font-medium ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>
                      Tareas Diarias
                    </span>
                    <span className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPlan.tasks.length} compromisos
                    </span>
                  </div>
                  <div>
                    <span className={`block font-medium ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>
                      Dificultad
                    </span>
                    <span className={`block capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPlan.id}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-6 border-t border-pink-500/20">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {!isCustomizing ? (
                selectedPlan ? `Plan seleccionado: ${selectedPlan.name}` : 'No hay plan seleccionado'
              ) : (
                customTasks.length > 0 
                  ? `${customTasks.length} ${customTasks.length === 1 ? 'tarea' : 'tareas'} seleccionadas`
                  : 'Selecciona al menos una tarea'
              )}
            </div>
            
            <div className="flex gap-3">
              {!isCustomizing ? (
                <>
                  <button
                    onClick={onClose}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={() => {
                      if (selectedPlan) {
                        onSelectPlan(selectedPlan);
                        onClose();
                      }
                    }}
                    disabled={!selectedPlan}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                      selectedPlan
                        ? 'bg-pink-600 text-white hover:bg-pink-700'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    Comenzar Desafío
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsCustomizing(false);
                      setSelectedPlan(null);
                      setCustomTasks([]);
                      setEditingTask(null);
                    }}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Atrás
                  </button>
                  
                  <button
                    onClick={confirmCustomPlan}
                    disabled={customTasks.length === 0}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                      customTasks.length > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    Confirmar Plan Personalizado
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelector;
