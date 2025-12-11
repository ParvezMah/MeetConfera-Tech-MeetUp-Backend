import z from "zod";

const createEventSchema = z.object({
  body: z.object({
    eventName: z.string(),               // changed from 'title' to 'eventName'
    description: z.string().optional(),
    date: z.string(),
    minParticipants: z.number(),         // include minParticipants as per schema
    maxParticipants: z.number(),
    location: z.string().optional(),     // optional location
    image: z.string().optional(),
    joiningFee: z.number().optional(),   // optional joiningFee
    category: z.string().optional(),
    hostId: z.string(),
  }),
});

export const EventsValidation = {
  createEventSchema,
};
