import { z } from 'zod';

export const userSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    balance: z.number().default(0),
    createdAt: z.string().datetime({ message: 'Invalid datetime format' }),
    firstName: z.string().min(1, 'First name is required'),
    languageCode: z.string().length(2, 'Language code must be 2 characters').default('en'),
    lastName: z.string().optional(),
    username: z.string().optional()
});

export type User = z.infer<typeof userSchema>;

// Schema for creating a new user
export const createUserSchema = userSchema.omit({
    // userId: true,
    // balance: true,
    // createdAt: true
});

// Schema for updating an existing user
export const updateUserSchema = createUserSchema.partial();