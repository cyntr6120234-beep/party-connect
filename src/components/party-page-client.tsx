"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Party, Attendee, Message } from "@/lib/types";
import { PartyDetails } from "@/components/party-details";
import { RsvpSection } from "@/components/rsvp-section";
import { ChatSection } from "@/components/chat-section";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Skeleton } from "@/components/ui/skeleton";

interface PartyPageClientProps {
  initialParty: Party;
}

export function PartyPageClient({ initialParty }: PartyPageClientProps) {
  const [party, setParty] = useState<Party>(initialParty);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  const heroImage = PlaceHolderImages.find(p => p.id === 'party-hero');

  useEffect(() => {
    const partyDocRef = doc(db, "parties", initialParty.id);
    const unsubscribeParty = onSnapshot(partyDocRef, (doc) => {
      if (doc.exists()) {
        const partyData = doc.data() as Omit<Party, 'id'>;
        setParty({ id: doc.id, ...partyData });
        setAttendees(partyData.attendees || []);
      }
    });

    const messagesColRef = collection(db, "parties", initialParty.id, "messages");
    const messagesQuery = query(messagesColRef, orderBy("sentAt", "asc"));
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages: Message[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(newMessages);
    });

    return () => {
      unsubscribeParty();
      unsubscribeMessages();
    };
  }, [initialParty.id]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <header className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8 shadow-lg">
          {!imageLoaded && <Skeleton className="absolute inset-0" />}
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              onLoad={() => setImageLoaded(true)}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PartyDetails party={party} />
            <RsvpSection partyId={party.id} attendees={attendees} />
          </div>
          <div className="lg:col-span-1">
            <ChatSection partyId={party.id} messages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
}
