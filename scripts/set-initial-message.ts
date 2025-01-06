import axios from 'axios';
import { config } from 'dotenv';
import { logger } from '../src/utils/logger';

config();

const descriptions = [
    {
        language_code: 'ru', // Russian
        description: "💼 Travelgig Jobs Bot – ваш помощник в поиске работы в Азии! 🌏\n\n✨ Бот 4 раза в день сканирует 5 сайтов и отправляет подходящие вакансии прямо в Telegram.\n\n💲 **Всего $1**. Платите только за совпадения, первый бюджет – бесплатно.\n\n👉 Настройте фильтры и начните получать вакансии уже сегодня!"
    },
    {
        language_code: 'en', // English
        description: "💼 Travelgig Jobs Bot – your assistant for finding jobs in Asia! 🌏\n\n✨ The bot scans 5 sites 4 times a day and sends matching jobs directly to Telegram.\n\n💲 **Just $1 per month**. Only pay for matches, with a free starting budget.\n\n👉 Set your filters and start getting jobs today!"
    }
];

async function setInitialBotMessage() {
    const token = process.env.BOT_TOKEN;

    if (!token) {
        throw new Error('BOT_TOKEN environment variable is required');
    }

    try {
        for (const { language_code, description } of descriptions) {
            const response = await axios.post(
                `https://api.telegram.org/bot${token}/setMyDescription`,
                {
                    description,
                    language_code
                }
            );

            if (response.data.ok) {
                logger.info(`Initial message set successfully for language: ${language_code}`);
            } else {
                throw new Error(`Failed to set initial message for language: ${language_code}`);
            }
        }
    } catch (error) {
        logger.error('Error setting bot initial message:', error as Error);
        process.exit(1);
    }
}

setInitialBotMessage();