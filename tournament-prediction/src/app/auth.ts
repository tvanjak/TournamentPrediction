import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/prisma"

export const { handlers, auth, signIn, signOut} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
})