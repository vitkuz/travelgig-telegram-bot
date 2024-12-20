import TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import { handleStart, handleLogin, handlePayment } from './handlers/commands';
import { handleSuccessfulPayment } from './handlers/payments';
import {handleBalance} from "./handlers/balance";

const bot = new TelegramBot(config.botToken);

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;
      const user = body.message.from;

      switch (text) {
        case '/start':
          await handleStart(bot, chatId, user);
          break;
        case '/login':
          await handleLogin(bot, chatId, user.id.toString());
          break;
        case '/payment':
          await handlePayment(bot, chatId);
          break;
        case '/mybalance':
          await handleBalance(bot, chatId, user.id.toString());
          break;
      }
    } else if (body.pre_checkout_query) {
      await bot.answerPreCheckoutQuery(body.pre_checkout_query.id, true);
    } else if (body.successful_payment) {
      await handleSuccessfulPayment(
          bot,
          body.message.chat.id,
          body.message.from.id.toString(),
          body.successful_payment
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};