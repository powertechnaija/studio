
export interface ActivityLog {
  id: string;
  date: string; // ISO string
  type: 'Feeding' | 'Medication' | 'Vaccination' | 'Observation' | 'Other';
  description: string;
}

export interface ImportantDate {
  id: string;
  date: string; // ISO string
  eventName: string;
  notes?: string;
}

export type LivestockType = 'Mega Stock' | 'Mid Stock' | 'Mini Stock' | 'Micro Stock';

export const livestockTypes: LivestockType[] = ['Mega Stock', 'Mid Stock', 'Mini Stock', 'Micro Stock'];

export interface Livestock {
  id: string;
  animalId: string; // User-defined ID or tag number
  breed: string;
  birthDate: string; // ISO string
  gender: 'Male' | 'Female' | 'Unknown';
  livestockType: LivestockType;
  penId?: string; // ID of the pen it belongs to
  healthRecords: string; // General health notes, could be more structured
  activityLogs: ActivityLog[];
  importantDates: ImportantDate[];
  imageUrl?: string;
  dataAiHint?: string;
}

export interface Pen {
  id: string;
  name: string;
  description?: string;
}

// For AI Insights
export interface AiOptimizedCareStrategies {
  careStrategies: string;
  reasoning: string;
}
