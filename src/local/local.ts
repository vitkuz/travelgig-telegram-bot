import TelegramBot from 'node-telegram-bot-api';
import { logger } from '../utils/logger';
import { config } from '../config';
import { setupBotHandlers } from './handlers';

// Initialize bot in polling mode for local development
const bot = new TelegramBot(config.botToken, { polling: true });

// Set up command and event handlers
setupBotHandlers(bot);

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Stopping bot...');
    bot.stopPolling();
    process.exit();
});

logger.info('🤖 Bot started in local development mode');
logger.info('Available commands: /start, /login, /payment');