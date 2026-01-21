# Database Alternatives Guide

## Current Setup: Firestore (Free Tier)
- **50,000 reads/day**
- **20,000 writes/day** 
- **1 GB storage**
- Usually enough for most apps!

## Alternative 1: Supabase (Recommended if switching)

### Setup:
1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Get your connection string from Settings → API

### Install:
```bash
npm install @supabase/supabase-js
```

### Environment Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Free Tier:
- 500 MB database
- 2 GB bandwidth/month
- 50,000 monthly active users
- Unlimited API requests

---

## Alternative 2: MongoDB Atlas

### Setup:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string

### Install:
```bash
npm install mongodb
```

### Free Tier:
- 512 MB storage
- Shared cluster
- Good for document-based data

---

## Alternative 3: PlanetScale

### Setup:
1. Go to https://planetscale.com
2. Create free account
3. Create database

### Install:
```bash
npm install @planetscale/database
```

### Free Tier:
- 1 database
- 1 GB storage
- 1 billion row reads/month

---

## Recommendation

**Stick with Firestore free tier** - it's very generous and you're already set up!

If you need more, **Supabase** is the best alternative with PostgreSQL and great free tier.
