import { useState, useCallback } from 'react';
import type { ModuleCState, DailyLog, ProgressPhoto } from '../types/moduleC';
import { getArgentinaDateString } from '../utils/time';

const MODULE_C_STORAGE_KEY = '75hard_moduleC_state';

export const useModuleC = () => {
  const [state, setState] = useState<ModuleCState>(() => {
    const saved = localStorage.getItem(MODULE_C_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing ModuleC state:', e);
      }
    }

    return {
      calendar: {
        currentMonth: new Date(),
        selectedDate: null,
        days: [],
        view: 'month'
      },
      dailyLogs: {},
      evidenceVault: {
        photos: [],
        uploading: false,
        compressionQuality: 0.7
      }
    };
  });

  const saveState = useCallback((newState: ModuleCState) => {
    setState(newState);
    localStorage.setItem(MODULE_C_STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const selectDate = useCallback((date: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        calendar: {
          ...prev.calendar,
          selectedDate: prev.calendar.selectedDate === date ? null : date
        }
      };
      localStorage.setItem(MODULE_C_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const saveDailyLog = useCallback((log: DailyLog) => {
    setState(prev => {
      const newState = {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [log.date]: log
        }
      };
      localStorage.setItem(MODULE_C_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const uploadPhoto = useCallback((photo: ProgressPhoto) => {
    setState(prev => {
      const newState = {
        ...prev,
        evidenceVault: {
          ...prev.evidenceVault,
          photos: [...prev.evidenceVault.photos, photo]
        }
      };
      localStorage.setItem(MODULE_C_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const deletePhoto = useCallback((photoId: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        evidenceVault: {
          ...prev.evidenceVault,
          photos: prev.evidenceVault.photos.filter(p => p.id !== photoId)
        }
      };
      localStorage.setItem(MODULE_C_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const getDailyLog = useCallback((date: string) => {
    return state.dailyLogs[date];
  }, [state.dailyLogs]);

  const getPhotosForDate = useCallback((date: string) => {
    return state.evidenceVault.photos.filter(photo => photo.date === date);
  }, [state.evidenceVault.photos]);

  const getTodayLog = useCallback(() => {
    const today = getArgentinaDateString();
    return state.dailyLogs[today];
  }, [state.dailyLogs]);

  const getTodayPhotos = useCallback(() => {
    const today = getArgentinaDateString();
    return getPhotosForDate(today);
  }, [getPhotosForDate]);

  return {
    state,
    selectDate,
    saveDailyLog,
    uploadPhoto,
    deletePhoto,
    getDailyLog,
    getPhotosForDate,
    getTodayLog,
    getTodayPhotos,
    saveState
  };
};
