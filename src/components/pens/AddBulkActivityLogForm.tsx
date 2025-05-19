
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ActivityLog } from '@/lib/types';

const bulkActivityLogFormSchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  type: z.enum(['Feeding', 'Medication', 'Vaccination', 'Observation', 'Other'], { required_error: "Type is required." }),
  description: z.string().min(1, "Description is required.").max(200, "Description is too long."),
});

export type BulkActivityLogFormData = z.infer<typeof bulkActivityLogFormSchema>;

interface AddBulkActivityLogFormProps {
  penName: string;
  onSubmit: (data: BulkActivityLogFormData) => void;
  onCancel: () => void;
}

export function AddBulkActivityLogForm({ penName, onSubmit, onCancel }: AddBulkActivityLogFormProps) {
  const form = useForm<BulkActivityLogFormData>({
    resolver: zodResolver(bulkActivityLogFormSchema),
    defaultValues: {
      date: new Date(),
      type: undefined,
      description: '',
    },
  });

  const handleFormSubmit = (data: BulkActivityLogFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Activity</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type of Activity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Feeding">Feeding</SelectItem>
                  <SelectItem value="Medication">Medication</SelectItem>
                  <SelectItem value="Vaccination">Vaccination</SelectItem>
                  <SelectItem value="Observation">Observation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Provide details about the activity for all animals in ${penName}...`}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Log Activity for Pen</Button>
        </div>
      </form>
    </Form>
  );
}
