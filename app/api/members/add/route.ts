import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb"
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {userId ,conversationId} = await request.json();
    const currentUser = await getCurrentUser();

    try {

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 400});

        // Checks to see if required fields were provided
        if(!userId || !conversationId) return NextResponse.json({message: "Provide Required Fields"}, {status: 400})

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

        // Checks to see if the user being added exists
        if(!existingUser) return NextResponse.json({message: "User does not exist."}, {status: 400});

        // Checks to see if the conversation exists
        if(!existingConversation) return NextResponse.json({message: "Conversation does not exist."}, {status: 400});

        // Checks to see if the conversation is a group, can only add members to group conversations
        if(!existingConversation.isGroup) return NextResponse.json({message: "Can only add members to groups"}, {status: 400});

        // Checks to see if the current user is apart of the group conversation
        if(!existingConversation.memberIds.includes(currentUser.id)) return NextResponse.json({message: "You are not apart of this group conversation"}, {status: 400});

        // Checks to see if current user is the admin of the group conversation
        if(currentUser?.id !== existingConversation.admin?.id) return NextResponse.json({message: "Only Admins can add members"}, {status: 400});

        // Checks to see if the user being added is already in the conversation
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

// Test: Does it pass these?
// 1. Must be logged in (PASS)
// 2. Is there a current user? (PASS)
// 3. Were the required fields provided? (PASS)
// 4. Does the user exist? (PASS)
// 5. Does the conversation exist? (PASS)
// 6. You can only add members in a group (PASS)
// 7. Only the admin of a group can add members (PASS)
// 8. Can only add a member to a group of which he is not in (PASS)
// 9. Is current user a member of the group? (PASS)