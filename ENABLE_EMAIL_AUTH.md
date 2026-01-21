# Enable Email/Password Authentication in Firebase

## Error: `auth/operation-not-allowed`

This error means **Email/Password authentication is not enabled** in Firebase Console.

## How to Fix:

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select your project: `astro-pwa-hp`

### Step 2: Enable Email/Password Auth
1. Click **"Authentication"** in the left sidebar
2. Click **"Get started"** (if you haven't set up auth yet)
3. Go to the **"Sign-in method"** tab
4. Find **"Email/Password"** in the list
5. Click on it
6. **Enable** the first toggle (Email/Password)
7. **Optionally enable** "Email link (passwordless sign-in)" if you want
8. Click **"Save"**

### Step 3: Verify Other Sign-in Methods
While you're there, also check:
- ✅ **Google** - Should be enabled (you already set this up)
- ✅ **Email/Password** - Enable this now

### Step 4: Test Again
After enabling, try signing up/login again. The error should be gone!

## Quick Checklist:
- [ ] Go to Firebase Console → Authentication
- [ ] Click "Sign-in method" tab
- [ ] Enable "Email/Password"
- [ ] Click "Save"
- [ ] Try authentication again

That's it! The error should be resolved.
