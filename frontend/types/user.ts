export interface PhysicalStats {
    weight: number; // in kg
    height: number; // in cm
    bodyFatPercentage?: number;
    date: string; // YYYY-MM-DD or ISO String
}

export interface User {
    id: string; // UUID
    name: string;
    email: string;
    avatarUrl?: string;
    physicalStatsHistory: PhysicalStats[];
    currentPlanId?: string; // ID of the UserPlanInstance currently active
    createdAt: string;
}
