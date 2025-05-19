
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Home, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const penFormSchema = z.object({
  name: z.string().min(1, 'Pen name is required.'),
  description: z.string().optional(),
});

type PenFormData = z.infer<typeof penFormSchema>;

export function PenManagement() {
  const { pens, addPen } = useData();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<PenFormData>({
    resolver: zodResolver(penFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleSubmit = (data: PenFormData) => {
    addPen(data);
    toast({
      title: "Pen Added",
      description: `Pen "${data.name}" has been successfully created.`,
    });
    form.reset();
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5 text-primary" /> Pen Management</CardTitle>
            <CardDescription>Configure and view your livestock pens.</CardDescription>
          </div>
          {!showForm && (
             <Button onClick={() => setShowForm(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Pen
            </Button>
          )}
        </CardHeader>
        {showForm && (
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4 border rounded-lg">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pen Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Main Pasture" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl><Textarea placeholder="e.g., For grazing cows, access to water trough" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                    <Button type="submit">Save Pen</Button>
                    <Button type="button" variant="outline" onClick={() => {setShowForm(false); form.reset();}}>Cancel</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Pens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Livestock Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pens.length > 0 ? pens.map((pen) => (
                <TableRow key={pen.id}>
                  <TableCell className="font-medium">{pen.name}</TableCell>
                  <TableCell>{pen.description || 'N/A'}</TableCell>
                  <TableCell>
                    {/* Placeholder for livestock count, actual count would need to query livestock data */}
                    {useData().livestock.filter(l => l.penId === pen.id).length}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No pens configured yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
