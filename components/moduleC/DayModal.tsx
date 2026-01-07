import React, { useState, useRef } from 'react';
import type { DailyLog, ProgressPhoto } from '../../types/moduleC';
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

  // Simplified modal: only notes textarea + photos
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(logData);
    onClose();
  };

  const compressImage = async (file: File, quality: number = 0.7): Promise<{ compressed: Blob; originalSize: number; compressedSize: number }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        let { width, height } = img;
        const maxSize = 1200;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve({
              compressed: blob!,
              originalSize: file.size,
              compressedSize: blob!.size
            });
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const createThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Create 200x200 thumbnail
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        
        // Calculate crop dimensions for square thumbnail
        const { width, height } = img;
        const cropSize = Math.min(width, height);
        const x = (width - cropSize) / 2;
        const y = (height - cropSize) / 2;
        
        ctx.drawImage(img, x, y, cropSize, cropSize, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 50);

        // Compress image
        const { compressed, originalSize, compressedSize } = await compressImage(file, 0.7);
        setUploadProgress((i / files.length) * 50 + 25);

        // Create thumbnail
        const thumbnailUrl = await createThumbnail(file);
        setUploadProgress((i / files.length) * 50 + 50);

        // Create object URL for the compressed image
        const url = URL.createObjectURL(compressed);
        setUploadProgress((i / files.length) * 50 + 75);

        // Create photo object
        const photo: ProgressPhoto = {
          id: `${Date.now()}-${i}`,
          date,
          url,
          thumbnailUrl,
          originalSize,
          compressedSize,
          uploadedAt: new Date().toISOString()
        };

        onPhotoUpload(photo);
        setUploadProgress((i + 1) / files.length * 100);
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error al subir las fotos. Por favor intenta nuevamente.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

          {/* Content: simplified to notes + photo upload/gallery */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-3">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Icon name="edit" className="w-5 h-5 text-pink-500" />
                📝 Notas del Día
              </h3>

              <textarea
                placeholder="Escribe tus notas del día..."
                value={logData.notes}
                onChange={(e) => {
                  setLogData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }));
                }}
                rows={6}
                className={`w-full px-4 py-3 rounded-xl border text-sm resize-none ${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 border-gray-600 text-white' 
                    : 'bg-gray-50/50 border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Upload Area (reuse existing upload/gallery UI) */}
            <div>
              <div className={`mb-6 p-6 border-2 border-dashed rounded-xl ${
                theme === 'dark' 
                  ? 'border-pink-600/50 bg-pink-950/20' 
                  : 'border-pink-300/50 bg-pink-50/20'
              }`}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploading}
                />

                <label
                  htmlFor="photo-upload"
                  className={`flex flex-col items-center justify-center cursor-pointer p-8 rounded-xl transition-all duration-300 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                  }`}
                >
                  <Icon name="upload" className="w-12 h-12 text-pink-500 mb-4" />
                  <span className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {uploading ? 'Subiendo fotos...' : 'Subir Fotos de Progreso'}
                  </span>
                  <span className={`text-sm mt-2 ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>
                    PNG, JPG hasta 10MB (se comprimirán automáticamente)
                  </span>
                </label>

                {/* Progress Bar */}
                {uploading && (
                  <div className="mt-4">
                    <div className={`w-full h-3 rounded-full ${theme === 'dark' ? 'bg-pink-950' : 'bg-pink-100'}`}>
                      <div 
                        className="h-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className={`text-sm mt-2 text-center ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>
                      {uploadProgress.toFixed(0)}% completado
                    </p>
                  </div>
                )}
              </div>

              {/* Photos Gallery */}
              {photos.length > 0 && (
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Icon name="camera" className="w-5 h-5 text-pink-500" />
                    Galería de Fotos ({photos.length})
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`relative group rounded-xl overflow-hidden border transition-all duration-300 ${
                          theme === 'dark' ? 'border-pink-600/30' : 'border-pink-300/50'
                        }`}
                      >
                        <img
                          src={photo.thumbnailUrl}
                          alt={`Progreso ${photo.date}`}
                          className="w-full h-32 object-cover"
                        />
                        
                        {/* Overlay with actions */}
                        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100`}>
                          <button
                            onClick={() => window.open(photo.url, '_blank')}
                            className="p-2 bg-white rounded-full mr-2 hover:bg-pink-100 transition-colors"
                            title="Ver foto completa"
                          >
                            <Icon name="eye" className="w-4 h-4 text-gray-800" />
                          </button>
                          
                          <button
                            onClick={() => onPhotoDelete(photo.id)}
                            className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                            title="Eliminar foto"
                          >
                            <Icon name="trash" className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        
                        {/* Compression info */}
                        <div className={`absolute bottom-0 left-0 right-0 p-2 text-xs ${
                          theme === 'dark' ? 'bg-pink-950/90' : 'bg-pink-50/90'
                        }`}>
                          <div className={theme === 'dark' ? 'text-pink-300' : 'text-pink-700'}>
                            {formatFileSize(photo.compressedSize)}
                            {photo.originalSize !== photo.compressedSize && (
                              <span className="text-green-500 ml-1">
                                (-{Math.round((1 - photo.compressedSize / photo.originalSize) * 100)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {photos.length === 0 && !uploading && (
                <div className="text-center py-12">
                  <Icon name="camera" className="w-16 h-16 text-pink-500 mx-auto mb-4 opacity-50" />
                  <p className={`text-lg ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>
                    No hay fotos de progreso para este día
                  </p>
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-500'}`}>
                    Sube tu primera foto para comenzar a documentar tu progreso
                  </p>
                </div>
              )}
            </div>
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
