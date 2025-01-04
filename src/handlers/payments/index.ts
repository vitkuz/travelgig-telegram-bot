import TelegramBot from 'node-telegram-bot-api';
import { PaymentSuccess, PaymentDetails } from './types';
import { processPayment } from './process-payment';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';
import { t } from '../../i18n/translate';

export async function handleSuccessfulPayment(
    bot: TelegramBot,
    chatId: number,
    userId: string,
    payment: PaymentDetails
) {
    console.log('handleSuccessfulPayment')
    try {
        const amount = await processPayment({ userId, payment });
        logger.info('Sending success message', { chatId, userId });
        await bot.sendMessage(
            chatId,
            t('payment.success', 'ru', { amount })
        );
    } catch (error) {
        if (error instanceof DatabaseError) {
            await bot.sendMessage(
                chatId,
                t('payment.updateError', 'ru')
            );
        }
        throw error; // Re-throw for logging/monitoring
    }
}