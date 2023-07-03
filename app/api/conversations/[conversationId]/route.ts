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
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 401});

        // Checks to see if required fields were provided
        if(!conversationId) return NextResponse.json({message: "Provide Required Field"}, {status: 400})

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                members: {
                    select: {
                        id: true,
                        conversationIds: true,
                        email: true
                    }
                }
            }
        }); // revist here, cannot add a select with include on same level. This means, I am getting all the fields including messages for existingConversation

        // Checks to see if conversation exists
        if(!existingConversation) {
            return NextResponse.json({message: "Conversation does not exist."}, {status: 404})
        }

        // Checks to see if current user is apart of the conversation they are trying to delete
        if(!existingConversation.members.some((member) => member.email === currentUser?.email)) {
            return NextResponse.json({message: "Cannot delete a conversation you aren't apart of."}, {status: 403})
        }

        // Checks to see if the conversation is a group
        if(existingConversation.isGroup) {
            // Checks to see if the current user is the admin of the group conversation they are trying to delete
            if(existingConversation.adminId !== currentUser?.id) {
                return NextResponse.json({message: "Only Group Admin can Delete Conversation."}, {status: 403})
            }
        }

        const deletedConversation = await prisma.conversation.delete({
            where: {
                id: conversationId
            },
            select: {
                id: true
            }
        });

        // Updates the all user's conversationId's array. Disconnects the deleted conversation
        const updateMemebers = existingConversation.members.map(async (member) => {

            const newConvoIds = member?.conversationIds.filter(id => id !== conversationId);

            await prisma.user.update({
                where: {
                    id: member.id
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
                },
                select: {
                    username: true
                }
            });

        });

        await Promise.all(updateMemebers)
        
        return NextResponse.json({deletedConversation, message: "Deleted Conversation"}, {status: 200})

    } catch (error) {
        // console.log(error);
        if (!/[a-fA-F0-9]{24}/.test(conversationId)) {
            return NextResponse.json({message: "Invalid conversationId format."}, {status: 400});
        }
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}

// Test: Does it pass these?
// 1. Must be logged in (PASS) (TESTED)
// 2. Is there a current user? (PASS) (TESTED)
// 3. Were the required fields provided? (PASS) (TESTED)
// 4. Does the conversation exist? (PASS) (TESTED)
// 5. Is there current user apart of the conversation/group? (PASS) (TESTED)
// 6. Is the conversation a group? If so, is the current user the admin of the group? (PASS) (TESTED)
// 7. Test if conversationId is of correct format for prisma (PASS) (TESTED)

// should disconnect and also update the user's conversationIds and disconnect there too?
// should make sure it deletes messages within the conversation if it were to be deleted

// In the future, you can add a feature for a user to delete a conversation (remove from theirs), but still have
// it available for the other user who chose not to delete it.