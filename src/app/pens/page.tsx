
"use client";

import { useData } from '@/contexts/DataContext';
import { PensTable } from '@/components/pens/PensTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function PensPage() {
  const { pens, livestock } = useData();

  const pensWithLivestockCount = pens.map(pen => ({
    ...pen,
    livestockCount: livestock.filter(animal => animal.penId === pen.id).length,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pens</CardTitle>
          <CardDescription>Manage all your livestock pens.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/settings"> {/* Assuming pen creation is in settings */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Pen
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <PensTable pens={pensWithLivestockCount} />
      </CardContent>
    </Card>
  );
}
