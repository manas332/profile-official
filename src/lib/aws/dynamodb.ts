import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDocClient } from "./config";
import { User } from "@/types/auth";

const USERS_TABLE = process.env.APP_AWS_DYNAMODB_USERS_TABLE || "users";
const OTP_TABLE = process.env.APP_AWS_DYNAMODB_OTP_TABLE || "otp_codes";
const CONSULTATION_ORDERS_TABLE = process.env.APP_AWS_DYNAMODB_CONSULTATION_ORDERS_TABLE || "consultation_orders";
const PRODUCTS_TABLE = process.env.APP_AWS_DYNAMODB_PRODUCTS_TABLE || "product_orders";

export const TABLE_NAMES = {
  CONSULTATION: CONSULTATION_ORDERS_TABLE,
  PRODUCTS: PRODUCTS_TABLE,
};


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

    return null;
  } catch (error: any) {
    // If GSI doesn't exist, use ScanCommand as fallback (less efficient but works)
    if (
      error.name === "ValidationException" &&
      (error.message?.includes("index") ||
        error.message?.includes("KeyConditions") ||
        error.message?.includes("KeyConditionExpression"))
    ) {
      console.warn(
        "⚠️ email-index GSI not found, using scan (inefficient). Please create GSI in DynamoDB."
      );

      try {
        // Use ScanCommand when GSI doesn't exist
        const scanResult = await dynamoDocClient.send(
          new ScanCommand({
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
      } catch (scanError: any) {
        console.error("Error scanning DynamoDB table:", scanError);
        if (scanError.name === "ResourceNotFoundException") {
          console.error(
            `⚠️ DynamoDB table "${USERS_TABLE}" not found. Please create it in AWS Console.`
          );
          return null;
        }
        throw scanError;
      }
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
        const value = key === "updatedAt"
          ? new Date().toISOString()
          : updates[key as keyof User];
        // Skip undefined/null values - DynamoDB doesn't allow them in ExpressionAttributeValues
        if (value !== undefined && value !== null) {
          updateExpressions.push(`${attrName} = ${attrValue}`);
          expressionAttributeNames[attrName] = key;
          expressionAttributeValues[attrValue] = value;
        }
      }
    });

    // Always update updatedAt
    if (!updateExpressions.includes("#updatedAt = :updatedAt")) {
      updateExpressions.push("#updatedAt = :updatedAt");
      expressionAttributeNames["#updatedAt"] = "updatedAt";
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();
    }

    // Ensure we have at least one expression (we always have updatedAt, but double-check)
    if (updateExpressions.length === 0) {
      throw new Error("Cannot update user: no valid fields to update");
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

// Order Management

export interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  [key: string]: any;
}

export interface Order {
  id: string; // Internal Order ID
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  amount: number;
  currency: string;
  items?: OrderItem[];
  status: 'created' | 'paid' | 'failed';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  astroId?: string; // For multi-tenancy
  type?: string; // 'consultation' | 'product'
  createdAt: string;
  updatedAt: string;
  shippingDetails?: any; // For products
  consultationDetails?: any; // For consultation
}

export async function createOrder(tableName: string, orderArg: Order): Promise<void> {
  try {
    // Validate basic fields
    if (!orderArg.id || !orderArg.amount || !orderArg.razorpayOrderId) {
      throw new Error("Missing required order fields");
    }

    const order = {
      ...orderArg,
      createdAt: orderArg.createdAt || new Date().toISOString(),
      updatedAt: orderArg.updatedAt || new Date().toISOString(),
    };

    await dynamoDocClient.send(
      new PutCommand({
        TableName: tableName,
        Item: order,
      })
    );
  } catch (error: any) {
    console.error(`Error creating order in ${tableName}:`, error);
    if (error.name === "ResourceNotFoundException") {
      throw new Error(
        `DynamoDB table "${tableName}" not found. Please create it in AWS Console.`
      );
    }
    throw error;
  }
}

export async function getOrder(tableName: string, orderId: string): Promise<Order | null> {
  try {
    const result = await dynamoDocClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { id: orderId },
      })
    );
    return (result.Item as Order) || null;
  } catch (error: any) {
    console.error(`Error fetching order from ${tableName}:`, error);
    return null;
  }
}

export async function updateOrderStatus(
  tableName: string,
  orderId: string,
  status: 'paid' | 'failed',
  paymentDetails?: { razorpayPaymentId: string; razorpaySignature: string }
): Promise<void> {
  try {
    let updateExpression = "set #status = :status, updatedAt = :updatedAt";
    let expressionAttributeNames: any = { "#status": "status" };
    let expressionAttributeValues: any = {
      ":status": status,
      ":updatedAt": new Date().toISOString()
    };

    if (paymentDetails) {
      updateExpression += ", razorpayPaymentId = :pid, razorpaySignature = :sig";
      expressionAttributeValues[":pid"] = paymentDetails.razorpayPaymentId;
      expressionAttributeValues[":sig"] = paymentDetails.razorpaySignature;
    }

    await dynamoDocClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id: orderId },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
  } catch (error: any) {
    console.error(`Error updating order status in ${tableName}:`, error);
    throw error;
  }
}
