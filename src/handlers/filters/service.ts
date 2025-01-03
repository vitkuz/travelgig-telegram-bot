import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient } from '../../config/dynamodb';
import { config } from '../../config';
import { DatabaseError } from '../../utils/errors';
import { SearchFilters } from "../../types/user.types";
import { randomUUID } from 'crypto';
import {UserProfile} from "../auth/types";

const docClient = createDynamoDBClient();

export async function listFilersInUserRecord(userId: string): Promise<UserProfile> {
    try {
        const response = await docClient.send(new GetCommand({
            TableName: config.tables.users,
            Key: { userId },
        }));

        return response.Item as UserProfile;
    } catch (error) {
        throw new DatabaseError('Failed to list user filters');
    }
}

export async function createFilerInUserRecord(userId: string, filter: SearchFilters): Promise<void> {
    const filterWithId = {
        ...filter,
        id: filter.id || randomUUID()
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

export async function toggleFilterNotification(userId: string, filterId: string): Promise<void> {
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

        // Toggle the hasNotification value
        const updatedFilters = [...currentFilters];
        updatedFilters[filterIndex] = {
            ...updatedFilters[filterIndex],
            hasNotification: !updatedFilters[filterIndex].hasNotification
        };

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
        throw new DatabaseError(error instanceof DatabaseError ? error.message : 'Failed to toggle filter notification');
    }
}