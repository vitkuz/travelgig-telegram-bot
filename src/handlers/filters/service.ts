import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient } from '../../config/dynamodb';
import { config } from '../../config';
import { DatabaseError } from '../../utils/errors';
import {CreateUserDto, UpdateUserDto, User} from "../../types/user.types";

const docClient = createDynamoDBClient();

export async function createFilerInUserRecord(data: CreateUserDto): Promise<User> {
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