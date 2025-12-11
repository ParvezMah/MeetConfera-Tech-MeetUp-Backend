import { z } from "zod";

export const createUserValidationSchema = z.object({
  password: z.string(),
  user: z.object({
    email: z.string({error: "Email is required!"}),
    name: z.string({error: "Name is required!"}),
    contactNumber: z.string({error: "Contact number is required!"}),
    location: z.string({error: "Location is required!"})
  }),
});

const createHostValidationSchema = z.object({
    password: z.string({ error: "Password is required" }),
    host: z.object({
        name: z.string({ error: "Name is required!" }),
        email: z.string({ error: "Email is required!" }).email(),
        contactNumber: z.string({ error: "Contact Number is required!" }),
        organization: z.string().optional(),
        profilePhoto: z.string().optional(),
    }),
});

const createAdminValidationSchema = z.object({
    password: z.string({ error: "Password is required" }),
    admin: z.object({
        name: z.string({ error: "Name is required!" }),
        email: z.string({ error: "Email is required!" }).email(),
        contactNumber: z.string({ error: "Contact Number is required!" }),
        profilePhoto: z.string().optional(),
    }),
});



// TypeScript type for the schema
export const UserValidation = {
    createUserValidationSchema,
    createHostValidationSchema,
    createAdminValidationSchema
}
