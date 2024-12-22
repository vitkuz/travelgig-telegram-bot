import { z } from 'zod';
import { userSchema, createUserSchema, updateUserSchema } from '../schemas/user.schema';

export type User = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;