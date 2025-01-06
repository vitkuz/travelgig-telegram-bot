import TelegramBot from 'node-telegram-bot-api';
import { TelegramUser } from "../../types/index";
export declare function handleBalance(bot: TelegramBot, chatId: number, user: TelegramUser): Promise<void>;
