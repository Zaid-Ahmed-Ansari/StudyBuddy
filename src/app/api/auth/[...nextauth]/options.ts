// src/app/api/auth/[...nextauth]/auth.ts
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/src/lib/dbConnect";
import { UserModel } from "@/src/model/User";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";

const auth = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        const user = await UserModel.findOne({
          $or: [
            { email: credentials.identifier },
            { username: credentials.identifier },
          ],
        });
        if (!user) throw new Error("No user found with this email");
        if (!user.isVerified) throw new Error("Verify your account first");
        const match = await bcrypt.compare(credentials.password, user.password);
        if (!match) throw new Error("Incorrect password");
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.partyCode = user.partyCode
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.isVerified = token.isVerified ?? true;
      session.user.partyCode = token.partyCode
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  secret: process.env.AUTH_SECRET,
});

export const { handlers, auth:NewAuth } = auth;
