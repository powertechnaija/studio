
"use client";

import type { Livestock, Pen } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, Edit3, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface LivestockTableProps {
  livestock: Livestock[];
  pens: Pen[];
  onDelete?: (id: string) => void; // Optional: Add delete functionality later
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
          <TableHead>Animal ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Breed</TableHead>
          <TableHead>Birth Date</TableHead>
          <TableHead>Pen</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {livestock.length > 0 ? livestock.map((animal) => (
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
                <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
              )}
            </TableCell>
            <TableCell className="font-medium">{animal.animalId}</TableCell>
            <TableCell>{animal.livestockType}</TableCell>
            <TableCell>{animal.breed}</TableCell>
            <TableCell>{new Date(animal.birthDate).toLocaleDateString()}</TableCell>
            <TableCell>{getPenName(animal.penId)}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/livestock/${animal.id}`} title="View">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              {/* Edit and Delete can be added later */}
              {/* 
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/livestock/${animal.id}/edit`} title="Edit">
                  <Edit3 className="h-4 w-4" />
                </Link>
              </Button>
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={() => onDelete(animal.id)} title="Delete" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              */}
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center h-24">
              No livestock found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
