
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Home, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { livestockTypes, type LivestockType } from '@/lib/types';

const penFormSchema = z.object({
  name: z.string().min(1, 'Pen name is required.'),
  description: z.string().optional(),
  allowedLivestockType: z.enum(livestockTypes as [LivestockType, ...LivestockType[]]).nullable().optional(),
});

type PenFormData = z.infer<typeof penFormSchema>;

export function PenManagement() {
  const { pens, addPen, getLivestockInPen } = useData(); // Removed updatePen as it's not fully implemented for editing here
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  // const [editingPen, setEditingPen] = useState<Pen | null>(null); // For future edit functionality

  const form = useForm<PenFormData>({
    resolver: zodResolver(penFormSchema),
    defaultValues: {
      name: '',
      description: '',
      allowedLivestockType: null,
    },
  });

  // useEffect(() => { // For future edit functionality
  //   if (editingPen) {
  //     form.reset({
  //       name: editingPen.name,
  //       description: editingPen.description || '',
  //       allowedLivestockType: editingPen.allowedLivestockType || null,
  //     });
  //     setShowForm(true);
  //   } else {
  //     form.reset({ name: '', description: '', allowedLivestockType: null });
  //   }
  // }, [editingPen, form]);

  const handleSubmit = (data: PenFormData) => {
    // if (editingPen) {
    //   // updatePen({ ...editingPen, ...data, allowedLivestockType: data.allowedLivestockType || null });
    //   // toast({ title: "Pen Updated", description: `Pen "${data.name}" has been updated.` });
    //   // setEditingPen(null);
    // } else {
      addPen({ ...data, allowedLivestockType: data.allowedLivestockType || null });
      toast({ title: "Pen Added", description: `Pen "${data.name}" has been successfully created.` });
    // }
    form.reset();
    setShowForm(false);
  };

  // const handleEdit = (pen: Pen) => { // For future edit functionality
  //   setEditingPen(pen);
  // };

  const handleCancel = () => {
    setShowForm(false);
    // setEditingPen(null);
    form.reset();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5 text-primary" /> Pen Management</CardTitle>
            <CardDescription>Configure and view your livestock pens. You can assign a specific livestock type to a pen, or leave it unassigned to be determined by the first animal added.</CardDescription>
          </div>
          {!showForm && (
             <Button onClick={() => { /*setEditingPen(null);*/ setShowForm(true); }}>
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
                <FormField
                  control={form.control}
                  name="allowedLivestockType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowed Livestock Type (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "null" ? null : value)} value={field.value || "null"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a livestock type (or leave unassigned)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={"null"}>Unassigned / Flexible</SelectItem>
                          {livestockTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Assigning a type restricts this pen to only that livestock type. If unassigned, the type will be set by the first animal added.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                    <Button type="submit">{false /*editingPen*/ ? 'Update Pen' : 'Save Pen'}</Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
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
                <TableHead>Allowed Livestock Type</TableHead>
                <TableHead>Current Livestock Count</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pens.length > 0 ? pens.map((pen) => (
                <TableRow key={pen.id}>
                  <TableCell className="font-medium">{pen.name}</TableCell>
                  <TableCell>{pen.description || 'N/A'}</TableCell>
                  <TableCell>{pen.allowedLivestockType || 'Flexible (Unassigned)'}</TableCell>
                  <TableCell>
                    {getLivestockInPen(pen.id).length}
                  </TableCell>
                  {/* <TableCell> Future edit button
                    <Button variant="outline" size="sm" onClick={() => handleEdit(pen)}>Edit</Button>
                  </TableCell> */}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
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
