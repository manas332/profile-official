# Firestore: Test Mode vs Production Mode

## Test Mode (Recommended for Development)

### Pros:
✅ **Quick setup** - Get started immediately
✅ **No security rules needed** - Perfect for development
✅ **Easy testing** - No authentication required to read/write
✅ **30-day window** - Rules auto-expire, forcing you to set proper rules

### Cons:
❌ **Not secure** - Anyone can read/write (if they know your project)
❌ **Only for development** - Must switch before production
❌ **Auto-expires** - Rules expire after 30 days

### Best For:
- Development and testing
- Learning Firestore
- Quick prototyping

---

## Production Mode (Recommended for Production)

### Pros:
✅ **Secure from start** - Must set security rules immediately
✅ **Best practices** - Forces proper security setup
✅ **Production-ready** - No need to switch later

### Cons:
❌ **Requires setup** - Must configure security rules immediately
❌ **More complex** - Need to understand Firestore security rules
❌ **Can block development** - If rules are wrong, nothing works

### Best For:
- Production apps
- When you understand Firestore security
- Apps going live soon

---

## My Recommendation

### Start with TEST MODE because:

1. **You're in development** - Your app isn't live yet
2. **Easier to get started** - No security rules to configure immediately
3. **You can test freely** - Authentication will work without rule complexity
4. **30-day reminder** - Forces you to set proper rules before going live

### Then Set Up Security Rules:

After enabling in test mode, immediately set up proper rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // OTP codes - users can only write their own, read is restricted
    match /otp_codes/{email} {
      allow write: if request.auth == null; // Allow OTP creation
      allow read: if request.auth != null; // Only authenticated users can read
    }
  }
}
```

---

## Steps:

1. **Enable Firestore in TEST MODE** (for now)
2. **Set up basic security rules** (copy the rules above)
3. **Test your authentication** - Make sure it works
4. **Before going live** - Review and tighten security rules
5. **Switch to production mode** - When ready to deploy

---

## Quick Setup:

1. Enable Firestore → **Start in test mode**
2. Go to **Rules** tab
3. Paste the security rules above
4. Click **Publish**
5. Done! ✅

This gives you the best of both worlds: easy development + security!
