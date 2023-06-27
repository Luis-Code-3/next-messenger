import prisma from '../lib/prismadb';

const getConversationById = async (conversationId: string) => {
  
    try {
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                members: true,
                admin: true
            }
        });

        return conversation;
    } catch (error) {
        console.log(error);
        return null
    }
}

export default getConversationById

// how am i protecting this here, would it be through here? if a user types in /dashboard/conversation/123
// which isnt a conversation the user is apart of it should send him an error page or a navigate him back to his dashboard
//