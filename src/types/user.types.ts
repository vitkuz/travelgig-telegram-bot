import { z } from 'zod';
import { userSchema, createUserSchema, updateUserSchema } from '../schemas/user.schema';

// {"userId":"5246112454","timeFilter":null,"domainFilter":null,"showLiked":false,"searchQuery":"zxczxc","id":"04f43abc-011d-4be6-b432-59b90e8b3e4b","name":"zxczxc","createdAt":1734900793433,"hasNotification":false}
// "name":"zxczxc","createdAt":1734900793433,"hasNotification":false
export interface SearchFilters {
    id?: string; // Added ID field
    userId: string;
    timeFilter: string | null;
    domainFilter: string | null;
    showLiked: boolean;
    searchQuery: string;
    name: string;
    createdAt: number;
    hasNotification: boolean;
}

export type User = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;