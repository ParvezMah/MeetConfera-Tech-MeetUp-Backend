export interface ICreateEvent {
  eventName: string;
  description?: string;
  date: string;
  location?: string;
  minParticipants: number;
  maxParticipants: number;
  status?: string;
  image?: string;
  joiningFee?: number;
  category: string;
  hostId: string;
}
