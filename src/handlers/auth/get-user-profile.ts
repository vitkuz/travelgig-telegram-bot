import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient } from '../../config/dynamodb';
import { config } from '../../config';
import { DatabaseError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { UserProfile } from './types';

const docClient = createDynamoDBClient();

export async function getUserProfile(userId: string): Promise<UserProfile> {
    try {
        const response = await docClient.send(new GetCommand({
            TableName: config.tables.users,
            Key: { userId }
        }));

        if (!response.Item) {
            throw new DatabaseError('User not found');
        }

        return response.Item as UserProfile;
    } catch (error) {
        logger.error('Failed to fetch user profile', error as Error);
        throw error;
    }
}