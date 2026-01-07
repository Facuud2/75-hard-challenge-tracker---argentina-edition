import React from 'react';
import type { DailyLog } from '../../types/moduleC';
import { INITIAL_TASKS } from '../../types';
import { Icon } from '../Icons';

interface DayModalProps {
  theme: 'dark' | 'light';
  isOpen: boolean;
  onClose: () => void;
  date: string;
  dailyLog?: DailyLog;
  onSave: (log: DailyLog) => void;
  photos: any[];
  onPhotoUpload: (photo: any) => void;
  onPhotoDelete: (photoId: string) => void;
}

const DayModal: React.FC<DayModalProps> = ({
  theme,
  isOpen,
  onClose,
  date,
  dailyLog,
  onSave,
  photos,
  onPhotoUpload,
  onPhotoDelete
}) => {
  const [logData, setLogData] = React.useState(() => {
    if (dailyLog) {
      return dailyLog;
    }

    return {
      date,
      tasks: INITIAL_TASKS.reduce((acc, task) => {
        acc[task.id] = {
          completed: false,
          value: '',
          notes: ''
        };
        return acc;
      }, {} as DailyLog['tasks']),
      notes: '',
      photos: []
    };
  });

  const [activeTab, setActiveTab] = React.useState<'tasks' | 'photos'>('tasks');

  const handleSave = () => {
    onSave(logData);
    onClose();
  };

  const renderTaskInput = (task: typeof INITIAL_TASKS[0]) => {
    const taskData = logData.tasks[task.id];

    switch (task.type) {
      case 'reading':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Páginas leídas"
              value={taskData.value || ''}
              onChange={(e) => {
                setLogData(prev => ({
                  ...prev,
                  tasks: {
                    ...prev.tasks,
                    [task.id]: {
                      ...prev.tasks[task.id],
                      value: parseInt(e.target.value) || 0
                    }
                  }
                }));
              }}
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
        );

      case 'exercise':
        return (
          <textarea
            placeholder="¿Qué ejercicio hiciste? (Ej: 45 min cardio + pesas)"
            value={taskData.value || ''}
            onChange={(e) => {
              setLogData(prev => ({
                ...prev,
                tasks: {
                  ...prev.tasks,
                  [task.id]: {
                    ...prev.tasks[task.id],
                    value: e.target.value
                  }
                }
              }));
            }}
            rows={2}
            className={`w-full px-3 py-2 rounded border text-sm resize-none ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        );

      case 'water':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="10"
              placeholder="0"
              value={taskData.value || ''}
              onChange={(e) => {
                setLogData(prev => ({
                  ...prev,
                  tasks: {
                    ...prev.tasks,
                    [task.id]: {
                      ...prev.tasks[task.id],
                      value: Math.min(10, Math.max(0, parseInt(e.target.value) || 0))
                    }
                  }
                }));
              }}
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
        );

      case 'diet':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={taskData.completed}
              onChange={(e) => {
                setLogData(prev => ({
                  ...prev,
                  tasks: {
                    ...prev.tasks,
                    [task.id]: {
                      ...prev.tasks[task.id],
                      completed: e.target.checked
                    }
                  }
                }));
              }}
              className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {taskData.completed ? '✓ Dieta cumplida' : 'No cumplí la dieta hoy'}
            </span>
          </div>
        );

      case 'progress':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={taskData.completed}
              onChange={(e) => {
                setLogData(prev => ({
                  ...prev,
                  tasks: {
                    ...prev.tasks,
                    [task.id]: {
                      ...prev.tasks[task.id],
                      completed: e.target.checked
                    }
                  }
                }));
              }}
              className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {taskData.completed ? '✓ Foto de progreso tomada' : 'Sin foto de progreso'}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-300 ${
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
              <Icon name="calendar" className="w-6 h-6 text-pink-500" />
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {new Date(date).toLocaleDateString('es-AR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
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

          {/* Tabs */}
          <div className="flex border-b border-pink-500/20">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
                activeTab === 'tasks'
                  ? theme === 'dark'
                    ? 'text-pink-300 border-pink-500 bg-pink-950/30'
                    : 'text-pink-600 border-pink-500 bg-pink-50'
                  : theme === 'dark'
                    ? 'text-gray-400 border-transparent hover:text-pink-300'
                    : 'text-gray-600 border-transparent hover:text-pink-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="checkSquare" className="w-4 h-4" />
                Tareas del Día
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
                activeTab === 'photos'
                  ? theme === 'dark'
                    ? 'text-pink-300 border-pink-500 bg-pink-950/30'
                    : 'text-pink-600 border-pink-500 bg-pink-50'
                  : theme === 'dark'
                    ? 'text-gray-400 border-transparent hover:text-pink-300'
                    : 'text-gray-600 border-transparent hover:text-pink-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="camera" className="w-4 h-4" />
                Fotos de Progreso
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'tasks' && (
              <div className="p-6 space-y-6">
                {/* Journaling */}
                <div className="space-y-3">
                  <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Icon name="edit" className="w-5 h-5 text-pink-500" />
                    📝 Journaling del Día
                  </h3>
                  <textarea
                    placeholder="¿Cómo te sentiste hoy? ¿Qué aprendiste? ¿Qué desafíos enfrentaste?"
                    value={logData.notes}
                    onChange={(e) => {
                      setLogData(prev => ({
                        ...prev,
                        notes: e.target.value
                      }));
                    }}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border text-sm resize-none ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 border-gray-600 text-white' 
                        : 'bg-gray-50/50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Tasks */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Tareas Detalladas
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
                      
                      {renderTaskInput(task)}
                      
                      <textarea
                        placeholder={`Notas sobre ${task.label.toLowerCase()}...`}
                        value={logData.tasks[task.id].notes || ''}
                        onChange={(e) => {
                          setLogData(prev => ({
                            ...prev,
                            tasks: {
                              ...prev.tasks,
                              [task.id]: {
                                ...prev.tasks[task.id],
                                notes: e.target.value
                              }
                            }
                          }));
                        }}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border text-sm resize-none mt-2 ${
                          theme === 'dark' 
                            ? 'bg-gray-800/30 border-gray-600 text-white' 
                            : 'bg-gray-50/30 border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="p-6">
                <div className="text-center py-12">
                  <Icon name="camera" className="w-16 h-16 text-pink-500 mx-auto mb-4 opacity-50" />
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Gestión de fotos próximamente
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-6 border-t border-pink-500/20">
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {photos.length} foto{photos.length !== 1 ? 's' : ''} guardada{photos.length !== 1 ? 's' : ''}
            </div>
            
            <div className="flex gap-3">
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
                onClick={handleSave}
                className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 font-medium"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayModal;
