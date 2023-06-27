import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
    const {conversationId} = await request.json();
    const session = await getServerSession(authOptions);


    try {
        if (!session?.user.email) {
            return NextResponse.json({message: "Not Authorized"})
        }

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                members: true,
                admin: true,
            }
        });

        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        if(!currentUser) return NextResponse.json({message: "User does not exist."}, {status: 400});

        if(!existingConversation) return NextResponse.json({message: "Conversation does not exist."}, {status: 400});

        if(!existingConversation.isGroup) return NextResponse.json({message: "Can only leave groups"}, {status: 400});

        if(!existingConversation.memberIds.includes(currentUser.id)) return NextResponse.json({message: "You are not a member of this group"}, {status: 400});

        if(existingConversation.adminId === currentUser.id) return NextResponse.json({message: "Admins cannot leave group"}, {status: 400}) // add extra logic or route

        const newMemberIds = existingConversation.memberIds.filter(id => id !== session?.user.id);

        const newConversationIds = currentUser.conversationIds.filter(id => id !== conversationId);

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
                        id: currentUser.id
                    }
                }
            }
        });

        const updatedUser = await prisma.user.update({
            where: {
                id: currentUser.id
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


        return NextResponse.json({updatedConversation, message: "Left The Group Chat"}, {status: 201});
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}