import { randomUUID } from 'crypto';
import { APIGatewayProxyEvent } from 'aws-lambda';

export function getOrCreateTraceId(event: APIGatewayProxyEvent): string {
    // Check headers for existing trace ID (case-insensitive)
    const existingTraceId = Object.entries(event.headers || {})
        .find(([key]) => key.toLowerCase() === 'x-trace-id')?.[1];

    return existingTraceId || randomUUID();
}