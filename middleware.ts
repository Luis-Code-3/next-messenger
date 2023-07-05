import {withAuth} from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const rateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    prefix: "@upstash/ratelimit"
});

export default withAuth(
    async function middleware(req: NextRequest) {
        const pathname = req.nextUrl.pathname;
        const isAuth = await getToken({req});

        if (pathname.startsWith('/api')) {
            let success;
            
            if(isAuth) {
                const identifier = isAuth.username;
                ({ success } = await rateLimit.limit(identifier));
            } else {
                const identifier = req.ip ?? '127.0.0.1';
                ({ success } = await rateLimit.limit(identifier));
            }

            if(!success) return NextResponse.json({message: "Too many requests. Try again later"}, {status: 429})

            if(pathname === '/api/users/register') {
                if(isAuth) {
                    return NextResponse.json({message: "You are already registered."}, {status: 409})
                }
                return NextResponse.next();
            }

            if(!isAuth) {
                return NextResponse.json({message: "Must be Logged In"}, {status: 401})
            }

            return NextResponse.next();
        }
        
        if (pathname === '/' || pathname === '/register') {
            if(isAuth) {
                return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
            }
        }

        if (pathname.startsWith('/dashboard')) {
            if (!isAuth) {
                return NextResponse.redirect(new URL('/', req.nextUrl))
            }

            if (isAuth.isNewUser) {
                return NextResponse.redirect(new URL('/setUsername', req.nextUrl))
            }

            if(pathname === '/dashboard') return NextResponse.redirect(new URL('/dashboard/conversations', req.nextUrl))
        }

        if (pathname === '/setUsername') {
            if(!isAuth) {
                return NextResponse.redirect(new URL('/', req.nextUrl))
            }

            if (!isAuth.isNewUser) {
                return NextResponse.redirect(new URL('/', req.nextUrl))
            }
        }


    },
    {
        callbacks: {
            async authorized() {
                return true // neeed this call back with withAuth
            }
        }
    }
)

export const config = {
    matcher: ['/', '/register', '/dashboard/:path*', '/setUsername', '/api/:path*']
}