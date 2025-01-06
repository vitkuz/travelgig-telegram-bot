import TelegramBot from 'node-telegram-bot-api';
import { TelegramUser } from '../types';
export declare function handleStart(bot: TelegramBot, chatId: number, user: TelegramUser): Promise<void>;
export declare function handleLogin(bot: TelegramBot, chatId: number, user: TelegramUser): Promise<void>;
export declare function handlePayment(bot: TelegramBot, chatId: number, user: TelegramUser): Promise<void>;
