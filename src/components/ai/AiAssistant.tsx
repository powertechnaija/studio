
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { suggestCareStrategies, type SuggestCareStrategiesInput, type SuggestCareStrategiesOutput } from '@/ai/flows/suggest-care-strategies';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const aiFormSchema = z.object({
  healthRecords: z.string().min(10, 'Please provide detailed health records.'),
  environmentalConditions: z.string().min(10, 'Describe the environmental conditions.'),
});

type AiFormData = z.infer<typeof aiFormSchema>;

export function AiAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuggestCareStrategiesOutput | null>(null);

  const form = useForm<AiFormData>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      healthRecords: '',
      environmentalConditions: '',
    },
  });

  const handleSubmit = async (data: AiFormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const aiOutput = await suggestCareStrategies(data);
      setResult(aiOutput);
    } catch (err) {
      console.error("AI suggestion error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="h-6 w-6 text-primary" /> AI-Powered Care Insights</CardTitle>
          <CardDescription>
            Enter livestock health records and environmental conditions to receive AI-optimized care strategies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="healthRecords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Records</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Recent coughing observed in 2 animals, one has slight fever. General diet is grass and supplemental hay..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="environmentalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environmental Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Current season is early spring, average temperature 10-15°C. High humidity in the mornings. Pasture is muddy in some areas..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Insights...
                  </>
                ) : (
                  'Get AI Suggestions'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
         <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-6 mt-8">
          <Card className="bg-accent/20 border-accent">
             <CardHeader>
              <CardTitle className="text-accent-foreground">Suggested Care Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{result.careStrategies}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reasoning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{result.reasoning}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
