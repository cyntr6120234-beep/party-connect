import { Timestamp } from "firebase/firestore";

export interface Party {
  id: string;
  occasion: string;
  description: string;
  dateTime: Timestamp;
  location: string;
  createdAt: Timestamp;
  attendees: Attendee[];
}

export interface Attendee {
  name: string;
  rsvpdAt: Timestamp;
}

export interface Message {
  id: string;
  text: string;
  senderName: string;
  sentAt: Timestamp;
}
