import React, { useState, useRef } from 'react';
import type { ProgressPhoto } from '../../types/moduleC';
import { Icon } from '../Icons';

interface EvidenceVaultProps {
  theme: 'dark' | 'light';
  date: string;
  photos: ProgressPhoto[];
  onPhotoUpload: (photo: ProgressPhoto) => void;
  onPhotoDelete: (photoId: string) => void;
}

const EvidenceVault: React.FC<EvidenceVaultProps> = ({
  theme,
  date,
  photos,
  onPhotoUpload,
  onPhotoDelete
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className={`w-full p-4 rounded-lg border ${
      theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="camera" className="w-5 h-5 text-pink-500" />
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Evidence Vault - {new Date(date).toLocaleDateString('es-AR')}
          </h3>
        </div>
        
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {photos.length} foto{photos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Upload Area */}
      <div className={`mb-4 p-4 border-2 border-dashed rounded-lg ${
        theme === 'dark' 
          ? 'border-gray-600 bg-gray-800' 
          : 'border-gray-300 bg-gray-50'
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
          className={`flex flex-col items-center justify-center cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
          }`}
        >
          <Icon name="upload" className="w-8 h-8 text-pink-500 mb-2" />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {uploading ? 'Subiendo fotos...' : 'Click para subir fotos'}
          </span>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            PNG, JPG hasta 10MB (se comprimirán automáticamente)
          </span>
        </label>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4">
            <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-2 rounded-full bg-pink-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {uploadProgress.toFixed(0)}% completado
            </p>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative group rounded-lg overflow-hidden border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <img
                src={photo.thumbnailUrl}
                alt={`Progreso ${photo.date}`}
                className="w-full h-32 object-cover"
              />
              
              {/* Overlay with actions */}
              <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100`}>
                <button
                  onClick={() => window.open(photo.url, '_blank')}
                  className="p-2 bg-white rounded-full mr-2 hover:bg-gray-100 transition-colors"
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
                theme === 'dark' ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'
              }`}>
                <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
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
      )}

      {/* Storage Info */}
      <div className={`mt-4 p-3 rounded-lg text-xs ${
        theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon name="info" className="w-3 h-3" />
          <span className="font-medium">Información de almacenamiento:</span>
        </div>
        <div>
          Total: {formatFileSize(photos.reduce((acc, photo) => acc + photo.compressedSize, 0))}
          {photos.length > 0 && (
            <span className="ml-2">
              (Original: {formatFileSize(photos.reduce((acc, photo) => acc + photo.originalSize, 0))})
            </span>
          )}
        </div>
        <div className="mt-1">
          Las fotos se comprimen automáticamente para ahorrar espacio. Las fotos originales no se almacenan.
        </div>
      </div>
    </div>
  );
};

export default EvidenceVault;
