
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, List } from 'lucide-react';
import { LivestockTable } from '@/components/livestock/LivestockTable';
import Link from 'next/link';

export default function PenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getPenById, livestock, pens: allPens } = useData();
  const id = typeof params.id === 'string' ? params.id : '';
  const pen = getPenById(id);

  if (!pen) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-muted-foreground">Pen not found.</p>
        <Button onClick={() => router.push('/pens')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pens List
        </Button>
      </div>
    );
  }

  const livestockInPen = livestock.filter(animal => animal.penId === pen.id);

  return (
    <div className="space-y-6">
      <Button onClick={() => router.push('/pens')} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pens List
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="h-7 w-7 text-primary" />
            <CardTitle className="text-3xl">{pen.name}</CardTitle>
          </div>
          {pen.description && <CardDescription className="text-lg mt-1">{pen.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p><strong>Total Livestock in this Pen:</strong> {livestockInPen.length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <List className="h-6 w-6 text-primary" />
            <CardTitle>Livestock in {pen.name}</CardTitle>
          </div>
          <CardDescription>Animals currently assigned to this pen.</CardDescription>
        </CardHeader>
        <CardContent>
          {livestockInPen.length > 0 ? (
            <LivestockTable livestock={livestockInPen} pens={allPens} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No livestock currently in this pen.</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/livestock/add">Add Livestock</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
