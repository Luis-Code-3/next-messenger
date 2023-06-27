import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
    const {conversationId} = await request.json();
    const session = await getServerSession(authOptions);



    try {

        if(!conversationId) {
            return NextResponse.json({message: "Provided Required Information"}, {status: 400})
        }

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                members: true
            }
        });

        if(!existingConversation) {
            return NextResponse.json({message: "Conversation does not exist."}, {status: 400})
        }

        if(!existingConversation.members.some((member) => member.email === session?.user.email)) {
            return NextResponse.json({message: "You cannot pin a conversation you are not apart of."}, {status: 401})
        }

        // update user's pinned convos
        const updateUser = await prisma.user.update({
            where: {
                id: session?.user.id
            },
            data: {
                pinnedIds: {
                    push: conversationId,
                },
                pinned: {
                    connect: {
                        id: conversationId
                    }
                }
            },
            include: {
                pinned: true
            }
        });


        // update convos pinnedByIds
        return NextResponse.json({message: "Conversation was Pinned"}, {status: 201});
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}