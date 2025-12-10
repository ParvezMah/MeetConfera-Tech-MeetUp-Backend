export interface ICreateEvent {
  title: string
  description?: string
  date: string
  maxParticipants: number
  image?: string
  category?: string
  hostId: string
}