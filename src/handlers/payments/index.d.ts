import TelegramBot from 'node-telegram-bot-api';
import { PaymentDetails } from './types';
export declare function handleSuccessfulPayment(bot: TelegramBot, chatId: number, userId: string, payment: PaymentDetails): Promise<void>;
