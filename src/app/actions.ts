'use server';

import { generatePartyThemes as generatePartyThemesFlow } from '@/ai/flows/party-theme-generator';
import type { PartyThemeGeneratorInput, PartyThemeGeneratorOutput } from '@/ai/flows/party-theme-generator';


export async function generatePartyThemes(
  input: PartyThemeGeneratorInput
): Promise<PartyThemeGeneratorOutput> {
  return generatePartyThemesFlow(input);
}
