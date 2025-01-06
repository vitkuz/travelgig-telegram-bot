import TelegramBot from 'node-telegram-bot-api';
import { PaymentSuccess, PaymentDetails } from './types';
import { processPayment } from './process-payment';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';
import { t } from '../../i18n/translate';
import {TelegramUser} from "../../types/index";

export async function handleSuccessfulPayment(
    bot: TelegramBot,
    chatId: number,
    user: TelegramUser,
    payment: PaymentDetails
) {
    console.log('handleSuccessfulPayment')
    const userId = user.id.toString();
    const lang = user.language_code || 'ru'; //todo: extract default language to const
    try {
        const amount = await processPayment({ userId, payment });
        logger.info('Sending success message', { chatId, userId });
        await bot.sendMessage(
            chatId,
            t('payment.success', lang, { amount })
        );
    } catch (error) {
        if (error instanceof DatabaseError) {
            await bot.sendMessage(
                chatId,
                t('payment.updateError', lang)
            );
        }
        throw error; // Re-throw for logging/monitoring
    }
}