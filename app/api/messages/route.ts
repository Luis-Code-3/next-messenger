import { NextResponse } from "next/server";
import prisma from "../../lib/prismadb"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {text, image, conversation} = await request.json();
    // const session = await getServerSession(authOptions);
    const currentUser = await getCurrentUser();

    try {
        if(!conversation || !currentUser?.id || (!text && !image)) {
            return NextResponse.json({message: "Invaid Data, Provide Required Information"}, {status: 400});
        }

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversation
            },
            include: {
                members: true
            }
        });

        if(!existingConversation) {
            return NextResponse.json({message: "Conversation does not exist"}, {status: 400});
        }

        if(!existingConversation.members.some((member) => member.email === currentUser?.email)) {
            return NextResponse.json({message: "Cannot send a Message to a Conversation you aren't apart of."}, {status: 401});
        }

        const newMessage =  await prisma.message.create({
            data: {
                text,
                image,
                conversation: {
                    connect: {id: conversation}
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
                id: conversation
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