import { NextResponse } from "next/server";
import { sesClient } from "@/lib/aws/config";
import { ListIdentitiesCommand, GetIdentityVerificationAttributesCommand } from "@aws-sdk/client-ses";

export async function GET() {
  try {
    // 1. List all identities
    const listCommand = new ListIdentitiesCommand({
      IdentityType: "EmailAddress",
      MaxItems: 100
    });
    const listResult = await sesClient.send(listCommand);
    const identities = listResult.Identities || [];

    // 2. Get verification status
    const verifyCommand = new GetIdentityVerificationAttributesCommand({
      Identities: identities
    });
    const verifyResult = await sesClient.send(verifyCommand);
    
    // 3. Check specifically for the target email if not in list
    const targetEmail = "manasbhatiaprsnl@gmail.com";
    let targetStatus = null;
    
    if (!identities.includes(targetEmail)) {
        // Try fetching it specifically in case it's not in the list (e.g. pagination)
        try {
            const targetCommand = new GetIdentityVerificationAttributesCommand({
                Identities: [targetEmail]
            });
            const targetResult = await sesClient.send(targetCommand);
            targetStatus = targetResult.VerificationAttributes?.[targetEmail]?.VerificationStatus;
        } catch (e) {
            console.error("Error fetching specific target:", e);
        }
    }

    return NextResponse.json({
      region: process.env.APP_AWS_REGION || "ap-south-1",
      note: "You must use 'Verified Identities' (Permission), NOT 'Email Validation' (Deliverability)",
      identities_found: identities,
      statuses: verifyResult.VerificationAttributes,
      target_email_check: {
        email: targetEmail,
        found_in_list: identities.includes(targetEmail),
        status: targetStatus || verifyResult.VerificationAttributes?.[targetEmail]?.VerificationStatus || "NOT_FOUND (Access Denied)"
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      code: error.code,
      stack: error.stack
    }, { status: 500 });
  }
}
