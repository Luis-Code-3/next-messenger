import { NextResponse } from "next/server";
import prisma from '../../lib/prismadb';

export async function POST(request: Request) {
    const {name, isGroup, image, memberIds, admin} = await request.json();

    try {
        if(isGroup) {
            const newConversation = await prisma.conversation.create({
                data: {
                    name,
                    isGroup,
                    image,
                    admin: {
                        connect: {id: admin}
                    },
                    members: {
                        connect: memberIds.map((member: string) => {
                            return {id: member}
                        })
                    },
                },
                include: {
                    members: true,
                }
            });

            return NextResponse.json({newConversation, message: "New Group Conversation Created"});
        };

        const existingConversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    {
                        memberIds: {
                            equals: [memberIds[0], memberIds[1]]
                        }
                    },
                    {
                        memberIds: {
                            equals: [memberIds[1], memberIds[0]]
                        }
                    }
                ]
            }
        });

        if(existingConversations.length > 0) {
            return NextResponse.json({existingConversations, message: "A Conversation already exists"}, {status: 404})
        }

        const newConversation = await prisma.conversation.create({
            data: {
                isGroup,
                members: {
                    connect: memberIds.map((member: string) => {
                        return {id: member}
                    })
                }
            },
            include: {
                members: true
            }
        });

        return NextResponse.json({newConversation, message: "New Conversation Created"}, {status: 201})
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Error"}, {status: 500})
    }
}