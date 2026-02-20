import React, { useState, useEffect } from 'react';
import type { DailyLog } from '../../types/moduleC';
import { INITIAL_TASKS } from '../../types';
import { Icon } from '../Icons';

interface DailyLogProps {
  theme: 'dark' | 'light';
  date: string;
  tasks: typeof INITIAL_TASKS;
  onSave: (log: DailyLog) => void;
  existingLog?: DailyLog;
}

const DailyLog: React.FC<DailyLogProps> = ({
  theme,
  date,
  tasks,
  onSave,
  existingLog
}) => {
  const [logData, setLogData] = useState<DailyLog>(() => {
    if (existingLog) {
      return existingLog;
    }

    return {
      date,
      tasks: tasks.reduce((acc, task) => {
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

  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleSave = () => {
    onSave(logData);
    setIsExpanded(false);
  };

  const isPastDate = new Date(date) < new Date(new Date().toDateString());

  return (
    <div className={`w-full p-4 rounded-lg border ${
      theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Daily Log - {new Date(date).toLocaleDateString('es-AR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          {isPastDate && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              theme === 'dark' ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
            }`}>
              Día pasado
            </span>
          )}
        </div>
        
        <Icon 
          name={isExpanded ? 'chevronUp' : 'chevronDown'} 
          className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
        />
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Tasks */}
          <div className="space-y-3">
            <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Tareas del Día
            </h4>
            
            {tasks.map(task => (
              <div key={task.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <task.icon className="w-5 h-5 text-pink-500" />
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {task.title}
                  </span>
                </div>
                
                {renderTaskInput(task)}
                
                {/* Task notes */}
                <textarea
                  placeholder={`Notas sobre ${task.title.toLowerCase()}...`}
                  value={logData.tasks[task.id]?.notes || ''}
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
                  className={`w-full px-3 py-2 rounded border text-sm resize-none ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Journaling */}
          <div className="space-y-2">
            <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              📝 Journaling del Día
            </h4>
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
              className={`w-full px-3 py-2 rounded border text-sm resize-none ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
            >
              Guardar Daily Log
            </button>
            
            <button
              onClick={() => setIsExpanded(false)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLog;
