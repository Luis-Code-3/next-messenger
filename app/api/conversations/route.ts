import { NextResponse } from "next/server";
import prisma from '../../lib/prismadb';
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const {name, isGroup, image, memberIds} = await request.json();
    const currentUser = await getCurrentUser();

    try {

        // Checks to see if a user is a logged in / there is a current user
        if(!currentUser?.id) return NextResponse.json({message: "Not Authorized"}, {status: 401});

        // Checks to see if required fields were provided
        if(!memberIds) return NextResponse.json({message: "Provide Required Fields"}, {status: 400})

        // Checks to see if there are 1 or more memberIds for the conversation
        if(memberIds.length <= 0) return NextResponse.json({message: "Conversations require 2 or more users"}, {status: 400})

        const hasDuplicates = (array: any) => {
            return array.some((item:any, index:any) => array.indexOf(item) !== index);
        }
          
        // Checks to see if there are duplicates in the Member Ids
        if (hasDuplicates(memberIds)) return NextResponse.json({message: "Duplicate User IDs provided"}, {status: 409});

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: memberIds
                }
            },
            select: {
                username: true
            }
        }); 

        // Check to see if memberIds are real users
        if(users.length !== memberIds.length) return NextResponse.json({message: "One or more users do not exist"}, {status: 409})

        if(isGroup) {

            // Check to see if required fields for groups are provided
            if(!name || !image) return NextResponse.json({message: "Provide Required Fields for Group"}, {status: 400});

            // Checks to see if there are more than one memberIds for the group conversation
            if(memberIds.length <= 1) return NextResponse.json({message: "A Group Conversation requires more than two people"}, {status: 400});

            const newConversation = await prisma.conversation.create({
                data: {
                    name,
                    isGroup,
                    image,
                    admin: {
                        connect: {id: currentUser.id}
                    },
                    members: {
                        connect: [
                            ...memberIds.map((member: string) => {
                            return {id: member}
                        }),
                        {
                            id: currentUser.id
                        }
                    ]
                    },
                },
                select: {
                    id: true,
                    memberIds: true
                }
            });

            return NextResponse.json({newConversation, message: "New Group Conversation Created"});
        };

        // Checks to see if the solo conversation only has two members
        if(memberIds.length !== 1) return NextResponse.json({message: "Solo conversations only have two members"}, {status: 400})

        const existingConversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    {
                        memberIds: {
                            equals: [memberIds[0], currentUser.id]
                        }
                    },
                    {
                        memberIds: {
                            equals: [currentUser.id, memberIds[0]]
                        }
                    }
                ]
            },
            select: {
                id: true
            }
        });

        // Checks to see if a previous solo conversation exist between provided memberIds
        if(existingConversations.length > 0) {
            return NextResponse.json({existingConversations, message: "A Conversation already exists"}, {status: 409})
        }

        const newConversation = await prisma.conversation.create({
            data: {
                isGroup: false,
                members: {
                    connect: [
                        ...memberIds.map((member: string) => {
                        return {id: member}
                    }),
                    {
                        id: currentUser.id
                    }
                ]
                }
            },
            select: {
                id: true,
                memberIds: true
            }
        });

        return NextResponse.json({newConversation, message: "New Conversation Created"}, {status: 201})
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Error"}, {status: 500})
    }
}

// Test: Does it pass these?
// 1. Must be logged in (PASS) (TESTED)
// 2. Is there a current user? (PASS) (TESTED)
// 3. Were the required fields provided? (PASS) (TESTED)
// 4. Does the users exist (PASS) (TESTED)
// 5. Is the conversation a group chat? (PASS) (TESTED)
// 6. If conversation is a group chat it should have required fields (PASS) (TESTED)
// 7. A group chat should have above two members < (PASS) (TESTED)
// 8. If not group, Does solo already conversation exist? (PASS) (TESTED)
// 9. A solo conversation should only have two members (PASS) (TESTED)
// 12. Is there duplicates (PASS) (TESTED)
// 13. Does the conversation have 2 or more users (PASS) (TESTED)
