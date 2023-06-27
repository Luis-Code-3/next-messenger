import { NextResponse } from "next/server";
import prisma from "../../../lib/prismadb"
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

type IParams = {
    conversationId: string
}

export async function DELETE(request: Request, {params}: {params: IParams}) {
    const conversationId = params.conversationId;
    const session = await getServerSession(authOptions);


    try {
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

        if(!existingConversation.members.some((member) => member.email === session?.user.email)) {
            return NextResponse.json({message: "Cannot delete a conversation you aren't apart of."}, {status: 400})
        }

        if(existingConversation.isGroup) {
            if(existingConversation.admin?.email !== session?.user.email) {
                return NextResponse.json({message: "Only Group Admin can Delete Conversation."}, {status: 400})
            }
        }

        const deletedConversation = await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                memberIds: {
                    has: session?.user.id //check here again
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