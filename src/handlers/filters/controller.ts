import { APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda';
import {createFilerInUserRecord, deleteFilterUserRecord, listFilersInUserRecord} from './service';
import { DatabaseError } from '../../utils/errors';
import { getOrCreateTraceId } from '../../utils/tracing';
import { logger } from '../../utils/logger';
import { z } from 'zod';

const createHeaders = (traceId: string) => ({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Credentials': 'true',
    'X-Trace-Id': traceId
});

// id?: string; // Added ID field
// userId: string;
// timeFilter: string | null;
// domainFilter: string | null;
// showLiked: boolean;
// searchQuery: string;
// name: string;
// createdAt: number;
// hasNotification: boolean;

const filterSchema = z.object({
    userId: z.string(),
    id: z.string().optional(),
    timeFilter: z.string().nullable(),
    domainFilter: z.string().nullable(),
    showLiked: z.boolean(),
    searchQuery: z.string(),
    createdAt: z.number().optional().default(Date.now()),
    hasNotification: z.boolean().optional().default(false),
    name: z.string(),
});

export const listFilersInUserRecordHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

        const user = await listFilersInUserRecord(userId);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(user)
        };
    } catch (error) {
        logger.error('Failed to create filter', error as Error);
        return {
            statusCode: error instanceof DatabaseError ? 400 : 500,
            headers,
            body: JSON.stringify({ error: (error as Error).message })
        };
    }
};

export const createFilerInUserRecordHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
        const filter = filterSchema.parse(body);

        await createFilerInUserRecord(userId, filter);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Filter added successfully' })
        };
    } catch (error) {
        logger.error('Failed to create filter', error as Error);
        return {
            statusCode: error instanceof DatabaseError ? 400 : 500,
            headers,
            body: JSON.stringify({ error: (error as Error).message })
        };
    }
};

export const deleteFilterUserRecordHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const traceId = getOrCreateTraceId(event);
    const headers = createHeaders(traceId);

    try {
        const userId = event.pathParameters?.userId;
        const filterId = event.pathParameters?.filterId;

        if (!userId || !filterId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'User ID and Filter ID are required' })
            };
        }

        await deleteFilterUserRecord(userId, filterId);
        return {
            statusCode: 204,
            headers,
            body: ''
        };
    } catch (error) {
        logger.error('Failed to delete filter', error as Error);
        return {
            statusCode: error instanceof DatabaseError ? 404 : 500,
            headers,
            body: JSON.stringify({ error: (error as Error).message })
        };
    }
};