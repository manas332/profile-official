import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
  dateOfBirth: z.date().optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
