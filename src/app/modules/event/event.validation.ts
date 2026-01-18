import z from "zod";

// const createEventZodSchema = z.object({
//   eventName: z.string().min(1, "Event name is required"),
//   description: z.string().optional(),
//   date: z.string().min(1, "Date is required"),
//   minParticipants: z.number(),
//   maxParticipants: z.number(),
//   location: z.string().optional(),
//   image: z.string().optional(),
//   joiningFee: z.number().optional(),
//   category: z.string(),
//   status: z.string().optional(),
// });



const createEventZodSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  date: z.coerce.date(),
  maxParticipants: z.number().int().positive(),
  minParticipants: z.number().int().positive(),
  joinedParticipants: z.number().int().optional(),
  joiningFee: z.number().int().optional(),
  location: z.string().optional(),
  status: z.enum([
    "OPEN", 
    "FULLED",
    "CANCELLED", 
    "COMPLETED"
  ]).optional().default("OPEN"),
  category: z.enum([
    "AI", 
    "MACHINE_LEARNING", 
    "DATA_SCIENCE", 
    "WEB_DEVELOPMENT", 
    "MOBILE_DEVELOPMENT",
    "CLOUD_COMPUTING",
    "CYBER_SECURITY",
    "BLOCKCHAIN",
    "DEVOPS",
    "GAMING",
    "ROBOTICS",
    "STARTUPS",
    "IOT",
    "SOFTWARE_ENGINEERING",
    "OTHER"
  ]), // adjust to your enum
  // hostId: z.string().uuid(),  // Because hostId will be taken from logged in user
});

export const EventsValidation = {
  createEventZodSchema,
};
