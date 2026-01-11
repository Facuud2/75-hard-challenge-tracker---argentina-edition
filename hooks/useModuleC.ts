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
      // Merge any existing evidence photos for this date into the daily log
      const existingEvidencePhotos = prev.evidenceVault?.photos?.filter(p => p.date === log.date) || [];
      const mergedPhotos = [
        ...(log.photos || []),
        ...existingEvidencePhotos.filter(ep => !(log.photos || []).some(lp => lp.id === ep.id))
      ];

      // Normalize weight: keep null or round to one decimal place
      const normalizedWeight = log.weight == null ? null : Number(parseFloat(String(log.weight)).toFixed(1));

      const newState: ModuleCState = {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [log.date]: {
            ...prev.dailyLogs[log.date],
            ...log,
            weight: normalizedWeight,
            photos: mergedPhotos
          }
        }
      };

      localStorage.setItem(MODULE_C_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const uploadPhoto = useCallback((photo: ProgressPhoto) => {
    setState(prev => {
      // Add photo to evidence vault
      const updatedPhotos = [...(prev.evidenceVault.photos || []), photo];

      // Also attach photo to the daily log for the same date
  const existingLog = prev.dailyLogs[photo.date] || { date: photo.date, tasks: {}, notes: '', photos: [], weight: null };
      const updatedLogPhotos = [...(existingLog.photos || []), photo];

      const newState: ModuleCState = {
        ...prev,
        evidenceVault: {
          ...prev.evidenceVault,
          photos: updatedPhotos
        },
        dailyLogs: {
          ...prev.dailyLogs,
          [photo.date]: {
            ...existingLog,
            photos: updatedLogPhotos
          }
        }
      };

      localStorage.setItem(MODULE_C_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const deletePhoto = useCallback((photoId: string) => {
    setState(prev => {
      // find photo to delete to also remove from dailyLogs
      const photoToDelete = prev.evidenceVault.photos.find(p => p.id === photoId);
      const updatedEvidencePhotos = prev.evidenceVault.photos.filter(p => p.id !== photoId);

      const newDailyLogs = { ...prev.dailyLogs };
      if (photoToDelete && newDailyLogs[photoToDelete.date]) {
        newDailyLogs[photoToDelete.date] = {
          ...newDailyLogs[photoToDelete.date],
          photos: (newDailyLogs[photoToDelete.date].photos || []).filter(p => p.id !== photoId)
        };
      }

      const newState: ModuleCState = {
        ...prev,
        evidenceVault: {
          ...prev.evidenceVault,
          photos: updatedEvidencePhotos
        },
        dailyLogs: newDailyLogs
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
