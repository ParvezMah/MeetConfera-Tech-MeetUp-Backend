import { z } from "zod";

// Schema for creating a user
export const createUserSchema = z.object({
    name: z.string({error: "Name is required"}),
    email: z.string({error: "Email is required"}),
    password: z.string({error: "Password is required"}),
});

// TypeScript type for the schema
export const UserValidation = {
    createUserSchema
}
