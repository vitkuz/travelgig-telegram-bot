import axios from 'axios';
import { config } from 'dotenv';
import { logger } from '../src/utils/logger';

config();

const descriptions = [
    {
        language_code: 'ru', // Russian
        description: `💼 Бот сканирует самые популярные сайты с вакансиями и отправляет подходящие вакансии в Telegram.\n\n💲 Вы получите 10 телеграм звезд. Используйте стартовый бюджет, чтобы протестировать бот.\n\n👉 Настройте фильтры и начните получать предложения уже сегодня! Бот будет отправлять подходящие вакансии прямо в ваш Telegram на основе созданных вами фильтров.\n\n⏳ Экономьте время и держите руку на пульсе`
    },
    {
        language_code: 'en', // English
        description: `💼 The bot scans the most popular job websites and sends suitable job offers to Telegram.\n\n💲 You will receive 10 Telegram stars. Use the starting budget to test the bot.\n\n👉 Set up filters and start receiving offers today! The bot will send relevant job offers directly to your Telegram based on the filters you created.\n\n⏳ Save time and stay on top of opportunities.`
    }
];

const names = [
    {
        language_code: 'ru', // Russian
        name: "Travelgig Вакансии Бот | Работа за границей | Рaбота в Азии"
    },
    {
        language_code: 'en', // English
        name: "Travelgig Jobs Bot | Work Abroad | Work in Asia and Middle East"
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


        // Set names
        for (const { language_code, name } of names) {
            const response = await axios.post(
                `https://api.telegram.org/bot${token}/setMyName`,
                {
                    name,
                    language_code
                }
            );

            if (response.data.ok) {
                logger.info(`Name set successfully for language: ${language_code}`);
            } else {
                throw new Error(`Failed to set name for language: ${language_code}`);
            }
        }

    } catch (error) {
        console.log(error)
        logger.error('Error setting bot initial message:', error as Error);
        process.exit(1);
    }
}

setInitialBotMessage();