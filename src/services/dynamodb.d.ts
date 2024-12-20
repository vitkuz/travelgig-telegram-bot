type TelegramUser = {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
};
export declare function recordUser(user: TelegramUser): Promise<void>;
export declare function recordAuthToken(userId: string, secret: string, ttl: number): Promise<void>;
export declare function updateUserBalance(userId: string, amount: number): Promise<void>;
export declare function recordPayment(paymentId: string, userId: string, amount: number, currency: string): Promise<void>;
export {};
