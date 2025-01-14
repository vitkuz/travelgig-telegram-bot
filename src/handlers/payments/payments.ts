import TelegramBot from 'node-telegram-bot-api';
import {logger} from "../../utils/logger";
import {PaymentError} from "../../utils/errors";
import {config} from "../../config/index";
import { t } from '../../i18n/translate';

export async function createPaymentInvoice(bot: TelegramBot, chatId: number, lang: string = 'en') {
    try {
        const title = t('payment.title', lang);
        const description = t('payment.description', lang);
        const payload = `payment_${Date.now()}`;
        const currency = 'XTR';
        const prices = [{ label: 'Баланс', amount: 1 }]; // 1 star

        logger.debug('Creating payment invoice', {
            chatId,
            title,
            currency,
            amount: prices[0].amount
        });

        await bot.sendInvoice(
            chatId,
            title,
            description,
            payload,
            config.paymentProviderToken ?? '',
            currency,
            prices
        );
    } catch (error) {
        logger.error('Failed to create payment invoice', error as Error);
        throw new PaymentError('Failed to create payment invoice');
    }
}