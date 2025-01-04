import TelegramBot from 'node-telegram-bot-api';
import { logger } from '../utils/logger';
import { handleStart, handleLogin, handlePayment } from '../handlers/commands';
import { handleSuccessfulPayment } from '../handlers/payments';
import {handleBalance} from "../handlers/balance";

export function setupBotHandlers(bot: TelegramBot) {
    // Command handlers
    bot.onText(/\/start/, async (msg) => {
        logger.info('🚀 Received /start command', { userId: msg.from?.id });
        await handleStart(bot, msg.chat.id, msg.from!);
    });

    bot.onText(/\/login/, async (msg) => {
        logger.info('🔑 Received /login command', { userId: msg.from?.id });
        // @ts-ignore
        await handleLogin(bot, msg.chat.id, msg.from!.id.toString());
    });

    bot.onText(/\/payment/, async (msg) => {
        logger.info('💰 Received /payment command', { userId: msg.from?.id });
        await handlePayment(bot, msg.chat.id);
    });

    // Payment handlers
    bot.on('pre_checkout_query', async (query) => {
        logger.info('💳 Received pre-checkout query', { queryId: query.id });
        await bot.answerPreCheckoutQuery(query.id, true);
    });

    bot.onText(/\/mybalance/, async (msg) => {
        logger.info('💳 Received /mybalance command', { userId: msg.from?.id });
        await handleBalance(bot, msg.chat.id, msg.from!.id.toString());
    });

    bot.on('successful_payment', async (msg) => {

        // @ts-ignore
        logger.payment('Payment successful', msg.from.id.toString(), {
            // @ts-ignore
            amount: msg.successful_payment.total_amount,
            // @ts-ignore
            currency: msg.successful_payment.currency,
        });
        await handleSuccessfulPayment(
            bot,
            msg.chat.id,
            // @ts-ignore
            msg.from.id.toString(),
            // @ts-ignore
            msg.successful_payment
        );
    });
}