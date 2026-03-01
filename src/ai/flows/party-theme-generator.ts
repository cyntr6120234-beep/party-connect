'use server';
/**
 * @fileOverview A Genkit flow to generate creative and unique party theme suggestions.
 *
 * - generatePartyThemes - A function that handles the party theme generation process.
 * - PartyThemeGeneratorInput - The input type for the generatePartyThemes function.
 * - PartyThemeGeneratorOutput - The return type for the generatePartyThemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PartyThemeGeneratorInputSchema = z.object({
  occasion: z
    .string()
    .describe(
      'The occasion for the party (e.g., Birthday, Anniversary, Holiday, Graduation, Just Because).'
    ),
  guestType: z
    .string()
    .describe(
      'The type of guests attending (e.g., Kids, Adults, Mixed Age Group, Family, Colleagues).'
    ),
  date: z
    .string()
    .optional()
    .describe('The date or time of year for the party (e.g., Summer, Winter, Halloween, specific date).'),
  additionalDetails: z
    .string()
    .optional()
    .describe(
      'Any additional details, preferences, or constraints for the party theme (e.g., preferred colors, specific interests, budget considerations).'
    ),
});
export type PartyThemeGeneratorInput = z.infer<typeof PartyThemeGeneratorInputSchema>;

const PartyThemeGeneratorOutputSchema = z.object({
  themes: z
    .array(
      z.object({
        themeName: z.string().describe('A creative and unique name for the party theme.'),
        description: z
          .string()
          .describe(
            'A brief, engaging description of the party theme, including ideas for decorations, activities, or food.'
          ),
      })
    )
    .describe('A list of creative and unique party theme suggestions.'),
});
export type PartyThemeGeneratorOutput = z.infer<typeof PartyThemeGeneratorOutputSchema>;

export async function generatePartyThemes(
  input: PartyThemeGeneratorInput
): Promise<PartyThemeGeneratorOutput> {
  return partyThemeGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'partyThemeGeneratorPrompt',
  input: {schema: PartyThemeGeneratorInputSchema},
  output: {schema: PartyThemeGeneratorOutputSchema},
  prompt: `You are an imaginative and creative party planning assistant. Your goal is to suggest unique and memorable party themes based on the provided details.

Generate at least 3 distinct party theme ideas. Each theme should have a catchy name and a brief, engaging description that highlights key elements like decoration, activities, or food concepts.

Here are the details for the party:
Occasion: {{{occasion}}}
Guest Type: {{{guestType}}}
{{#if date}}Date/Time of Year: {{{date}}}{{/if}}
{{#if additionalDetails}}Additional Details/Preferences: {{{additionalDetails}}}{{/if}}

Please provide the themes in a structured JSON format as described by the output schema.`,
});

const partyThemeGeneratorFlow = ai.defineFlow(
  {
    name: 'partyThemeGeneratorFlow',
    inputSchema: PartyThemeGeneratorInputSchema,
    outputSchema: PartyThemeGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate party themes.');
    }
    return output;
  }
);
