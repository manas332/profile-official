// Server-side Cognito functions using AWS SDK
// These are used by API routes for server-side authentication

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "./config";
import { getUserFromIdToken } from "./cognito";

const CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || "";
const CLIENT_SECRET = process.env.AWS_COGNITO_CLIENT_SECRET;

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
