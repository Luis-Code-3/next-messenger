import {withAuth} from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
    async function middleware(req: NextRequest) {
        const pathname = req.nextUrl.pathname;
        const isAuth = await getToken({req});

        if (pathname.startsWith('/api')) {
            if(!isAuth) {
                return NextResponse.json({message: "Must be Logged In"}, {status: 400})
            }

            // add rate limiter here later

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