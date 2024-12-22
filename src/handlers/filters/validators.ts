// import { z } from 'zod';
//
// export const createUserSchema = z.object({
//     firstName: z.string().min(1, 'First name is required'),
//     lastName: z.string().optional(),
//     email: z.string().email('Invalid email format')
// });
//
// export const updateUserSchema = createUserSchema.partial();