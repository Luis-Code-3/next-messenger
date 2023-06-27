import prisma from '../lib/prismadb';

const getUsers = async (email: string) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "desc"
            },
            where: {
                NOT: {
                    email: email
                }
            }
        });

        return users;
    } catch (error) {
        console.log(error);
        return null  
    }
}

export default getUsers;