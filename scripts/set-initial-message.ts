import axios from 'axios';
import { config } from 'dotenv';
import { logger } from '../src/utils/logger';

config();

async function setInitialBotMessage() {
    const token = process.env.BOT_TOKEN;

    if (!token) {
        throw new Error('BOT_TOKEN environment variable is required');
    }

    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${token}/setMyDescription`,
            {
                description: "💰Хочешь работать за границей? Ты в правильном месте! Есть уникальная возможность трудоустройства по всему миру!🌏\n\n👋 Меня зовут Лиля и я 9 лет живу и работаю в разных странах. За моими плечами рабочие контракты в странах Азии и Среднего Востока.\n\nНажми /start чтобы начать!"
            }
        );

        if (response.data.ok) {
            logger.info('Bot initial message set successfully');
        } else {
            throw new Error('Failed to set bot initial message');
        }
    } catch (error) {
        logger.error('Error setting bot initial message:', error as Error);
        process.exit(1);
    }
}

setInitialBotMessage();