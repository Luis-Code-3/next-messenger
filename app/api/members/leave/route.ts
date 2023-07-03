import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {conversationId} = await request.json();
    const currentUser = await getCurrentUser();

    try {

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 401});

        // Checks to see if required ConversationId was provided
        if(!conversationId) return NextResponse.json({message: "Provide Required Field"}, {status: 400})

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

        // Checks to see if the conversation exists
        if(!existingConversation) return NextResponse.json({message: "Conversation does not exist."}, {status: 404});

        // Checks to see if the conversation is a group, can only leave group conversations
        if(!existingConversation.isGroup) return NextResponse.json({message: "Can only leave groups"}, {status: 400});

        // Checks to see if the current user is apart of the group conversation
        if(!existingConversation.memberIds.includes(currentUser?.id)) return NextResponse.json({message: "You are not a member of this group"}, {status: 403});

        // Checks to see if the current user is the admin of the group conversation
        if(existingConversation.adminId === currentUser?.id) return NextResponse.json({message: "Admins cannot leave group"}, {status: 403}) // add extra logic or route

        const newMemberIds = existingConversation.memberIds.filter(id => id !== currentUser?.id);

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
            },
            select: {
                id: true
            }
        });

        const updatedUser = await prisma.user.update({
            where: {
                id: currentUser?.id
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


        return NextResponse.json({message: `${updatedUser.username} Left The Group Chat`}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}

// Test: Does it pass these?
// 1. Must be logged in (PASS) (TESTED)
// 2. Is there a current user? (PASS) (TESTED)
// 3. Were the required fields provided? (PASS) (TESTED)
// 4. Does the user exist? (PASS) (TESTED)
// 5. Does the conversation exist? (PASS) (TESTED)
// 6. You can only leave a group (PASS) (TESTED)
// 7. Admins cannot leave groups (PASS) (TESTED)
// 8. Can only leave a group of which you are in (PASS) (TESTED)