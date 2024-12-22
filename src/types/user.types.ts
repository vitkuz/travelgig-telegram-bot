import { z } from 'zod';
import { userSchema, createUserSchema, updateUserSchema } from '../schemas/user.schema';

export interface SearchFilters {
    id: string; // Added ID field
    timeFilter: string | null;
    domainFilter: string | null;
    showLiked: boolean;
    searchQuery: string;
}

export type User = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;