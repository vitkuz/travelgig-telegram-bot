import axios from 'axios';
import { config } from 'dotenv';
import { logger } from '../src/utils/logger';

config();

const commands = [
    {
        command: 'start',
        description: 'Начать работу с ботом'
    },
    {
        command: 'login',
        description: 'Получить ссылку для входа на сайт'
    },
    {
        command: 'payment',
        description: 'Сделать платеж'
    },
    {
        command: 'mybalance',
        description: 'Проверить баланс'
    }
];

async function updateBotCommands() {
    const token = process.env.BOT_TOKEN;

    if (!token) {
        throw new Error('BOT_TOKEN environment variable is required');
    }

    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${token}/setMyCommands`,
            { commands }
        );

        if (response.data.ok) {
            logger.info('Bot commands updated successfully');
        } else {
            throw new Error('Failed to update bot commands');
        }
    } catch (error) {
        logger.error('Error updating bot commands:', error as Error);
        process.exit(1);
    }
}

updateBotCommands();