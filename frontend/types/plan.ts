export type PlanType = '75_HARD' | 'CUSTOM' | 'OTHER';

export interface PlanTaskDefinition {
    id: string;
    label: string;
    description: string;
    icon: string;
    type: 'diet' | 'exercise' | 'water' | 'reading' | 'progress' | 'custom';
    requiredDaily: boolean; // Determines if missing this task fails the day
}

export interface Plan {
    id: string; // e.g. "default-75-hard" or a UUID
    name: string;
    description: string;
    type: PlanType;
    durationDays: number;
    tasks: PlanTaskDefinition[];
    createdAt: string;
}

export interface CustomPlanCharacteristics extends Plan {
    type: 'CUSTOM';
    creatorUserId: string; // The user who created this custom plan
    isPublic: boolean; // Whether other users can find and adopt this plan
}

export interface UserPlanInstance {
    id: string;
    userId: string;
    planId: string;
    startDate: string; // YYYY-MM-DD
    endDate?: string | null;
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
    currentDay: number;
}
