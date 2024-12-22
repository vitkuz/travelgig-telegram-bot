export interface UserProfile {
    userId: string;
    firstName: string;
    lastName?: string;
    balance: number;
    createdAt: string;
    filters: any[];
}
export interface AuthLinkParams {
    userId: string;
    secret: string;
}
