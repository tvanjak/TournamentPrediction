import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma-client";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      try {
        console.log("Sign in callback - User:", user.email);
        
        // Find or create user
        let dbUser = await prisma.users.findUnique({
          where: { email: user.email },
        });
        
        if (dbUser) {
          // Update existing user
          dbUser = await prisma.users.update({
            where: { email: user.email },
            data: {
              image: user.image,
              // Set username from Google name if not already set
              username: dbUser.username || user.name?.replace(/\s+/g, '_').toLowerCase() || undefined,
            },
          });
          console.log("Updated existing user:", dbUser.id);
        } else {
          // Create new user
          dbUser = await prisma.users.create({
            data: {
              email: user.email,
              image: user.image,
              username: user.name?.replace(/\s+/g, '_').toLowerCase() || undefined,
            },
          });
          console.log("Created new user:", dbUser.id);
        }
        
        // Now handle the account record
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        });
        
        if (existingAccount) {
          // Update existing account
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            data: {
              access_token: account.access_token,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
            },
          });
          console.log("Updated account for user:", dbUser.id);
        } else {
          // Create new account
          await prisma.account.create({
            data: {
              userId: dbUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
            },
          });
          console.log("Created account for user:", dbUser.id);
        }
        
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        // Return true anyway to allow sign in - we'll handle errors gracefully
        return true;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          console.log("Session callback - User email:", session.user.email);
          
          const dbUser = await prisma.users.findUnique({
            where: { email: session.user.email },
          });
          
          if (dbUser) {
            session.user.id = dbUser.id;
            // Add username to session if available
            if (dbUser.username) {
              session.user.name = dbUser.username;
            }
            console.log("Found user ID for session:", dbUser.id);
          } else {
            console.log("User not found in database for session");
          }
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  //debug: true,
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };