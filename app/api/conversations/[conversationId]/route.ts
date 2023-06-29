import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb"
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import getCurrentUser from "@/app/actions/getCurrentUser";

type IParams = {
    conversationId: string
}

export async function DELETE(request: Request, {params}: {params: IParams}) {
    const conversationId = params.conversationId;
    // const session = await getServerSession(authOptions);
    const currentUser = await getCurrentUser();


    try {
        // Need to check if conversationId exists

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                members: true,
                admin: true
            }
        });

        if(!existingConversation) {
            return NextResponse.json({message: "Conversation does not exist."}, {status: 400})
        }

        if(!existingConversation.members.some((member) => member.email === currentUser?.email)) {
            return NextResponse.json({message: "Cannot delete a conversation you aren't apart of."}, {status: 400})
        }

        if(existingConversation.isGroup) {
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
        
        // also update user conversationIds
        
        return NextResponse.json({deletedConversation, message: "Deleted Conversation"}, {status: 200})

    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}