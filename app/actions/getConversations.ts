import prisma from '../lib/prismadb';

const getConversations = async (userId: string) => {

    try {
        const conversations = await prisma.conversation.findMany({
            orderBy: {
                lastMessageAt: 'desc'
            },
            where: {
                memberIds: {
                    has: userId
                }
            },
            include: {
                members: true
            }
        });
        return conversations;
    } catch (err) {
        console.log(err);
        return null
    }
}

export default getConversations