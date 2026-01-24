// AWS SDK Configuration
// This file sets up AWS clients for SES, DynamoDB, and Cognito

import { SESClient } from "@aws-sdk/client-ses";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

// Validate AWS configuration
if (!process.env.APP_AWS_REGION) {
  console.error("APP_AWS_REGION is not set in environment variables");
  throw new Error("APP_AWS_REGION is required. Please set it in your .env.local file.");
}

if (!process.env.APP_AWS_ACCESS_KEY_ID) {
  console.warn("APP_AWS_ACCESS_KEY_ID is not set. AWS SDK will use default credential chain.");
}

if (!process.env.APP_AWS_SECRET_ACCESS_KEY) {
  console.warn("APP_AWS_SECRET_ACCESS_KEY is not set. AWS SDK will use default credential chain.");
}

const region = process.env.APP_AWS_REGION || "ap-south-1";

// AWS SDK v3 client configuration
const awsConfig = {
  region,
  ...(process.env.APP_AWS_ACCESS_KEY_ID && process.env.APP_AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
};

// Initialize AWS clients
const sesClient = new SESClient(awsConfig);

export { sesClient };
export const dynamoDBClient = new DynamoDBClient(awsConfig);
export const dynamoDocClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
export const cognitoClient = new CognitoIdentityProviderClient(awsConfig);

// Export region for use in other modules
export const AWS_REGION = region;
