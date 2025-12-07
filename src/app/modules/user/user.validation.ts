import { z } from "zod";

export const createUserSchema = z.object({
  password: z.string(),
  user: z.object({
    email: z.string({error: "Email is required!"}),
    name: z.string({error: "Name is required!"}),
    contactNumber: z.string({error: "Contact number is required!"}),
    address: z.string({error: "Address is required!"})
  }),
});



// TypeScript type for the schema
export const UserValidation = {
    createUserSchema
}
