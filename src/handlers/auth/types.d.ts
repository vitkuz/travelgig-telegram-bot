export interface UserProfile {
    userId: string;
    firstName: string;
    lastName?: string;
    balance: number;
    createdAt: string;
}
export interface AuthLinkParams {
    userId: string;
    secret: string;
}
