import { randomBytes } from 'crypto';
import { recordAuthToken } from './dynamodb';
import { logger } from '../utils/logger';

export async function generateAuthLink(userId: string) {
  logger.debug('Generating auth link', { userId });

  const secret = randomBytes(32).toString('hex');
  const ttl = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 1 week

  logger.debug('Recording auth token', { userId, ttl });
  await recordAuthToken(userId, secret, ttl);

  const domain = process.env.FRONT_URL || 'https://d1vcyqhvw55pzm.cloudfront.net/'

  const authLink = `${domain}?userId=${userId}&secret=${secret}`;
  logger.debug('Auth link generated', { userId });

  return authLink;
}