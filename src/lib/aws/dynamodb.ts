import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDocClient } from "./config";
import { User } from "@/types/auth";

const USERS_TABLE = process.env.AWS_DYNAMODB_USERS_TABLE || "users";
const OTP_TABLE = process.env.AWS_DYNAMODB_OTP_TABLE || "otp_codes";

// Helper to convert DynamoDB item to User
function itemToUser(item: any): User {
  return {
    id: item.id,
    email: item.email,
    name: item.name,
    photoURL: item.photoURL,
    provider: item.provider,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
  };
}

// Helper to convert User to DynamoDB item
function userToItem(user: User): any {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoURL: user.photoURL,
    provider: user.provider,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function createUser(userData: User): Promise<void> {
  try {
    const now = new Date();
    const item = {
      ...userToItem({
        ...userData,
        createdAt: userData.createdAt || now,
        updatedAt: userData.updatedAt || now,
      }),
    };

    await dynamoDocClient.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: item,
        ConditionExpression: "attribute_not_exists(id)", // Prevent overwriting existing user
      })
    );
  } catch (error: any) {
    console.error("Error creating user in DynamoDB:", error);
    if (error.name === "ConditionalCheckFailedException") {
      throw new Error("User already exists");
    }
    if (error.name === "ResourceNotFoundException") {
      throw new Error(
        `DynamoDB table "${USERS_TABLE}" not found. Please create it in AWS Console.`
      );
    }
    throw error;
  }
}

export async function getUser(userId: string): Promise<User | null> {
  try {
    const result = await dynamoDocClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { id: userId },
      })
    );

    if (result.Item) {
      return itemToUser(result.Item);
    }
    return null;
  } catch (error: any) {
    console.error("Error getting user from DynamoDB:", error);
    if (error.name === "ResourceNotFoundException") {
      console.error(
        `⚠️ DynamoDB table "${USERS_TABLE}" not found. Please create it in AWS Console.`
      );
      return null;
    }
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Query using GSI on email (assuming email-index GSI exists)
    // If GSI doesn't exist, we'll scan (less efficient but works)
    const result = await dynamoDocClient.send(
      new QueryCommand({
        TableName: USERS_TABLE,
        IndexName: "email-index", // GSI name - adjust if different
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
        Limit: 1,
      })
    );

    if (result.Items && result.Items.length > 0) {
      return itemToUser(result.Items[0]);
    }

    // Fallback: Scan if GSI doesn't exist (not recommended for production)
    // This is a temporary fallback - should create GSI in production
    console.warn(
      "email-index GSI not found, using scan (inefficient). Please create GSI in DynamoDB."
    );
    const scanResult = await dynamoDocClient.send(
      new QueryCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
        Limit: 1,
      })
    );

    if (scanResult.Items && scanResult.Items.length > 0) {
      return itemToUser(scanResult.Items[0]);
    }

    return null;
  } catch (error: any) {
    // If GSI doesn't exist, try alternative approach
    if (error.name === "ValidationException" && error.message?.includes("index")) {
      // GSI doesn't exist, try scanning (not recommended for production)
      console.warn(
        "email-index GSI not found. Please create a GSI on email attribute in DynamoDB."
      );
      // For now, return null - user should create the GSI
      return null;
    }
    console.error("Error getting user by email from DynamoDB:", error);
    if (error.name === "ResourceNotFoundException") {
      console.error(
        `⚠️ DynamoDB table "${USERS_TABLE}" not found. Please create it in AWS Console.`
      );
      return null;
    }
    throw error;
  }
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<void> {
  try {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build update expression dynamically
    Object.keys(updates).forEach((key) => {
      if (key !== "id" && key !== "createdAt") {
        // Don't update id or createdAt
        const attrName = `#${key}`;
        const attrValue = `:${key}`;
        updateExpressions.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] =
          key === "updatedAt"
            ? new Date().toISOString()
            : updates[key as keyof User];
      }
    });

    // Always update updatedAt
    if (!updateExpressions.includes("#updatedAt = :updatedAt")) {
      updateExpressions.push("#updatedAt = :updatedAt");
      expressionAttributeNames["#updatedAt"] = "updatedAt";
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();
    }

    await dynamoDocClient.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id: userId },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
  } catch (error: any) {
    console.error("Error updating user in DynamoDB:", error);
    if (error.name === "ResourceNotFoundException") {
      throw new Error(
        `DynamoDB table "${USERS_TABLE}" not found. Please create it in AWS Console.`
      );
    }
    throw error;
  }
}

export async function saveOTP(
  email: string,
  otp: string,
  expiresAt: Date,
  purpose: "signup" | "login"
): Promise<void> {
  try {
    // Calculate TTL (seconds since epoch)
    const ttl = Math.floor(expiresAt.getTime() / 1000);

    await dynamoDocClient.send(
      new PutCommand({
        TableName: OTP_TABLE,
        Item: {
          email,
          otp,
          expiresAt: expiresAt.toISOString(),
          purpose,
          createdAt: new Date().toISOString(),
          ttl, // TTL attribute for automatic expiration
        },
      })
    );
  } catch (error: any) {
    console.error("Error saving OTP:", error);
    if (error.name === "ResourceNotFoundException") {
      throw new Error(
        `DynamoDB table "${OTP_TABLE}" not found. Please create it in AWS Console.`
      );
    }
    throw error;
  }
}

export async function verifyOTP(
  email: string,
  otp: string
): Promise<{ valid: boolean; purpose?: "signup" | "login" }> {
  try {
    const result = await dynamoDocClient.send(
      new GetCommand({
        TableName: OTP_TABLE,
        Key: { email },
      })
    );

    if (!result.Item) {
      console.error("OTP not found for email:", email);
      return { valid: false };
    }

    const data = result.Item;
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    // Check if expired
    if (!expiresAt || expiresAt < new Date()) {
      console.error("OTP expired for email:", email);
      // Delete expired OTP
      await deleteOTP(email);
      return { valid: false };
    }

    // Check if OTP matches
    if (data.otp !== otp) {
      console.error("OTP mismatch for email:", email);
      return { valid: false };
    }

    return { valid: true, purpose: data.purpose };
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    if (error.name === "ResourceNotFoundException") {
      throw new Error(
        `DynamoDB table "${OTP_TABLE}" not found. Please create it in AWS Console.`
      );
    }
    throw error;
  }
}

export async function deleteOTP(email: string): Promise<void> {
  try {
    await dynamoDocClient.send(
      new DeleteCommand({
        TableName: OTP_TABLE,
        Key: { email },
      })
    );
  } catch (error: any) {
    console.error("Error deleting OTP:", error);
    // Don't throw - deletion is best effort
  }
}
