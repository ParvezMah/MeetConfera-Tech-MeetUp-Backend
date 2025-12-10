import z from "zod";


const createEventSchema = z.object({
  body: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    maxParticipants: z.number(),
    image: z.string().optional(),
    category: z.string().optional(),
    hostId: z.string(),
  }),
})

export const EventsValidation = {
    createEventSchema
}