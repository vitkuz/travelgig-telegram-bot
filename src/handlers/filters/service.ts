import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient } from '../../config/dynamodb';
import { config } from '../../config';
import { DatabaseError } from '../../utils/errors';
import { SearchFilters } from "../../types/user.types";
import { randomUUID } from 'crypto';

const docClient = createDynamoDBClient();

export async function createFilerInUserRecord(userId: string, filter: Omit<SearchFilters, 'id'>): Promise<void> {
    const filterWithId = {
        ...filter,
        id: randomUUID()
    };

    try {
        await docClient.send(new UpdateCommand({
            TableName: config.tables.users,
            Key: { userId },
            UpdateExpression: 'SET filters = list_append(if_not_exists(filters, :empty_list), :new_filter)',
            ExpressionAttributeValues: {
                ':empty_list': [],
                ':new_filter': [filterWithId]
            },
            ReturnValues: 'UPDATED_NEW'
        }));
    } catch (error) {
        throw new DatabaseError('Failed to update user filters');
    }
}

export async function deleteFilterUserRecord(userId: string, filterId: string): Promise<void> {
    try {
        // First, get the current filters
        const response = await docClient.send(new GetCommand({
            TableName: config.tables.users,
            Key: { userId }
        }));

        if (!response.Item?.filters) {
            throw new DatabaseError('No filters found for user');
        }

        const currentFilters = response.Item.filters as SearchFilters[];
        const filterIndex = currentFilters.findIndex(filter => filter.id === filterId);

        if (filterIndex === -1) {
            throw new DatabaseError('Filter not found');
        }

        // Remove the filter and update the array
        const updatedFilters = [
            ...currentFilters.slice(0, filterIndex),
            ...currentFilters.slice(filterIndex + 1)
        ];

        await docClient.send(new UpdateCommand({
            TableName: config.tables.users,
            Key: { userId },
            UpdateExpression: 'SET filters = :filters',
            ExpressionAttributeValues: {
                ':filters': updatedFilters
            },
            ReturnValues: 'UPDATED_NEW'
        }));
    } catch (error) {
        throw new DatabaseError(error instanceof DatabaseError ? error.message : 'Failed to delete filter');
    }
}