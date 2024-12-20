#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TelegramBotStack } from '../lib/telegram-bot-stack';

const app = new cdk.App();
new TelegramBotStack(app, 'TelegramBotStack');