// src/lib/auth-edge.ts
import NextAuth from "next-auth";

// Do not import dbConnect or Mongoose here!
const auth = NextAuth({
  providers: [],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
});

export const { auth: middlewareAuth } = auth;
