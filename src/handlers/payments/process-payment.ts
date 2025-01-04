import { PaymentSuccess } from './types';
import { updateUserBalance, recordPayment } from '../../services/dynamodb';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';

export async function processPayment({ userId, payment }: Omit<PaymentSuccess, 'chatId'>) {
    logger.info('Processing successful payment',{
        userId,
        payment
    });
    const amount = payment.total_amount; // Convert from cents

    try {
        // Update user balance
        await updateUserBalance(userId, amount);

        // Record payment history
        await recordPayment(
            payment.provider_payment_charge_id,
            userId,
            amount,
            payment.currency
        );

        return amount;
    } catch (error) {
        logger.error('Failed to process payment', error as Error);
        throw new DatabaseError('Failed to process payment');
    }
}