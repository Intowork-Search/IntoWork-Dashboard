# Social Login Setup Guide for INTOWORK Sign-In

## Overview

The sign-in page now includes Google and GitHub social login buttons. This guide walks you through setting up the authentication providers with NextAuth.js v5.

## Prerequisites

- NextAuth.js v5.0.0-beta.30+ installed
- Node.js environment with environment variables support
- GitHub and Google developer accounts

## Configuration Files

### 1. Environment Variables

Update `frontend/.env.local` with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-here-32-characters-minimum
NEXTAUTH_URL=http://localhost:3000  # For development
# NEXTAUTH_URL=https://your-domain.com  # For production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 2. NextAuth Configuration File

Create or update `frontend/src/auth.ts`:

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    // Credentials Provider (existing email/password auth)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          return response.data.user;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        // Sync social login with backend
        try {
          const response = await axios.post(
            `${API_URL}/auth/social-signup`,
            {
              provider: account.provider,
              provider_id: profile?.id,
              email: profile?.email,
              name: profile?.name,
              image: profile?.image,
            }
          );

          token.user = response.data.user;
          token.accessToken = response.data.token;
        } catch (error) {
          console.error("Social auth sync error:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("User signed in:", { user, account, isNewUser });
    },

    async error({ error }) {
      console.error("Auth error:", error);
    },
  },
});
```

## Getting Provider Credentials

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to APIs & Services > Library
   - Search for "Google+ API"
   - Click Enable

3. **Create OAuth 2.0 Credentials**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://your-domain.com
     ```
   - Add Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-domain.com/api/auth/callback/google
     ```
   - Copy Client ID and Client Secret

### GitHub OAuth Setup

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Register New OAuth Application**
   - Application name: "INTOWORK"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

3. **Generate Client Secret**
   - After creating, you'll see Client ID
   - Click "Generate a new client secret"
   - Copy both Client ID and Client Secret

4. **Update for Production**
   - Create another OAuth app with production URLs
   - Or update URLs in existing app to support both dev/prod

## Backend Integration

### Required Backend Endpoint

The sign-in page expects a social authentication endpoint. Add this to `backend/app/api/auth.py`:

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.base import User, Candidate, Employer

router = APIRouter()

class SocialSignupRequest(BaseModel):
    provider: str  # 'google' or 'github'
    provider_id: str
    email: str
    name: str
    image: str | None = None

@router.post("/social-signup")
async def social_signup(
    request: SocialSignupRequest,
    db: Session = Depends(get_db)
):
    """
    Handle social login signup/sync
    """
    try:
        # Check if user exists by email
        user = db.query(User).filter(User.email == request.email).first()

        if not user:
            # Create new user
            user = User(
                email=request.email,
                first_name=request.name.split()[0] if request.name else "User",
                last_name=" ".join(request.name.split()[1:]) if request.name else "",
                role="candidate",  # Default role
                clerk_id=f"{request.provider}_{request.provider_id}",
                oauth_provider=request.provider,
                oauth_id=request.provider_id,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Create candidate profile automatically
            candidate = Candidate(user_id=user.id)
            db.add(candidate)
            db.commit()

        # Generate JWT token
        token = create_access_token({"sub": str(user.id)})

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.first_name,
                "image": request.image,
            },
            "token": token,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### Database Schema Update

Add OAuth fields to User model in `backend/app/models/base.py`:

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255))
    role = Column(String(50), default="candidate", nullable=False)
    clerk_id = Column(String(255), unique=True, index=True)

    # New OAuth fields
    oauth_provider = Column(String(50), nullable=True)  # 'google', 'github'
    oauth_id = Column(String(255), nullable=True, index=True)

    # Relationships
    candidate = relationship("Candidate", back_populates="user", uselist=False)
    employer = relationship("Employer", back_populates="user", uselist=False)
```

### Database Migration

Create a migration for the new fields:

```bash
cd backend
alembic revision --autogenerate -m "Add OAuth fields to User model"
alembic upgrade head
```

## Testing the Integration

### Test Locally

1. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn app.main:app --reload --port 8001

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

2. **Test Credentials Login**
   - Navigate to http://localhost:3000/auth/signin
   - Test normal email/password login first
   - Should redirect to dashboard on success

3. **Test Google Login**
   - Click "Google" button
   - Sign in with test Google account
   - Verify redirect to dashboard
   - Check browser console for errors

4. **Test GitHub Login**
   - Click "GitHub" button
   - Authorize the application
   - Verify redirect to dashboard

### Debug Mode

Enable detailed logging in `frontend/src/app/auth/signin/page.tsx`:

```typescript
const handleSocialSignIn = async (provider: 'google' | 'github') => {
  console.log(`Starting ${provider} sign-in`);
  setSocialLoading(provider);
  try {
    const result = await signIn(provider, { redirect: false });
    console.log(`${provider} sign-in result:`, result);

    if (!result?.error) {
      router.push('/dashboard');
    } else {
      console.error(`${provider} error:`, result.error);
    }
  } catch (error) {
    console.error(`${provider} exception:`, error);
  } finally {
    setSocialLoading(null);
  }
};
```

## Common Issues & Solutions

### Issue: "Redirect URI mismatch"

**Solution:**
- Verify redirect URIs match exactly in provider settings
- Check for trailing slashes: `/api/auth/callback/google` not `/api/auth/callback/google/`
- Ensure protocol (http vs https) matches configuration

### Issue: "Email already exists" on social signup

**Solution:**
- Set `allowDangerousEmailAccountLinking: true` in provider config
- This allows linking social accounts to existing email accounts
- Implement confirmation dialog for security

### Issue: "NEXTAUTH_SECRET not configured"

**Solution:**
```bash
# Generate a secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=your-generated-secret
```

### Issue: Profile image not showing

**Solution:**
- Google provides `picture` field, GitHub provides `avatar_url`
- Map these in the profile callback:
```typescript
profile: {
  ...profile,
  image: profile?.image || profile?.picture || profile?.avatar_url,
}
```

### Issue: "User object missing required fields"

**Solution:**
- Ensure backend creates User record with all required fields
- Verify firstName, lastName, email are provided
- Add default values if fields are missing from social profile

## Security Considerations

### Email Verification

Consider requiring email verification for social signups:

```typescript
callbacks: {
  async signIn({ user, account, profile, email, credentials }) {
    if (account?.provider !== "credentials") {
      // Send verification email for social signups
      await sendVerificationEmail(user.email);
      // Redirect to email verification page
      return "/auth/verify-email";
    }
    return true;
  },
}
```

### Rate Limiting

Add rate limiting to prevent brute force attempts:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
});

// In callbacks:
const { success } = await ratelimit.limit(user.email);
if (!success) {
  throw new Error("Too many sign-in attempts");
}
```

### CSRF Protection

NextAuth provides CSRF protection by default:
- Always use official NextAuth signIn function
- Don't make direct requests to OAuth providers
- Validate state parameter in callbacks

## Production Deployment

### Vercel Deployment

1. **Set Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local`
   - Redeploy project

2. **Update Provider URLs**
   - Google: Add `https://your-domain.com` to authorized origins
   - GitHub: Update OAuth app URLs to production domain

3. **Verify NEXTAUTH_URL**
   ```env
   NEXTAUTH_URL=https://your-domain.com
   ```

### Railway Deployment

```yaml
# Add to railway.toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
```

## Monitoring & Analytics

### Track Sign-In Events

```typescript
// Add to sign-in callback
events: {
  async signIn({ user, account, isNewUser }) {
    // Log to analytics service
    analytics.track("user_signed_in", {
      provider: account?.provider,
      is_new_user: isNewUser,
      user_id: user.id,
    });
  },
},
```

### Monitor Error Rates

```typescript
events: {
  async error({ error }) {
    // Send to error tracking service
    errorTracking.captureException(error, {
      tags: { auth_error: true },
    });
  },
},
```

## Next Steps

1. Get provider credentials (Google & GitHub)
2. Add environment variables to `.env.local`
3. Update `auth.ts` with provider configuration
4. Add backend endpoint for social signup
5. Add OAuth fields to User model
6. Run database migration
7. Test locally with test accounts
8. Deploy to production

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [NextAuth Google Provider](https://next-auth.js.org/providers/google)
- [NextAuth GitHub Provider](https://next-auth.js.org/providers/github)

## Support

For issues with social login implementation, check:
1. Browser console for error messages
2. NextAuth logs in server console
3. Provider error responses
4. Database records for created users
