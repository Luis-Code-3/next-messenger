import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb"
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {userId ,conversationId} = await request.json();
    // const session = await getServerSession(authOptions);
    const currentUser = await getCurrentUser();


    try {
        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                members: true,
                admin: true,
            }
        });

        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if(!existingUser) return NextResponse.json({message: "User does not exist."}, {status: 400});

        if(!existingConversation) return NextResponse.json({message: "Conversation does not exist."}, {status: 400});

        if(!existingConversation.isGroup) return NextResponse.json({message: "Can only add members to groups"}, {status: 400});

        if(currentUser?.id !== existingConversation.admin?.id) return NextResponse.json({message: "Only Admins can add members"}, {status: 400});

        if(existingConversation.memberIds.includes(userId)) return NextResponse.json({message: "User already a member"}, {status: 400});

        const updatedConversation = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                memberIds: {
                    push: userId
                },
                members: {
                    connect: {
                        id: userId
                    }
                }
            }
        })

        return NextResponse.json({updatedConversation, message: "Added Member to Group Chat"}, {status: 201})
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}