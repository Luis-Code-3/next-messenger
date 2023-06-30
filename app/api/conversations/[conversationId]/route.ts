import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb"
import getCurrentUser from "@/app/actions/getCurrentUser";

type IParams = {
    conversationId: string
}

export async function DELETE(request: Request, {params}: {params: IParams}) {
    const conversationId = params.conversationId;
    const currentUser = await getCurrentUser();

    try {

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 400});

        // Checks to see if required fields were provided
        if(!conversationId) return NextResponse.json({message: "Provide Required Field"}, {status: 400})

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                members: true,
                admin: true
            }
        });

        // Checks to see if conversation exists
        if(!existingConversation) {
            return NextResponse.json({message: "Conversation does not exist."}, {status: 400})
        }

        // Checks to see if current user is apart of the conversation they are trying to delete
        if(!existingConversation.members.some((member) => member.email === currentUser?.email)) {
            return NextResponse.json({message: "Cannot delete a conversation you aren't apart of."}, {status: 400})
        }

        // Checks to see if the conversation is a group
        if(existingConversation.isGroup) {
            // Checks to see if the current user is the admin of the group conversation they are trying to delete
            if(existingConversation.adminId !== currentUser?.id) {
                return NextResponse.json({message: "Only Group Admin can Delete Conversation."}, {status: 400})
            }
        }

        const deletedConversation = await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                memberIds: {
                    has: currentUser?.id //check here again and disconnect it
                }
            }
        });

        const currentUserConvos = await prisma.user.findUnique({
            where: {
                id: currentUser.id
            },
            include: {
                conversations: true
            }
        });

        const newConvoIds = currentUserConvos?.conversationIds.filter(id => id !== conversationId);
        
        const updatedUser = await prisma.user.update({
            where: {
                id: currentUser.id
            },
            data: {
                conversationIds: {
                    set: newConvoIds
                },
                conversations: {
                    disconnect: {
                        id: conversationId
                    }
                }
            }
        })
        
        return NextResponse.json({deletedConversation, message: "Deleted Conversation"}, {status: 200})

    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}

// Test: Does it pass these?
// 1. Must be logged in (PASS)
// 2. Is there a current user? (PASS)
// 3. Were the required fields provided? (PASS)
// 4. Does the conversation exist? (PASS)
// 5. Is there current user apart of the conversation/group? (PASS)
// 6. Is the conversation a group? If so, is the current user the admin of the group? (PASS)

// should disconnect and also update the user's conversationIds and disconnect there too?
// should make sure it deletes messages within the conversation if it were to be deleted

// In the future, you can add a feature for a user to delete a conversation (remove from theirs), but still have
// it available for the other user who chose not to delete it.