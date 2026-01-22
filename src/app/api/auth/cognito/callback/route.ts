import { NextRequest, NextResponse } from "next/server";
import { createUser, getUser } from "@/lib/aws/dynamodb";
import { getUserFromIdToken } from "@/lib/aws/cognito";
import { createSession } from "@/lib/auth/session";

const CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || "";
const CLIENT_SECRET = process.env.AWS_COGNITO_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("Cognito OAuth error:", error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }

    // Exchange authorization code for tokens using OAuth2 token endpoint
    const redirectUri = process.env.NEXT_PUBLIC_AWS_COGNITO_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/cognito/callback`;
    const cognitoDomain = process.env.NEXT_PUBLIC_AWS_COGNITO_DOMAIN;
    
    if (!cognitoDomain) {
      return NextResponse.redirect(new URL("/login?error=no_cognito_domain", request.url));
    }

    const tokenEndpoint = `https://${cognitoDomain}/oauth2/token`;
    
    // Build request body
    const bodyParams: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: redirectUri,
    };

    // Add client secret if used (for confidential clients)
    if (CLIENT_SECRET) {
      bodyParams.client_secret = CLIENT_SECRET;
    }
    
    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(bodyParams),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(new URL("/login?error=token_exchange_failed", request.url));
    }

    const tokenData = await tokenResponse.json();
    const idToken = tokenData.id_token;

    if (!idToken) {
      return NextResponse.redirect(new URL("/login?error=no_token", request.url));
    }

    // Get user info from ID token
    let user = getUserFromIdToken(idToken);
    
    // Check/create DynamoDB record
    let dbUser = await getUser(user.id);
    if (!dbUser) {
      await createUser(user);
      dbUser = user;
    } else {
      dbUser = user;
    }

    // Create session
    await createSession(dbUser, idToken);

    // Redirect to app
    return NextResponse.redirect(new URL("/astro", request.url));
  } catch (error: any) {
    console.error("Cognito callback error:", error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || "authentication_failed")}`, request.url));
  }
}
