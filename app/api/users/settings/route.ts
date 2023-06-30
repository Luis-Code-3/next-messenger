import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import { User } from "@prisma/client";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {name, username, image} = await request.json();
    const updateData: Partial<User>  = {};
    const currentUser = await getCurrentUser();

    try { 

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 400});

        if(username) {
            const existUsername = await prisma.user.findUnique({
                where: {
                    username
                }
            });

            // Checks to see if the username is already taken
            if(existUsername) return NextResponse.json({message: "Username Taken"}, {status: 400});

            updateData.username = username;
        }

        if (image) updateData.image = image;
        if (name) updateData.name = name;

        const updatedUser = await prisma.user.update({
            where: {
                id: currentUser?.id
            },
            data: updateData
        })


        return NextResponse.json({updatedUser, message: "Updated User"}, {status: 201})
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}


// Test: Does it pass these?
// 1. Must be logged in (PASS)
// 2. Other users cannot change your profile details (PASS (uses current user))
// 3. Is there a current user (PASS)
// 4. Cannot change to a username that already exists (PASS)