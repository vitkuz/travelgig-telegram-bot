import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient } from '../../config/dynamodb';
import { config } from '../../config';
import { AuthError } from '../../utils/errors';
import { logger } from '../../utils/logger';

const docClient = createDynamoDBClient();

export async function validateAuthToken(userId: string, secret: string): Promise<boolean> {
    try {
        const response = await docClient.send(new GetCommand({
            TableName: config.tables.usersAuth,
            Key: { userId }
        }));

        if (!response.Item) {
            throw new AuthError('Invalid authentication token');
        }

        const { token } = response.Item;
        // const now = Math.floor(Date.now() / 1000);
        //
        // if (ttl < now) {
        //     throw new AuthError('Authentication token expired');
        // }

        return token === secret;
    } catch (error) {
        logger.error('Failed to validate auth token', error as Error);
        throw error;
    }
}