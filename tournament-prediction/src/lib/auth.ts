import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma-client";


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        let dbUser = await prisma.users.findUnique({ where: { email: user.email } });

        if (dbUser) {
          dbUser = await prisma.users.update({
            where: { email: user.email },
            data: {
              image: user.image ?? dbUser.image,
              username: dbUser.username || user.name?.replace(/\s+/g, "_").toLowerCase(),
            },
          });
        } else {
          dbUser = await prisma.users.create({
            data: {
              email: user.email,
              image: user.image,
              username: user.name?.replace(/\s+/g, "_").toLowerCase(),
            },
          });
        }

        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        });

        if (existingAccount) {
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            data: account,
          });
        } else {
          await prisma.account.create({
            data: {
              userId: dbUser.id,
              ...account,
            },
          });
        }

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return true;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.users.findUnique({ where: { email: session.user.email } });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.name = dbUser.username || session.user.name;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};
