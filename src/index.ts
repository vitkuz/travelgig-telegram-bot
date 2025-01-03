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

      console.log({
        chatId,
        text,
        user,
      });

      // Check if the text starts with a slash
      if (text.startsWith('/')) {
        const [command, payload] = text.split(' ', 2); // Split into command and optional payload
        console.log({ command, payload });

        switch (command) {
          case '/start':
            if (payload === 'login') {
              await handleLogin(bot, chatId, user.id.toString());
            } else {
              await handleStart(bot, chatId, user);
            }
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

          default:
            // Handle unknown commands
            await bot.sendMessage(chatId, `Unknown command: ${command}`);
            break;
        }
      } else {
        // Default handler for non-command text
        await bot.sendMessage(chatId, 'Sorry, I don’t understand that message.');
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