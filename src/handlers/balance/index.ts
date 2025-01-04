import TelegramBot from 'node-telegram-bot-api';
import { getUserBalance } from './get-balance';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';

export async function handleBalance(bot: TelegramBot, chatId: number, userId: string) {
    try {
        const { balance, firstName } = await getUserBalance(userId);

        logger.debug('Sending balance message', { chatId, userId, balance });
        await bot.sendMessage(
            chatId,
            `💰 ${firstName}, ваш текущий баланс ⭐${balance.toFixed(2)}`
        );
    } catch (error) {
        if (error instanceof DatabaseError) {
            await bot.sendMessage(
                chatId,
                '❌ Sorry, I could not fetch your balance. Please try again later.'
            );
        }
        throw error; // Re-throw for logging/monitoring
    }
}