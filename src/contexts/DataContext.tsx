
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Livestock, Pen, ActivityLog, ImportantDate, LivestockType } from '@/lib/types';

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
  addBulkActivityLogToPen: (penId: string, logEntry: Omit<ActivityLog, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialPensData: Pen[] = [
  { id: 'pen1', name: 'Pen A', description: 'Main pasture' },
  { id: 'pen2', name: 'Pen B', description: 'Holding pen' },
];

const initialLivestockData: Livestock[] = [
  {
    id: 'lvstk1',
    animalId: 'COW-001',
    breed: 'Holstein',
    birthDate: new Date(2022, 5, 15).toISOString(),
    gender: 'Female',
    livestockType: 'Mega Stock',
    penId: 'pen1',
    healthRecords: 'Generally healthy. Vaccinated for BVD.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'cattle farm',
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
    livestockType: 'Mid Stock',
    penId: 'pen2',
    healthRecords: 'Dewormed on schedule.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'sheep flock',
    activityLogs: [
       { id: 'act3', date: new Date(2023, 9, 15).toISOString(), type: 'Medication', description: 'Deworming.' },
    ],
    importantDates: [
      { id: 'impD2', date: new Date(2024, 4, 10).toISOString(), eventName: 'Shearing Season' },
    ],
  },
];


export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with default data for server and client's first render.
  const [livestock, setLivestock] = useState<Livestock[]>(initialLivestockData);
  const [pens, setPens] = useState<Pen[]>(initialPensData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage only on the client, after mount.
  useEffect(() => {
    const savedLivestock = localStorage.getItem('stockwiseLivestock');
    if (savedLivestock) {
      setLivestock(JSON.parse(savedLivestock));
    } else {
      // If nothing in localStorage, persist initial data
      localStorage.setItem('stockwiseLivestock', JSON.stringify(initialLivestockData));
    }

    const savedPens = localStorage.getItem('stockwisePens');
    if (savedPens) {
      setPens(JSON.parse(savedPens));
    } else {
      // If nothing in localStorage, persist initial data
      localStorage.setItem('stockwisePens', JSON.stringify(initialPensData));
    }
    setIsLoaded(true); // Indicate that data has been loaded/checked from localStorage
  }, []);

  // Save to localStorage whenever data changes, but only if it's already loaded (to avoid overwriting during initial hydration with default data)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('stockwiseLivestock', JSON.stringify(livestock));
    }
  }, [livestock, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
     localStorage.setItem('stockwisePens', JSON.stringify(pens));
    }
  }, [pens, isLoaded]);

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
          activityLogs: [...animal.activityLogs, { ...log, id: `act${Date.now()}-${Math.random().toString(36).substring(2,9)}` }]
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
          importantDates: [...animal.importantDates, { ...dateEntry, id: `impD${Date.now()}-${Math.random().toString(36).substring(2,9)}` }]
        };
      }
      return animal;
    }));
  };

  const addBulkActivityLogToPen = (penId: string, logEntry: Omit<ActivityLog, 'id'>) => {
    setLivestock(prevLivestock => {
      return prevLivestock.map(animal => {
        if (animal.penId === penId) {
          const newLog: ActivityLog = {
            ...logEntry,
            id: `act${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            date: new Date(logEntry.date).toISOString(),
          };
          return {
            ...animal,
            activityLogs: [...animal.activityLogs, newLog].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          };
        }
        return animal;
      });
    });
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
        addImportantDate,
        addBulkActivityLogToPen
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
