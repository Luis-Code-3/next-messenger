import NextAuth from "next-auth/next";
import { AuthOptions } from "next-auth";
import prisma from "../../../lib/prismadb"
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    pages: {

    },
    providers: [],
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: "jwt"
    },
    callbacks: {

    },
    secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};