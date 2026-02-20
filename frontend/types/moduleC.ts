// Types for module C (daily logs, calendar days, progress photos)

export type DayStatus = 'completed' | 'failed' | 'pending' | 'future';

export interface CalendarDay {
	date: string; // YYYY-MM-DD
	status: DayStatus;
	tasksCompleted: number;
	totalTasks: number;
	hasPhoto: boolean;
}

export interface ProgressPhoto {
	id: string;
	date: string; // YYYY-MM-DD
	url: string; // object URL or remote URL
	thumbnailUrl: string; // data URL or small version
	originalSize: number;
	compressedSize: number;
	uploadedAt: string; // ISO
}

export interface DailyLog {
	date: string; // YYYY-MM-DD
	tasks: Record<string, { completed: boolean; value?: any; notes?: string }>;
	notes?: string;
	photos?: ProgressPhoto[];
	// Optional weight recorded for the day (kg). Null/undefined means not recorded yet.
	weight?: number | null;
}

export interface ModuleCState {
	logs: Record<string, DailyLog>;
}

export {};
