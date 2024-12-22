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
            // create or update user attribute filters, array of objects
            return createFilerInUserRecordHandler(event);
        case 'DELETE':
            // delete or update user attribute filters, array of objects
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