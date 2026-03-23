import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import axios from "axios"
import { getApiUrl } from "./lib/getApiUrl"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const API_URL = getApiUrl()
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await axios.post(`${API_URL}/auth/signin`, {
            email: credentials.email,
            password: credentials.password
          })

          const { access_token, user } = response.data

          if (access_token && user) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: `${user.first_name} ${user.last_name}`,
              image: user.image || null,
              role: user.role,
              accessToken: access_token
            }
          }

          return null
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // OAuth flow (Google) — exchange Google identity for a backend JWT
      if (account?.provider === "google" && profile?.email) {
        try {
          const API_URL = getApiUrl()
          const res = await fetch(`${API_URL}/auth/oauth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: "google",
              provider_account_id: account.providerAccountId,
              email: profile.email,
              name: (profile as any).name || null,
              image: (profile as any).picture || (profile as any).image || null,
              id_token: account.id_token || null,
            }),
          })
          if (res.ok) {
            const data = await res.json()
            token.id = data.user.id.toString()
            token.role = data.user.role
            token.accessToken = data.access_token
          } else {
            console.error("OAuth backend exchange failed:", await res.text())
          }
        } catch (error) {
          console.error("OAuth backend exchange error:", error)
        }
      } else if (user) {
        // Credentials flow (inchangé)
        token.id = user.id || ""
        token.role = (user as any).role || ""
        token.accessToken = (user as any).accessToken || ""
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.accessToken = token.accessToken
      }
      return session
    }
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 heures
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
})
