
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

export interface BaseLivestock {
  id: string;
  livestockType: LivestockType;
  penId?: string; // ID of the pen it belongs to
  healthRecords?: string; // General health notes, could be more structured for batch
  activityLogs: ActivityLog[];
  importantDates: ImportantDate[];
  imageUrl?: string;
  dataAiHint?: string;
}

export interface IndividualLivestock extends BaseLivestock {
  livestockType: 'Mega Stock' | 'Mid Stock';
  animalId: string; // User-defined ID or tag number
  breed: string;
  birthDate: string; // ISO string
  gender: 'Male' | 'Female' | 'Unknown';
  quantity?: undefined; // Not applicable
}

export interface BatchLivestock extends BaseLivestock {
  livestockType: 'Mini Stock' | 'Micro Stock';
  animalId: string; // Batch/Colony ID
  breed: string; // Type/Strain
  birthDate?: string; // Optional, e.g., hatch date for a batch
  gender?: undefined; // Not applicable
  quantity: number;
}

export type Livestock = IndividualLivestock | BatchLivestock;

export interface Pen {
  id: string;
  name: string;
  description?: string;
  allowedLivestockType?: LivestockType | null; // null or undefined means not set / flexible until first animal
}

// For AI Insights
export interface AiOptimizedCareStrategies {
  careStrategies: string;
  reasoning: string;
}
