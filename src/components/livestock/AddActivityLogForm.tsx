
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import type { ActivityLog } from '@/lib/types';

const activityLogFormSchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  type: z.enum(['Feeding', 'Medication', 'Vaccination', 'Observation', 'Other'], { required_error: "Type is required." }),
  description: z.string().min(1, "Description is required.").max(200, "Description is too long."),
});

type ActivityLogFormData = z.infer<typeof activityLogFormSchema>;

interface AddActivityLogFormProps {
  animalId: string;
  onLogAdded: () => void;
  onCancel: () => void;
}

export function AddActivityLogForm({ animalId, onLogAdded, onCancel }: AddActivityLogFormProps) {
  const { addActivityLog } = useData();
  const { toast } = useToast();

  const form = useForm<ActivityLogFormData>({
    resolver: zodResolver(activityLogFormSchema),
    defaultValues: {
      date: new Date(),
      type: undefined, // Ensure type is initially undefined to show placeholder
      description: '',
    },
  });

  const handleSubmit = (data: ActivityLogFormData) => {
    const newLog: Omit<ActivityLog, 'id'> = {
      date: data.date.toISOString(),
      type: data.type,
      description: data.description,
    };
    addActivityLog(animalId, newLog);
    toast({
      title: "Activity Log Added",
      description: `A new ${data.type} log has been recorded for this animal.`,
    });
    onLogAdded();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                  placeholder="Provide details about the activity..."
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
          <Button type="submit">Save Log</Button>
        </div>
      </form>
    </Form>
  );
}
