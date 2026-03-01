"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { PartyPopper, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Attendee } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addRsvp } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RsvpSectionProps {
  partyId: string;
  attendees: Attendee[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "RSVPing..." : "I'm In!"}
    </Button>
  );
}

export function RsvpSection({ partyId, attendees }: RsvpSectionProps) {
  const initialState = { message: "" };
  const [state, formAction] = useFormState(addRsvp, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.message.includes("successful")) {
        toast({
          title: "You're on the list!",
          description: "Thanks for RSVPing.",
        });
        formRef.current?.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Oops!",
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Guest List ({attendees.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendees.length > 0 ? (
          <ul className="space-y-4">
            {attendees.slice().reverse().map((attendee, index) => (
              <li key={index} className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{attendee.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold">{attendee.name}</p>
                  <p className="text-xs text-muted-foreground">
                    RSVP'd {formatDistanceToNow(attendee.rsvpdAt.toDate(), { addSuffix: true })}
                  </p>
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
        <form ref={formRef} action={formAction} className="w-full space-y-4">
          <h3 className="font-semibold">Are you coming?</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input name="name" placeholder="Enter your name to RSVP" required />
            <input type="hidden" name="partyId" value={partyId} />
            <SubmitButton />
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
