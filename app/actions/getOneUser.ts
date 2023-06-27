import prisma from '../lib/prismadb';

const getOneUser = async (userId: string) => {
    try {
        const oneUser = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        return oneUser;
    } catch (error) {
        console.log(error);
        return null
    }
}

export default getOneUser;