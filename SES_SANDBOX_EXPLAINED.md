# AWS SES Sandbox Mode Explained

## What is Sandbox Mode?

**Sandbox mode** is AWS SES's default security mode for new accounts. It's designed to prevent spam and abuse.

### Sandbox Mode Restrictions:
- ✅ You can **send emails FROM** verified email addresses or domains
- ❌ You can **ONLY send emails TO** verified email addresses
- ❌ You **CANNOT** send to any random email address

### Production Mode (After Requesting Access):
- ✅ You can send **FROM** verified email addresses or domains
- ✅ You can send **TO** any email address (no restrictions)
- ✅ Better for production applications

## Email Address vs Domain Verification

### Option 1: Verify Email Address (Quick Start - 5 minutes)
**What it is:** Verify a specific email like `manas@humarapandit.com`

**Pros:**
- ✅ Quick and easy (just click a link in email)
- ✅ No DNS configuration needed
- ✅ Good for testing and getting started

**Cons:**
- ❌ Only that ONE email can send emails
- ❌ Still in sandbox mode (can only send to verified recipients)

**When to use:** Testing, development, or if you only need one sender email

### Option 2: Verify Domain (Production - 30 minutes)
**What it is:** Verify the entire domain `humarapandit.com`

**Pros:**
- ✅ ANY email @humarapandit.com can send (noreply@, support@, etc.)
- ✅ More professional
- ✅ Better for production

**Cons:**
- ❌ Requires DNS configuration (add records to your domain)
- ❌ Takes longer to set up
- ❌ Still in sandbox mode unless you request production access

**When to use:** Production applications, multiple sender emails

## What You Need to Do Right Now

Since you haven't verified your domain yet, you have two options:

### Quick Fix (Do This First):
1. **Verify the email address** `manas@humarapandit.com` in SES
   - This will let you send emails FROM that address
   - You'll still be in sandbox mode (can only send TO verified emails)
   - Takes 5 minutes

2. **For testing:** Also verify the recipient email address
   - If you want to test OTP, verify the email you're testing with
   - Then you can send OTP to that email

### Better Solution (For Production):
1. **Verify your domain** `humarapandit.com` in SES
   - Add DNS records (SPF, DKIM) to your domain
   - Any email @humarapandit.com can send
   - Takes 30 minutes (DNS propagation)

2. **Request production access**
   - Go to SES Console → Account dashboard
   - Click "Request production access"
   - Fill out the form
   - Wait for approval (usually 24 hours)
   - Then you can send to ANY email address

## Step-by-Step: Verify Email Address (Quick Start)

1. Go to https://console.aws.amazon.com/ses/ (region: ap-south-1)
2. Click "Verified identities" → "Create identity"
3. Select "Email address"
4. Enter: `manas@humarapandit.com`
5. Click "Create identity"
6. Check your email and click verification link
7. ✅ Done! You can now send FROM this email

**Important:** You're still in sandbox mode, so:
- You can send FROM: `manas@humarapandit.com` ✅
- You can send TO: Only verified email addresses ❌

## Step-by-Step: Verify Domain (Production)

1. Go to SES Console → Verified identities → Create identity
2. Select "Domain"
3. Enter: `humarapandit.com`
4. Choose verification method:
   - **Easy Email:** AWS sends verification email to admin@, postmaster@, etc.
   - **DNS:** Add DNS records (recommended)
5. If using DNS:
   - Copy the DNS records AWS provides
   - Add them to your domain's DNS (wherever you manage DNS)
   - Wait for DNS propagation (5-30 minutes)
6. AWS will verify automatically once DNS records are found
7. ✅ Done! Any email @humarapandit.com can send

## Current Status

Based on your setup:
- ❌ Email `manas@humarapandit.com` is NOT verified → **Fix this first!**
- ❌ Domain `humarapandit.com` is NOT verified → Do this later for production
- ❌ Account is in sandbox mode → Request production access when ready

## Recommended Path

### Phase 1: Get It Working (Now)
1. Verify email `manas@humarapandit.com` ✅
2. Verify test recipient email (for testing) ✅
3. Test OTP sending ✅

### Phase 2: Production Ready (Later)
1. Verify domain `humarapandit.com` ✅
2. Request production access ✅
3. Can send to any email address ✅

## Summary

- **Sandbox mode** = Can only send to verified emails
- **Verify email** = Quick fix, one email can send
- **Verify domain** = Better, any email @domain can send
- **Production access** = Can send to any email address

**Right now:** Just verify `manas@humarapandit.com` to get started! 🚀
