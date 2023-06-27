import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
    const {userId, conversationId} = await request.json();
    const session = await getServerSession(authOptions);

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

        if(!existingConversation.isGroup) return NextResponse.json({message: "Can only remove members in groups"}, {status: 400});

        if(session?.user.id !== existingConversation.admin?.id) return NextResponse.json({message: "Only Admins can remove members"}, {status: 400});

        if(!existingConversation.memberIds.includes(userId)) return NextResponse.json({message: "User is not a member in this group"}, {status: 400});

        const newMemberIds = existingConversation.memberIds.filter(id => id !== userId);

        const newConversationIds = existingUser.conversationIds.filter(id => id !== conversationId);

        const updatedConversation = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                memberIds: {
                    set: newMemberIds
                },
                members: {
                    disconnect: {
                        id: userId
                    }
                }
            }
        });

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                conversationIds: {
                    set: newConversationIds
                },
                conversations: {
                    disconnect: {
                        id: conversationId
                    }
                }
            }
        });

        return NextResponse.json({updatedConversation, message: "Removed Member from Group Chat"}, {status: 201})
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}