import TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import {handleStart, handleLogin, handlePayment, handleAbout} from './handlers/commands';
import { handleSuccessfulPayment } from './handlers/payments';
import {handleBalance} from "./handlers/balance";
import {t} from "./i18n/translate";

const bot = new TelegramBot(config.botToken);

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);
    console.log('event:body',JSON.stringify(body, null, 2));
    if (body.message) {
      console.log('if:body.message',JSON.stringify(body, null, 2));
      const chatId = body.message.chat.id;
      const text = body.message.text;
      const user = body.message.from;

      console.log({
        chatId,
        text,
        user,
      });

      // Check if the text starts with a slash
      if (text && text.startsWith('/')) {
        const [command, payload] = text.split(' ', 2); // Split into command and optional payload
        console.log({ command, payload });

        switch (command) {
          case '/start':
            if (payload === 'login') {
              await handleLogin(bot, chatId, user);
            } else {
              await handleStart(bot, chatId, user);
            }
            break;
          case '/about':
            await handleAbout(bot, chatId, user);
            break;

          case '/login':
            await handleLogin(bot, chatId, user);
            break;

          case '/payment':
            await handlePayment(bot, chatId, user);
            break;

          case '/mybalance':
            await handleBalance(bot, chatId, user);
            break;
          default:
            await bot.sendMessage(chatId, t('errors.unknownCommand', user.language_code || 'ru', { command }));
            break;
        }
      } else if (body.message.successful_payment) {
        console.log('if:body.message.successful_payment')
        const user = body.message.from;
        await handleSuccessfulPayment(
            bot,
            body.message.chat.id,
            user,
            body.message.successful_payment
        );
      } else {
        // Default handler for non-command text
        await bot.sendMessage(chatId, t('errors.unknownMessage', user.language_code || 'ru'));
      }
    } else if (body.pre_checkout_query) {
      console.log('if:body.pre_checkout_query',JSON.stringify(body, null, 2));
      await bot.answerPreCheckoutQuery(body.pre_checkout_query.id, true);
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