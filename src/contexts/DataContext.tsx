
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Livestock, Pen, ActivityLog, ImportantDate, LivestockType, IndividualLivestock, BatchLivestock } from '@/lib/types';

interface DataContextType {
  livestock: Livestock[];
  pens: Pen[];
  addLivestock: (animalData: Omit<IndividualLivestock, 'id' | 'activityLogs' | 'importantDates'> | Omit<BatchLivestock, 'id' | 'activityLogs' | 'importantDates'>) => void;
  updateLivestock: (animal: Livestock) => void;
  getLivestockById: (id: string) => Livestock | undefined;
  addPen: (pen: Omit<Pen, 'id'>) => Pen;
  updatePen: (updatedPen: Pen) => void;
  getPens: () => Pen[];
  getPenById: (id: string) => Pen | undefined;
  addActivityLog: (livestockId: string, log: Omit<ActivityLog, 'id'>) => void;
  addImportantDate: (livestockId: string, date: Omit<ImportantDate, 'id'>) => void;
  addBulkActivityLogToPen: (penId: string, logEntry: Omit<ActivityLog, 'id'>) => void;
  getLivestockInPen: (penId: string) => Livestock[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialPensData: Pen[] = [
  { id: 'pen1', name: 'Pen A (Cattle)', description: 'Main pasture for large animals', allowedLivestockType: 'Mega Stock' },
  { id: 'pen2', name: 'Pen B (Sheep)', description: 'Holding pen for medium animals', allowedLivestockType: 'Mid Stock' },
  { id: 'pen3', name: 'Chicken Coop 1', description: 'For broiler chickens', allowedLivestockType: 'Mini Stock' },
  { id: 'pen4', name: 'Apiary Section 1', description: 'Beehives', allowedLivestockType: 'Micro Stock'},
  { id: 'pen5', name: 'Flexible Pen C', description: 'Can be assigned a type', allowedLivestockType: null },
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
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'holstein cow',
    activityLogs: [
      { id: 'act1', date: new Date(2023, 10, 1).toISOString(), type: 'Vaccination', description: 'Annual booster shots.' },
      { id: 'act2', date: new Date(2023, 11, 5).toISOString(), type: 'Feeding', description: 'Standard feed mix.' },
    ],
    importantDates: [
      { id: 'impD1', date: new Date(2024, 8, 1).toISOString(), eventName: 'Expected Calving' },
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
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'merino sheep',
    activityLogs: [
       { id: 'act3', date: new Date(2023, 9, 15).toISOString(), type: 'Medication', description: 'Deworming.' },
    ],
    importantDates: [
      { id: 'impD2', date: new Date(2024, 4, 10).toISOString(), eventName: 'Shearing Season' },
    ],
  },
  {
    id: 'lvstk3',
    livestockType: 'Mini Stock',
    animalId: 'CHIX-B1-23', // Batch ID
    breed: 'Broiler', // Type/Strain
    penId: 'pen3',
    quantity: 50,
    healthRecords: 'Batch started on 2023-10-01. Standard vaccination program.',
    birthDate: new Date(2023,9,1).toISOString(), // Hatch date
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'chickens farm',
    activityLogs: [
      { id: 'act4', date: new Date(2023, 10, 5).toISOString(), type: 'Feeding', description: 'Starter feed provided.'}
    ],
    importantDates: [
      { id: 'impD3', date: new Date(2024, 0, 15).toISOString(), eventName: 'Target Processing Date'}
    ],
  },
   {
    id: 'lvstk4',
    livestockType: 'Micro Stock',
    animalId: 'BEES-HIVE-A', // Colony ID
    breed: 'Italian Honey Bee', // Type/Strain
    penId: 'pen4',
    quantity: 1, // Represents 1 colony
    healthRecords: 'New colony established Spring 2023. Varroa mite check scheduled.',
    // birthDate not typically tracked for bee colonies in this way, maybe establishment date as importantDate
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'bee hive',
    activityLogs: [
      { id: 'act5', date: new Date(2023, 8, 1).toISOString(), type: 'Observation', description: 'Hive inspection, queen looks healthy.'}
    ],
    importantDates: [
      { id: 'impD4', date: new Date(2024, 3, 1).toISOString(), eventName: 'Spring Honey Harvest Est.'}
    ],
  }
];


export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [livestock, setLivestock] = useState<Livestock[]>(initialLivestockData);
  const [pens, setPens] = useState<Pen[]>(initialPensData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedLivestock = localStorage.getItem('stockwiseLivestock');
    if (savedLivestock) {
      setLivestock(JSON.parse(savedLivestock));
    } else {
      localStorage.setItem('stockwiseLivestock', JSON.stringify(initialLivestockData));
    }

    const savedPens = localStorage.getItem('stockwisePens');
    if (savedPens) {
      setPens(JSON.parse(savedPens));
    } else {
      localStorage.setItem('stockwisePens', JSON.stringify(initialPensData));
    }
    setIsLoaded(true);
  }, []);

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

  const addLivestock = useCallback((animalData: Omit<IndividualLivestock, 'id' | 'activityLogs' | 'importantDates'> | Omit<BatchLivestock, 'id' | 'activityLogs' | 'importantDates'>) => {
    const newAnimal: Livestock = {
      ...animalData,
      id: `lvstk${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      activityLogs: [],
      importantDates: [],
    };

    setLivestock(prev => [...prev, newAnimal]);

    // If animal is assigned to a pen, and that pen doesn't have an allowedLivestockType yet,
    // set the pen's type to this animal's type.
    if (newAnimal.penId) {
      const penToUpdate = pens.find(p => p.id === newAnimal.penId);
      if (penToUpdate && (penToUpdate.allowedLivestockType === null || penToUpdate.allowedLivestockType === undefined)) {
        // Check if other animals are in the pen
        const animalsInPen = livestock.filter(l => l.penId === newAnimal.penId && l.id !== newAnimal.id);
        if (animalsInPen.length === 0) { // Only set if this is the first animal or others are of same type
             updatePen({...penToUpdate, allowedLivestockType: newAnimal.livestockType});
        } else if (animalsInPen.every(a => a.livestockType === newAnimal.livestockType)) {
             updatePen({...penToUpdate, allowedLivestockType: newAnimal.livestockType});
        }
        // If animalsInPen has different types, this indicates a data issue or a scenario not covered.
        // For now, we assume the form's pen filtering prevents this.
      }
    }
  }, [pens, livestock]); // Added livestock to dependencies

  const updateLivestock = (updatedAnimal: Livestock) => {
    setLivestock(prev => prev.map(animal => animal.id === updatedAnimal.id ? updatedAnimal : animal));
  };
  
  const getLivestockById = (id: string) => livestock.find(animal => animal.id === id);

  const addPen = (penData: Omit<Pen, 'id'>): Pen => {
    const newPen = { ...penData, id: `pen${Date.now()}` };
    setPens(prev => [...prev, newPen]);
    return newPen;
  };
  
  const updatePen = (updatedPen: Pen) => {
    setPens(prevPens => prevPens.map(p => p.id === updatedPen.id ? updatedPen : p));
  };

  const getPens = () => pens;
  const getPenById = (id: string) => pens.find(pen => pen.id === id);

  const getLivestockInPen = useCallback((penId: string) => {
    return livestock.filter(animal => animal.penId === penId);
  }, [livestock]);


  const addActivityLog = (livestockId: string, log: Omit<ActivityLog, 'id'>) => {
    setLivestock(prev => prev.map(animal => {
      if (animal.id === livestockId) {
        return {
          ...animal,
          activityLogs: [...animal.activityLogs, { ...log, id: `act${Date.now()}-${Math.random().toString(36).substring(2,9)}` }].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
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
          importantDates: [...animal.importantDates, { ...dateEntry, id: `impD${Date.now()}-${Math.random().toString(36).substring(2,9)}` }].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
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
        updatePen,
        getPens, 
        getPenById,
        addActivityLog,
        addImportantDate,
        addBulkActivityLogToPen,
        getLivestockInPen
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
