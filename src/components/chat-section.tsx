"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessagesSquare, UserPlus } from "lucide-react";
import { format } from "date-fns";

import { Message } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { sendMessage } from "@/app/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ChatSectionProps {
  partyId: string;
  messages: Message[];
}

export function ChatSection({ partyId, messages }: ChatSectionProps) {
  const [guestName, setGuestName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedName = localStorage.getItem(`partyconnect_guest_${partyId}`);
    if (savedName) {
      setGuestName(savedName);
    }
  }, [partyId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  }, [messages]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setGuestName(nameInput.trim());
      localStorage.setItem(`partyconnect_guest_${partyId}`, nameInput.trim());
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !guestName) return;

    const formData = new FormData();
    formData.append("text", messageInput);
    formData.append("senderName", guestName);
    formData.append("partyId", partyId);

    setMessageInput("");
    const result = await sendMessage(formData);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Message failed",
        description: "Could not send your message. Please try again.",
      });
      setMessageInput(messageInput); // Restore input if send fails
    }
  };
  
  if (!guestName) {
    return (
      <Card className="shadow-lg h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Join the Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <p className="text-muted-foreground text-sm">Enter a name to start chatting with other guests.</p>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              required
            />
            <Button type="submit" className="w-full">Join Chat</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg h-full flex flex-col max-h-[70vh]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessagesSquare className="h-6 w-6 text-primary" />
          Live Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{msg.senderName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-sm">{msg.senderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(msg.sentAt.toDate(), "p")}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg rounded-tl-none mt-1">
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground pt-16">
                <p>No messages yet.</p>
                <p>Start the conversation!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
          />
          <Button type="submit" size="icon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
