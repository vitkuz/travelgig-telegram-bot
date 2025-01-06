import TelegramBot from 'node-telegram-bot-api';
import { TelegramUser } from '../types';
import { recordUser } from '../services/dynamodb';
import { generateAuthLink } from '../services/auth';
import { logger } from '../utils/logger';
import { PaymentError } from '../utils/errors';
import { createPaymentInvoice } from "./payments/payments";
import { t } from '../i18n/translate';
// import { Message } from 'node-telegram-bot-api';

export async function handleStart(bot: TelegramBot, chatId: number, user: TelegramUser) {
  logger.user('Processing /start command', user.id.toString(), {
    username: user.username,
    languageCode: user.language_code
  });

  const lang = user.language_code || 'ru';
  await recordUser(user);

  logger.debug('Sending welcome message', { chatId, userId: user.id });
  await bot.sendPhoto(
      chatId,
      'https://videos-582347504313.s3.amazonaws.com/bb3c5120-c598-448f-912a-eb0502517df9.jfif',
      {
        caption: `${user.first_name},\n\n${t('welcome.title', lang)}\n\n${t('welcome.description', lang)}`
      }
  );
  await bot.sendMessage(
      chatId,
      t('welcome.nextSteps', lang)
  );
  await bot.sendMessage(
      chatId,
      t('welcome.step1', lang)
  );
  await bot.sendMessage(
      chatId,
      t('welcome.step2', lang)
  );
  // await bot.sendMessage(
  //     chatId,
  //     `PS: Вопросы... пиши лично @vitkuzzzs. только детально пиши. ниче сразу добавлю в игнор`
  // );
  await bot.sendMessage(
      chatId,
      t('welcome.socialLinks', lang),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{
              text: t('welcome.social.instagram', lang),
              url: 'https://www.instagram.com/lily.travelgirl/'
            }],
            [{
              text: t('welcome.social.telegram', lang),
              url: 'https://t.me/siberian_lily'
            }],
            [{
              text: t('welcome.social.jobs', lang),
              url: 'https://t.me/travelgig_jobs'
            }],
            [{
              text: t('welcome.social.worldwide', lang),
              url: 'https://tracker.travelgig.info/'
            }],
            [{
              text: t('welcome.social.website', lang),
              url: 'https://travelgig.info/'
            }]
          ]
        }
      }
  );
}

export async function handleLogin(bot: TelegramBot, chatId: number, user: TelegramUser) {
  const userId = user.id.toString();
  logger.user('Processing /login command', userId);
  const lang = user.language_code || 'ru';
  const authLink = await generateAuthLink(userId);

  logger.debug('Sending auth link', { chatId, userId });
  await bot.sendMessage(
      chatId,
      t('auth.loginLink', lang, { link: authLink })
  );
}

export async function handlePayment(bot: TelegramBot, chatId: number, user: TelegramUser) {
  const lang = user.language_code || 'ru';
  try {
    await createPaymentInvoice(bot, chatId);
  } catch (error) {
    if (error instanceof PaymentError) {
      await bot.sendMessage(
          chatId,
          t('payment.error', lang)
      );
    }
    throw error; // Re-throw for logging/monitoring
  }
}