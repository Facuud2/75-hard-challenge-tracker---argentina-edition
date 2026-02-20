import { useEffect, useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';


export default function InstallPWA() {
  const { isInstallable, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    // Mostrar después de 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(isInstallable);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isInstallable]);
  if (!isVisible) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs z-50 border border-pink-500/20">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
        ¿Instalar 75 Days HARD?
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Instala esta aplicación en tu dispositivo para un mejor acceso.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => {
            install();
            setIsVisible(false);
          }}
          className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}

