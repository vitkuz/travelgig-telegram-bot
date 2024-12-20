import { z } from 'zod';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const configSchema = z.object({
    // Bot configuration
    botToken: z.string().min(1, "BOT_TOKEN is required"),
    paymentProviderToken: z.string().optional(),

    // DynamoDB tables
    tables: z.object({
        users: z.string().min(1, "USERS_TABLE is required"),
        usersAuth: z.string().min(1, "USERS_AUTH_TABLE is required"),
        paymentHistory: z.string().min(1, "PAYMENT_HISTORY_TABLE is required"),
    }),
});

type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
    const config = {
        botToken: process.env.BOT_TOKEN,
        paymentProviderToken: process.env.PAYMENT_PROVIDER_TOKEN,
        tables: {
            users: process.env.USERS_TABLE,
            usersAuth: process.env.USERS_AUTH_TABLE,
            paymentHistory: process.env.PAYMENT_HISTORY_TABLE,
        },
    };

    return configSchema.parse(config);
}

export const config = loadConfig();