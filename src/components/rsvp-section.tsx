'use client';

import { useState, useEffect, useRef } from 'react';
import { PartyPopper, UserCheck, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

import { RSVP, UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  useFirestore,
  useUser,
  useDoc,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';

interface RsvpSectionProps {
  partyId: string;
  rsvps: RSVP[];
}

export function RsvpSection({ partyId, rsvps }: RsvpSectionProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firestore = useFirestore();
  const { user } = useUser();

  const userRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile } = useDoc<UserProfile>(userRef);

  useEffect(() => {
    if (userProfile?.displayName) {
      setName(userProfile.displayName);
    }
  }, [userProfile]);

  const handleRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user || !firestore) {
      toast({ variant: 'destructive', title: 'Name is required' });
      return;
    }
    setIsSubmitting(true);

    const rsvpData = {
      partyId: partyId,
      guestId: user.uid,
      status: 'Attending' as const,
      guestDisplayName: name.trim(),
      respondedAt: serverTimestamp(),
    };

    const promises = [];

    // If user has no profile, create one.
    if (!userProfile) {
      const userProfileData = { id: user.uid, displayName: name.trim() };
      const userDocRef = doc(firestore, 'users', user.uid);
      const profilePromise = setDoc(userDocRef, userProfileData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'write',
          requestResourceData: userProfileData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Propagate error
      });
      promises.push(profilePromise);
    }

    const rsvpsRef = collection(firestore, 'parties', partyId, 'rsvps');
    const rsvpPromise = addDoc(rsvpsRef, rsvpData).catch(serverError => {
      const permissionError = new FirestorePermissionError({
        path: rsvpsRef.path,
        operation: 'create',
        requestResourceData: rsvpData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError; // Propagate error
    });
    promises.push(rsvpPromise);

    try {
      await Promise.all(promises);
      toast({
        title: "You're on the list!",
        description: 'Thanks for RSVPing.',
      });
      formRef.current?.reset();
      setName(userProfile?.displayName || '');
    } catch (error) {
      // Error is already emitted, this catch is to prevent unhandled promise rejection
      // and to stop execution. The user will see the Next.js error overlay.
    } finally {
      setIsSubmitting(false);
    }
  };

  const userHasRsvpd = rsvps.some(rsvp => rsvp.guestId === user?.uid);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Guest List ({rsvps.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rsvps.length > 0 ? (
          <ul className="space-y-4">
            {rsvps
              .slice()
              .reverse()
              .map(rsvp => (
                <li key={rsvp.id} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{rsvp.guestDisplayName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold">{rsvp.guestDisplayName}</p>
                    {rsvp.respondedAt && (
                      <p className="text-xs text-muted-foreground">
                        RSVP'd {formatDistanceToNow(rsvp.respondedAt.toDate(), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <PartyPopper className="mx-auto h-12 w-12 mb-4" />
            <p>No one has RSVP'd yet.</p>
            <p>Be the first to join the party!</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        {userHasRsvpd ? (
          <p className="w-full text-center text-muted-foreground font-semibold">
            Thanks for RSVPing!
          </p>
        ) : (
          <form ref={formRef} onSubmit={handleRsvp} className="w-full space-y-4">
            <h3 className="font-semibold">Are you coming?</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                name="name"
                placeholder="Enter your name to RSVP"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={!!userProfile?.displayName}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "I'm In!"}
              </Button>
            </div>
          </form>
        )}
      </CardFooter>
    </Card>
  );
}
