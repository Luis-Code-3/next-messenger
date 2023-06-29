import prisma from '../lib/prismadb';
import getCurrentUser from './getCurrentUser';

const getConversations = async () => {
    const currentUser = await getCurrentUser();

    if(!currentUser?.id) {
        return [];
    }

    try {
        const conversations = await prisma.conversation.findMany({
            orderBy: {
                lastMessageAt: 'desc'
            },
            where: {
                memberIds: {
                    has: currentUser?.id
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