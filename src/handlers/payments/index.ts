import TelegramBot from 'node-telegram-bot-api';
import { PaymentSuccess, PaymentDetails } from './types';
import { processPayment } from './process-payment';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';

export async function handleSuccessfulPayment(
    bot: TelegramBot,
    chatId: number,
    userId: string,
    payment: PaymentDetails
) {
    try {
        const amount = await processPayment({ userId, payment });

        logger.debug('Sending success message', { chatId, userId });
        await bot.sendMessage(
            chatId,
            `✅ Payment successful! Added $${amount} to your balance.`
        );
    } catch (error) {
        if (error instanceof DatabaseError) {
            await bot.sendMessage(
                chatId,
                '❌ Payment received but failed to update balance. Our team will resolve this issue.'
            );
        }
        throw error; // Re-throw for logging/monitoring
    }
}