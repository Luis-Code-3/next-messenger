import prisma from '../lib/prismadb';

const getMessages = async (conversationId: string) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId
            },
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                sender: true
            }
        });

        return messages; 
    } catch (error) {
        console.log(error);
        return null
    }
}

export default getMessages;