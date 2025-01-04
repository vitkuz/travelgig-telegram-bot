import TelegramBot from 'node-telegram-bot-api';
import { TelegramUser } from '../types';
import { recordUser } from '../services/dynamodb';
import { generateAuthLink } from '../services/auth';
import { logger } from '../utils/logger';
import { PaymentError } from '../utils/errors';
import {createPaymentInvoice} from "./payments/payments";
// import { Message } from 'node-telegram-bot-api';

export async function handleStart(bot: TelegramBot, chatId: number, user: TelegramUser) {
  logger.user('Processing /start command', user.id.toString(), {
    username: user.username,
    languageCode: user.language_code
  });

  await recordUser(user);

  logger.debug('Sending welcome message', { chatId, userId: user.id });
  await bot.sendPhoto(
      chatId,
      'https://videos-582347504313.s3.amazonaws.com/bb3c5120-c598-448f-912a-eb0502517df9.jfif',
      {
        caption: `${user.first_name},\n\n💰Хочешь работать за границей? Ты в правильном месте! Есть уникальная возможность трудоустройства по всему миру! \n\n🌏 Этот бот позволит тебе увидеть список актуальных вакансий. \n\n👋 Меня зовут Лиля, и я уже 9 лет живу и работаю в разных странах. За моими плечами рабочие контракты в странах Азии и Ближнего Востока. Со мной ты получишь доступ к необычным предложениям работы и поддержку на каждом этапе. \n\n⭐️ Почему выбирают меня? Я обеспечиваю надежность, прозрачность и индивидуальный подход к каждому кандидату. Путешествуй и зарабатывай больше, чем в своём городе!`
      }
  );
  await bot.sendMessage(
      chatId,
      `Какие следующие шаги?`
  );
  await bot.sendMessage(
      chatId,
      `Шаг 1: Посмотри последние вакансии в моем канале...`
  );
  await bot.sendMessage(
      chatId,
      `Шаг 2: Посмотри вакансии по всему миру... Я паршу 5 сайтов. Инструмент. Теперь еге можешь использовать ты...`
  );
  // await bot.sendMessage(
  //     chatId,
  //     `PS: Вопросы... пиши лично @vitkuzzzs. только детально пиши. ниче сразу добавлю в игнор`
  // );
  await bot.sendMessage(
      chatId,
      `👉 PS: Подпишись на мои соцсети и будь в курсе всех новостей 🚨, актуальных горячих вакансий 🔥 и историй из путешествий! 🌏✈️`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{
              text: `Мой инстаграм`,
              url: 'https://www.instagram.com/lily.travelgirl/'
            }],
            [{
              text: `Мой телеграм`,
              url: 'https://t.me/siberian_lily'
            }],
            [{
              text: `Мои вакансии`,
              url: 'https://t.me/travelgig_jobs'
            }],
            [{
              text: `Вакансии по всему миру`,
              url: 'https://tracker.travelgig.info/'
            }],
            [{
              text: `Мой сайт`,
              url: 'https://travelgig.info/'
            }]
          ]
        }
      }
  );
}

export async function handleLogin(bot: TelegramBot, chatId: number, userId: string) {
  logger.user('Processing /login command', userId);

  const authLink = await generateAuthLink(userId);

  logger.debug('Sending auth link', { chatId, userId });
  await bot.sendMessage(
      chatId,
      `Вот ваша ссылка для входа:\n\n${authLink}`
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