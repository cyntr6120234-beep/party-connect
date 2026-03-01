"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Clipboard, ClipboardCheck } from "lucide-react";
import { Party } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PartyDetailsProps {
  party: Party;
}

export function PartyDetails({ party }: PartyDetailsProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      toast({ title: "Link Copied!", description: "Invitation link copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const partyDate = party.dateTime.toDate();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight">{party.occasion}</CardTitle>
        <CardDescription className="text-lg pt-1">
          Created on {format(party.createdAt.toDate(), "MMMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">{party.description}</p>
        
        <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{format(partyDate, "EEEE, MMMM do, yyyy")}</span>
            </div>
            <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <span>{format(partyDate, "h:mm a")}</span>
            </div>
            <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{party.location}</span>
            </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-2">Share this party!</h3>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" value={shareUrl} readOnly className="bg-muted" />
            <Button type="button" size="icon" onClick={handleCopy} aria-label="Copy link">
              {isCopied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
