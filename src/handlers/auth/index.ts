import { APIGatewayProxyHandler } from 'aws-lambda';
import { parseLinkParams } from './parse-link-params';
import { validateAuthToken } from './validate-token';
import { getUserProfile } from './get-user-profile';
import { AuthError, DatabaseError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import {getOrCreateTraceId} from "../../utils/tracing";

export const handler: APIGatewayProxyHandler = async (event) => {

    const traceId = getOrCreateTraceId(event);
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Credentials': 'true',
        'X-Trace-Id': traceId
    };

    try {
        // Parse and validate link parameters
        const { userId, secret } = parseLinkParams(event.queryStringParameters);

        // Validate the auth token
        const isValid = await validateAuthToken(userId, secret);
        if (!isValid) {
            throw new AuthError('Invalid authentication token');
        }

        const userProfile = await getUserProfile(userId);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(userProfile)
        };

    } catch (error) {
        logger.error('Auth link validation failed', error as Error);

        if (error instanceof AuthError) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: error.message })
            };
        }

        if (error instanceof DatabaseError) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: error.message })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};