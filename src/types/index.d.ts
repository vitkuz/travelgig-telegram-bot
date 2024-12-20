export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}
export interface PaymentData {
    userId: string;
    amount: number;
    currency: string;
    chargeId: string;
}
