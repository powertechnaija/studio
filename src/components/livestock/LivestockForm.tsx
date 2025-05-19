
"use client";

import { z } from 'zod'; // Added this line
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Livestock, Pen, ActivityLog, ImportantDate } from '@/lib/types';

const activityLogSchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  type: z.enum(['Feeding', 'Medication', 'Vaccination', 'Observation', 'Other']),
  description: z.string().min(1, "Description is required."),
});

const importantDateSchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  eventName: z.string().min(1, "Event name is required."),
  notes: z.string().optional(),
});

const livestockFormSchema = z.object({
  animalId: z.string().min(1, 'Animal ID is required'),
  breed: z.string().min(1, 'Breed is required'),
  birthDate: z.date({ required_error: "Birth date is required."}),
  gender: z.enum(['Male', 'Female', 'Unknown']),
  penId: z.string().optional(),
  healthRecords: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
  activityLogs: z.array(activityLogSchema).optional(),
  importantDates: z.array(importantDateSchema).optional(),
});

export type LivestockFormData = z.infer<typeof livestockFormSchema>;

interface LivestockFormProps {
  pens: Pen[];
  onSubmit: (data: LivestockFormData) => void;
  initialData?: Partial<Livestock>; // For editing
  isLoading?: boolean;
}

export function LivestockForm({ pens, onSubmit, initialData, isLoading }: LivestockFormProps) {
  const form = useForm<LivestockFormData>({
    resolver: zodResolver(livestockFormSchema),
    defaultValues: {
      animalId: initialData?.animalId || '',
      breed: initialData?.breed || '',
      birthDate: initialData?.birthDate ? new Date(initialData.birthDate) : undefined,
      gender: initialData?.gender || 'Unknown',
      penId: initialData?.penId || '',
      healthRecords: initialData?.healthRecords || '',
      imageUrl: initialData?.imageUrl || '',
      dataAiHint: (initialData as any)?.dataAiHint || '', // Temp fix if type doesn't have it
      activityLogs: initialData?.activityLogs?.map(log => ({...log, date: new Date(log.date)})) || [],
      importantDates: initialData?.importantDates?.map(date => ({...date, date: new Date(date.date)})) || [],
    },
  });

  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
    control: form.control,
    name: "activityLogs",
  });

 const { fields: importantDateFields, append: appendImportantDate, remove: removeImportantDate } = useFieldArray({
    control: form.control,
    name: "importantDates",
  });

  const handleSubmit = (data: LivestockFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="animalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Animal ID/Tag</FormLabel>
                <FormControl><Input placeholder="e.g., COW-001" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed</FormLabel>
                <FormControl><Input placeholder="e.g., Holstein" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Birth Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="penId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pen</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Assign to a pen" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {pens.map(pen => <SelectItem key={pen.id} value={pen.id}>{pen.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL (Optional)</FormLabel>
                <FormControl><Input placeholder="https://placehold.co/100x100.png" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dataAiHint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image AI Hint (Optional, 1-2 words for placeholder)</FormLabel>
                <FormControl><Input placeholder="e.g. jersey cow" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="healthRecords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Health Records / Notes</FormLabel>
              <FormControl><Textarea placeholder="General health notes, vaccinations, treatments..." {...field} className="min-h-[100px]" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Activity Logs */}
        <div>
          <h3 className="text-lg font-medium mb-2">Activity Logs</h3>
          {activityFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-4 items-end mb-4 p-4 border rounded-md">
              <FormField control={form.control} name={`activityLogs.${index}.date`}
                render={({ field: dateField }) => (
                  <FormItem><FormLabel>Date</FormLabel>
                    <Popover><PopoverTrigger asChild>
                      <FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !dateField.value && "text-muted-foreground")}>
                        {dateField.value ? format(dateField.value, "PPP") : <span>Pick date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                    </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateField.value} onSelect={dateField.onChange} initialFocus /></PopoverContent></Popover>
                  <FormMessage /></FormItem>)} />
              <FormField control={form.control} name={`activityLogs.${index}.type`}
                render={({ field: typeField }) => (
                  <FormItem><FormLabel>Type</FormLabel>
                    <Select onValueChange={typeField.onChange} defaultValue={typeField.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Feeding">Feeding</SelectItem>
                      <SelectItem value="Medication">Medication</SelectItem>
                      <SelectItem value="Vaccination">Vaccination</SelectItem>
                      <SelectItem value="Observation">Observation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name={`activityLogs.${index}.description`}
                render={({ field: descField }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...descField} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="button" variant="outline" size="icon" onClick={() => removeActivity(index)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendActivity({ date: new Date(), type: 'Feeding', description: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Activity Log</Button>
        </div>
        
        {/* Important Dates */}
        <div>
          <h3 className="text-lg font-medium mb-2">Important Dates</h3>
          {importantDateFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-4 items-end mb-4 p-4 border rounded-md">
               <FormField control={form.control} name={`importantDates.${index}.date`}
                render={({ field: dateField }) => (
                  <FormItem><FormLabel>Date</FormLabel>
                    <Popover><PopoverTrigger asChild>
                      <FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !dateField.value && "text-muted-foreground")}>
                        {dateField.value ? format(dateField.value, "PPP") : <span>Pick date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                    </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateField.value} onSelect={dateField.onChange} initialFocus /></PopoverContent></Popover>
                  <FormMessage /></FormItem>)} />
              <FormField control={form.control} name={`importantDates.${index}.eventName`}
                render={({ field: nameField }) => (<FormItem><FormLabel>Event Name</FormLabel><FormControl><Input {...nameField} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name={`importantDates.${index}.notes`}
                render={({ field: notesField }) => (<FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Input {...notesField} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="button" variant="outline" size="icon" onClick={() => removeImportantDate(index)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendImportantDate({ date: new Date(), eventName: '', notes: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Important Date</Button>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? 'Saving...' : (initialData?.id ? 'Update Livestock' : 'Add Livestock')}
        </Button>
      </form>
    </Form>
  );
}
