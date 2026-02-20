
/**
 * Utility functions for handling Argentina Time (ART) accurately.
 */

export const getArgentinaDate = (): Date => {
  // Use Intl API to get current time in Argentina, then parse it back to a date object
  const artString = new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"});
  return new Date(artString);
};

export const getArgentinaDateString = (): string => {
  const art = getArgentinaDate();
  const year = art.getFullYear();
  const month = String(art.getMonth() + 1).padStart(2, '0');
  const day = String(art.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysDifference = (date1Str: string, date2Str: string): number => {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  // Normalize to midnight UTC to avoid daylight saving issues during diff
  d1.setUTCHours(0, 0, 0, 0);
  d2.setUTCHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};

export const getTimeUntilMidnightART = () => {
  const art = getArgentinaDate();
  const midnight = new Date(art);
  midnight.setHours(24, 0, 0, 0);
  
  // Need to account for potential drift by using the same reference
  const diff = midnight.getTime() - art.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { 
    hours: Math.max(0, hours), 
    minutes: Math.max(0, minutes), 
    seconds: Math.max(0, seconds), 
    totalMs: diff 
  };
};

export const isSameDay = (d1: string, d2: string) => d1 === d2;
