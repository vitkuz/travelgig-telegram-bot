import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient } from '../../config/dynamodb';
import { config } from '../../config';
import { DatabaseError } from '../../utils/errors';
import {CreateUserDto, UpdateUserDto, User} from "../../types/user.types";
import {deleteFilterUserRecordHandler} from "./controller";

const docClient = createDynamoDBClient();

export async function createFilerInUser(data: CreateUserDto): Promise<User> {
    const user = {
        ...data,
        balance: 0,
        createdAt: new Date().toISOString()
    };

    try {
        await docClient.send(new PutCommand({
            TableName: config.tables.users,
            Item: user,
            ConditionExpression: 'attribute_not_exists(userId)'
        }));
        return user;
    } catch (error) {
        throw new DatabaseError('Failed to create user');
    }
}

export async function getUser(userId: string): Promise<User> {
    try {
        const response = await docClient.send(new GetCommand({
            TableName: config.tables.users,
            Key: { userId }
        }));

        if (!response.Item) {
            throw new DatabaseError('User not found');
        }

        return response.Item as User;
    } catch (error) {
        throw new DatabaseError('Failed to get user');
    }
}

export async function updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            updateExpressions.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = value;
        }
    });

    try {
        const response = await docClient.send(new UpdateCommand({
            TableName: config.tables.users,
            Key: { userId },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }));

        return response.Attributes as User;
    } catch (error) {
        throw new DatabaseError('Failed to update user');
    }
}

export async function deleteFilterUserRecord(userId: string): Promise<void> {
    try {
        await docClient.send(new DeleteCommand({
            TableName: config.tables.users,
            Key: { userId }
        }));
    } catch (error) {
        throw new DatabaseError('Failed to delete user');
    }
}