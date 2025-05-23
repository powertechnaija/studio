
"use client";

import { useEffect, useMemo } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Livestock, Pen, ActivityLog, ImportantDate, LivestockType, IndividualLivestock, BatchLivestock } from '@/lib/types';
import { livestockTypes } from '@/lib/types';
import { useData } from '@/contexts/DataContext';

// Schemas for dynamic form validation
const activityLogSchema = z.object({
  id: z.string().optional(), // for existing logs when editing
  date: z.date({ required_error: "Date is required." }),
  type: z.enum(['Feeding', 'Medication', 'Vaccination', 'Observation', 'Other']),
  description: z.string().min(1, "Description is required."),
});

const importantDateSchema = z.object({
  id: z.string().optional(), // for existing logs when editing
  date: z.date({ required_error: "Date is required." }),
  eventName: z.string().min(1, "Event name is required."),
  notes: z.string().optional(),
});

const baseLivestockSchema = z.object({
  livestockType: z.enum(livestockTypes as [LivestockType, ...LivestockType[]], { required_error: "Livestock type is required." }),
  penId: z.string().optional(),
  healthRecords: z.string().optional(),
  imageUrl: z.string().url({ message: "Invalid URL format." }).optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
  activityLogs: z.array(activityLogSchema).optional(),
  importantDates: z.array(importantDateSchema).optional(),
});

const individualLivestockSchema = baseLivestockSchema.extend({
  livestockType: z.enum(['Mega Stock', 'Mid Stock']),
  animalId: z.string().min(1, 'Animal ID is required'),
  breed: z.string().min(1, 'Breed is required'),
  birthDate: z.date({ required_error: "Birth date is required." }),
  gender: z.enum(['Male', 'Female', 'Unknown'], { required_error: "Gender is required."}),
  quantity: z.undefined().optional(),
});

const batchLivestockSchema = baseLivestockSchema.extend({
  livestockType: z.enum(['Mini Stock', 'Micro Stock']),
  animalId: z.string().min(1, 'Batch/Colony ID is required'), // Repurposed label
  breed: z.string().min(1, 'Type/Strain is required'), // Repurposed label
  quantity: z.number({required_error: "Quantity is required."}).min(1, "Quantity must be at least 1."),
  birthDate: z.date().optional(), // Optional for batch, e.g., hatch date
  gender: z.undefined().optional(), // Not applicable for batch
});

export const livestockFormSchema = z.discriminatedUnion("livestockType", [
  individualLivestockSchema,
  batchLivestockSchema,
]);

export type LivestockFormData = z.infer<typeof livestockFormSchema>;

interface LivestockFormProps {
  allPens: Pen[]; // Renamed from pens to allPens for clarity
  onSubmit: (data: LivestockFormData) => void;
  initialData?: Partial<Livestock>;
  isLoading?: boolean;
}

export function LivestockForm({ allPens, onSubmit, initialData, isLoading }: LivestockFormProps) {
  const { getLivestockInPen } = useData();

  const form = useForm<LivestockFormData>({
    resolver: zodResolver(livestockFormSchema),
    defaultValues: initialData ? {
        ...initialData,
        birthDate: initialData.birthDate ? new Date(initialData.birthDate) : undefined,
        quantity: initialData.livestockType === 'Mini Stock' || initialData.livestockType === 'Micro Stock' ? (initialData as BatchLivestock).quantity : undefined,
        activityLogs: initialData.activityLogs?.map(log => ({...log, date: new Date(log.date)})),
        importantDates: initialData.importantDates?.map(date => ({...date, date: new Date(date.date)}))
    } : {
      livestockType: undefined,
      animalId: '',
      breed: '',
      birthDate: undefined,
      gender: 'Unknown',
      penId: '',
      healthRecords: '',
      imageUrl: '',
      dataAiHint: '',
      quantity: undefined,
      activityLogs: [],
      importantDates: [],
    },
  });

  const watchedLivestockType = useWatch({ control: form.control, name: 'livestockType' });

  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
    control: form.control,
    name: "activityLogs",
  });

  const { fields: importantDateFields, append: appendImportantDate, remove: removeImportantDate } = useFieldArray({
    control: form.control,
    name: "importantDates",
  });

  // Filter pens based on selected livestock type
  const availablePens = useMemo(() => {
    if (!watchedLivestockType) return allPens; // Show all if no type selected yet

    return allPens.filter(pen => {
      // If pen has a specific type, it must match
      if (pen.allowedLivestockType && pen.allowedLivestockType !== watchedLivestockType) {
        return false;
      }
      // If pen has no specific type (flexible), check if it's empty or contains same type
      if (!pen.allowedLivestockType) {
        const animalsInThisPen = getLivestockInPen(pen.id);
        if (animalsInThisPen.length > 0 && animalsInThisPen.some(a => a.livestockType !== watchedLivestockType)) {
          return false; // Contains animals of a different type
        }
      }
      return true;
    });
  }, [watchedLivestockType, allPens, getLivestockInPen]);


  // Reset conditional fields when livestockType changes
  useEffect(() => {
    if (watchedLivestockType === 'Mega Stock' || watchedLivestockType === 'Mid Stock') {
      form.setValue('quantity', undefined);
    } else if (watchedLivestockType === 'Mini Stock' || watchedLivestockType === 'Micro Stock') {
      form.setValue('birthDate', undefined);
      form.setValue('gender', undefined);
    }
  }, [watchedLivestockType, form]);


  const handleSubmit = (data: LivestockFormData) => {
    onSubmit(data);
  };
  
  const isBatchType = watchedLivestockType === 'Mini Stock' || watchedLivestockType === 'Micro Stock';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
            control={form.control}
            name="livestockType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Livestock Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger autoFocus={!initialData?.id}>
                      <SelectValue placeholder="Select livestock type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {livestockTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        {watchedLivestockType && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="animalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isBatchType ? 'Batch/Colony ID *' : 'Animal ID/Tag *'}</FormLabel>
                    <FormControl><Input placeholder={isBatchType ? "e.g., CHIX-B1-001" : "e.g., COW-001"} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isBatchType ? 'Type/Strain *' : 'Breed *'}</FormLabel>
                    <FormControl><Input placeholder={isBatchType ? "e.g., Broiler, Italian Bee" : "e.g., Holstein"} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isBatchType && (
                <>
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Birth Date *</FormLabel>
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
                        <FormLabel>Gender *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
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
                </>
              )}

              {isBatchType && (
                <>
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity *</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 50" {...field} 
                        onChange={event => field.onChange(+event.target.value)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="birthDate" // repurposed for Hatch Date / Batch Start Date for Mini/Micro
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Est. Hatch/Start Date (Optional)</FormLabel>
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
                </>
              )}
              
              <FormField
                control={form.control}
                name="penId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pen</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Assign to a pen" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {availablePens.map(pen => <SelectItem key={pen.id} value={pen.id}>{pen.name} ({pen.allowedLivestockType || 'Flexible'})</SelectItem>)}
                      </SelectContent>
                    </Select>
                     <FormDescription>
                      Only pens compatible with the selected livestock type are shown.
                    </FormDescription>
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
                    <FormControl><Input placeholder="https://placehold.co/300x300.png" {...field} /></FormControl>
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
                  <FormLabel>Health Records / Notes {isBatchType ? '(for batch)' : ''}</FormLabel>
                  <FormControl><Textarea placeholder={isBatchType ? "Batch health notes, vaccinations, treatments..." : "General health notes, vaccinations, treatments..."} {...field} className="min-h-[100px]" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Activity Logs and Important Dates remain, applying to individual or batch */}
             <div>
              <h3 className="text-lg font-medium mb-2">Activity Logs {isBatchType ? '(for batch)' : ''}</h3>
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
            
            <div>
              <h3 className="text-lg font-medium mb-2">Important Dates {isBatchType ? '(for batch)' : ''}</h3>
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
          </>
        )}

        <Button type="submit" disabled={isLoading || !watchedLivestockType} className="w-full md:w-auto">
          {isLoading ? 'Saving...' : (initialData?.id ? 'Update Livestock' : 'Add Livestock')}
        </Button>
      </form>
    </Form>
  );
}
