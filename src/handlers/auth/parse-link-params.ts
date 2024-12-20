import {APIGatewayProxyEventQueryStringParameters} from "aws-lambda";
import { AuthLinkParams } from './types';
import { AuthError } from '../../utils/errors';

export function parseLinkParams(queryStringParameters: APIGatewayProxyEventQueryStringParameters | null): AuthLinkParams {
    if (!queryStringParameters?.userId || !queryStringParameters?.secret) {
        throw new AuthError('Missing required parameters');
    }

    return {
        userId: queryStringParameters.userId,
        secret: queryStringParameters.secret
    };
}