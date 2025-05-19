
"use client";

import type { Livestock, Pen, BatchLivestock, IndividualLivestock } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, Edit3, Trash2, Users, Tag } from 'lucide-react'; // Added Users for quantity
import Image from 'next/image';
import { format } from 'date-fns';

interface LivestockTableProps {
  livestock: Livestock[];
  pens: Pen[];
  onDelete?: (id: string) => void;
}

export function LivestockTable({ livestock, pens, onDelete }: LivestockTableProps) {
  const getPenName = (penId?: string) => {
    if (!penId) return 'N/A';
    const pen = pens.find(p => p.id === penId);
    return pen ? pen.name : 'Unknown Pen';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Image</TableHead>
          <TableHead>ID/Batch</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Breed/Strain</TableHead>
          <TableHead>Key Date</TableHead> {/* Changed from Birth Date */}
          <TableHead>Pen</TableHead>
          <TableHead>Details</TableHead> {/* For Gender or Quantity */}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {livestock.length > 0 ? livestock.map((animal) => {
          const isBatch = animal.livestockType === 'Mini Stock' || animal.livestockType === 'Micro Stock';
          const keyDate = animal.birthDate ? format(new Date(animal.birthDate), 'P') : 'N/A';
          const idDisplay = animal.animalId;

          return (
            <TableRow key={animal.id}>
              <TableCell>
                {animal.imageUrl ? (
                  <Image 
                      src={animal.imageUrl} 
                      alt={animal.animalId} 
                      width={60} 
                      height={60} 
                      className="rounded-md object-cover aspect-square"
                      data-ai-hint={animal.dataAiHint || "livestock animal"}
                  />
                ) : (
                  <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center text-muted-foreground" data-ai-hint={animal.dataAiHint || "livestock silhouette"}>
                     <Tag className="h-6 w-6" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{idDisplay}</TableCell>
              <TableCell>{animal.livestockType}</TableCell>
              <TableCell>{animal.breed}</TableCell>
              <TableCell>{keyDate}</TableCell>
              <TableCell>{getPenName(animal.penId)}</TableCell>
              <TableCell>
                {isBatch ? (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{(animal as BatchLivestock).quantity}</span>
                  </div>
                ) : (
                  (animal as IndividualLivestock).gender
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/livestock/${animal.id}`} title="View">
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {/* Edit and Delete can be added later */}
              </TableCell>
            </TableRow>
          );
        }) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center h-24">
              No livestock found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
