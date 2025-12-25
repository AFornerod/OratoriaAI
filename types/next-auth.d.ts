import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;  // ← IMPORTANTE
    tier?: string;
  }
  
  interface Session {
    user: {
      id: string;  // ← IMPORTANTE
      email: string;
      name?: string;
      tier?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;  // ← IMPORTANTE (es el ID del usuario)
    tier?: string;
  }
}