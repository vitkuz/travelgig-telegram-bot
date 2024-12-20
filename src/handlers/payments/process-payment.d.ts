import { PaymentSuccess } from './types';
export declare function processPayment({ userId, payment }: Omit<PaymentSuccess, 'chatId'>): Promise<number>;
