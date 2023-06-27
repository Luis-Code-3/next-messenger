import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const {username, email} = await request.json();

    if(!username) {
        return NextResponse.json({message: "Field is Required."}, {status: 400});
    }

    if(session?.user.email !== email) {
        return NextResponse.json({message: "Not Authorized"}, {status: 401})
    } // prevents another user from changing your username

    try {
        const existUser = await prisma.user.findUnique({
            where: {
                username: username
            }
        });

        if(existUser) {
            return NextResponse.json({message: "Username already taken."}, {status: 400})
        }

        const user = await prisma.user.update({
            where: {
                email: email
            },
            data: {
                username
            }
        });

        return NextResponse.json({message: `Username Updated to ${user.username}`}, {status: 201})
    } catch (err) {
        return NextResponse.json({message: "Internal Error"}, {status: 500})
    }
}