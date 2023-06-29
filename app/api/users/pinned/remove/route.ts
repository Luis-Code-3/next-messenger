import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {conversationId} =  await request.json();
    // const session = await getServerSession(authOptions);
    const currentUser = await getCurrentUser();
    
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

        if(!existingConversation.members.some((member) => member.email === currentUser?.email)) {
            return NextResponse.json({message: "You cannot remove a pinned conversation you are not apart of."}, {status: 401})
        }

        const currentUserPinned = await prisma.user.findUnique({
            where: {
                id: currentUser?.id
            },
            include: {
                pinned: true
            }
        });

        const newPinnedIds = currentUserPinned?.pinnedIds.filter(id => id !== conversationId);

        const updateUser = await prisma.user.update({
            where: {
                id: currentUser?.id
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
            return id !== currentUser?.id
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
                        id: currentUser?.id
                    }
                }
            }
        })


        return NextResponse.json({message: "Conversation was removed from Pinned."}, {status: 201})
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}