import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.APP_AWS_COGNITO_CLIENT_ID || "";
const CLIENT_SECRET = process.env.APP_AWS_COGNITO_CLIENT_SECRET;
const DOMAIN = process.env.NEXT_PUBLIC_APP_AWS_COGNITO_DOMAIN || "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_AWS_COGNITO_REDIRECT_URI || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, code_verifier, redirect_uri } = body;

    if (!code || !code_verifier) {
      return NextResponse.json(
        { error: "code and code_verifier are required" },
        { status: 400 }
      );
    }

    const tokenEndpoint = `https://${DOMAIN}/oauth2/token`;
    const actualRedirectUri = redirect_uri || REDIRECT_URI;

    const bodyParams: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: actualRedirectUri,
      code_verifier: code_verifier,
    };

    // Add client secret if configured (for confidential clients)
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
      const errorText = await tokenResponse.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { raw: errorText.substring(0, 200) };
      }
      return NextResponse.json(
        { error: errorData.error || "token_exchange_failed", error_description: errorData.error_description },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    return NextResponse.json({ id_token: tokenData.id_token });
  } catch (error: any) {
    return NextResponse.json(
      { error: "token_exchange_failed", error_description: error.message },
      { status: 500 }
    );
  }
}
