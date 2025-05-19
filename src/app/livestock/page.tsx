
"use client";

import { useData } from '@/contexts/DataContext';
import { LivestockTable } from '@/components/livestock/LivestockTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function LivestockPage() {
  const { livestock, pens } = useData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Livestock Registry</CardTitle>
          <CardDescription>Manage all your registered livestock.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/livestock/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Livestock
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <LivestockTable livestock={livestock} pens={pens} />
      </CardContent>
    </Card>
  );
}
