import { APIGatewayProxyHandler } from 'aws-lambda';
import { createFilerInUserRecordHandler, deleteFilterUserRecordHandler } from './controller';
import { logger } from '../../utils/logger';

export const handler: APIGatewayProxyHandler = async (event, context) => {
    logger.debug('Received request', {
        path: event.path,
        method: event.httpMethod,
        requestId: context.awsRequestId
    });

    switch (event.httpMethod) {
        case 'POST':
            return createFilerInUserRecordHandler(event);
        case 'DELETE':
            return deleteFilterUserRecordHandler(event);
        default:
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Method not allowed' }),
                headers: {
                    'Content-Type': 'application/json',
                    'Allow': 'GET, POST, PUT, DELETE'
                }
            };
    }
};