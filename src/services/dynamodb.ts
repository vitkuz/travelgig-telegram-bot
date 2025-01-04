import {PutCommand, UpdateCommand, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import { config } from '../config';
import { createDynamoDBClient } from '../config/dynamodb';
import { logger } from '../utils/logger';

const docClient = createDynamoDBClient();

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export async function recordUser(user: TelegramUser) {
  logger.debug('Recording user', user);

  const params: UpdateCommandInput = {
    TableName: config.tables.users,
    Key: {
      userId: user.id.toString(),
    },
    UpdateExpression: `
      SET firstName = :firstName,
          lastName = :lastName,
          username = :username,
          languageCode = :languageCode,
          createdAt = if_not_exists(createdAt, :createdAt),
          updatedAt = :updatedAt,
          balance = if_not_exists(balance, :initialBalance)
    `,
    ExpressionAttributeValues: {
      ':firstName': user.first_name,
      ':lastName': user.last_name,
      ':username': user.username,
      ':languageCode': user.language_code,
      ':createdAt': new Date().toISOString(),
      ':updatedAt': new Date().toISOString(),
      ':initialBalance': 0, // Default balance when the user is created
    },
  };

  try {
    await docClient.send(new UpdateCommand(params));
    logger.info(`User ${user.id} recorded successfully.`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error recording user: ${error.message}`);
      logger.debug(`Stack trace: ${error.stack}`);
    } else {
      logger.error('Unexpected error');
    }
    throw error;
  }
}

export async function recordAuthToken(userId: string, secret: string, ttl: number) {
  logger.debug('Recording auth token', { userId });
  await docClient.send(new PutCommand({
    TableName: config.tables.usersAuth,
    Item: {
      userId,
      secret,
      ttl,
      createdAt: new Date().toISOString(),
    },
  }));
}

export async function updateUserBalance(userId: string, amount: number) {
  logger.info('Updating user balance', { userId, amount });

  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount value');
  }

  await docClient.send(new UpdateCommand({
    TableName: config.tables.users,
    Key: { userId },
    UpdateExpression: 'SET balance = if_not_exists(balance, :zero) + :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':zero': 0
    },
  }));
}

export async function recordPayment(paymentId: string, userId: string, amount: number, currency: string) {
  logger.debug('Recording payment', { paymentId, userId, amount });
  await docClient.send(new PutCommand({
    TableName: config.tables.paymentHistory,
    Item: {
      paymentId,
      userId,
      amount,
      currency,
      timestamp: new Date().toISOString(),
    },
  }));
}