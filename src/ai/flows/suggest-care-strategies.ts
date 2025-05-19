'use server';

/**
 * @fileOverview This file defines a Genkit flow that analyzes livestock health records and environmental conditions to suggest optimized care strategies.
 *
 * - suggestCareStrategies - A function that accepts livestock health records and environmental conditions as input and returns optimized care strategies.
 * - SuggestCareStrategiesInput - The input type for the suggestCareStrategies function.
 * - SuggestCareStrategiesOutput - The return type for the suggestCareStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCareStrategiesInputSchema = z.object({
  healthRecords: z
    .string()
    .describe('A detailed record of the livestock health, including any past illnesses, treatments, and vaccinations.'),
  environmentalConditions: z
    .string()
    .describe(
      'A description of the environmental conditions the livestock are exposed to, including temperature, humidity, and any other relevant factors.'
    ),
});

export type SuggestCareStrategiesInput = z.infer<typeof SuggestCareStrategiesInputSchema>;

const SuggestCareStrategiesOutputSchema = z.object({
  careStrategies: z
    .string()
    .describe('A list of optimized care strategies based on the provided health records and environmental conditions.'),
  reasoning: z
    .string()
    .describe('Explanation of how the care strategies are optimized.'),
});

export type SuggestCareStrategiesOutput = z.infer<typeof SuggestCareStrategiesOutputSchema>;

export async function suggestCareStrategies(
  input: SuggestCareStrategiesInput
): Promise<SuggestCareStrategiesOutput> {
  return suggestCareStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCareStrategiesPrompt',
  input: {schema: SuggestCareStrategiesInputSchema},
  output: {schema: SuggestCareStrategiesOutputSchema},
  prompt: `You are an AI assistant specializing in livestock health and care. Analyze the provided health records and environmental conditions to suggest optimized care strategies for the livestock.

Health Records: {{{healthRecords}}}
Environmental Conditions: {{{environmentalConditions}}}

Consider all factors and provide a comprehensive list of care strategies, along with a clear explanation of why these strategies are recommended.
`,
});

const suggestCareStrategiesFlow = ai.defineFlow(
  {name: 'suggestCareStrategiesFlow', inputSchema: SuggestCareStrategiesInputSchema, outputSchema: SuggestCareStrategiesOutputSchema},
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
