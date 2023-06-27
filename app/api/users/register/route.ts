import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import bcrypt from "bcrypt";

export async function POST(request:Request) {
    const {username, password, email, name} = await request.json();

    if(!username || !email || !password || !name) {
        return NextResponse.json({message: "All Fields are Required."}, {status: 400});
    }

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
            }
        });

        if(existUser) {
            return NextResponse.json({message: "User already exists"}, {status: 400})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                hashedPassword,
                name
            }
        });

        return NextResponse.json({message: `Welcome ${user.username}`}, {status: 201})
        
    } catch (err) {
        return NextResponse.json({message: "Internal Error"}, {status: 500})
    }
}