import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda';
import { createUser, getUser, updateUser, deleteUser } from './service';
import { DatabaseError } from '../../utils/errors';
import { getOrCreateTraceId } from '../../utils/tracing';
import { logger } from '../../utils/logger';
import {createUserSchema, updateUserSchema} from "../../schemas/user.schema";

const createHeaders = (traceId: string) => ({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Credentials': 'true',
    'X-Trace-Id': traceId
});

export const createUserHandler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const traceId = getOrCreateTraceId(event);
    const headers = createHeaders(traceId);

    try {
        const body = JSON.parse(event.body || '{}');
        const data = createUserSchema.parse(body);
        const user = await createUser(data);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(user)
        };
    } catch (error) {
        logger.error('Failed to create user', error as Error);
        return {
            statusCode: error instanceof DatabaseError ? 400 : 500,
            headers,
            // @ts-ignore
            body: JSON.stringify({ error: error.message })
        };
    }
};

export const getUserHandler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const traceId = getOrCreateTraceId(event);
    const headers = createHeaders(traceId);

    try {
        const userId = event.pathParameters?.userId;
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'User ID is required' })
            };
        }

        const user = await getUser(userId);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(user)
        };
    } catch (error) {
        logger.error('Failed to get user', error as Error);
        return {
            statusCode: error instanceof DatabaseError ? 404 : 500,
            headers,
            // @ts-ignore
            body: JSON.stringify({ error: error.message })
        };
    }
};

export const updateUserHandler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const traceId = getOrCreateTraceId(event);
    const headers = createHeaders(traceId);

    try {
        const userId = event.pathParameters?.userId;
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'User ID is required' })
            };
        }

        const body = JSON.parse(event.body || '{}');
        const data = updateUserSchema.parse(body);
        const user = await updateUser(userId, data);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(user)
        };
    } catch (error) {
        logger.error('Failed to update user', error as Error);
        return {
            statusCode: error instanceof DatabaseError ? 404 : 500,
            headers,
            // @ts-ignore
            body: JSON.stringify({ error: error.message })
        };
    }
};

export const deleteUserHandler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const traceId = getOrCreateTraceId(event);
    const headers = createHeaders(traceId);

    try {
        const userId = event.pathParameters?.userId;
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'User ID is required' })
            };
        }

        await deleteUser(userId);
        return {
            statusCode: 204,
            headers,
            body: ''
        };
    } catch (error) {
        logger.error('Failed to delete user', error as Error);
        return {
            statusCode: error instanceof DatabaseError ? 404 : 500,
            headers,
            // @ts-ignore
            body: JSON.stringify({ error: error.message })
        };
    }
};