
"use client";

import type { Pen } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, Edit3, Trash2 } from 'lucide-react'; // Assuming Edit3 and Trash2 might be used later

interface PenWithLivestockCount extends Pen {
  livestockCount: number;
}

interface PensTableProps {
  pens: PenWithLivestockCount[];
  // onDelete?: (id: string) => void; // Optional: Add delete functionality later
}

export function PensTable({ pens /*, onDelete */ }: PensTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Livestock Count</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pens.length > 0 ? pens.map((pen) => (
          <TableRow key={pen.id}>
            <TableCell className="font-medium">{pen.name}</TableCell>
            <TableCell>{pen.description || 'N/A'}</TableCell>
            <TableCell>{pen.livestockCount}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/pens/${pen.id}`} title="View Details">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              {/* Edit and Delete can be added later from settings page */}
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center h-24">
              No pens found. <Link href="/settings" className="text-primary hover:underline">Add a pen in Settings.</Link>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
