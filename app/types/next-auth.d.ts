import type {JWT} from "next-auth/jwt";
import { Session, User } from "next-auth";

interface MyAdapterUser extends User {
    username: string;
  }

declare module 'next-auth/jwt' {
    interface JWT {
        isNewUser?: boolean
        username: string
    }
}

declare module 'next-auth' {
    interface Session {
        user: User & {
            isNewUser?: boolean
            username: string
        }
    }
}