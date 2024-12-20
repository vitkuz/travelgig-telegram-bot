export interface PaymentDetails {
    total_amount: number;
    currency: string;
    provider_payment_charge_id: string;
}
export interface PaymentSuccess {
    userId: string;
    chatId: number;
    payment: PaymentDetails;
}
