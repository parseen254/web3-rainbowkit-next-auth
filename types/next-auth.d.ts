import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    address: string | null | undefined;
    user:
      | {
          name?: string | null | undefined;
          email?: string | null | undefined;
          image?: string | null | undefined;
        }
      | undefined;
  }
}
