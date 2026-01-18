import { EventCategory, EventStatus } from "@prisma/client";

export interface IEvent {
  eventName: string;
  description: string;
  date: Date;
  maxParticipants: number;
  minParticipants: number;
  joinedParticipants?: number;
  image?: string;
  joiningFee?: number;
  location?: string;
  status?: EventStatus;
  category: EventCategory;
  host?: string;
  // hostId: string;  // Because hostId will be taken from logged in user
}
