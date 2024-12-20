import TelegramBot from 'node-telegram-bot-api';
import { TelegramUser } from '../types';
import { recordUser } from '../services/dynamodb';
import { generateAuthLink } from '../services/auth';
// import { createPaymentInvoice } from './payments';
import { logger } from '../utils/logger';
import { PaymentError } from '../utils/errors';
import {createPaymentInvoice} from "./payments/payments";

export async function handleStart(bot: TelegramBot, chatId: number, user: TelegramUser) {
  logger.user('Processing /start command', user.id.toString(), {
    username: user.username,
    languageCode: user.language_code
  });

  await recordUser(user);

  logger.debug('Sending welcome message', { chatId, userId: user.id });
  await bot.sendMessage(
      chatId,
      `Welcome ${user.first_name}! I'm your payment bot. Use /login to get access to the website or /payment to make a payment or /mybalance to check balance.`
  );
}

export async function handleLogin(bot: TelegramBot, chatId: number, userId: string) {
  logger.user('Processing /login command', userId);

  const authLink = await generateAuthLink(userId);

  logger.debug('Sending auth link', { chatId, userId });
  await bot.sendMessage(
      chatId,
      `Here's your login link (valid for 1 week):\n${authLink}`
  );
}

export async function handlePayment(bot: TelegramBot, chatId: number) {
  try {
    await createPaymentInvoice(bot, chatId);
  } catch (error) {
    if (error instanceof PaymentError) {
      await bot.sendMessage(
          chatId,
          '❌ Sorry, there was an error creating the payment. Please try again later.'
      );
    }
    throw error; // Re-throw for logging/monitoring
  }
}