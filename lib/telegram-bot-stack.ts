import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { config } from 'dotenv';
import {loadEnvVariables} from "./utils/env";

config();

export class TelegramBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { botTokenValue } = loadEnvVariables();

    const layer = new lambda.LayerVersion(this, 'SharedModules', {
      code: lambda.Code.fromAsset('lambda-layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Shared modules and dependencies for Telegram bot',
    });

    const botToken = new secretsmanager.Secret(this, 'BotToken', {
      secretName: `vitkuz-bot-token`,
      description: 'Telegram Bot Token',
      secretStringValue: cdk.SecretValue.unsafePlainText(botTokenValue),
    });

    // DynamoDB Tables
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const usersAuthTable = new dynamodb.Table(this, 'UsersAuthTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const paymentHistoryTable = new dynamodb.Table(this, 'PaymentHistoryTable', {
      partitionKey: { name: 'paymentId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Function
    const botHandler = new lambda.Function(this, 'TelegramBotHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      layers: [layer],
      code: lambda.Code.fromAsset('src'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        USERS_TABLE: usersTable.tableName,
        USERS_AUTH_TABLE: usersAuthTable.tableName,
        PAYMENT_HISTORY_TABLE: paymentHistoryTable.tableName,
        BOT_TOKEN: botToken.secretValue.unsafeUnwrap(), //todo: you can remove secret, and put it from .env
      },
    });



    // Grant DynamoDB permissions to Lambda
    usersTable.grantReadWriteData(botHandler);
    usersAuthTable.grantReadWriteData(botHandler);
    paymentHistoryTable.grantReadWriteData(botHandler);

    // API Gateway
    const telegramBotApi = new apigateway.RestApi(this, 'TelegramBotApi', {
      restApiName: 'Telegram Bot API',
    });

    ///-----------------------

    const integration = new apigateway.LambdaIntegration(botHandler);
    telegramBotApi.root.addMethod('POST', integration);

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: telegramBotApi.url,
      description: 'API Gateway URL for Telegram webhook',
    });

    // ====================================

    const validateAuthFunction = new lambda.Function(this, 'ValidateAuthFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/auth/index.handler',
      code: lambda.Code.fromAsset('src'),
      layers: [layer],
      timeout: cdk.Duration.seconds(30),
      environment: {
        USERS_TABLE: usersTable.tableName,
        USERS_AUTH_TABLE: usersAuthTable.tableName,
        PAYMENT_HISTORY_TABLE: paymentHistoryTable.tableName,
        BOT_TOKEN: botToken.secretValue.unsafeUnwrap(), //todo: you can remove secret, and put it from .env
        FRONT_URL: 'https://d1vcyqhvw55pzm.cloudfront.net/', //todo: you can remove secret, and put it from .env
      },
    });

    // Grant DynamoDB permissions
    usersTable.grantReadData(validateAuthFunction);
    usersAuthTable.grantReadData(validateAuthFunction);

    const usersHandler = new lambda.Function(this, 'UsersHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/users/index.handler',
      layers: [layer],
      code: lambda.Code.fromAsset('src'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        USERS_TABLE: usersTable.tableName,
        USERS_AUTH_TABLE: usersAuthTable.tableName,
        PAYMENT_HISTORY_TABLE: paymentHistoryTable.tableName,
        BOT_TOKEN: botToken.secretValue.unsafeUnwrap(), //todo: you can remove secret, and put it from .env
      },
    });

    // Grant DynamoDB permissions
    usersTable.grantReadWriteData(usersHandler);

    const filtersHandler = new lambda.Function(this, 'FiltersHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/filters/index.handler',
      layers: [layer],
      code: lambda.Code.fromAsset('src'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        USERS_TABLE: usersTable.tableName,
        USERS_AUTH_TABLE: usersAuthTable.tableName,
        PAYMENT_HISTORY_TABLE: paymentHistoryTable.tableName,
        BOT_TOKEN: botToken.secretValue.unsafeUnwrap(), //todo: you can remove secret, and put it from .env
      },
    });

    // Grant DynamoDB permissions
    usersTable.grantReadWriteData(filtersHandler);

    // Create API Gateway
    const authApi = new apigateway.RestApi(this, 'AuthApi', {
      restApiName: `AuthApi`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Add auth endpoint
    const auth = authApi.root.addResource('auth');
    const validate = auth.addResource('validate');

    validate.addMethod('GET', new apigateway.LambdaIntegration(validateAuthFunction));


    const users = authApi.root.addResource('users');
    const user = users.addResource('{userId}');

    users.addMethod('POST', new apigateway.LambdaIntegration(usersHandler));
    user.addMethod('GET', new apigateway.LambdaIntegration(usersHandler));
    user.addMethod('PUT', new apigateway.LambdaIntegration(usersHandler));
    user.addMethod('DELETE', new apigateway.LambdaIntegration(usersHandler));

    const filters = user.addResource('filters');
    const filter = filters.addResource('{filterId}');

    filters.addMethod('POST', new apigateway.LambdaIntegration(filtersHandler)); // add new filter
    // filter.addMethod('GET', new apigateway.LambdaIntegration(filtersHandler));
    // filter.addMethod('PUT', new apigateway.LambdaIntegration(filtersHandler));
    filter.addMethod('DELETE', new apigateway.LambdaIntegration(filtersHandler));

    // Stack Outputs
    new cdk.CfnOutput(this, 'UsersTableOutput', {
      value: usersTable.tableName,
      description: 'Users table name',
    });

    new cdk.CfnOutput(this, 'UsersAuthTableOutput', {
      value: usersAuthTable.tableName,
      description: 'Users authentication table name',
    });

    new cdk.CfnOutput(this, 'PaymentHistoryTableOutput', {
      value: paymentHistoryTable.tableName,
      description: 'Payment history table name',
    });

    new cdk.CfnOutput(this, 'TelegramBotApiOutput', {
      value: telegramBotApi.url,
      description: 'API Gateway URL for Telegram webhook',
    });

    new cdk.CfnOutput(this, 'AuthApiOutput', {
      value: authApi.url,
      description: 'API Gateway URL for auth',
    });

  }
}
