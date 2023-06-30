import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {conversationId} = await request.json();
    const currentUser = await getCurrentUser();

    try {

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 400});

        // Checks to see if required ConversationId field was provided
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

        // Checks to see if conversation exists
        if(!existingConversation) {
            return NextResponse.json({message: "Conversation does not exist."}, {status: 400})
        }

        // Checks to see if current user is apart of the conversation
        if(!existingConversation.members.some((member) => member.email === currentUser?.email)) {
            return NextResponse.json({message: "You cannot pin a conversation you are not apart of."}, {status: 401})
        }

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
            include: {
                pinned: true
            }
        });

        return NextResponse.json({message: "Conversation was Pinned"}, {status: 201});
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}

// Test: Does it pass these?
// 1. Must be logged in (PASS)
// 2. Does conversation exist? (PASS)
// 3. Was a conversationId provided (PASS)
// 4. Other users cannot pin a conversation for you (PASS)
// 5. Only conversations a user is in can be pinned (PASS)
// 6. Is there a current user (PASS)