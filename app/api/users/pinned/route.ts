import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {conversationId} = await request.json();
    const currentUser = await getCurrentUser();

    try {

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 401});

        // Checks to see if required ConversationId field was provided
        if(!conversationId) {
            return NextResponse.json({message: "Provided Required Information"}, {status: 400})
        }

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            select: {
                memberIds: true,
                pinnedByUserIds: true
            }
        });

        // Checks to see if conversation exists
        if(!existingConversation) {
            return NextResponse.json({message: "Conversation does not exist."}, {status: 404})
        }

        // Checks to see if current user is apart of the conversation
        if(!existingConversation.memberIds.some((memberId) => memberId === currentUser?.id)) {
            return NextResponse.json({message: "You cannot pin a conversation you are not apart of."}, {status: 403})
        }

        // Checks to see if the conversation is already pinned by current user
        if(existingConversation.pinnedByUserIds.includes(currentUser.id)) return NextResponse.json({message: "Already pinned this conversation"}, {status: 409})

        const updateUser = await prisma.user.update({
            where: {
                id: currentUser?.id
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
            select: {
                username: true
            }
        });

        return NextResponse.json({message: "Conversation was Pinned"}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}

// Test: Does it pass these?
// 1. Must be logged in (PASS) (TESTED)
// 2. Does conversation exist? (PASS) (TESTED)
// 3. Was a conversationId provided (PASS) (TESTED)
// 4. Other users cannot pin a conversation for you (PASS) (TESTED)
// 5. Only conversations a user is in can be pinned (PASS) (TESTED)
// 6. Is there a current user (PASS) (TESTED)
// 7. only can pin a conversation which hasnt already be pinned (PASS) (TESTED)