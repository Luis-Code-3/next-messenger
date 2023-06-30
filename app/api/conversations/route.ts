import { NextResponse } from "next/server";
import prisma from '../../lib/prismadb';
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {name, isGroup, image, memberIds, admin} = await request.json();
    const currentUser = await getCurrentUser();

    try {

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 400});

        // Checks to see if required fields were provided
        if(!memberIds) return NextResponse.json({message: "Provide Required Fields"}, {status: 400})

        // Checks to see if there are 2 or more memberIds for the conversation
        if(memberIds.length <= 1) return NextResponse.json({message: "Conversations require 2 or more users"}, {status: 400})

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: memberIds
                }
            }
        });

        // Check to see if memberIds are real users
        if(users.length !== memberIds.length) return NextResponse.json({message: "One or more users do not exist"}, {status: 400})

        // Checks to see if currentUser is in memberIds, to be included in the conversation being created
        if(!memberIds.includes(currentUser.id)) return NextResponse.json({message: "You must be apart of the conversation"}, {status: 400})

        if(isGroup) {

            // Check to see if required fields for groups are provided
            if(!name || !admin || !image) return NextResponse.json({message: "Provide Required Fields for Group"}, {status: 400});

            // Checks to see if there are more than two memberIds for the group conversation
            if(memberIds.length < 2) return NextResponse.json({message: "A Group Conversation requires more than two people"}, {status: 400});

            // Checks to see if admin is apart of conversation
            if(!memberIds.includes(admin)) return NextResponse.json({message: "Admin must be apart of conversation"}, {status: 400})

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

        // Checks to see if the solo conversation only has two members
        if(memberIds.length !== 2) return NextResponse.json({message: "Solo conversations only have two members"}, {status: 400})

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

        // Checks to see if a previous solo conversation exist between provided memberIds
        if(existingConversations.length > 0) {
            return NextResponse.json({existingConversations, message: "A Conversation already exists"}, {status: 404})
        }

        const newConversation = await prisma.conversation.create({
            data: {
                isGroup: false,
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

// Test: Does it pass these?
// 1. Must be logged in (PASS)
// 2. Is there a current user? (PASS)
// 3. Were the required fields provided? (PASS)
// 4. Does the users exist (PASS)
// 5. Is the conversation a group chat? (PASS)
// 6. If conversation is a group chat it should have required fields (PASS)
// 7. A group chat should have above two members < (PASS)
// 8. If not group, Does solo already conversation exist? (PASS)
// 9. A solo conversation should only have two members (PASS)
// 10. User who is creating the conversation should be a part of memberIds (PASS)
// 11. Check to see if admin is apart of group conversation
