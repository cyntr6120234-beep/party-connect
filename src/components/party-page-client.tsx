"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { notFound } from "next/navigation";

import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { Party, RSVP, Message, UserProfile } from "@/lib/types";
import { PartyDetails } from "@/components/party-details";
import { RsvpSection } from "@/components/rsvp-section";
import { ChatSection } from "@/components/chat-section";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Skeleton } from "@/components/ui/skeleton";
import Loading from "@/app/party/[id]/loading";

interface PartyPageClientProps {
  partyId: string;
}

export function PartyPageClient({ partyId }: PartyPageClientProps) {
  const firestore = useFirestore();
  const [imageLoaded, setImageLoaded] = useState(false);

  const partyRef = useMemoFirebase(() => doc(firestore, "parties", partyId), [firestore, partyId]);
  const { data: party, isLoading: isPartyLoading } = useDoc<Party>(partyRef);

  const rsvpsRef = useMemoFirebase(() => collection(firestore, "parties", partyId, "rsvps"), [firestore, partyId]);
  const { data: rsvps } = useCollection<RSVP>(rsvpsRef);

  const messagesRef = useMemoFirebase(() => collection(firestore, "parties", partyId, "chatMessages"), [firestore, partyId]);
  const messagesQuery = useMemoFirebase(() => query(messagesRef, orderBy("timestamp", "asc")), [messagesRef]);
  const { data: messages } = useCollection<Message>(messagesQuery);
  
  const heroImage = PlaceHolderImages.find(p => p.id === 'party-hero');

  if (isPartyLoading) {
    return <Loading />;
  }

  if (!party) {
    notFound();
  }

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
            <RsvpSection partyId={party.id} rsvps={rsvps || []} />
          </div>
          <div className="lg:col-span-1">
            <ChatSection partyId={party.id} messages={messages || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
