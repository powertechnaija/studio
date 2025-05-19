
"use client";

import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { LivestockForm, type LivestockFormData } from '@/components/livestock/LivestockForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AddLivestockPage() {
  const router = useRouter();
  const { pens, addLivestock: contextAddLivestock } = useData();
  const { toast } = useToast();

  const handleSubmit = (data: LivestockFormData) => {
    const animalToAdd = {
      animalId: data.animalId,
      breed: data.breed,
      birthDate: data.birthDate.toISOString(),
      gender: data.gender,
      livestockType: data.livestockType,
      penId: data.penId,
      healthRecords: data.healthRecords || '',
      imageUrl: data.imageUrl,
      dataAiHint: data.dataAiHint,
      // activityLogs and importantDates will be initialized as empty arrays by contextAddLivestock
      // and can be added/managed via the detail page or an edit flow.
    };
    
    contextAddLivestock(animalToAdd);

    // If you want to add activityLogs and importantDates directly during creation,
    // you would need to modify contextAddLivestock or use updateLivestock immediately after.
    // For this example, we're keeping contextAddLivestock simpler.
    // const newAnimalWithDetails = {
    //   ...animalToAdd,
    //   // id would be assigned by contextAddLivestock, so this part needs careful handling
    //   activityLogs: data.activityLogs?.map(log => ({...log, id: `act${Date.now()}-${Math.random()}`, date: log.date.toISOString()})) || [],
    //   importantDates: data.importantDates?.map(impDate => ({...impDate, id: `impD${Date.now()}-${Math.random()}`, date: impDate.date.toISOString()})) || [],
    // };
    // updateLivestock(newAnimalWithDetails); // This would require getting the ID first.

    toast({
      title: "Livestock Added",
      description: `${data.animalId} (${data.livestockType}) has been successfully registered.`,
    });
    router.push('/livestock');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Livestock</CardTitle>
        <CardDescription>Fill in the details for the new animal.</CardDescription>
      </CardHeader>
      <CardContent>
        <LivestockForm pens={pens} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
}
