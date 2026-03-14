import * as z from "zod";

export const userSchema = z.object({
  id: z.int(),
  email: z.email(),
  name: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

// Example safeParse usage
// const result = userSchema.safeParse(data);
// if (!result.success) { /* handle error */ }
