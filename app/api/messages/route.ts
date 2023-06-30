import { NextResponse } from "next/server";
import prisma from "../../lib/prismadb"
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {text, image, conversationId} = await request.json();
    const currentUser = await getCurrentUser();

    try {

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 400});

        // Checks to see if the required fields are provided
        if(!conversationId || (!text && !image)) {
            return NextResponse.json({message: "Invaid Data, Provide Required Information"}, {status: 400});
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
            return NextResponse.json({message: "Conversation does not exist"}, {status: 400});
        }

        // Checks to see if current user is apart of conversation
        if(!existingConversation.members.some((member) => member.email === currentUser?.email)) {
            return NextResponse.json({message: "Cannot send a Message to a Conversation you aren't apart of."}, {status: 401});
        }

        const newMessage =  await prisma.message.create({
            data: {
                text,
                image,
                conversation: {
                    connect: {id: conversationId}
                },
                sender: {
                    connect: {id: currentUser?.id}
                }
            },
            include: {
                sender: true
            }
        });

        const updatedConversation = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                lastMessageAt: new Date(),
                messages: {
                    connect: {
                        id: newMessage.id
                    }
                }
            },
            include: {
                members: true
            }
        });

        return NextResponse.json(newMessage, {status: 201});
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }


}

// Test: Does it pass these?
// 1. Must be logged in (PASS)
// 2. Are the required fields provided? (PASS)
// 3. Users cannot send a message to a conversation that does not exist (PASS)
// 4. Only a message can be sent in a conversation that a user is in (PASS)
// 5. Is there a current user? (PASS)