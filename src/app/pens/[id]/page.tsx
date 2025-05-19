
"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, List, PlusCircle } from 'lucide-react';
import { LivestockTable } from '@/components/livestock/LivestockTable';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddBulkActivityLogForm, type BulkActivityLogFormData } from '@/components/pens/AddBulkActivityLogForm';
import { useToast } from '@/hooks/use-toast';

export default function PenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getPenById, livestock, pens: allPens, addBulkActivityLogToPen } = useData();
  const { toast } = useToast();
  const id = typeof params.id === 'string' ? params.id : '';
  const pen = getPenById(id);

  const [isBulkLogDialogOpen, setIsBulkLogDialogOpen] = useState(false);

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

  const handleBulkLogSubmit = (data: BulkActivityLogFormData) => {
    if (!pen) return;

    const logEntry = {
      date: data.date.toISOString(),
      type: data.type,
      description: data.description,
    };

    addBulkActivityLogToPen(pen.id, logEntry);

    toast({
      title: "Bulk Activity Logged",
      description: `${data.type} activity logged for all ${livestockInPen.length} animal(s) in pen ${pen.name}.`,
    });
    setIsBulkLogDialogOpen(false);
  };

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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <List className="h-6 w-6 text-primary" />
              <CardTitle>Livestock in {pen.name}</CardTitle>
            </div>
            <CardDescription>Animals currently assigned to this pen.</CardDescription>
          </div>
          {livestockInPen.length > 0 && (
            <Dialog open={isBulkLogDialogOpen} onOpenChange={setIsBulkLogDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" /> Log Activity for Pen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Log Bulk Activity for Pen: {pen.name}</DialogTitle>
                  <DialogDescription>
                    This activity will be logged for all {livestockInPen.length} animal(s) currently in this pen.
                  </DialogDescription>
                </DialogHeader>
                <AddBulkActivityLogForm
                  penName={pen.name}
                  onSubmit={handleBulkLogSubmit}
                  onCancel={() => setIsBulkLogDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
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
