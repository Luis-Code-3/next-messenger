import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    const {username} = await request.json();

    // Checks to see if a user is a logged in / there is a current user
    if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 401});

    // Checks to see if required username field was provided
    if(!username) {
        return NextResponse.json({message: "Field is Required."}, {status: 400});
    }

    try {
        const existUser = await prisma.user.findUnique({
            where: {
                username: username
            },
            select: {
                username: true
            }
        });

        // Checks to see if username is already taken
        if(existUser) {
            return NextResponse.json({message: "Username already taken."}, {status: 409})
        }

        const user = await prisma.user.update({
            where: {
                id: currentUser.id
            },
            data: {
                username
            },
            select: {
                username: true
            }
        });

        return NextResponse.json({message: `Username Updated to ${user.username}`}, {status: 200})
    } catch (err) {
        return NextResponse.json({message: "Internal Error"}, {status: 500})
    }
}

// Test: Does it pass these?
// 1. Must be logged in (PASS) (TESTED)
// 2. Is there a current user? (PASS) (TESTED)
// 3. Was the required fields provided? (PASS) (TESTED)
// 4. Other users cannot change your username (PASS) (TESTED)
// 5. Cannot change to a username that already exists (PASS) (TESTED)