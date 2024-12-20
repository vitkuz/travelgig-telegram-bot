import { APIGatewayProxyEventQueryStringParameters } from "aws-lambda";
import { AuthLinkParams } from './types';
export declare function parseLinkParams(queryStringParameters: APIGatewayProxyEventQueryStringParameters | null): AuthLinkParams;
