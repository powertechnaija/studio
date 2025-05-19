
"use client";

import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { LivestockForm, type LivestockFormData } from '@/components/livestock/LivestockForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { IndividualLivestock, BatchLivestock } from '@/lib/types';


export default function AddLivestockPage() {
  const router = useRouter();
  const { pens: allPens, addLivestock: contextAddLivestock, updatePen } = useData(); // get all pens
  const { toast } = useToast();

  const handleSubmit = (data: LivestockFormData) => {
    let animalToAdd: Omit<IndividualLivestock, 'id' | 'activityLogs' | 'importantDates'> | Omit<BatchLivestock, 'id' | 'activityLogs' | 'importantDates'>;

    if (data.livestockType === 'Mega Stock' || data.livestockType === 'Mid Stock') {
      animalToAdd = {
        livestockType: data.livestockType,
        animalId: data.animalId,
        breed: data.breed,
        birthDate: data.birthDate!.toISOString(), // Assert non-null as it's required by schema
        gender: data.gender!, // Assert non-null
        penId: data.penId,
        healthRecords: data.healthRecords,
        imageUrl: data.imageUrl,
        dataAiHint: data.dataAiHint,
      };
    } else { // Mini Stock or Micro Stock
      animalToAdd = {
        livestockType: data.livestockType,
        animalId: data.animalId, // Batch/Colony ID
        breed: data.breed, // Type/Strain
        quantity: data.quantity!, // Assert non-null
        birthDate: data.birthDate ? data.birthDate.toISOString() : undefined, // Optional
        penId: data.penId,
        healthRecords: data.healthRecords,
        imageUrl: data.imageUrl,
        dataAiHint: data.dataAiHint,
      };
    }
    
    contextAddLivestock(animalToAdd);
    
    // Logic to update pen's allowedLivestockType if it was flexible and is now set by this animal
    // This is now handled within contextAddLivestock for cleaner separation.

    toast({
      title: "Livestock Added",
      description: `${data.livestockType === 'Mega Stock' || data.livestockType === 'Mid Stock' ? data.animalId : data.animalId + ' (Batch)'} (${data.livestockType}) has been successfully registered.`,
    });
    router.push('/livestock');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Livestock</CardTitle>
        <CardDescription>Fill in the details for the new animal or batch/colony.</CardDescription>
      </CardHeader>
      <CardContent>
        <LivestockForm allPens={allPens} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
}
