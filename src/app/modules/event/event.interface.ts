export interface ICreateEvent {
  eventName: string;
  description?: string;
  date: string;
  location?: string;
  maxParticipants: number;
  minParticipants: number;
  joinedParticipants: number;
  status?: string;
  image?: string;
  joiningFee?: number;
  category: string;
  host?: string;
  // hostId: string;
}
