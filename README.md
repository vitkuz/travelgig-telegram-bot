TelegramBotStack.ApiUrl = https://qp7d64ncw4.execute-api.us-east-1.amazonaws.com/prod/
TelegramBotStack.PaymentHistoryTableOutput = TelegramBotStack-PaymentHistoryTableB1149501-7X7SET0ZONI5
TelegramBotStack.TelegramBotApiEndpoint9AFCEF37 = https://qp7d64ncw4.execute-api.us-east-1.amazonaws.com/prod/
TelegramBotStack.TelegramBotApiOutput = https://qp7d64ncw4.execute-api.us-east-1.amazonaws.com/prod/
TelegramBotStack.UsersAuthTableOutput = TelegramBotStack-UsersAuthTable55A029FE-WOB85XCHCIVZ
TelegramBotStack.UsersTableOutput = TelegramBotStack-UsersTable9725E9C8-14OV16L88H2EE


# Telegram Payment Bot

A serverless Telegram bot built with AWS CDK that handles user authentication and payments.

## Architecture

- **AWS Lambda**: Handles bot logic and webhook endpoints
- **API Gateway**: Receives webhook updates from Telegram
- **DynamoDB**: Stores user data, authentication tokens, and payment history
- **Node.js 20**: Runtime environment

### DynamoDB Tables

1. **Users Table**
   - Stores user information and balance
   - Primary key: `userId` (string)

2. **UsersAuth Table**
   - Manages authentication tokens
   - Primary key: `userId` (string)
   - TTL: 1 week

3. **PaymentHistory Table**
   - Records payment transactions
   - Partition key: `paymentId` (string)
   - Sort key: `userId` (string)

## Bot Commands

- `/start` - Initializes user and saves their information
- `/login` - Generates a website authentication link
- `/payment` - Initiates payment process via Telegram Payments API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
export BOT_TOKEN="your_telegram_bot_token"
export PAYMENT_PROVIDER_TOKEN="your_payment_provider_token"
```

3. Deploy the infrastructure:
```bash
npm run deploy
```

4. Set up the webhook:
```bash
npm run setup-webhook
```

## Development

- `npm run build` - Compile TypeScript
- `npm run deploy` - Deploy to AWS
- `npm run setup-webhook` - Configure Telegram webhook

## Project Structure

```
├── bin/                    # CDK app entry point
├── lib/                    # CDK infrastructure code
├── src/                    # Lambda function code
├── scripts/                # Utility scripts
└── package.json           # Project configuration
```

## Security

- Authentication tokens expire after 1 week
- DynamoDB tables use encryption at rest
- API Gateway endpoints are HTTPS-only
- Lambda functions use minimal IAM permissions

## License

MIT