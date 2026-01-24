# DynamoDB Setup Guide

## Required Tables

You need to create two DynamoDB tables in AWS Console (ap-south-1 region):

### 1. Users Table

**Table Name:** `users` (or set `AWS_DYNAMODB_USERS_TABLE` env var)

**Partition Key:**
- `id` (String)

**Global Secondary Index (GSI):**
- Index Name: `email-index`
- Partition Key: `email` (String)

**Settings:**
- Billing Mode: On-demand (recommended) or Provisioned
- Encryption: AWS owned keys (default)

### 2. OTP Codes Table

**Table Name:** `otp_codes` (or set `AWS_DYNAMODB_OTP_TABLE` env var)

**Partition Key:**
- `email` (String)

**Time to Live (TTL):**
- Attribute Name: `ttl`
- This will automatically delete expired OTPs

**Settings:**
- Billing Mode: On-demand (recommended) or Provisioned
- Encryption: AWS owned keys (default)

## Steps to Create Tables

1. Go to AWS Console → DynamoDB
2. Select region: **ap-south-1 (Mumbai)**
3. Click "Create table"

### For Users Table:
- Table name: `users`
- Partition key: `id` (String)
- Click "Create table"
- After creation, go to "Indexes" tab
- Click "Create index"
  - Index name: `email-index`
  - Partition key: `email` (String)
  - Click "Create index"

### For OTP Table:
- Table name: `otp_codes`
- Partition key: `email` (String)
- Click "Create table"
- After creation, go to "Additional settings"
- Enable TTL with attribute name: `ttl` 

## IAM Permissions

Your AWS IAM user/role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-south-1:*:table/users",
        "arn:aws:dynamodb:ap-south-1:*:table/users/index/email-index",
        "arn:aws:dynamodb:ap-south-1:*:table/otp_codes"
      ]
    }
  ]
}
```

## Testing

After creating tables, test the connection by:
1. Setting up AWS credentials in `.env.local`
2. Running the application
3. Attempting to sign up a new user