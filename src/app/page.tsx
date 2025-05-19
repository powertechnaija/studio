
"use client";

import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ListChecks, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

export default function DashboardPage() {
  const { livestock, pens, getPenById } = useData();
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const totalLivestock = livestock.length;

  const livestockByPen = pens.map(pen => ({
    ...pen,
    count: livestock.filter(animal => animal.penId === pen.id).length,
  }));

  const upcomingImportantDates = livestock
    .flatMap(animal => 
      animal.importantDates.map(date => ({ ...date, animalId: animal.animalId, animalName: `${animal.breed} ${animal.animalId}` }))
    )
    .filter(date => new Date(date.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Livestock</CardTitle>
            <ListChecks className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLivestock}</div>
            <p className="text-xs text-muted-foreground">animals currently registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pens Overview</CardTitle>
            <Home className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pens.length}</div>
            <p className="text-xs text-muted-foreground">total pens managed</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {clientLoaded ? (
              <>
                <div className="text-2xl font-bold">{upcomingImportantDates.length}</div>
                <p className="text-xs text-muted-foreground">important dates in near future</p>
              </>
            ) : (
              <>
                <Skeleton className="h-7 w-10 mb-1" />
                <Skeleton className="h-3 w-32" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Livestock by Pen</CardTitle>
            <CardDescription>Distribution of livestock across different pens.</CardDescription>
          </CardHeader>
          <CardContent>
            {livestockByPen.length > 0 ? (
              <ul className="space-y-2">
                {livestockByPen.map(pen => (
                  <li key={pen.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                    <span>{pen.name} ({pen.description})</span>
                    <span className="font-semibold">{pen.count} animals</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No pens configured yet. <Link href="/settings" className="text-primary hover:underline">Add pens</Link></p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Important Dates</CardTitle>
            <CardDescription>Next 5 critical dates for your livestock.</CardDescription>
          </CardHeader>
          <CardContent>
            {!clientLoaded ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : upcomingImportantDates.length > 0 ? (
              <ul className="space-y-2">
                {upcomingImportantDates.map(date => (
                  <li key={date.id} className="flex flex-col p-2 rounded-md hover:bg-muted">
                    <div className="flex justify-between items-center">
                       <span className="font-semibold">{date.eventName}</span>
                       <span className="text-sm text-muted-foreground">{new Date(date.date).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">For: {date.animalName}</span>
                    {date.notes && <p className="text-xs mt-1">{date.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No upcoming important dates.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Recent Livestock Additions</CardTitle>
            <CardDescription>A quick look at recently added animals.</CardDescription>
        </CardHeader>
        <CardContent>
            {livestock.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {livestock.slice(-4).reverse().map(animal => (
                        <Link href={`/livestock/${animal.id}`} key={animal.id} className="block">
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                {animal.imageUrl && (
                                  <div className="aspect-video relative w-full">
                                     <Image 
                                        src={animal.imageUrl} 
                                        alt={animal.animalId} 
                                        fill // Changed from layout="fill" objectFit="cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        style={{objectFit: "cover"}}
                                        data-ai-hint={animal.dataAiHint || "livestock animal"}
                                     />
                                  </div>
                                )}
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base">{animal.animalId}</CardTitle>
                                    <CardDescription>{animal.breed} - {getPenById(animal.penId || "")?.name || "Unassigned"}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No livestock registered yet. <Link href="/livestock/add" className="text-primary hover:underline">Add Livestock</Link></p>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
