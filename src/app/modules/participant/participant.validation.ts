import z from "zod";

const createParticipantSchema = z.object({
  body: z.object({
    // userId: z.string(),
    eventId: z.string(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    participantId: z.string(),
    status: z.enum(["CANCELLED", "REJECTED", "JOINED", "WAITING"]),
  }),
});

export const ParticipantValidation = {
  createParticipantSchema,
  updateStatusSchema,
};
