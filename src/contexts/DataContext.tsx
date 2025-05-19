
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Livestock, Pen, ActivityLog, ImportantDate } from '@/lib/types';

interface DataContextType {
  livestock: Livestock[];
  pens: Pen[];
  addLivestock: (animal: Omit<Livestock, 'id' | 'activityLogs' | 'importantDates'>) => void;
  updateLivestock: (animal: Livestock) => void;
  getLivestockById: (id: string) => Livestock | undefined;
  addPen: (pen: Omit<Pen, 'id'>) => void;
  getPens: () => Pen[];
  getPenById: (id: string) => Pen | undefined;
  addActivityLog: (livestockId: string, log: Omit<ActivityLog, 'id'>) => void;
  addImportantDate: (livestockId: string, date: Omit<ImportantDate, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialPens: Pen[] = [
  { id: 'pen1', name: 'Pen A', description: 'Main pasture' },
  { id: 'pen2', name: 'Pen B', description: 'Holding pen' },
];

const initialLivestock: Livestock[] = [
  {
    id: 'lvstk1',
    animalId: 'COW-001',
    breed: 'Holstein',
    birthDate: new Date(2022, 5, 15).toISOString(),
    gender: 'Female',
    penId: 'pen1',
    healthRecords: 'Generally healthy. Vaccinated for BVD.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'cow farm',
    activityLogs: [
      { id: 'act1', date: new Date(2023, 10, 1).toISOString(), type: 'Vaccination', description: 'Annual booster shots.' },
      { id: 'act2', date: new Date(2023, 11, 5).toISOString(), type: 'Feeding', description: 'Standard feed mix.' },
    ],
    importantDates: [
      { id: 'impD1', date: new Date(2024, 2, 1).toISOString(), eventName: 'Expected Calving' },
    ],
  },
  {
    id: 'lvstk2',
    animalId: 'SHEEP-003',
    breed: 'Merino',
    birthDate: new Date(2023, 1, 20).toISOString(),
    gender: 'Male',
    penId: 'pen2',
    healthRecords: 'Dewormed on schedule.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'sheep field',
    activityLogs: [
       { id: 'act3', date: new Date(2023, 9, 15).toISOString(), type: 'Medication', description: 'Deworming.' },
    ],
    importantDates: [
      { id: 'impD2', date: new Date(2024, 4, 10).toISOString(), eventName: 'Shearing Season' },
    ],
  },
];


export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [livestock, setLivestock] = useState<Livestock[]>(() => {
     if (typeof window !== 'undefined') {
      const savedLivestock = localStorage.getItem('stockwiseLivestock');
      return savedLivestock ? JSON.parse(savedLivestock) : initialLivestock;
    }
    return initialLivestock;
  });
  const [pens, setPens] = useState<Pen[]>(() => {
    if (typeof window !== 'undefined') {
      const savedPens = localStorage.getItem('stockwisePens');
      return savedPens ? JSON.parse(savedPens) : initialPens;
    }
    return initialPens;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stockwiseLivestock', JSON.stringify(livestock));
    }
  }, [livestock]);

  useEffect(() => {
     if (typeof window !== 'undefined') {
      localStorage.setItem('stockwisePens', JSON.stringify(pens));
    }
  }, [pens]);

  const addLivestock = (animal: Omit<Livestock, 'id' | 'activityLogs' | 'importantDates'>) => {
    setLivestock(prev => [...prev, { ...animal, id: `lvstk${Date.now()}`, activityLogs: [], importantDates: [] }]);
  };

  const updateLivestock = (updatedAnimal: Livestock) => {
    setLivestock(prev => prev.map(animal => animal.id === updatedAnimal.id ? updatedAnimal : animal));
  };
  
  const getLivestockById = (id: string) => livestock.find(animal => animal.id === id);

  const addPen = (pen: Omit<Pen, 'id'>) => {
    setPens(prev => [...prev, { ...pen, id: `pen${Date.now()}` }]);
  };

  const getPens = () => pens;
  const getPenById = (id: string) => pens.find(pen => pen.id === id);

  const addActivityLog = (livestockId: string, log: Omit<ActivityLog, 'id'>) => {
    setLivestock(prev => prev.map(animal => {
      if (animal.id === livestockId) {
        return {
          ...animal,
          activityLogs: [...animal.activityLogs, { ...log, id: `act${Date.now()}` }]
        };
      }
      return animal;
    }));
  };

  const addImportantDate = (livestockId: string, dateEntry: Omit<ImportantDate, 'id'>) => {
     setLivestock(prev => prev.map(animal => {
      if (animal.id === livestockId) {
        return {
          ...animal,
          importantDates: [...animal.importantDates, { ...dateEntry, id: `impD${Date.now()}` }]
        };
      }
      return animal;
    }));
  };

  return (
    <DataContext.Provider value={{ 
        livestock, 
        pens, 
        addLivestock, 
        updateLivestock, 
        getLivestockById, 
        addPen, 
        getPens, 
        getPenById,
        addActivityLog,
        addImportantDate
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
