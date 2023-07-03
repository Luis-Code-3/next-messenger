import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import bcrypt from "bcrypt";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request:Request) {
    const {username, password, email, name} = await request.json();
    const currentUser = await getCurrentUser();

    // Checks to see if all required fields were provided
    if(!username || !email || !password || !name) {
        return NextResponse.json({message: "All Fields are Required."}, {status: 400});
    }

    // Checks to see if user is logged out / confirms whether a currentUser exists
    if(currentUser?.id) return NextResponse.json({message: "You are already registered."}, {status: 409});

    try {
        const existUser = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: email
                    },
                    {
                        username: username
                    }
                ]
            },
            select: {
                username: true
            }
        });

        // Checks to see if an account with the provided username or email already exists
        if(existUser) {
            return NextResponse.json({message: "User already exists"}, {status: 409})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                hashedPassword,
                name
            },
            select: {
                username: true
            }
        });

        return NextResponse.json({message: `Welcome ${user.username}`}, {status: 201})
        
    } catch (err) {
        return NextResponse.json({message: "Internal Error"}, {status: 500})
    }
}

// Test: Does it pass these?
// 1. Must be logged out in order to access (PASS) (TESTED)
// 2. Cannot create an account with an existing username or email. (PASS) (TESTED)
// 3. Is there not a current user (PASS) (TESTED)
// 4. Are all required fields provided? (PASS) (TESTED)