import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {conversationId} =  await request.json();
    const currentUser = await getCurrentUser();
    
    try {

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 400});
        
        // Checks to see if the required ConversationId field was provided
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

        // Checks to see if the conversation exists
        if(!existingConversation) {
            return NextResponse.json({message: "Conversation does not exist."}, {status: 400})
        }

        // Checks to see if the current user is apart of the conversation
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

// Test: Does it pass these?
// 1. Must be logged in (PASS)
// 2. Does conversation exist? (PASS)
// 3. Was a conversationId provided (PASS)
// 4. Other users cannot unpin a conversation for you (PASS)
// 5. Only conversations a user is in can be removed from pinned (PASS)
// 6. Is there a current user? (PASS)