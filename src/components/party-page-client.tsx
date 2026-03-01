"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { FileQuestion } from "lucide-react";

import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { Party, RSVP, Message } from "@/lib/types";
import { PartyDetails } from "@/components/party-details";
import { RsvpSection } from "@/components/rsvp-section";
import { ChatSection } from "@/components/chat-section";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Skeleton } from "@/components/ui/skeleton";
import Loading from "@/app/party/[id]/loading";
import { Button } from "./ui/button";

interface PartyPageClientProps {
  partyId: string;
}

function PartyNotFound() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center justify-center text-center py-16">
        <FileQuestion className="w-16 h-16 mb-4 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">Party Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This party does not exist or may have been removed.
        </p>
        <Button asChild>
          <Link href="/">Go back to Homepage</Link>
        </Button>
      </div>
    </div>
  )
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
    return <PartyNotFound />;
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
