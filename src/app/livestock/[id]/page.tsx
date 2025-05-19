
"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, CalendarDays, ListChecks, Syringe, Utensils, MessageSquare, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { AddActivityLogForm } from '@/components/livestock/AddActivityLogForm';
import { useToast } from '@/hooks/use-toast';


export default function LivestockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getLivestockById, getPenById, addActivityLog: contextAddActivityLog } = useData(); // Renamed to avoid conflict
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

  const activityIcons = {
    Feeding: Utensils,
    Medication: Syringe,
    Vaccination: Syringe,
    Observation: MessageSquare,
    Other: ListChecks,
  };

  const handleLogAdded = () => {
    setIsAddLogDialogOpen(false);
    // Data context already updated the livestock state, so the list will re-render.
  };

  return (
    <div className="space-y-6">
      <Button onClick={() => router.push('/livestock')} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Livestock List
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-3xl">{animal.animalId}</CardTitle>
            <CardDescription className="text-lg">{animal.breed} - {animal.gender}</CardDescription>
          </div>
          {/* <Button asChild variant="outline">
            <Link href={`/livestock/${animal.id}/edit`}> // Edit page not implemented in this scaffold
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button> */}
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
              <div className="w-full h-[300px] bg-muted rounded-lg flex items-center justify-center text-muted-foreground shadow-md">No Image Available</div>
            )}
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Birth Date:</strong> {format(new Date(animal.birthDate), "PPP")}</div>
              <div><strong>Pen:</strong> {pen ? pen.name : 'N/A'} {pen?.description && `(${pen.description})`}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Health Records / Notes:</h4>
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
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Chronological record of activities related to this animal.</CardDescription>
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
                      Record a new activity for this animal. Click save when you're done.
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
                animal.activityLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => {
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
                <p className="text-muted-foreground">No activity logs recorded for this animal.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dates">
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
              <CardDescription>Key dates and milestones for this animal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {animal.importantDates && animal.importantDates.length > 0 ? (
                 animal.importantDates.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(date => (
                    <div key={date.id} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50">
                      <CalendarDays className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{date.eventName} - <span className="font-normal text-muted-foreground">{format(new Date(date.date), "PPP")}</span></p>
                        {date.notes && <p className="text-sm">{date.notes}</p>}
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground">No important dates scheduled for this animal.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
