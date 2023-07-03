import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {userId, conversationId} = await request.json();
    const currentUser = await getCurrentUser();

    try {

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 401});

        // Checks to see if required fields were provided
        if(!userId || !conversationId) return NextResponse.json({message: "Provide Required Fields"}, {status: 400})

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            select: {
                isGroup: true,
                adminId: true,
                memberIds: true
            }
        });

        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                username: true,
                conversationIds: true
            }
        });

        // Checks to see if the user who is being removed exists
        if(!existingUser) return NextResponse.json({message: "User does not exist."}, {status: 404});

        // Checks to see if the conversation exists
        if(!existingConversation) return NextResponse.json({message: "Conversation does not exist."}, {status: 404});

        // Checks to see if the conversation is a group, can only remove members in a group
        if(!existingConversation.isGroup) return NextResponse.json({message: "Can only remove members in groups"}, {status: 400});

        // Checks to see if the current user is apart of the group conversation
        if(!existingConversation.memberIds.includes(currentUser.id)) return NextResponse.json({message: "You are not apart of this group conversation"}, {status: 403});

        // Checks to see if the current user is the admin of the group conversation
        if(currentUser?.id !== existingConversation.adminId) return NextResponse.json({message: "Only Admins can remove members"}, {status: 403});

        // Checks to see if the user being removed is in the group conversation
        if(!existingConversation.memberIds.includes(userId)) return NextResponse.json({message: "User is not a member in this group"}, {status: 409});

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
            },
            select: {
                id: true
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
            },
            select: {
                username: true
            }
        });

        return NextResponse.json({message: `Removed ${updatedUser.username} from Group Chat`}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}

// Test: Does it pass these?
// 1. Must be logged in (PASS) (TESTED)
// 2. Is there a current user? (PASS) (TESTED)
// 3. Were the required fields provided? (PASS) (TESTED)
// 4. Does the user exist? (PASS) (TESTED)
// 5. Does the conversation exist? (PASS) (TESTED)
// 6. You can only remove members in a group (PASS) (TESTED)
// 7. Only the admin of a group can remove members (PASS) (TESTED)
// 8. Can only remove a member of a group of which he is in (PASS) (TESTED)
// 9. Is current user a member of the group? (PASS) (TESTED)