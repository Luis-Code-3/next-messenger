import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
    const {conversationId} =  await request.json();
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
            return NextResponse.json({message: "You cannot remove a pinned conversation you are not apart of."}, {status: 401})
        }

        const currentUser = await prisma.user.findUnique({
            where: {
                id: session?.user.id
            },
            include: {
                pinned: true
            }
        });

        const newPinnedIds = currentUser?.pinnedIds.filter(id => id !== conversationId);

        const updateUser = await prisma.user.update({
            where: {
                id: session?.user.id
            },
            data: {
                pinnedIds: {
                    set: newPinnedIds
                },
                pinned: {
                    disconnect: {
                        id: conversationId
                    },
                }
            },
            include: {
                pinned: true
            }
        });

        const newPinnedByUserIds = existingConversation.pinnedByUserIds.filter((id) => {
            return id !== session?.user.id
        });

        const updateConversation = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                pinnedByUserIds: {
                    set: newPinnedByUserIds
                },
                pinnedByUsers: {
                    disconnect: {
                        id: session?.user.id
                    }
                }
            }
        })


        return NextResponse.json({message: "Conversation was removed from Pinned."}, {status: 201})
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}