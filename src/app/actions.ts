"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { generatePartyThemes as AIGeneratePartyThemes, PartyThemeGeneratorInput } from "@/ai/flows/party-theme-generator";

const PartyFormSchema = z.object({
  occasion: z.string().min(1, "Occasion is required."),
  description: z.string().min(1, "Description is required."),
  location: z.string().min(1, "Location is required."),
  date: z.date({ required_error: "Date is required." }),
  time: z.string().min(1, "Time is required."),
});

export async function createParty(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());

  // Manually parse date and time
  const date = new Date(rawFormData.date as string);
  const [hours, minutes] = (rawFormData.time as string).split(':');
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));

  const validatedFields = PartyFormSchema.safeParse({
    occasion: rawFormData.occasion,
    description: rawFormData.description,
    location: rawFormData.location,
    date: date,
    time: rawFormData.time,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const docRef = await addDoc(collection(db, "parties"), {
      occasion: validatedFields.data.occasion,
      description: validatedFields.data.description,
      location: validatedFields.data.location,
      dateTime: Timestamp.fromDate(validatedFields.data.date),
      createdAt: Timestamp.now(),
      attendees: [],
    });
    return { partyId: docRef.id };
  } catch (error) {
    console.error("Error creating party:", error);
    return {
      errors: { _form: ["Failed to create party. Please try again."] },
    };
  }
}

export async function generatePartyThemes(input: PartyThemeGeneratorInput) {
    try {
        const themes = await AIGeneratePartyThemes(input);
        return themes;
    } catch (error) {
        console.error("Error generating party themes:", error);
        return { themes: [] };
    }
}

const RsvpSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  partyId: z.string(),
});

export async function addRsvp(prevState: any, formData: FormData) {
  const validatedFields = RsvpSchema.safeParse({
    name: formData.get("name"),
    partyId: formData.get("partyId"),
  });

  if (!validatedFields.success) {
    return { message: "Validation failed." };
  }

  const { name, partyId } = validatedFields.data;

  try {
    const partyRef = doc(db, "parties", partyId);
    await updateDoc(partyRef, {
      attendees: arrayUnion({
        name,
        rsvpdAt: Timestamp.now(),
      }),
    });
    revalidatePath(`/party/${partyId}`);
    return { message: "RSVP successful!" };
  } catch (error) {
    console.error("Error adding RSVP:", error);
    return { message: "Failed to RSVP." };
  }
}

const MessageSchema = z.object({
  text: z.string().min(1),
  senderName: z.string().min(1),
  partyId: z.string(),
});

export async function sendMessage(formData: FormData) {
  const validatedFields = MessageSchema.safeParse({
    text: formData.get("text"),
    senderName: formData.get("senderName"),
    partyId: formData.get("partyId"),
  });

  if (!validatedFields.success) {
    return { success: false, error: "Invalid message data." };
  }

  const { text, senderName, partyId } = validatedFields.data;

  try {
    const messagesRef = collection(db, "parties", partyId, "messages");
    await addDoc(messagesRef, {
      text,
      senderName,
      sentAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message." };
  }
}
