// Server-side Cognito functions using AWS SDK
// These are used by API routes for server-side authentication

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "./config";
import { getUserFromIdToken } from "./cognito";
import crypto from "crypto";

const CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || "";
const CLIENT_SECRET = process.env.AWS_COGNITO_CLIENT_SECRET;
const USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL_ID || "";

// Helper to compute secret hash for Cognito (if client secret is used)
function computeSecretHash(username: string): string | undefined {
  if (!CLIENT_SECRET) return undefined;
  
  const crypto = require("crypto");
  return crypto
    .createHmac("SHA256", CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest("base64");
}

// Sign up with email and password (server-side)
export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<{ userId: string; email: string; requiresConfirmation: boolean }> {
  try {
    const params: any = {
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
      ],
    };

    if (name) {
      params.UserAttributes.push({
        Name: "name",
        Value: name,
      });
    }

    if (CLIENT_SECRET) {
      params.SecretHash = computeSecretHash(email);
    }

    const command = new SignUpCommand(params);
    const result = await cognitoClient.send(command);

    return {
      userId: result.UserSub || email,
      email: email,
      requiresConfirmation: result.CodeDeliveryDetails !== undefined,
    };
  } catch (error: any) {
    console.error("Error signing up with Cognito:", error);
    if (error.name === "UsernameExistsException") {
      throw new Error("Email already in use");
    }
    if (error.name === "InvalidPasswordException") {
      throw new Error("Password does not meet requirements");
    }
    if (error.name === "InvalidParameterException") {
      throw new Error("Invalid email or password format");
    }
    throw new Error(error.message || "Failed to sign up");
  }
}

// Sign in with email and password (server-side)
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{
  userId: string;
  email: string;
  accessToken: string;
  idToken: string;
  refreshToken?: string;
}> {
  try {
    const params: any = {
      ClientId: CLIENT_ID,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    if (CLIENT_SECRET) {
      params.AuthParameters.SECRET_HASH = computeSecretHash(email);
    }

    const command = new InitiateAuthCommand(params);
    const result = await cognitoClient.send(command);

    if (!result.AuthenticationResult) {
      throw new Error("Authentication failed - no tokens returned");
    }

    return {
      userId: result.AuthenticationResult.IdToken
        ? JSON.parse(
            Buffer.from(
              result.AuthenticationResult.IdToken.split(".")[1],
              "base64"
            ).toString()
          ).sub
        : email,
      email: email,
      accessToken: result.AuthenticationResult.AccessToken || "",
      idToken: result.AuthenticationResult.IdToken || "",
      refreshToken: result.AuthenticationResult.RefreshToken,
    };
  } catch (error: any) {
    console.error("Error signing in with Cognito:", error);
    if (error.name === "NotAuthorizedException") {
      throw new Error("Invalid email or password");
    }
    if (error.name === "UserNotConfirmedException") {
      throw new Error("User email not confirmed. Please verify your email.");
    }
    if (error.name === "UserNotFoundException") {
      throw new Error("User not found");
    }
    throw new Error(error.message || "Failed to sign in");
  }
}

// Check if user exists in Cognito (admin function)
export async function userExistsInCognito(email: string): Promise<boolean> {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    });
    await cognitoClient.send(command);
    return true;
  } catch (error: any) {
    if (error.name === "UserNotFoundException") {
      return false;
    }
    throw error;
  }
}

// Create user in Cognito with auto-confirmation (admin function)
// Used for OTP-based signup where email is already verified via OTP
export async function createCognitoUserWithPassword(
  email: string,
  password: string,
  name?: string
): Promise<{ userId: string; email: string }> {
  try {
    const userAttributes: any[] = [
      { Name: "email", Value: email },
      { Name: "email_verified", Value: "true" }, // Auto-verify since OTP was verified
    ];

    if (name) {
      userAttributes.push({ Name: "name", Value: name });
    }

    // Generate a UUID for the username since email is an alias
    const username = crypto.randomUUID();

    // First, create the user
    const createCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      UserAttributes: userAttributes,
      MessageAction: "SUPPRESS", // Don't send welcome email
      DesiredDeliveryMediums: [], // Don't send any messages
    });

    const createResult = await cognitoClient.send(createCommand);
    const userId = createResult.User?.Username || username;

    // Set permanent password
    const passwordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: userId,
      Password: password,
      Permanent: true, // User won't be forced to change password on first login
    });

    await cognitoClient.send(passwordCommand);

    return {
      userId: userId,
      email: email,
    };
  } catch (error: any) {
    console.error("Error creating Cognito user:", error);
    
    if (error.name === "UsernameExistsException") {
      throw new Error("Email already in use");
    }
    if (error.name === "InvalidPasswordException") {
      throw new Error("Password does not meet requirements");
    }
    if (error.name === "InvalidParameterException") {
      throw new Error("Invalid email or password format");
    }
    throw new Error(error.message || "Failed to create user");
  }
}

// Auto-confirm an existing Cognito user (admin function)
// Used when user verifies email via OTP
export async function confirmCognitoUser(email: string): Promise<void> {
  try {
    // Update user attributes to mark email as verified
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [
        { Name: "email_verified", Value: "true" },
      ],
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    console.error("Error confirming Cognito user:", error);
    if (error.name === "UserNotFoundException") {
      throw new Error("User not found in Cognito");
    }
    throw new Error(error.message || "Failed to confirm user");
  }
}

// Delete a user from Cognito (admin function)
// Used when cleaning up orphaned users during signup
export async function deleteCognitoUser(email: string): Promise<void> {
  try {
    const command = new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    });
    await cognitoClient.send(command);
  } catch (error: any) {
    // If user not found, that's fine - goal achieved
    if (error.name === "UserNotFoundException") {
      return;
    }
    console.error("Error deleting Cognito user:", error);
    throw new Error(error.message || "Failed to delete user");
  }
}
