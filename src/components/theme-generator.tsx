"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Loader2 } from "lucide-react";

import { PartyThemeGeneratorInput, PartyThemeGeneratorOutput } from "@/ai/flows/party-theme-generator";
import { generatePartyThemes } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ThemeGeneratorSchema = z.object({
  guestType: z.string().min(1, "Guest type is required."),
  additionalDetails: z.string().optional(),
});

type ThemeGeneratorValues = z.infer<typeof ThemeGeneratorSchema>;

interface ThemeGeneratorProps {
  form: any;
}

export function ThemeGenerator({ form: partyForm }: ThemeGeneratorProps) {
  const [generatedThemes, setGeneratedThemes] = useState<PartyThemeGeneratorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const themeForm = useForm<ThemeGeneratorValues>({
    resolver: zodResolver(ThemeGeneratorSchema),
    defaultValues: {
      guestType: 'Mixed Age Group',
      additionalDetails: '',
    },
  });

  const handleGenerateThemes = async (data: ThemeGeneratorValues) => {
    setIsLoading(true);
    setGeneratedThemes(null);
    const partyOccasion = partyForm.getValues("occasion");
    const partyDate = partyForm.getValues("date");
    
    const input: PartyThemeGeneratorInput = {
      occasion: partyOccasion || 'General Party',
      guestType: data.guestType,
      date: partyDate ? partyDate.toLocaleDateString('en-US', { month: 'long' }) : undefined,
      additionalDetails: data.additionalDetails,
    };
    
    const result = await generatePartyThemes(input);
    setGeneratedThemes(result);
    setIsLoading(false);
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">Need inspiration? Use our AI Theme Generator!</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="border-none shadow-none">
            <CardHeader className="p-2">
              <CardTitle className="text-lg">AI Party Theme Generator</CardTitle>
              <CardDescription>Fill in some details and let AI suggest some creative themes.</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <Form {...themeForm}>
                <form onSubmit={themeForm.handleSubmit(handleGenerateThemes)} className="space-y-4">
                  <FormField
                    control={themeForm.control}
                    name="guestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select guest type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Kids">Kids</SelectItem>
                            <SelectItem value="Adults">Adults</SelectItem>
                            <SelectItem value="Mixed Age Group">Mixed Age Group</SelectItem>
                            <SelectItem value="Family">Family</SelectItem>
                            <SelectItem value="Colleagues">Colleagues</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={themeForm.control}
                    name="additionalDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Details (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., outdoor, loves dogs, favorite color is blue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Ideas
                  </Button>
                </form>
              </Form>

              {isLoading && (
                <div className="mt-4 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground mt-2">Generating awesome ideas...</p>
                </div>
              )}

              {generatedThemes && generatedThemes.themes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Here are some ideas:</h3>
                  <Accordion type="multiple" className="w-full space-y-2">
                    {generatedThemes.themes.map((theme, index) => (
                      <AccordionItem value={`theme-${index}`} key={index} className="bg-background/50 rounded-md border">
                        <AccordionTrigger className="px-4 text-left">{theme.themeName}</AccordionTrigger>
                        <AccordionContent className="px-4">
                          <p>{theme.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
