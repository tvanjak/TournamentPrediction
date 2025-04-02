import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const adapter = PrismaAdapter(prisma);

export const authOptions = {
  adapter, // Ensure Prisma is initialized correctly
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub; // Attach user ID to session
      }
      return session;
    },
  },
  debug: true, // Enable debugging to see more errors
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



//export const authOptions = {
//  providers: [
//    GoogleProvider({
//      clientId: process.env.GOOGLE_CLIENT_ID!,
//      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//    }),
//  ],
//  adapter: PrismaAdapter(prisma),
//  callbacks: {
//    async session({ session, user }) {
//      if (session.user) {
//        session.user.id = user.id;
//        // Use the name from Google directly
//        session.user.name = user.name;
//      }
//      return session;
//    },
//  },
//  secret: process.env.NEXTAUTH_SECRET,
//};
//
//const handler = NextAuth(authOptions);
//
//export { handler as GET, handler as POST };