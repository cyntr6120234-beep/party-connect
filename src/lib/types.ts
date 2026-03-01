import { Timestamp } from "firebase/firestore";

export interface Party {
  id: string;
  name: string;
  occasion: string; // From form, maps to name
  description: string;
  dateTime: Timestamp;
  location: string;
  organizerId: string;
  invitationLink: string;
  themeSuggestion?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
    id: string;
    displayName: string;
}

export interface RSVP {
  id: string;
  partyId: string;
  guestId: string;
  guestDisplayName: string;
  status: 'Attending' | 'Declined' | 'Maybe';
  respondedAt: Timestamp;
}

export interface Message {
  id: string;
  partyId: string;
  senderId: string;
  senderDisplayName: string;
  content: string;
  timestamp: Timestamp;
}
