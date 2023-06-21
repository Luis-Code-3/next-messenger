import type {JWT} from "next-auth/jwt";
import { Session, User } from "next-auth";

declare module 'next-auth/jwt' {
    interface JWT {
        isNewUser?: boolean
    }
}

declare module 'next-auth' {
    interface Session {
        user: User & {
            isNewUser?: boolean
        }
    }
}