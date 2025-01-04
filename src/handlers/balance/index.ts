import TelegramBot from 'node-telegram-bot-api';
import { getUserBalance } from './get-balance';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';
import { t } from '../../i18n/translate';
import {TelegramUser} from "../../types/index";

export async function handleBalance(bot: TelegramBot, chatId: number, user: TelegramUser) {
    const userId = user.id.toString();
    try {
        const { balance, firstName } = await getUserBalance(userId);

        logger.debug('Sending balance message', { chatId, userId, balance });
        await bot.sendMessage(
            chatId,
            t('balance.current', 'ru', { firstName, balance: balance.toFixed(2) })
        );
    } catch (error) {
        if (error instanceof DatabaseError) {
            await bot.sendMessage(
                chatId,
                t('balance.error', 'ru')
            );
        }
        throw error; // Re-throw for logging/monitoring
    }
}