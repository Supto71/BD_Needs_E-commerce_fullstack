import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" || account?.provider === "facebook") {
          const email = user.email || `${account.providerAccountId}@${account.provider}.com`;
          
          let dbUser = await prisma.user.findUnique({
            where: { email: email },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: email,
                name: user.name || `${account.provider} User`,
                password: "OAUTH_LOGIN_" + Math.random().toString(36), // Dummy password for OAuth users
                avatarUrl: user.image || "",
                phone: "",
              },
            });
          }
          
          // Ensure user object has an email for the subsequent JWT callback
          user.email = email;
          
          return true;
        }
        return true;
      } catch (error) {
        console.error("NextAuth signIn Error:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (account && user) {
          // Initial sign in
          const email = user.email || `${account.providerAccountId}@${account.provider}.com`;
          const dbUser = await prisma.user.findUnique({
            where: { email: email },
            select: { id: true, name: true, email: true, role: true, isFraud: true, phone: true }
          });
          if (dbUser) {
            token.dbUser = dbUser;
          }
        }
        return token;
      } catch (error) {
        console.error("NextAuth jwt Error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token?.dbUser) {
          (session as any).user.dbUser = token.dbUser;
        } else if (session?.user?.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, email: true, role: true, isFraud: true, phone: true }
          });
          if (dbUser) {
            (session as any).user.dbUser = dbUser;
          }
        }
        return session;
      } catch (error) {
        console.error("NextAuth session Error:", error);
        return session;
      }
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
