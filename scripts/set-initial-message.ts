import axios from 'axios';
import { config } from 'dotenv';
import { logger } from '../src/utils/logger';

config();

const descriptions = [
    {
        language_code: 'ru', // Russian
        description: "💼 Travelgig Jobs Bot сканирует 5 популярных сайтов с вакансиями 4 раза в день и отправляет подходящие вакансии в Telegram.\n\n 💲 Платите только за совпадения, стартовый бюджет – 10 звёзд Telegram.\n\n 👉 Настройте фильтры и начните получать предложения уже сегодня!\n"
    },
    {
        language_code: 'en', // English
        description: "💼 Travelgig Jobs Bot – scans 5 popular job board websites 4 times a day and sends matching jobs directly to Telegram.\n\n💲 Only pay for matches, starting budget is 10 telegram stars to test things out.\n\n👉 Set your filters and start getting jobs opportunities today! Save time and be up to day with your industry"
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