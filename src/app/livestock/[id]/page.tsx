
"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, CalendarDays, ListChecks, Syringe, Utensils, MessageSquare, PlusCircle, Tag, Users, Binary } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { AddActivityLogForm } from '@/components/livestock/AddActivityLogForm';
import { useToast } from '@/hooks/use-toast';
import type { IndividualLivestock, BatchLivestock } from '@/lib/types';


export default function LivestockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getLivestockById, getPenById, addActivityLog: contextAddActivityLog } = useData(); 
  const { toast } = useToast();
  const id = typeof params.id === 'string' ? params.id : '';
  const animal = getLivestockById(id);

  const [isAddLogDialogOpen, setIsAddLogDialogOpen] = useState(false);

  if (!animal) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-muted-foreground">Livestock not found.</p>
        <Button onClick={() => router.push('/livestock')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Livestock
        </Button>
      </div>
    );
  }

  const pen = animal.penId ? getPenById(animal.penId) : null;
  const isBatchType = animal.livestockType === 'Mini Stock' || animal.livestockType === 'Micro Stock';

  const activityIcons = {
    Feeding: Utensils,
    Medication: Syringe,
    Vaccination: Syringe,
    Observation: MessageSquare,
    Other: ListChecks,
  };

  const handleLogAdded = () => {
    setIsAddLogDialogOpen(false);
  };

  const cardTitle = isBatchType ? `${animal.animalId} (Batch/Colony)` : animal.animalId;
  const cardDescription = `${animal.livestockType} - ${animal.breed}`;

  return (
    <div className="space-y-6">
      <Button onClick={() => router.push('/livestock')} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Livestock List
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-3xl">{cardTitle}</CardTitle>
            <CardDescription className="text-lg">
              {cardDescription}
              {!isBatchType && ` - ${(animal as IndividualLivestock).gender}`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            {animal.imageUrl ? (
              <Image 
                src={animal.imageUrl} 
                alt={animal.animalId} 
                width={300} 
                height={300} 
                className="rounded-lg object-cover aspect-square w-full shadow-md"
                data-ai-hint={animal.dataAiHint || "livestock animal"}
              />
            ) : (
              <div className="w-full h-[300px] bg-muted rounded-lg flex items-center justify-center text-muted-foreground shadow-md" data-ai-hint={animal.dataAiHint || "livestock silhouette"}>
                 <Tag className="h-24 w-24 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {isBatchType ? (
                <>
                  <div><strong>Quantity:</strong> {(animal as BatchLivestock).quantity}</div>
                  {animal.birthDate && <div><strong>Est. Hatch/Start Date:</strong> {format(new Date(animal.birthDate), "PPP")}</div>}
                </>
              ) : (
                <>
                  {animal.birthDate && <div><strong>Birth Date:</strong> {format(new Date(animal.birthDate), "PPP")}</div>}
                </>
              )}
              <div><strong>Pen:</strong> {pen ? `${pen.name} (${pen.description || 'No description'})` : 'N/A'}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Health Records / Notes {isBatchType ? '(for Batch/Colony)' : ''}:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{animal.healthRecords || 'No specific health records noted.'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="dates">Important Dates</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Activity Logs {isBatchType ? '(for Batch/Colony)' : ''}</CardTitle>
                <CardDescription>Chronological record of activities.</CardDescription>
              </div>
              <Dialog open={isAddLogDialogOpen} onOpenChange={setIsAddLogDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Log
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Add New Activity Log for {animal.animalId}</DialogTitle>
                    <DialogDescription>
                      Record a new activity. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <AddActivityLogForm
                    animalId={animal.id}
                    onLogAdded={handleLogAdded}
                    onCancel={() => setIsAddLogDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {animal.activityLogs && animal.activityLogs.length > 0 ? (
                animal.activityLogs.map(log => { // Sorting is now handled in DataContext
                  const Icon = activityIcons[log.type] || ListChecks;
                  return (
                    <div key={log.id} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50">
                      <Icon className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{log.type} - <span className="font-normal text-muted-foreground">{format(new Date(log.date), "PPP 'at' h:mm a")}</span></p>
                        <p className="text-sm">{log.description}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground">No activity logs recorded.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dates">
          <Card>
            <CardHeader>
              <CardTitle>Important Dates {isBatchType ? '(for Batch/Colony)' : ''}</CardTitle>
              <CardDescription>Key dates and milestones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {animal.importantDates && animal.importantDates.length > 0 ? (
                 animal.importantDates.map(date => ( // Sorting is now handled in DataContext
                    <div key={date.id} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50">
                      <CalendarDays className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{date.eventName} - <span className="font-normal text-muted-foreground">{format(new Date(date.date), "PPP")}</span></p>
                        {date.notes && <p className="text-sm">{date.notes}</p>}
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground">No important dates scheduled.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
