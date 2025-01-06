import axios from 'axios';
import { config } from 'dotenv';
import { logger } from '../src/utils/logger';

config();

const translations = [
    {
        language_code: 'en', // English
        commands: [
            { command: 'start', description: 'Start working with the bot' },
            { command: 'about', description: 'About the bot creator' },
            { command: 'login', description: 'Get a login link to the site' },
            { command: 'payment', description: 'Make a payment' },
            { command: 'mybalance', description: 'Check your balance' }
        ]
    },
    {
        language_code: 'ru', // Russian
        commands: [
            { command: 'start', description: 'Начать работу с ботом' },
            { command: 'about', description: 'О создателе бота' },
            { command: 'login', description: 'Получить ссылку для входа на сайт' },
            { command: 'payment', description: 'Сделать платеж' },
            { command: 'mybalance', description: 'Проверить баланс' }
        ]
    }
];

async function updateBotCommands() {
    const token = process.env.BOT_TOKEN;

    if (!token) {
        throw new Error('BOT_TOKEN environment variable is required');
    }

    try {
        for (const { language_code, commands } of translations) {
            const response = await axios.post(
                `https://api.telegram.org/bot${token}/setMyCommands`,
                {
                    commands,
                    language_code
                }
            );

            if (response.data.ok) {
                logger.info(`Bot commands updated successfully for language: ${language_code}`);
            } else {
                throw new Error(`Failed to update bot commands for language: ${language_code}`);
            }
        }
    } catch (error) {
        logger.error('Error updating bot commands:', error as Error);
        process.exit(1);
    }
}

updateBotCommands();