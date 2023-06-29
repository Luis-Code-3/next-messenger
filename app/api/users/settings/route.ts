import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { User } from "@prisma/client";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {name, username, image} = await request.json();
    const updateData: Partial<User>  = {};
    // const session = await getServerSession(authOptions);
    const currentUser = await getCurrentUser();

    try {
        if(username) {
            const existUsername = await prisma.user.findUnique({
                where: {
                    username
                }
            });

            if(existUsername) return NextResponse.json({message: "Username Taken"}, {status: 400});

            updateData.username = username;
        }

        // if(email) {
        //     const existEmail = await prisma.user.findUnique({
        //         where: {
        //             email
        //         }
        //     });

        //     if(existEmail) return NextResponse.json({message: "Email Taken"}, {status: 400});

        //     updateData.email = email;
        // }

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