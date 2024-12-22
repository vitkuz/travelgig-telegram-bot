import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient } from '../../config/dynamodb';
import { config } from '../../config';
import { AuthError } from '../../utils/errors';
import { logger } from '../../utils/logger';

const docClient = createDynamoDBClient();

export async function validateAuthToken(userId: string, secretSent: string): Promise<boolean> {
    try {
        const response = await docClient.send(new GetCommand({
            TableName: config.tables.usersAuth,
            Key: { userId }
        }));

        if (!response.Item) {
            throw new AuthError('Invalid authentication token');
        }

        const { secret: secretSaved } = response.Item;

        console.log({secretSent});
        console.log({secretSaved});

        return secretSent === secretSaved;
    } catch (error) {
        logger.error('Failed to validate auth token', error as Error);
        throw error;
    }
}