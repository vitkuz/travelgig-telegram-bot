import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient } from '../../config/dynamodb';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';
import { UserBalance } from './types';

const docClient = createDynamoDBClient();

export async function getUserBalance(userId: string): Promise<UserBalance> {
    try {
        logger.debug('Fetching user balance', { userId });

        const response = await docClient.send(new GetCommand({
            TableName: config.tables.users,
            Key: { userId },
        }));

        if (!response.Item) {
            throw new DatabaseError('User not found');
        }

        return {
            userId,
            balance: response.Item.balance || 0,
            firstName: response.Item.firstName,
        };
    } catch (error) {
        logger.error('Failed to fetch user balance', error as Error);
        throw new DatabaseError('Failed to fetch balance');
    }
}