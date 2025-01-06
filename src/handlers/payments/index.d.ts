import TelegramBot from 'node-telegram-bot-api';
import { PaymentDetails } from './types';
import { TelegramUser } from "../../types/index";
export declare function handleSuccessfulPayment(bot: TelegramBot, chatId: number, user: TelegramUser, payment: PaymentDetails): Promise<void>;
